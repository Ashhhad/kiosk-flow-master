// Analytics Service for Kiosk Events
// Tracks all user interactions and system actions

type AnalyticsEvent = {
  eventName: string;
  properties: Record<string, unknown>;
  timestamp: number;
  sessionId?: string;
};

class AnalyticsService {
  private events: AnalyticsEvent[] = [];
  private isEnabled: boolean = true;

  trackEvent(eventName: string, properties: Record<string, unknown> = {}) {
    if (!this.isEnabled) return;

    const event: AnalyticsEvent = {
      eventName,
      properties,
      timestamp: Date.now(),
    };

    this.events.push(event);

    // In production, this would send to analytics backend
    // [SYSTEM ACTION] analytics.track(event)
    if (process.env.NODE_ENV === 'development') {
      console.log('[ANALYTICS]', eventName, properties);
    }

    // For production: would integrate with analytics provider
    // await fetch('/api/analytics', { method: 'POST', body: JSON.stringify(event) });
  }

  trackScreenView(screenName: string, additionalProps: Record<string, unknown> = {}) {
    this.trackEvent('screen_view', {
      screen_name: screenName,
      ...additionalProps,
    });
  }

  trackCartAction(action: 'add' | 'remove' | 'update', item: string, quantity: number, value: number) {
    this.trackEvent(`cart_${action}`, {
      item_name: item,
      quantity,
      value,
    });
  }

  trackPayment(status: 'initiated' | 'success' | 'failed' | 'retry', method: string, amount: number) {
    this.trackEvent(`payment_${status}`, {
      payment_method: method,
      amount,
    });
  }

  trackError(errorType: string, errorMessage: string, context: Record<string, unknown> = {}) {
    this.trackEvent('error', {
      error_type: errorType,
      error_message: errorMessage,
      ...context,
    });
  }

  trackTiming(category: string, variable: string, time: number) {
    this.trackEvent('timing', {
      category,
      variable,
      time,
    });
  }

  getEvents() {
    return [...this.events];
  }

  clearEvents() {
    this.events = [];
  }

  setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
  }
}

export const analyticsService = new AnalyticsService();
