import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { analyzeResume } from "./services/gemini";
import { sendInterviewInvite, sendRejectionEmail } from "./services/email";
import { parseResume } from "./services/resume-parser";
import multer from "multer";
import * as path from "path";
import * as fs from "fs";

interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req: any, file: any, cb: any) => {
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF and Word documents are allowed.'));
    }
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all jobs
  app.get("/api/jobs", async (req, res) => {
    try {
      const jobs = await storage.getJobs();
      res.json(jobs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch jobs" });
    }
  });

  // Create new job
  app.post("/api/jobs", async (req, res) => {
    try {
      const job = await storage.createJob(req.body);
      res.json(job);
    } catch (error) {
      res.status(500).json({ message: "Failed to create job" });
    }
  });

  // Get all candidates with applications
  app.get("/api/candidates", async (req, res) => {
    try {
      const candidates = await storage.getCandidatesWithApplications();
      res.json(candidates);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch candidates" });
    }
  });

  // Get candidate by ID
  app.get("/api/candidates/:id", async (req, res) => {
    try {
      const candidate = await storage.getCandidate(req.params.id);
      if (!candidate) {
        return res.status(404).json({ message: "Candidate not found" });
      }
      res.json(candidate);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch candidate" });
    }
  });

  // Upload and analyze resume
  app.post("/api/upload-resume", upload.single('resume'), async (req: MulterRequest, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const { jobId, candidateName, candidateEmail } = req.body;
      
      if (!jobId) {
        return res.status(400).json({ message: "Job ID is required" });
      }

      // Get job details
      const job = await storage.getJob(jobId);
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }

      // Parse resume
      const parsed = await parseResume(req.file.path, req.file.mimetype);
      
      // Create candidate
      const candidate = await storage.createCandidate({
        name: candidateName || parsed.name || 'Unknown',
        email: candidateEmail || parsed.email || '',
        phone: parsed.phone,
        resumeText: parsed.text,
        resumeUrl: req.file.path,
      });

      // Analyze resume with AI
      const analysis = await analyzeResume(parsed.text, job.description);

      // Create application
      const application = await storage.createApplication({
        candidateId: candidate.id,
        jobId: job.id,
        matchScore: analysis.matchScore,
        strengths: analysis.strengths,
        weaknesses: analysis.weaknesses,
        aiSummary: analysis.summary,
        interviewQuestions: analysis.interviewQuestions,
        status: analysis.matchScore >= 70 ? 'qualified' : 'rejected',
      });

      // Auto-schedule interview or send rejection based on score
      if (analysis.matchScore >= 70 && candidate.email) {
        // Schedule interview (for now, just mark as scheduled)
        await storage.updateApplication(application.id, {
          interviewScheduled: true,
          interviewDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
        });

        // Send interview invite
        const success = await sendInterviewInvite(
          candidate.name,
          candidate.email,
          job.title,
          'Tomorrow at 2:00 PM',
          analysis.interviewQuestions
        );

        await storage.updateApplication(application.id, {
          emailSent: success,
        });
      } else if (candidate.email) {
        // Send rejection email
        const success = await sendRejectionEmail(
          candidate.name,
          candidate.email,
          job.title
        );

        await storage.updateApplication(application.id, {
          emailSent: success,
        });
      }

      // Clean up uploaded file
      fs.unlinkSync(req.file.path);

      res.json({
        candidate,
        application: {
          ...application,
          job,
        },
        analysis,
      });
    } catch (error) {
      console.error("Resume upload error:", error);
      
      // Clean up file if it exists
      if (req.file?.path) {
        try {
          fs.unlinkSync(req.file.path);
        } catch (cleanupError) {
          console.error("File cleanup error:", cleanupError);
        }
      }
      
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Failed to process resume" 
      });
    }
  });

  // Schedule interview
  app.post("/api/schedule-interview/:applicationId", async (req, res) => {
    try {
      const { applicationId } = req.params;
      const { interviewDate } = req.body;

      const application = await storage.updateApplication(applicationId, {
        interviewScheduled: true,
        interviewDate: new Date(interviewDate),
        status: 'interview_scheduled',
      });

      if (!application) {
        return res.status(404).json({ message: "Application not found" });
      }

      res.json(application);
    } catch (error) {
      res.status(500).json({ message: "Failed to schedule interview" });
    }
  });

  // Send interview invite
  app.post("/api/send-invite/:applicationId", async (req, res) => {
    try {
      const { applicationId } = req.params;
      const application = await storage.getApplication(applicationId);
      
      if (!application) {
        return res.status(404).json({ message: "Application not found" });
      }

      const candidate = await storage.getCandidate(application.candidateId);
      const job = await storage.getJob(application.jobId);

      if (!candidate || !job) {
        return res.status(404).json({ message: "Candidate or job not found" });
      }

      const success = await sendInterviewInvite(
        candidate.name,
        candidate.email,
        job.title,
        'To be scheduled',
        application.interviewQuestions || []
      );

      await storage.updateApplication(applicationId, {
        emailSent: success,
        status: 'invited',
      });

      res.json({ success });
    } catch (error) {
      res.status(500).json({ message: "Failed to send invite" });
    }
  });

  // Reject candidate
  app.post("/api/reject/:applicationId", async (req, res) => {
    try {
      const { applicationId } = req.params;
      const application = await storage.getApplication(applicationId);
      
      if (!application) {
        return res.status(404).json({ message: "Application not found" });
      }

      const candidate = await storage.getCandidate(application.candidateId);
      const job = await storage.getJob(application.jobId);

      if (!candidate || !job) {
        return res.status(404).json({ message: "Candidate or job not found" });
      }

      const success = await sendRejectionEmail(
        candidate.name,
        candidate.email,
        job.title
      );

      await storage.updateApplication(applicationId, {
        status: 'rejected',
        emailSent: success,
      });

      res.json({ success });
    } catch (error) {
      res.status(500).json({ message: "Failed to reject candidate" });
    }
  });

  // Get dashboard statistics
  app.get("/api/dashboard-stats", async (req, res) => {
    try {
      const applications = await storage.getApplications();
      const jobs = await storage.getJobs();
      
      const totalApplications = applications.length;
      const shortlisted = applications.filter(app => app.status === 'qualified' || app.status === 'interview_scheduled').length;
      const interviews = applications.filter(app => app.interviewScheduled).length;
      const avgScore = applications.length > 0 
        ? Math.round(applications.reduce((sum, app) => sum + (app.matchScore || 0), 0) / applications.length)
        : 0;

      res.json({
        totalApplications,
        shortlisted,
        interviews,
        avgScore,
        activeJobs: jobs.filter(job => job.status === 'active').length,
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
