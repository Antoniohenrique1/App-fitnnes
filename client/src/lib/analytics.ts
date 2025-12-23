type AnalyticsEvent =
    | 'workout_started'
    | 'workout_completed'
    | 'item_purchased'
    | 'badge_unlocked'
    | 'profile_updated'
    | 'login_success'
    | 'onboarding_completed'
    | 'feedback_viewed';

export const trackEvent = (event: AnalyticsEvent, metadata?: Record<string, any>) => {
    // Simulating analytics tracking (e.g., Mixpanel, Segment, or internal API)
    const timestamp = new Date().toISOString();
    const logEntry = {
        event,
        timestamp,
        metadata,
        sessionId: Math.random().toString(36).substring(7)
    };

    console.group(`📊 Analytics Event: ${event.toUpperCase()}`);
    console.log('Timestamp:', timestamp);
    if (metadata) console.log('Metadata:', metadata);
    console.groupEnd();

    // In a real app, we would send this to an API
    // try {
    //   fetch('/api/analytics', { method: 'POST', body: JSON.stringify(logEntry) });
    // } catch (e) { /* ignore */ }
};
