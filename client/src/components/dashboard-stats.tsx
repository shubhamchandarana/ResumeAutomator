import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { 
  FileText, 
  UserPlus, 
  Calendar, 
  TrendingUp,
  Brain
} from "lucide-react";

interface DashboardStats {
  totalApplications: number;
  shortlisted: number;
  interviews: number;
  avgScore: number;
  activeJobs: number;
}

export default function DashboardStats() {
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ['/api/dashboard-stats'],
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Applications",
      value: stats?.totalApplications || 0,
      icon: FileText,
      color: "text-primary",
      bgColor: "bg-primary/10",
      trend: "+12% from last month",
      trendIcon: TrendingUp,
      trendColor: "text-green-600",
      testId: "stat-total-applications"
    },
    {
      title: "Shortlisted",
      value: stats?.shortlisted || 0,
      icon: UserPlus,
      color: "text-green-500",
      bgColor: "bg-green-50 dark:bg-green-900/20",
      trend: "+8% from last month",
      trendIcon: TrendingUp,
      trendColor: "text-green-600",
      testId: "stat-shortlisted"
    },
    {
      title: "Interviews Scheduled",
      value: stats?.interviews || 0,
      icon: Calendar,
      color: "text-blue-500",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
      trend: "Next: Today 2:00 PM",
      trendIcon: Calendar,
      trendColor: "text-blue-600",
      testId: "stat-interviews"
    },
    {
      title: "Avg. Match Score",
      value: stats?.avgScore || 0,
      icon: Brain,
      color: "text-purple-500",
      bgColor: "bg-purple-50 dark:bg-purple-900/20",
      trend: "AI-powered matching",
      trendIcon: Brain,
      trendColor: "text-purple-600",
      testId: "stat-avg-score"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statCards.map((stat) => {
        const IconComponent = stat.icon;
        const TrendIconComponent = stat.trendIcon;
        
        return (
          <Card key={stat.title} className="hover:shadow-lg transition-shadow" data-testid={stat.testId}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white" data-testid={`${stat.testId}-value`}>
                    {stat.value}
                  </p>
                </div>
                <div className={`p-3 ${stat.bgColor} rounded-full`}>
                  <IconComponent className={`${stat.color} h-6 w-6`} />
                </div>
              </div>
              <p className={`text-xs ${stat.trendColor} mt-2 flex items-center`}>
                <TrendIconComponent className="h-3 w-3 mr-1" />
                {stat.trend}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
