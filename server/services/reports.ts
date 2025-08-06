import { storage } from "../storage";
import type { CandidateWithApplication } from "@shared/schema";

export interface ReportData {
  candidates: {
    name: string;
    email: string;
    jobTitle: string;
    matchScore: number;
    status: string;
    appliedDate: string;
    strengths: string;
    weaknesses: string;
    summary: string;
  }[];
  summary: {
    totalApplications: number;
    averageScore: number;
    qualifiedCount: number;
    rejectedCount: number;
    interviewsScheduled: number;
  };
}

export async function generateCandidateReport(): Promise<ReportData> {
  try {
    const candidatesWithApps = await storage.getCandidatesWithApplications();
    const jobs = await storage.getJobs();
    
    // Create job lookup for titles
    const jobLookup = jobs.reduce((acc, job) => {
      acc[job.id] = job.title;
      return acc;
    }, {} as Record<string, string>);

    const candidates = candidatesWithApps
      .filter(c => c.application) // Only candidates with applications
      .map(candidate => ({
        name: candidate.name,
        email: candidate.email || 'N/A',
        jobTitle: jobLookup[candidate.application!.jobId] || 'Unknown Position',
        matchScore: candidate.application!.matchScore || 0,
        status: candidate.application!.status || 'pending',
        appliedDate: candidate.application!.createdAt?.toLocaleDateString() || 'Unknown',
        strengths: candidate.application!.strengths?.join('; ') || 'N/A',
        weaknesses: candidate.application!.weaknesses?.join('; ') || 'N/A',
        summary: candidate.application!.aiSummary || 'No summary available'
      }))
      .sort((a, b) => b.matchScore - a.matchScore); // Sort by score descending

    const totalApplications = candidates.length;
    const averageScore = totalApplications > 0 
      ? Math.round(candidates.reduce((sum, c) => sum + c.matchScore, 0) / totalApplications) 
      : 0;
    const qualifiedCount = candidates.filter(c => c.matchScore >= 70).length;
    const rejectedCount = candidates.filter(c => c.status === 'rejected').length;
    const interviewsScheduled = candidates.filter(c => c.status === 'interview_scheduled' || c.status === 'qualified').length;

    return {
      candidates,
      summary: {
        totalApplications,
        averageScore,
        qualifiedCount,
        rejectedCount,
        interviewsScheduled
      }
    };
  } catch (error) {
    console.error('Error generating report:', error);
    throw new Error('Failed to generate candidate report');
  }
}

export function formatReportAsCSV(reportData: ReportData): string {
  const headers = [
    'Name',
    'Email', 
    'Job Title',
    'Match Score',
    'Status',
    'Applied Date',
    'Strengths',
    'Weaknesses',
    'Summary'
  ].join(',');

  const rows = reportData.candidates.map(candidate => [
    `"${candidate.name}"`,
    `"${candidate.email}"`,
    `"${candidate.jobTitle}"`,
    candidate.matchScore,
    `"${candidate.status}"`,
    `"${candidate.appliedDate}"`,
    `"${candidate.strengths}"`,
    `"${candidate.weaknesses}"`,
    `"${candidate.summary.replace(/"/g, '""')}"` // Escape quotes in summary
  ].join(','));

  const summarySection = [
    '',
    'SUMMARY STATISTICS',
    `Total Applications,${reportData.summary.totalApplications}`,
    `Average Score,${reportData.summary.averageScore}`,
    `Qualified Candidates,${reportData.summary.qualifiedCount}`,
    `Rejected Candidates,${reportData.summary.rejectedCount}`,
    `Interviews Scheduled,${reportData.summary.interviewsScheduled}`
  ];

  return [headers, ...rows, ...summarySection].join('\n');
}