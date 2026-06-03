/**
 * Date Formatting Utilities
 */

/**
 * Returns a human-friendly timestamp for chat messages.
 * e.g., "10:30 AM", "Yesterday", "Monday", or "12/05/2026"
 */
export function formatMessageTime(dateParam: string | Date | undefined): string {
  if (!dateParam) return '';
  const date = new Date(dateParam);
  
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const msgDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  // Format hours/minutes (e.g. 10:30 AM)
  const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  if (msgDate.getTime() === today.getTime()) {
    return timeStr;
  }
  
  if (msgDate.getTime() === yesterday.getTime()) {
    return `Yesterday, ${timeStr}`;
  }

  // If within the last 7 days, return name of day (e.g. "Monday, 10:30 AM")
  const diffMs = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays < 7) {
    const dayName = date.toLocaleDateString([], { weekday: 'long' });
    return `${dayName}, ${timeStr}`;
  }

  // Fallback to absolute date
  return `${date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}, ${timeStr}`;
}

/**
 * Returns a simplified last-seen message text.
 */
export function formatLastSeen(lastSeenParam: string | Date | undefined): string {
  if (!lastSeenParam) return 'Offline';
  const date = new Date(lastSeenParam);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  
  // Less than 1 minute
  if (diffMs < 60 * 1000) {
    return 'Just now';
  }
  
  // Less than 1 hour
  if (diffMs < 60 * 60 * 1000) {
    const mins = Math.floor(diffMs / (60 * 1000));
    return `Active ${mins}m ago`;
  }
  
  // Less than 24 hours
  if (diffMs < 24 * 60 * 60 * 1000) {
    const hours = Math.floor(diffMs / (60 * 60 * 1000));
    return `Active ${hours}h ago`;
  }

  // absolute dates
  return `Last seen ${date.toLocaleDateString()}`;
}
