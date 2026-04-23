"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui";
import { AlertCircle, RefreshCcw, Home } from "lucide-react";
import Link from "next/link";
import { CloudMonitoring } from "@/utils/monitoring";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    CloudMonitoring.logError(error, { digest: error.digest });
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4">
      <div className="max-w-md w-full text-center space-y-8">
        <div className="flex justify-center">
          <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-3xl flex items-center justify-center text-red-600 animate-bounce">
            <AlertCircle size={40} />
          </div>
        </div>
        
        <div className="space-y-3">
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Something went wrong</h1>
          <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
            We encountered an unexpected error. Don't worry, your election data is safe.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <Button 
            onClick={reset}
            className="w-full bg-blue-600 text-white hover:bg-blue-700 flex items-center justify-center gap-2"
          >
            <RefreshCcw size={18} /> Try Again
          </Button>
          <Link href="/" className="w-full">
            <Button className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white flex items-center justify-center gap-2">
              <Home size={18} /> Go Home
            </Button>
          </Link>
        </div>

        <p className="text-[10px] text-slate-400 font-mono">
          Error ID: {error.digest || "Unknown"}
        </p>
      </div>
    </div>
  );
}
