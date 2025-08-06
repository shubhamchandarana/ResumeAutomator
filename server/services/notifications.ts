export interface Notification {
  id: string;
  type: 'candidate_applied' | 'interview_scheduled' | 'high_score' | 'system';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  candidateName?: string;
  matchScore?: number;
}

// In-memory notification storage (in production, use database)
let notifications: Notification[] = [
  {
    id: '1',
    type: 'candidate_applied',
    title: 'New Candidate Applied',
    message: 'Sarah Johnson applied for Senior Software Engineer position',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    read: false,
    candidateName: 'Sarah Johnson',
    matchScore: 92
  },
  {
    id: '2',
    type: 'high_score',
    title: 'High Match Score Alert',
    message: 'Michael Chen scored 88% for Product Manager role',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
    read: false,
    candidateName: 'Michael Chen',
    matchScore: 88
  },
  {
    id: '3',
    type: 'interview_scheduled',
    title: 'Interview Scheduled',
    message: 'Interview scheduled with Alex Rodriguez for tomorrow 2:00 PM',
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
    read: true,
    candidateName: 'Alex Rodriguez'
  },
  {
    id: '4',
    type: 'system',
    title: 'System Update',
    message: 'AI matching algorithm has been improved for better accuracy',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    read: true
  }
];

export function getNotifications(): Notification[] {
  return notifications.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}

export function getUnreadCount(): number {
  return notifications.filter(n => !n.read).length;
}

export function markAsRead(notificationId: string): boolean {
  const notification = notifications.find(n => n.id === notificationId);
  if (notification) {
    notification.read = true;
    return true;
  }
  return false;
}

export function markAllAsRead(): void {
  notifications.forEach(n => n.read = true);
}

export function addNotification(notification: Omit<Notification, 'id' | 'timestamp' | 'read'>): Notification {
  const newNotification: Notification = {
    ...notification,
    id: Date.now().toString(),
    timestamp: new Date(),
    read: false
  };
  
  notifications.unshift(newNotification);
  
  // Keep only last 50 notifications
  notifications = notifications.slice(0, 50);
  
  return newNotification;
}

export function createCandidateNotification(candidateName: string, jobTitle: string, matchScore: number): Notification {
  let title: string;
  let message: string;
  let type: Notification['type'];
  
  if (matchScore >= 90) {
    title = 'Exceptional Candidate!';
    message = `${candidateName} scored ${matchScore}% for ${jobTitle} - Highly recommended!`;
    type = 'high_score';
  } else if (matchScore >= 80) {
    title = 'Strong Candidate';
    message = `${candidateName} scored ${matchScore}% for ${jobTitle} - Great fit!`;
    type = 'high_score';
  } else if (matchScore >= 70) {
    title = 'Qualified Candidate';
    message = `${candidateName} applied for ${jobTitle} and meets requirements`;
    type = 'candidate_applied';
  } else {
    title = 'New Application';
    message = `${candidateName} applied for ${jobTitle}`;
    type = 'candidate_applied';
  }
  
  return addNotification({
    type,
    title,
    message,
    candidateName,
    matchScore
  });
}