import { format, isValid, parseISO, subDays, startOfDay, endOfDay } from 'date-fns';

/**
 * Format date for API requests (ISO string)
 */
export const formatDateForAPI = (date: Date | null): string | undefined => {
  if (!date || !isValid(date)) return undefined;
  return date.toISOString();
};

/**
 * Format date for display
 */
export const formatDateForDisplay = (date: string | Date, formatString: string = 'MMM dd, yyyy'): string => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(dateObj)) return 'Invalid Date';
    return format(dateObj, formatString);
  } catch {
    return 'Invalid Date';
  }
};

/**
 * Format datetime for display
 */
export const formatDateTimeForDisplay = (date: string | Date): string => {
  return formatDateForDisplay(date, 'MMM dd, yyyy HH:mm');
};

/**
 * Get predefined date ranges
 */
export const getDateRangePresets = () => {
  const now = new Date();
  
  return {
    today: {
      label: 'Today',
      start: startOfDay(now),
      end: endOfDay(now),
    },
    yesterday: {
      label: 'Yesterday',
      start: startOfDay(subDays(now, 1)),
      end: endOfDay(subDays(now, 1)),
    },
    last7Days: {
      label: 'Last 7 Days',
      start: startOfDay(subDays(now, 7)),
      end: endOfDay(now),
    },
    last30Days: {
      label: 'Last 30 Days',
      start: startOfDay(subDays(now, 30)),
      end: endOfDay(now),
    },
    thisMonth: {
      label: 'This Month',
      start: startOfDay(new Date(now.getFullYear(), now.getMonth(), 1)),
      end: endOfDay(now),
    },
  };
};

/**
 * Check if date is within range
 */
export const isDateInRange = (
  date: Date | string,
  startDate: Date | null,
  endDate: Date | null
): boolean => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  
  if (!isValid(dateObj)) return false;
  
  if (startDate && dateObj < startDate) return false;
  if (endDate && dateObj > endDate) return false;
  
  return true;
};

/**
 * Get relative time string (e.g., "2 hours ago")
 */
export const getRelativeTime = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  
  if (!isValid(dateObj)) return 'Invalid date';
  
  const now = new Date();
  const diffMs = now.getTime() - dateObj.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
  
  return formatDateForDisplay(dateObj);
};
