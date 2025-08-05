import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  X, 
  CheckCircle, 
  AlertTriangle, 
  HelpCircle, 
  Calendar,
  Mail,
  UserX,
  Brain
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { CandidateWithApplication } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

interface CandidateDetailsDialogProps {
  candidate: CandidateWithApplication;
  open: boolean;
  onClose: () => void;
}

export default function CandidateDetailsDialog({ 
  candidate, 
  open, 
  onClose 
}: CandidateDetailsDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const scheduleInterviewMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', `/api/schedule-interview/${candidate.application?.id}`, {
        interviewDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/candidates'] });
      toast({
        title: "Interview Scheduled",
        description: "Interview has been scheduled successfully",
      });
      onClose();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to schedule interview",
        variant: "destructive",
      });
    },
  });

  const sendInviteMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', `/api/send-invite/${candidate.application?.id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/candidates'] });
      toast({
        title: "Invite Sent",
        description: "Interview invite sent successfully",
      });
      onClose();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send invite",
        variant: "destructive",
      });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', `/api/reject/${candidate.application?.id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/candidates'] });
      toast({
        title: "Candidate Rejected",
        description: "Rejection email sent successfully",
      });
      onClose();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to reject candidate",
        variant: "destructive",
      });
    },
  });

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  const matchScore = candidate.application?.matchScore || 0;
  const strengths = candidate.application?.strengths || [];
  const weaknesses = candidate.application?.weaknesses || [];
  const interviewQuestions = candidate.application?.interviewQuestions || [];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl w-full max-h-[90vh] overflow-y-auto" data-testid="dialog-candidate-details">
        <DialogHeader className="pb-6 border-b border-gray-200 dark:border-gray-700">
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Avatar className="w-16 h-16 bg-primary">
                <AvatarFallback className="text-white text-xl font-medium">
                  {getInitials(candidate.name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white" data-testid="text-candidate-name">
                  {candidate.name}
                </h3>
                <p className="text-gray-600 dark:text-gray-400" data-testid="text-candidate-email">
                  {candidate.email}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Applied for {candidate.application?.job?.title || 'Unknown Position'}
                </p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} data-testid="button-close-candidate-dialog">
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-6">
          {/* Match Score Section */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-gray-900 dark:text-white">AI Match Analysis</h4>
              <div className="flex items-center space-x-2">
                <Brain className="h-5 w-5 text-green-500" />
                <span className="text-2xl font-bold text-green-500" data-testid="text-match-score">
                  {matchScore}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">/100</span>
              </div>
            </div>
            <Progress value={matchScore} className="w-full h-3 mb-4" />
          </div>

          {/* Strengths */}
          {strengths.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                Strengths
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {strengths.map((strength, index) => (
                  <div key={index} className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3" data-testid={`strength-${index}`}>
                    <p className="text-sm font-medium text-green-800 dark:text-green-300">
                      {strength}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Areas for Improvement */}
          {weaknesses.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2" />
                Areas for Improvement
              </h4>
              <div className="space-y-2">
                {weaknesses.map((weakness, index) => (
                  <div key={index} className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3" data-testid={`weakness-${index}`}>
                    <p className="text-sm font-medium text-yellow-800 dark:text-yellow-300">
                      {weakness}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI Summary */}
          {candidate.application?.aiSummary && (
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                AI Summary
              </h4>
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <p className="text-sm text-blue-800 dark:text-blue-300" data-testid="text-ai-summary">
                  {candidate.application.aiSummary}
                </p>
              </div>
            </div>
          )}

          {/* Generated Interview Questions */}
          {interviewQuestions.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                <HelpCircle className="h-5 w-5 text-purple-500 mr-2" />
                AI-Generated Interview Questions
              </h4>
              <div className="space-y-3">
                {interviewQuestions.map((question, index) => (
                  <div key={index} className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4" data-testid={`interview-question-${index}`}>
                    <p className="text-sm font-medium text-purple-800 dark:text-purple-300 mb-2">
                      Question {index + 1}
                    </p>
                    <p className="text-sm text-purple-700 dark:text-purple-400">
                      {question}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              className="flex-1 flex items-center justify-center space-x-2"
              onClick={() => scheduleInterviewMutation.mutate()}
              disabled={scheduleInterviewMutation.isPending}
              data-testid="button-schedule-interview"
            >
              <Calendar className="h-4 w-4" />
              <span>Schedule Interview</span>
            </Button>
            <Button
              variant="secondary"
              className="flex-1 flex items-center justify-center space-x-2 bg-green-500 hover:bg-green-600 text-white"
              onClick={() => sendInviteMutation.mutate()}
              disabled={sendInviteMutation.isPending}
              data-testid="button-send-invite"
            >
              <Mail className="h-4 w-4" />
              <span>Send Invite</span>
            </Button>
            <Button
              variant="destructive"
              className="flex-1 flex items-center justify-center space-x-2"
              onClick={() => rejectMutation.mutate()}
              disabled={rejectMutation.isPending}
              data-testid="button-reject-candidate"
            >
              <UserX className="h-4 w-4" />
              <span>Reject</span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
