"use client";

import { Component, ReactNode } from "react";
import { motion } from "framer-motion";
import { RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to console in development
    console.error("Error caught by boundary:", error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  handleGoHome = () => {
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-gradient-calm flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md"
          >
            <Card className="text-center">
              <CardContent className="pt-8 pb-6">
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-6xl mb-4"
                >
                  🌿
                </motion.div>
                
                <h2 className="text-xl font-semibold text-sage-800 mb-2">
                  Something went wrong
                </h2>
                
                <p className="text-sage-600 mb-6">
                  Take a deep breath. These things happen. Let&apos;s try again.
                </p>

                <div className="flex flex-col gap-3">
                  <Button onClick={this.handleRetry} className="w-full">
                    <RefreshCw className="w-4 h-4 mr-2" aria-hidden="true" />
                    Try Again
                  </Button>
                  
                  <Button variant="ghost" onClick={this.handleGoHome} className="w-full">
                    <Home className="w-4 h-4 mr-2" aria-hidden="true" />
                    Go Home
                  </Button>
                </div>

                {process.env.NODE_ENV === "development" && this.state.error && (
                  <details className="mt-6 text-left">
                    <summary className="text-sm text-sage-500 cursor-pointer">
                      Error details
                    </summary>
                    <pre className="mt-2 p-3 bg-beige-100 rounded-lg text-xs text-sage-700 overflow-auto">
                      {this.state.error.message}
                    </pre>
                  </details>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Functional wrapper for easier use
export function withErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  fallback?: ReactNode
) {
  return function WithErrorBoundary(props: P) {
    return (
      <ErrorBoundary fallback={fallback}>
        <WrappedComponent {...props} />
      </ErrorBoundary>
    );
  };
}
