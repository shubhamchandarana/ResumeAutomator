import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { analyzeResume } from "./services/gemini";
import { sendInterviewInvite, sendRejectionEmail } from "./services/email";
import { parseResumeFile, validateResumeContent } from "./services/resume-parser";
import { getNotifications, getUnreadCount, markAsRead, markAllAsRead, createCandidateNotification } from "./services/notifications";
import { generateCandidateReport, formatReportAsCSV } from "./services/reports";
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
      console.error("Error fetching jobs:", error);
      res.status(500).json({ message: "Failed to fetch jobs" });
    }
  });

  // Create new job
  app.post("/api/jobs", async (req, res) => {
    try {
      const { title, description, requirements, location, type, status = 'active' } = req.body;
      
      // Validate required fields
      if (!title || !description || !requirements || !location || !type) {
        return res.status(400).json({ 
          message: "Missing required fields: title, description, requirements, location, type" 
        });
      }

      const job = await storage.createJob({
        title,
        description,
        requirements,
        location,
        type,
        status,
      });

      res.status(201).json(job);
    } catch (error) {
      console.error("Error creating job:", error);
      res.status(500).json({ message: "Failed to create job" });
    }
  });

  // Update job
  app.put("/api/jobs/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { title, description, requirements, location, type, status } = req.body;
      
      const existingJob = await storage.getJob(id);
      if (!existingJob) {
        return res.status(404).json({ message: "Job not found" });
      }

      const updatedJob = await storage.updateJob(id, {
        title,
        description,
        requirements,
        location,
        type,
        status,
      });

      if (!updatedJob) {
        return res.status(404).json({ message: "Job not found" });
      }

      res.json(updatedJob);
    } catch (error) {
      console.error("Error updating job:", error);
      res.status(500).json({ message: "Failed to update job" });
    }
  });

  // Get single job
  app.get("/api/jobs/:id", async (req, res) => {
    try {
      const job = await storage.getJob(req.params.id);
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }
      res.json(job);
    } catch (error) {
      console.error("Error fetching job:", error);
      res.status(500).json({ message: "Failed to fetch job" });
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
      console.log("Parsing resume file:", req.file.originalname);
      const resumeText = await parseResumeFile(req.file.path, req.file.mimetype);
      
      // Validate resume content
      if (!validateResumeContent(resumeText)) {
        return res.status(400).json({ 
          message: "Resume unreadable - the uploaded file doesn't contain valid resume content" 
        });
      }
      
      // Create candidate
      const candidate = await storage.createCandidate({
        name: candidateName || 'Unknown Candidate',
        email: candidateEmail || '',
        phone: '',
        resumeText: resumeText,
        resumeUrl: req.file.path,
      });

      // Analyze resume with AI
      console.log("Analyzing resume with Gemini AI...");
      const analysis = await analyzeResume(resumeText, job.description);
      console.log(`Analysis completed. Match score: ${analysis.matchScore}`);

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

      // Create notification for new candidate
      createCandidateNotification(candidate.name, job.title, analysis.matchScore);

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

      // TODO: Integrate with Google Calendar or Calendly API
      // For now, we simulate calendar event creation
      console.log(`Calendar event would be created for application ${applicationId} on ${interviewDate}`);

      res.json({
        ...application,
        calendarEventCreated: true,
        message: "Interview scheduled successfully"
      });
    } catch (error) {
      console.error("Error scheduling interview:", error);
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

  // Notifications endpoints
  app.get("/api/notifications", async (req, res) => {
    try {
      const notifications = getNotifications();
      const unreadCount = getUnreadCount();
      res.json({ notifications, unreadCount });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.post("/api/notifications/:id/read", async (req, res) => {
    try {
      const success = markAsRead(req.params.id);
      res.json({ success });
    } catch (error) {
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });

  app.post("/api/notifications/read-all", async (req, res) => {
    try {
      markAllAsRead();
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to mark all notifications as read" });
    }
  });

  // Report generation endpoint
  app.get("/api/reports/candidates", async (req, res) => {
    try {
      const reportData = await generateCandidateReport();
      const csvContent = formatReportAsCSV(reportData);
      
      const filename = `candidate-report-${new Date().toISOString().split('T')[0]}.csv`;
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(csvContent);
    } catch (error) {
      console.error('Report generation error:', error);
      res.status(500).json({ message: "Failed to generate report" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
