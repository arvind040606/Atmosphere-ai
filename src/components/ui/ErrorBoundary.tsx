import { Component, ReactNode } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, RotateCcw } from "lucide-react";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error boundary to catch and handle React component errors gracefully
 * Prevents entire app from crashing if a component fails
 * Used for critical features like map, weather card, search
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    console.error("Error boundary caught:", error);
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log to console for debugging
    console.error("ErrorBoundary:", error, errorInfo);
  }

  reset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center p-8 text-center"
            style={{
              minHeight: "300px",
              borderRadius: "16px",
              background: "rgba(220,38,38,0.05)",
              border: "1px solid rgba(220,38,38,0.20)",
            }}
          >
            <AlertTriangle size={40} style={{ color: "#dc2626", marginBottom: "12px" }} />
            <h3 className="text-lg font-bold t-primary mb-1">Something went wrong</h3>
            <p className="text-sm t-muted mb-4 max-w-sm">
              {this.state.error?.message || "An unexpected error occurred"}
            </p>
            <button
              onClick={this.reset}
              className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-opacity hover:opacity-80"
              style={{
                background: "rgba(220,38,38,0.10)",
                color: "#dc2626",
                border: "1px solid rgba(220,38,38,0.20)",
              }}
            >
              <RotateCcw size={14} />
              Try again
            </button>
          </motion.div>
        )
      );
    }

    return this.props.children;
  }
}
