import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import NavigationHeader from "@/components/navigation-header";
import { Textarea } from "@/components/ui/textarea";
import { 
  Settings as SettingsIcon, 
  Key, 
  Mail, 
  Brain, 
  Calendar,
  Database,
  Shield,
  Bell
} from "lucide-react";

export default function Settings() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <NavigationHeader />
      <div className="max-w-6xl mx-auto p-6 space-y-8">
        <div className="flex items-center space-x-4">
          <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center">
            <SettingsIcon className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white" data-testid="text-settings-title">
              Application Settings
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Configure your Smart Recruiter application preferences and integrations
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* AI Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Brain className="h-5 w-5" />
                <span>AI Configuration</span>
              </CardTitle>
              <CardDescription>
                Configure AI-powered resume analysis settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="geminiKey" className="flex items-center space-x-2">
                  <Key className="h-4 w-4" />
                  <span>Gemini API Key</span>
                </Label>
                <Input 
                  id="geminiKey" 
                  type="password"
                  placeholder="AIzaSy..."
                  defaultValue="••••••••••••••••"
                  data-testid="input-gemini-key"
                />
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Your Google Gemini API key for AI-powered resume analysis
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="minScore">Minimum Match Score for Auto-Interview</Label>
                <Input 
                  id="minScore" 
                  type="number"
                  min="0"
                  max="100"
                  defaultValue="70"
                  data-testid="input-min-score"
                />
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Candidates scoring above this threshold will automatically qualify for interviews
                </p>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable AI Retry Logic</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Automatically retry failed AI requests with exponential backoff
                  </p>
                </div>
                <Switch defaultChecked data-testid="switch-ai-retry" />
              </div>
            </CardContent>
          </Card>

          {/* Email Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Mail className="h-5 w-5" />
                <span>Email Configuration</span>
              </CardTitle>
              <CardDescription>
                Configure email settings for candidate communications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="sendgridKey" className="flex items-center space-x-2">
                  <Key className="h-4 w-4" />
                  <span>SendGrid API Key</span>
                </Label>
                <Input 
                  id="sendgridKey" 
                  type="password"
                  placeholder="SG...."
                  defaultValue="••••••••••••••••"
                  data-testid="input-sendgrid-key"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fromEmail">From Email Address</Label>
                <Input 
                  id="fromEmail" 
                  type="email"
                  defaultValue="hr@company.com"
                  data-testid="input-from-email"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name</Label>
                <Input 
                  id="companyName" 
                  defaultValue="Smart Recruiter Inc."
                  data-testid="input-company-name"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Auto-send Interview Invites</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Automatically send interview invitations to qualified candidates
                  </p>
                </div>
                <Switch defaultChecked data-testid="switch-auto-invite" />
              </div>
            </CardContent>
          </Card>

          {/* Calendar Integration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>Calendar Integration</span>
              </CardTitle>
              <CardDescription>
                Connect your calendar for automated interview scheduling
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Calendar Provider</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" data-testid="button-connect-google-calendar">
                    Connect Google Calendar
                  </Button>
                  <Button variant="outline" data-testid="button-connect-calendly">
                    Connect Calendly
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="defaultDuration">Default Interview Duration (minutes)</Label>
                <Input 
                  id="defaultDuration" 
                  type="number"
                  min="15"
                  max="180"
                  defaultValue="60"
                  data-testid="input-interview-duration"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="interviewBuffer">Buffer Time Between Interviews (minutes)</Label>
                <Input 
                  id="interviewBuffer" 
                  type="number"
                  min="0"
                  max="60"
                  defaultValue="15"
                  data-testid="input-interview-buffer"
                />
              </div>
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Security & Privacy</span>
              </CardTitle>
              <CardDescription>
                Configure security and data privacy settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Two-Factor Authentication</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Add an extra layer of security to your account
                  </p>
                </div>
                <Button variant="outline" size="sm" data-testid="button-setup-2fa">
                  Setup
                </Button>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Auto-delete Rejected Applications</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Automatically delete rejected applications after 90 days
                  </p>
                </div>
                <Switch data-testid="switch-auto-delete" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dataRetention">Data Retention Period (days)</Label>
                <Input 
                  id="dataRetention" 
                  type="number"
                  min="30"
                  max="365"
                  defaultValue="180"
                  data-testid="input-data-retention"
                />
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="h-5 w-5" />
                <span>Notification Preferences</span>
              </CardTitle>
              <CardDescription>
                Configure how and when you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Email Notifications</h4>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>New Applications</Label>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        When new candidates apply
                      </p>
                    </div>
                    <Switch defaultChecked data-testid="switch-notify-applications" />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>High-scoring Candidates</Label>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        When candidates score above threshold
                      </p>
                    </div>
                    <Switch defaultChecked data-testid="switch-notify-high-scores" />
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Interview Reminders</h4>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>24 Hours Before</Label>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Send reminder 1 day before interview
                      </p>
                    </div>
                    <Switch defaultChecked data-testid="switch-remind-24h" />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>1 Hour Before</Label>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Send reminder 1 hour before interview
                      </p>
                    </div>
                    <Switch defaultChecked data-testid="switch-remind-1h" />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="emailTemplate">Custom Email Template</Label>
                <Textarea 
                  id="emailTemplate"
                  placeholder="Customize your interview invitation email template..."
                  className="min-h-[100px]"
                  defaultValue="Hi {candidate_name}, Thank you for applying to the {job_title} position at our company..."
                  data-testid="textarea-email-template"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end space-x-4">
          <Button variant="outline" data-testid="button-reset-settings">
            Reset to Defaults
          </Button>
          <Button data-testid="button-save-settings">
            Save All Settings
          </Button>
        </div>
      </div>
    </div>
  );
}