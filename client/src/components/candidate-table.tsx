import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Search,
  Filter,
  Eye,
  Calendar,
  Mail,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import CandidateDetailsDialog from "./candidate-details-dialog";
import { CandidateWithApplication } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

export default function CandidateTable() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateWithApplication | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: candidates = [], isLoading } = useQuery<CandidateWithApplication[]>({
    queryKey: ['/api/candidates'],
  });

  const scheduleInterviewMutation = useMutation({
    mutationFn: async (applicationId: string) => {
      const response = await apiRequest('POST', `/api/schedule-interview/${applicationId}`, {
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
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to schedule interview",
        variant: "destructive",
      });
    },
  });

  const sendEmailMutation = useMutation({
    mutationFn: async (applicationId: string) => {
      const response = await apiRequest('POST', `/api/send-invite/${applicationId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/candidates'] });
      toast({
        title: "Email Sent",
        description: "Interview invite sent successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send email",
        variant: "destructive",
      });
    },
  });

  const filteredCandidates = candidates.filter(candidate =>
    candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    candidate.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (candidate.application?.job?.title || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string, matchScore?: number | null) => {
    switch (status) {
      case 'qualified':
      case 'interview_scheduled':
        return <Badge className="bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300">Interview Scheduled</Badge>;
      case 'invited':
        return <Badge className="bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300">Invited</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300">Rejected</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300">Under Review</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getAvatarColor = (name: string) => {
    const colors = ['bg-primary', 'bg-purple-500', 'bg-red-500', 'bg-green-500', 'bg-blue-500'];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Candidates</h2>
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search candidates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-64"
                  data-testid="input-search-candidates"
                />
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              </div>
              <Button variant="ghost" size="icon" data-testid="button-filter">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Candidate</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Match Score</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCandidates.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-gray-500 dark:text-gray-400">
                      No candidates found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCandidates.map((candidate) => (
                    <TableRow key={candidate.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50" data-testid={`row-candidate-${candidate.id}`}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar className={`w-10 h-10 ${getAvatarColor(candidate.name)}`}>
                            <AvatarFallback className="text-white">{getInitials(candidate.name)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white" data-testid={`text-candidate-name-${candidate.id}`}>
                              {candidate.name}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400" data-testid={`text-candidate-email-${candidate.id}`}>
                              {candidate.email}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-900 dark:text-white" data-testid={`text-job-title-${candidate.id}`}>
                          {candidate.application?.job?.title || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Applied {candidate.createdAt ? new Date(candidate.createdAt).toLocaleDateString() : 'Unknown date'}
                        </div>
                      </TableCell>
                      <TableCell>
                        {candidate.application?.matchScore !== null && candidate.application?.matchScore !== undefined ? (
                          <div className="flex items-center space-x-3">
                            <Progress 
                              value={candidate.application.matchScore} 
                              className="w-16 h-2"
                            />
                            <span className="text-sm font-medium text-gray-900 dark:text-white" data-testid={`text-match-score-${candidate.id}`}>
                              {candidate.application.matchScore}
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500">N/A</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(candidate.application?.status || 'pending', candidate.application?.matchScore)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setSelectedCandidate(candidate)}
                            data-testid={`button-view-candidate-${candidate.id}`}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => scheduleInterviewMutation.mutate(candidate.application?.id || '')}
                            disabled={!candidate.application?.id || scheduleInterviewMutation.isPending}
                            data-testid={`button-schedule-interview-${candidate.id}`}
                          >
                            <Calendar className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => sendEmailMutation.mutate(candidate.application?.id || '')}
                            disabled={!candidate.application?.id || sendEmailMutation.isPending}
                            data-testid={`button-send-email-${candidate.id}`}
                          >
                            <Mail className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          
          <div className="px-6 py-3 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700 dark:text-gray-300">
                Showing <span className="font-medium">1</span> to <span className="font-medium">{Math.min(10, filteredCandidates.length)}</span> of <span className="font-medium">{filteredCandidates.length}</span> results
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="icon" disabled data-testid="button-prev-page">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button size="sm" className="bg-primary text-white">1</Button>
                <Button variant="outline" size="sm" disabled>2</Button>
                <Button variant="outline" size="sm" disabled>3</Button>
                <Button variant="outline" size="icon" disabled data-testid="button-next-page">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {selectedCandidate && (
        <CandidateDetailsDialog
          candidate={selectedCandidate}
          open={!!selectedCandidate}
          onClose={() => setSelectedCandidate(null)}
        />
      )}
    </>
  );
}
