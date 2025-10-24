"use client";

import LoadingSpinner from "@/components/common/LoadingSpinner";

interface LoadingStateProps {
  message: string;
}

export default function LoadingState({ message }: Readonly<LoadingStateProps>) {
  return (
    <div className="bg-white rounded-xl shadow-md p-12 flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner size="lg" />
        <p className="text-gray-600 mt-4">{message}</p>
      </div>
    </div>
  );
}
