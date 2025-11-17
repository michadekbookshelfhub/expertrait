import React from "react";
import { Button } from "@/components/ui/button";
import { LogIn, UserPlus, Smartphone } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function AuthButtons({ variant = "default" }) {
  const navigate = useNavigate();

  // Authentication is handled via mobile app
  // Web interface is for browsing and downloading app

  const handleDownloadApp = () => {
    navigate(createPageUrl("DownloadApp"));
  };

  // Show download app button
  if (variant === "mobile") {
    return (
      <div className="flex flex-col gap-2 w-full">
        <Button
          onClick={handleDownloadApp}
          className="w-full bg-orange-600 hover:bg-orange-700 text-white"
        >
          <Smartphone className="w-4 h-4 mr-2" />
          Get the App
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <Button
        onClick={handleDownloadApp}
        className="bg-orange-600 hover:bg-orange-700 text-white"
      >
        <Smartphone className="w-4 h-4 mr-2" />
        Download App
      </Button>
    </div>
  );
}