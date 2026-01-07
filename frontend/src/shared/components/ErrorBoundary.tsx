/**
 * Error Boundary Component - Prevents Screen Blackout
 * @purpose: Catch React errors and show fallback UI instead of blank screen
 */

import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
        console.error('🚨 [ErrorBoundary] Caught error:', error);
        console.error('🚨 [ErrorBoundary] Error info:', errorInfo);

        // Clean up any stuck body styles that could cause blackout
        document.body.style.overflow = '';
        document.body.style.touchAction = '';
        document.body.style.overscrollBehavior = '';
        document.body.style.pointerEvents = '';

        // Force a layout repaint
        window.dispatchEvent(new Event('resize'));
    }

    handleRetry = (): void => {
        this.setState({ hasError: false, error: null });
    };

    handleReload = (): void => {
        window.location.reload();
    };

    render(): ReactNode {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 max-w-sm w-full text-center">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                            <span className="material-symbols-rounded text-3xl text-red-500">error</span>
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                            Something went wrong
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm">
                            We encountered an unexpected error. Please try again.
                        </p>
                        <div className="flex gap-3 justify-center">
                            <button
                                onClick={this.handleRetry}
                                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                            >
                                Try Again
                            </button>
                            <button
                                onClick={this.handleReload}
                                className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
                            >
                                Reload App
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
