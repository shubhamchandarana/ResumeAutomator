import { useState, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { CloudUpload, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Job } from "@shared/schema";

interface UploadDialogProps {
  open: boolean;
  onClose: () => void;
}

export default function UploadDialog({ open, onClose }: UploadDialogProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [candidateName, setCandidateName] = useState("");
  const [candidateEmail, setCandidateEmail] = useState("");
  const [selectedJobId, setSelectedJobId] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: jobs = [] } = useQuery<Job[]>({
    queryKey: ['/api/jobs'],
  });

  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const percentComplete = (event.loaded / event.total) * 100;
            setUploadProgress(Math.round(percentComplete));
          }
        });

        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const response = JSON.parse(xhr.responseText);
              resolve(response);
            } catch (error) {
              reject(new Error('Invalid response format'));
            }
          } else {
            try {
              const errorResponse = JSON.parse(xhr.responseText);
              reject(new Error(errorResponse.message || 'Upload failed'));
            } catch {
              reject(new Error(`Upload failed with status ${xhr.status}`));
            }
          }
        });

        xhr.addEventListener('error', () => {
          reject(new Error('Network error occurred'));
        });

        xhr.open('POST', '/api/upload-resume');
        xhr.send(formData);
      });
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['/api/candidates'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard-stats'] });
      
      toast({
        title: "Resume Uploaded Successfully",
        description: `Match score: ${data.analysis?.matchScore || 'N/A'}. ${data.analysis?.matchScore >= 70 ? 'Interview invite sent!' : 'Rejection email sent.'}`,
      });
      
      handleClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Upload Failed",
        description: error.message,
        variant: "destructive",
      });
      setUploadProgress(0);
    },
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const allowedTypes = [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/msword'
      ];
      
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Invalid File Type",
          description: "Please upload a PDF or Word document",
          variant: "destructive",
        });
        return;
      }
      
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Please upload a file smaller than 10MB",
          variant: "destructive",
        });
        return;
      }
      
      setSelectedFile(file);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      const fakeEvent = {
        target: { files: [file] }
      } as unknown as React.ChangeEvent<HTMLInputElement>;
      handleFileSelect(fakeEvent);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleUpload = () => {
    if (!selectedFile || !selectedJobId) {
      toast({
        title: "Missing Information",
        description: "Please select a file and job position",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData();
    formData.append('resume', selectedFile);
    formData.append('jobId', selectedJobId);
    formData.append('candidateName', candidateName);
    formData.append('candidateEmail', candidateEmail);

    setUploadProgress(0);
    uploadMutation.mutate(formData);
  };

  const handleClose = () => {
    setSelectedFile(null);
    setCandidateName("");
    setCandidateEmail("");
    setSelectedJobId("");
    setUploadProgress(0);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md w-full" data-testid="dialog-upload-resume">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Upload Resume
            <Button variant="ghost" size="icon" onClick={handleClose} data-testid="button-close-upload-dialog">
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="jobSelect" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Select Position
            </Label>
            <Select value={selectedJobId} onValueChange={setSelectedJobId}>
              <SelectTrigger className="w-full" id="jobSelect" data-testid="select-job-position">
                <SelectValue placeholder="Choose a job position" />
              </SelectTrigger>
              <SelectContent>
                {jobs.map((job) => (
                  <SelectItem key={job.id} value={job.id}>
                    {job.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="candidateName" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Name (Optional)
              </Label>
              <Input
                id="candidateName"
                value={candidateName}
                onChange={(e) => setCandidateName(e.target.value)}
                placeholder="Candidate name"
                data-testid="input-candidate-name"
              />
            </div>
            <div>
              <Label htmlFor="candidateEmail" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Email (Optional)
              </Label>
              <Input
                id="candidateEmail"
                type="email"
                value={candidateEmail}
                onChange={(e) => setCandidateEmail(e.target.value)}
                placeholder="candidate@email.com"
                data-testid="input-candidate-email"
              />
            </div>
          </div>
          
          <div>
            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
              Upload Resume
            </Label>
            <div
              className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-primary dark:hover:border-primary transition-colors cursor-pointer"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={() => fileInputRef.current?.click()}
              data-testid="drop-zone-resume"
            >
              <CloudUpload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
              {selectedFile ? (
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Selected: {selectedFile.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Drop your resume here or click to browse
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    PDF, DOC, DOCX up to 10MB
                  </p>
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleFileSelect}
              className="hidden"
              data-testid="input-file-resume"
            />
          </div>
          
          {uploadMutation.isPending && (
            <div className="space-y-2" data-testid="upload-progress">
              <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                <span>Uploading and analyzing resume...</span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="w-full" />
            </div>
          )}
          
          <div className="flex space-x-3 pt-4">
            <Button 
              variant="outline" 
              className="flex-1" 
              onClick={handleClose}
              disabled={uploadMutation.isPending}
              data-testid="button-cancel-upload"
            >
              Cancel
            </Button>
            <Button 
              className="flex-1" 
              onClick={handleUpload}
              disabled={!selectedFile || !selectedJobId || uploadMutation.isPending}
              data-testid="button-upload-analyze"
            >
              {uploadMutation.isPending ? 'Processing...' : 'Upload & Analyze'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
