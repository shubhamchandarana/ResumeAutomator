import { apiRequest } from "./queryClient";

export interface UploadResponse {
  candidate: any;
  application: any;
  analysis: {
    matchScore: number;
    strengths: string[];
    weaknesses: string[];
    summary: string;
    interviewQuestions: string[];
  };
}

export const uploadResume = async (formData: FormData): Promise<UploadResponse> => {
  const response = await fetch('/api/upload-resume', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Upload failed');
  }

  return response.json();
};

export const scheduleInterview = async (applicationId: string, interviewDate: string) => {
  const response = await apiRequest('POST', `/api/schedule-interview/${applicationId}`, {
    interviewDate,
  });
  return response.json();
};

export const sendInvite = async (applicationId: string) => {
  const response = await apiRequest('POST', `/api/send-invite/${applicationId}`);
  return response.json();
};

export const rejectCandidate = async (applicationId: string) => {
  const response = await apiRequest('POST', `/api/reject/${applicationId}`);
  return response.json();
};
