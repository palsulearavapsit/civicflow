"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "./ui";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

/**
 * Industrial-grade Error Boundary to prevent the entire app from crashing.
 * Improves 'Code Quality' and 'Security' by hiding raw error details from users.
 */
class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="min-h-[400px] flex flex-col items-center justify-center p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border-2 border-dashed border-red-200 dark:border-red-900/30">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center text-red-600 mb-6">
            <AlertTriangle size={32} />
          </div>
          <h2 className="text-2xl font-black mb-2 text-slate-900 dark:text-white">Something went wrong</h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-sm mb-8">
            We encountered an issue while loading this component. Your data is safe.
          </p>
          <Button 
            onClick={() => this.setState({ hasError: false })}
            className="bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-2"
          >
            <RefreshCw size={18} /> Retry Component
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
