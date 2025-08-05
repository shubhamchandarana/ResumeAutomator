import { useState } from "react";
import NavigationHeader from "@/components/navigation-header";
import DashboardStats from "@/components/dashboard-stats";
import CandidateTable from "@/components/candidate-table";
import JobSidebar from "@/components/job-sidebar";
import UploadDialog from "@/components/upload-dialog";
import { JobFormDialog } from "@/components/job-form-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Plus,
  Upload,
  BarChart3
} from "lucide-react";

export default function Dashboard() {
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [showJobDialog, setShowJobDialog] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <NavigationHeader />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <DashboardStats />
        
        {/* Quick Actions */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button 
                className="flex items-center justify-center space-x-3 p-4 h-auto"
                onClick={() => setShowJobDialog(true)}
                data-testid="button-create-job"
              >
                <Plus className="h-5 w-5" />
                <span className="font-medium">Create New Job</span>
              </Button>
              <Button 
                variant="secondary"
                className="flex items-center justify-center space-x-3 p-4 h-auto bg-green-500 hover:bg-green-600 text-white"
                onClick={() => setShowUploadDialog(true)}
                data-testid="button-upload-resume"
              >
                <Upload className="h-5 w-5" />
                <span className="font-medium">Upload Resume</span>
              </Button>
              <Button 
                variant="outline"
                className="flex items-center justify-center space-x-3 p-4 h-auto border-purple-200 hover:bg-purple-50 dark:border-purple-800 dark:hover:bg-purple-900/20"
                onClick={() => {/* TODO: Implement reports */}}
                data-testid="button-generate-report"
              >
                <BarChart3 className="h-5 w-5 text-purple-500" />
                <span className="font-medium text-purple-600 dark:text-purple-400">Generate Report</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <CandidateTable />
          </div>
          
          <div>
            <JobSidebar />
          </div>
        </div>
      </main>

      <UploadDialog 
        open={showUploadDialog} 
        onClose={() => setShowUploadDialog(false)} 
      />
      
      <JobFormDialog 
        open={showJobDialog} 
        onClose={() => setShowJobDialog(false)} 
      />
    </div>
  );
}
