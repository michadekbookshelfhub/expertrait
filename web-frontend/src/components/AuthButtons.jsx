import React from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { LogIn, UserPlus, LogOut, LayoutDashboard } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function AuthButtons({ variant = "default" }) {
  const [user, setUser] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const navigate = useNavigate();

  React.useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const isAuthenticated = await base44.auth.isAuthenticated();
      if (isAuthenticated) {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      }
    } catch (error) {
      console.log("Not authenticated");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = () => {
    base44.auth.redirectToLogin(createPageUrl("Home"));
  };

  const handleSignup = () => {
    base44.auth.redirectToLogin(createPageUrl("Home"));
  };

  const handleLogout = () => {
    base44.auth.logout();
  };

  const handleDashboard = () => {
    // Default to UserDashboard for all users
    // Both dashboards now show the mobile app download page
    navigate(createPageUrl("UserDashboard"));
  };

  if (isLoading) {
    return null;
  }

  if (user) {
    // Logged in state
    if (variant === "mobile") {
      return (
        <div className="flex flex-col gap-2 w-full">
          <Button
            onClick={handleDashboard}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white"
          >
            <LayoutDashboard className="w-4 h-4 mr-2" />
            My Dashboard
          </Button>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-3">
        <Button
          onClick={handleDashboard}
          variant="outline"
          className="border-orange-600 text-orange-600 hover:bg-orange-50"
        >
          <LayoutDashboard className="w-4 h-4 mr-2" />
          Dashboard
        </Button>
        <Button
          onClick={handleLogout}
          variant="ghost"
          className="text-gray-700 hover:text-orange-600"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </div>
    );
  }

  // Logged out state
  if (variant === "mobile") {
    return (
      <div className="flex flex-col gap-2 w-full">
        <Button
          onClick={handleLogin}
          className="w-full bg-orange-600 hover:bg-orange-700 text-white"
        >
          <LogIn className="w-4 h-4 mr-2" />
          Login
        </Button>
        <Button
          onClick={handleSignup}
          variant="outline"
          className="w-full"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Sign Up
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <Button
        onClick={handleLogin}
        variant="outline"
        className="border-orange-600 text-orange-600 hover:bg-orange-50"
      >
        <LogIn className="w-4 h-4 mr-2" />
        Login
      </Button>
      <Button
        onClick={handleSignup}
        className="bg-orange-600 hover:bg-orange-700 text-white"
      >
        <UserPlus className="w-4 h-4 mr-2" />
        Sign Up
      </Button>
    </div>
  );
}