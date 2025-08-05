import { useState } from "react";
import { Link } from "wouter";
import NavigationHeader from "@/components/navigation-header";
import UploadDialog from "@/components/upload-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Upload, CheckCircle, Clock, AlertCircle } from "lucide-react";

export default function CandidateUpload() {
  const [showUploadDialog, setShowUploadDialog] = useState(false);

  const steps = [
    {
      number: 1,
      title: "Select Position",
      description: "Choose the job position you're applying for",
      icon: CheckCircle,
      status: "complete"
    },
    {
      number: 2,
      title: "Upload Resume",
      description: "Upload your resume in PDF or Word format",
      icon: Upload,
      status: "current"
    },
    {
      number: 3,
      title: "AI Analysis",
      description: "Our AI will analyze your resume and provide a match score",
      icon: Clock,
      status: "upcoming"
    },
    {
      number: 4,
      title: "Interview Scheduling",
      description: "If qualified, we'll automatically schedule an interview",
      icon: AlertCircle,
      status: "upcoming"
    }
  ];

  const getStepColor = (status: string) => {
    switch (status) {
      case 'complete':
        return 'bg-green-500 text-white';
      case 'current':
        return 'bg-primary text-white';
      case 'upcoming':
        return 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400';
      default:
        return 'bg-gray-200 text-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <NavigationHeader />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" className="mb-4" data-testid="button-back-dashboard">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Upload Your Resume
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Get matched with the perfect job using our AI-powered resume analysis
          </p>
        </div>

        {/* Process Steps */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Application Process</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {steps.map((step, index) => {
                const IconComponent = step.icon;
                return (
                  <div key={step.number} className="flex items-start space-x-4" data-testid={`step-${step.number}`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getStepColor(step.status)}`}>
                      {step.status === 'complete' ? (
                        <CheckCircle className="h-5 w-5" />
                      ) : (
                        <span className="font-semibold">{step.number}</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {step.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {step.description}
                      </p>
                    </div>
                    {index < steps.length - 1 && (
                      <div className="w-px h-8 bg-gray-200 dark:bg-gray-700 ml-5 mt-2"></div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Upload Section */}
        <Card>
          <CardContent className="p-8 text-center">
            <div className="max-w-md mx-auto">
              <Upload className="h-16 w-16 mx-auto text-primary mb-4" />
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                Ready to Get Started?
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Upload your resume and let our AI analyze it for the best job matches. 
                The process takes just a few seconds!
              </p>
              <Button 
                size="lg" 
                onClick={() => setShowUploadDialog(true)}
                className="w-full"
                data-testid="button-start-upload"
              >
                <Upload className="h-5 w-5 mr-2" />
                Upload Resume & Get Analyzed
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                AI-Powered Matching
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Our advanced AI analyzes your resume against job requirements for accurate matching
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Clock className="h-6 w-6 text-green-500" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Instant Results
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Get your match score and feedback within seconds of uploading your resume
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="h-6 w-6 text-blue-500" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Auto Scheduling
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                High-scoring candidates get automatically scheduled for interviews
              </p>
            </CardContent>
          </Card>
        </div>
      </main>

      <UploadDialog 
        open={showUploadDialog} 
        onClose={() => setShowUploadDialog(false)} 
      />
    </div>
  );
}
