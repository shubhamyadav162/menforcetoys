// Comprehensive error handling and user feedback utilities for NP Wellness Store

export interface ErrorInfo {
  code?: string;
  message: string;
  details?: any;
  timestamp: Date;
  context?: string;
}

export interface UserFeedback {
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export class ErrorHandler {
  private static errors: ErrorInfo[] = [];
  private static maxErrors = 50;

  // Log error with context
  static logError(error: Error | string, context?: string, details?: any): void {
    const errorInfo: ErrorInfo = {
      code: this.extractErrorCode(error),
      message: this.extractErrorMessage(error),
      details,
      timestamp: new Date(),
      context
    };

    this.errors.unshift(errorInfo);
    
    // Keep only the last maxErrors
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(0, this.maxErrors);
    }

    // Log to console for development
    console.error('NP Wellness Error:', errorInfo);

    // In production, you might want to send errors to a monitoring service
    if (import.meta.env.PROD) {
      this.sendToMonitoringService(errorInfo);
    }
  }

  // Extract error code from various error types
  private static extractErrorCode(error: Error | string): string | undefined {
    if (error instanceof Error) {
      // Check for common error patterns
      if (error.message.includes('network') || error.message.includes('fetch')) {
        return 'NETWORK_ERROR';
      }
      if (error.message.includes('validation')) {
        return 'VALIDATION_ERROR';
      }
      if (error.message.includes('auth') || error.message.includes('unauthorized')) {
        return 'AUTH_ERROR';
      }
      if (error.message.includes('timeout')) {
        return 'TIMEOUT_ERROR';
      }
      
      // Check for Supabase specific errors
      if (error.message.includes('PGRST')) {
        return 'SUPABASE_ERROR';
      }
      
      return error.name;
    }
    
    return 'UNKNOWN_ERROR';
  }

  // Extract user-friendly error message
  private static extractErrorMessage(error: Error | string): string {
    if (typeof error === 'string') {
      return error;
    }
    
    return error.message || 'An unexpected error occurred';
  }

  // Send error to monitoring service (placeholder)
  private static sendToMonitoringService(errorInfo: ErrorInfo): void {
    // In a real implementation, you would send this to services like:
    // - Sentry
    // - LogRocket
    // - Custom error tracking API
    console.log('Would send to monitoring service:', errorInfo);
  }

  // Get recent errors
  static getRecentErrors(count: number = 10): ErrorInfo[] {
    return this.errors.slice(0, count);
  }

  // Clear error log
  static clearErrors(): void {
    this.errors = [];
  }

  // Get user-friendly message for common error codes
  static getUserFriendlyMessage(errorCode: string, language: 'en' | 'hi' = 'en'): string {
    const messages: Record<string, { en: string; hi: string }> = {
      NETWORK_ERROR: {
        en: 'Network connection error. Please check your internet connection and try again.',
        hi: 'नेटवर्क कनेक्शन त्रुटि। कृपया अपना इंटरनेट कनेक्शन जांचें और फिर से कोशिश करें।'
      },
      VALIDATION_ERROR: {
        en: 'Please check your input and correct any errors.',
        hi: 'कृपया अपना इनपुट जांचें और किसी भी त्रुटि को सुधारें।'
      },
      AUTH_ERROR: {
        en: 'Authentication error. Please log in again.',
        hi: 'प्रमाणीकरण त्रुटि। कृपया फिर से लॉग इन करें।'
      },
      TIMEOUT_ERROR: {
        en: 'Request timed out. Please try again.',
        hi: 'अनुरोध समय समाप्त। कृपया फिर से कोशिश करें।'
      },
      SUPABASE_ERROR: {
        en: 'Database error. Please try again later.',
        hi: 'डेटाबेस त्रुटि। कृपया बाद में फिर से कोशिश करें।'
      },
      UNKNOWN_ERROR: {
        en: 'An unexpected error occurred. Please try again.',
        hi: 'एक अप्रत्याशित त्रुटि हुई। कृपया फिर से कोशिश करें।'
      }
    };

    return messages[errorCode]?.[language] || messages.UNKNOWN_ERROR[language];
  }
}

// User feedback manager
export class FeedbackManager {
  private static feedbackQueue: UserFeedback[] = [];
  private static isShowing = false;

  // Show feedback message
  static show(feedback: UserFeedback): void {
    this.feedbackQueue.push(feedback);
    
    if (!this.isShowing) {
      this.processQueue();
    }
  }

  // Show success message
  static success(title: string, message: string, duration?: number): void {
    this.show({
      type: 'success',
      title,
      message,
      duration: duration || 3000
    });
  }

  // Show error message
  static error(title: string, message: string, duration?: number): void {
    this.show({
      type: 'error',
      title,
      message,
      duration: duration || 5000
    });
  }

  // Show warning message
  static warning(title: string, message: string, duration?: number): void {
    this.show({
      type: 'warning',
      title,
      message,
      duration: duration || 4000
    });
  }

  // Show info message
  static info(title: string, message: string, duration?: number): void {
    this.show({
      type: 'info',
      title,
      message,
      duration: duration || 3000
    });
  }

  // Process feedback queue
  private static processQueue(): void {
    if (this.feedbackQueue.length === 0) {
      this.isShowing = false;
      return;
    }

    this.isShowing = true;
    const feedback = this.feedbackQueue.shift()!;
    
    // Create and show toast notification
    this.showToast(feedback);
  }

  // Show toast notification
  private static showToast(feedback: UserFeedback): void {
    // This would integrate with your toast system
    // For now, we'll use browser notifications as fallback
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(feedback.title, {
        body: feedback.message,
        icon: '/favicon.ico'
      });
    } else {
      // Fallback to console
      console.log(`${feedback.type.toUpperCase()}: ${feedback.title} - ${feedback.message}`);
    }

    // Schedule next feedback
    setTimeout(() => {
      this.processQueue();
    }, feedback.duration || 3000);
  }

  // Request notification permission
  static requestNotificationPermission(): void {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }
}

// Network status monitor
export class NetworkMonitor {
  private static isOnline = navigator.onLine;
  private static listeners: ((online: boolean) => void)[] = [];

  static init(): void {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.notifyListeners(true);
      FeedbackManager.info(
        'Connection Restored',
        'Your internet connection has been restored.'
      );
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.notifyListeners(false);
      FeedbackManager.warning(
        'Connection Lost',
        'You are currently offline. Some features may not work.'
      );
    });
  }

  static isCurrentlyOnline(): boolean {
    return this.isOnline;
  }

  static addListener(listener: (online: boolean) => void): void {
    this.listeners.push(listener);
  }

  static removeListener(listener: (online: boolean) => void): void {
    this.listeners = this.listeners.filter(l => l !== listener);
  }

  private static notifyListeners(online: boolean): void {
    this.listeners.forEach(listener => listener(online));
  }
}

// Form submission tracker
export class FormSubmissionTracker {
  private static submissions: Map<string, { count: number; lastAttempt: Date }> = new Map();

  static trackSubmission(formId: string): { canSubmit: boolean; reason?: string } {
    const now = new Date();
    const submission = this.submissions.get(formId);
    
    if (!submission) {
      this.submissions.set(formId, { count: 1, lastAttempt: now });
      return { canSubmit: true };
    }

    // Check rate limiting (max 5 submissions per minute)
    const timeDiff = now.getTime() - submission.lastAttempt.getTime();
    if (timeDiff < 60000 && submission.count >= 5) {
      return {
        canSubmit: false,
        reason: 'Too many submissions. Please wait a moment before trying again.'
      };
    }

    // Reset count if more than a minute has passed
    if (timeDiff > 60000) {
      submission.count = 1;
    } else {
      submission.count++;
    }
    
    submission.lastAttempt = now;
    this.submissions.set(formId, submission);
    
    return { canSubmit: true };
  }

  static resetTracking(formId: string): void {
    this.submissions.delete(formId);
  }
}

// Performance monitor
export class PerformanceMonitor {
  private static metrics: Map<string, number[]> = new Map();

  static startTimer(name: string): () => void {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      if (!this.metrics.has(name)) {
        this.metrics.set(name, []);
      }
      
      this.metrics.get(name)!.push(duration);
      
      // Keep only last 100 measurements
      const measurements = this.metrics.get(name)!;
      if (measurements.length > 100) {
        measurements.shift();
      }
      
      // Log slow operations
      if (duration > 3000) {
        console.warn(`Slow operation detected: ${name} took ${duration.toFixed(2)}ms`);
      }
    };
  }

  static getMetrics(name: string): { avg: number; min: number; max: number; count: number } | null {
    const measurements = this.metrics.get(name);
    if (!measurements || measurements.length === 0) {
      return null;
    }

    const avg = measurements.reduce((sum, val) => sum + val, 0) / measurements.length;
    const min = Math.min(...measurements);
    const max = Math.max(...measurements);

    return { avg, min, max, count: measurements.length };
  }

  static getAllMetrics(): Record<string, { avg: number; min: number; max: number; count: number }> {
    const result: Record<string, { avg: number; min: number; max: number; count: number }> = {};
    
    this.metrics.forEach((measurements, name) => {
      const metrics = this.getMetrics(name);
      if (metrics) {
        result[name] = metrics;
      }
    });
    
    return result;
  }
}

// Initialize monitoring systems
export const initializeMonitoring = (): void => {
  NetworkMonitor.init();
  FeedbackManager.requestNotificationPermission();
  
  // Log page load performance
  window.addEventListener('load', () => {
    const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
    console.log(`Page load time: ${loadTime}ms`);
    
    if (loadTime > 3000) {
      FeedbackManager.warning(
        'Slow Page Load',
        'The page took longer than usual to load. Please check your connection.'
      );
    }
  });
  
  // Log unhandled errors
  window.addEventListener('error', (event) => {
    ErrorHandler.logError(event.error || event.message, 'Global Error Handler', {
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno
    });
  });
  
  // Log unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    ErrorHandler.logError(event.reason, 'Unhandled Promise Rejection');
  });
};