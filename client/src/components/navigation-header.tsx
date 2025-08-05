import { useTheme } from "./theme-provider";
import { Button } from "@/components/ui/button";
import { 
  Bell, 
  Sun, 
  Moon, 
  ChevronDown,
  Briefcase
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function NavigationHeader() {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Briefcase className="text-primary text-2xl" />
              <h1 className="text-xl font-medium text-gray-900 dark:text-white">Smart Recruiter</h1>
            </div>
            <nav className="hidden md:flex space-x-6 ml-8">
              <a href="/" className="text-primary font-medium px-3 py-2 rounded-md bg-primary/10">Dashboard</a>
              <a href="/upload" className="text-gray-700 dark:text-gray-300 hover:text-primary px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">Upload</a>
              <a href="#" className="text-gray-700 dark:text-gray-300 hover:text-primary px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">Analytics</a>
            </nav>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              data-testid="button-theme-toggle"
            >
              {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </Button>
            
            <Button variant="ghost" size="icon" className="relative" data-testid="button-notifications">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-3" data-testid="button-user-menu">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-primary text-white">HR</AvatarFallback>
                  </Avatar>
                  <span className="text-gray-700 dark:text-gray-300 text-sm font-medium">HR Manager</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuItem>Logout</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
