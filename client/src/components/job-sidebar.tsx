import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  TrendingUp, 
  CheckCircle, 
  Upload, 
  AlertCircle, 
  X,
  Edit,
  Brain,
  Plus
} from "lucide-react";
import { Job } from "@shared/schema";

interface ActivityItem {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  message: string;
  timestamp: string;
  icon: React.ComponentType<{ className?: string }>;
}

export default function JobSidebar() {
  const { data: jobs = [], isLoading: jobsLoading } = useQuery<Job[]>({
    queryKey: ['/api/jobs'],
  });

  // Mock activity data - in a real app this would come from an API
  const recentActivity: ActivityItem[] = [
    {
      id: '1',
      type: 'success',
      message: 'Alex Smith interview scheduled',
      timestamp: '2 minutes ago',
      icon: CheckCircle,
    },
    {
      id: '2',
      type: 'info',
      message: 'New resume uploaded for Data Scientist',
      timestamp: '5 minutes ago',
      icon: Upload,
    },
    {
      id: '3',
      type: 'info',
      message: 'AI screening completed for 3 candidates',
      timestamp: '10 minutes ago',
      icon: Brain,
    },
    {
      id: '4',
      type: 'error',
      message: 'Robert Chen application rejected',
      timestamp: '15 minutes ago',
      icon: X,
    },
  ];

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-100 dark:bg-green-900/20 text-green-500';
      case 'info':
        return 'bg-blue-100 dark:bg-blue-900/20 text-blue-500';
      case 'warning':
        return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-500';
      case 'error':
        return 'bg-red-100 dark:bg-red-900/20 text-red-500';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-500';
    }
  };

  if (jobsLoading) {
    return (
      <div className="space-y-6">
        <Card className="animate-pulse">
          <CardHeader>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Active Job Postings */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Active Job Postings</h3>
            <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80" data-testid="button-view-all-jobs">
              View All
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {jobs.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-500 dark:text-gray-400 mb-4">
                <Plus className="h-12 w-12 mx-auto mb-2" />
                <p>No active job postings</p>
              </div>
              <Button size="sm" data-testid="button-create-job">
                Create First Job
              </Button>
            </div>
          ) : (
            jobs.slice(0, 3).map((job) => (
              <div key={job.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors" data-testid={`job-card-${job.id}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 dark:text-white text-sm" data-testid={`text-job-title-${job.id}`}>
                      {job.title}
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {job.location} • {job.type}
                    </p>
                    <div className="flex items-center mt-2 space-x-4">
                      <span className="text-xs text-gray-600 dark:text-gray-400 flex items-center">
                        <Users className="h-3 w-3 mr-1" />
                        23 applicants
                      </span>
                      <span className="text-xs text-green-600 flex items-center">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        8 qualified
                      </span>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8" data-testid={`button-edit-job-${job.id}`}>
                    <Edit className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader className="pb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Activity</h3>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {recentActivity.map((activity) => {
            const IconComponent = activity.icon;
            return (
              <div key={activity.id} className="flex items-start space-x-3" data-testid={`activity-${activity.id}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getActivityColor(activity.type)}`}>
                  <IconComponent className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 dark:text-white" data-testid={`text-activity-message-${activity.id}`}>
                    {activity.message}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{activity.timestamp}</p>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* AI Insights */}
      <Card className="bg-gradient-to-br from-primary/5 to-purple-50 dark:from-primary/10 dark:to-purple-900/20">
        <CardHeader className="pb-4">
          <div className="flex items-center space-x-2">
            <Brain className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">AI Insights</h3>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-3">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
            <p className="text-sm text-gray-900 dark:text-white font-medium mb-2">Top Missing Skills</p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="text-xs">React.js</Badge>
              <Badge variant="secondary" className="text-xs">Docker</Badge>
              <Badge variant="secondary" className="text-xs">AWS</Badge>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
            <p className="text-sm text-gray-900 dark:text-white font-medium mb-2">Recommendation</p>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Consider adjusting Python Developer requirements - 67% of qualified candidates lack spaCy experience.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
