import { Link, useLocation } from "wouter";
import { logout } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { User } from "@shared/schema";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

interface NavbarProps {
  user: User;
}

export default function Navbar({ user }: NavbarProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const handleLogout = async () => {
    const result = await logout();
    if (result.success) {
      setLocation("/login");
    } else {
      toast({
        title: "Logout Failed",
        description: result.error,
        variant: "destructive"
      });
    }
  };
  
  return (
    <nav className="bg-primary rounded-2xl shadow-lg text-white mb-8">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <i className="fas fa-chart-line text-2xl"></i>
            <span className="text-xl font-bold">Twinzy</span>
          </div>
          
          <div className="hidden md:flex items-center space-x-2">
            <Link href="/dashboard">
              <a className="px-4 py-2 rounded-xl hover:bg-white hover:bg-opacity-20 transition-colors">
                Dashboard
              </a>
            </Link>
            <Link href="/goals">
              <a className="px-4 py-2 rounded-xl hover:bg-white hover:bg-opacity-20 transition-colors">
                Goals
              </a>
            </Link>
            <Link href="/analytics">
              <a className="px-4 py-2 rounded-xl hover:bg-white hover:bg-opacity-20 transition-colors">
                Analytics
              </a>
            </Link>
            <Link href="./settings">
              <a className="px-4 py-2 rounded-xl hover:bg-white hover:bg-opacity-20 transition-colors">
                Settings
              </a>
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center space-x-2 focus:outline-none">
                <div className="flex items-center space-x-2">
                  <img 
                    src={user.photoURL || "https://ui-avatars.com/api/?name=" + encodeURIComponent(user.name)} 
                    alt={user.name}
                    className="w-10 h-10 rounded-full border-2 border-white"
                  />
                  <span className="hidden md:inline">{user.name}</span>
                  <i className="fas fa-chevron-down text-xs"></i>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-48">
                <DropdownMenuItem asChild>
                  <Link href="/profile">
                    <a className="w-full">Profile</a>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings">
                    <a className="w-full">Settings</a>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
}
