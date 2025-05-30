// index.js - Converted from TypeScript to JavaScript

import React, { Component } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.js';

// Error Boundary Component for catching and displaying errors gracefully
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log error information
    console.error('Brainspire Error:', error);
    console.error('Component Stack:', errorInfo.componentStack);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      // Cyberpunk-themed error UI
      return (
        <div className="min-h-screen bg-cyber-bg text-cyber-text font-inter flex items-center justify-center p-4">
          <div className="bg-cyber-card-bg rounded-lg border border-cyber-error shadow-cyber-error p-6 max-w-2xl w-full">
            <h2 className="text-2xl font-rajdhani font-bold text-cyber-error mb-4">
              <span className="inline-block mr-2">⚠</span>
              SYSTEM ERROR
            </h2>
            <div className="bg-black/50 rounded p-4 font-mono text-sm text-cyber-error mb-4 overflow-auto max-h-60">
              <p className="mb-2">{this.state.error?.toString()}</p>
              <details>
                <summary className="cursor-pointer text-cyber-accent-primary mb-2">Stack Trace</summary>
                <pre className="text-cyber-muted-text text-xs whitespace-pre-wrap">
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            </div>
            <p className="text-cyber-muted-text mb-4">
              An unexpected error occurred in the Brainspire system. Please try refreshing the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-5 py-2.5 bg-cyber-accent-primary text-black rounded-lg font-semibold hover:shadow-cyber transition-all flex items-center gap-2 text-sm mx-auto"
            >
              SYSTEM REBOOT
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Initialize the application
const initializeApp = () => {
  const rootElement = document.getElementById('root');
  
  if (!rootElement) {
    console.error('Root element not found. Cannot mount React application.');
    return;
  }
  
  const root = createRoot(rootElement);
  
  root.render(
    <React.StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </React.StrictMode>
  );
  
  console.log('Brainspire system initialized successfully.');
};

// Start the application
initializeApp();
