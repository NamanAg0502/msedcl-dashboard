"use client";

import { Loader2 } from "lucide-react";

export const LoadingSpinner: React.FC<{
  size?: number;
  className?: string;
}> = ({ size = 24, className = "" }) => {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <Loader2 className="animate-spin" size={size} />
    </div>
  );
};

export const PageLoader: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <LoadingSpinner size={48} />
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    </div>
  );
};
