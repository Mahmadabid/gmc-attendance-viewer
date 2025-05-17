/**
 * Parses a date string that could be in DD/MM/YYYY format or ISO format
 * @param dateStr Date string in DD/MM/YYYY format or ISO format
 * @returns A proper Date object
 */
export function parseDate(dateStr: string): Date | null {
  if (!dateStr) return null;
  
  // Check if the date is in DD/MM/YYYY format
  const ddmmyyyyPattern = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
  const match = dateStr.match(ddmmyyyyPattern);
  
  if (match) {
    // Extract day, month (0-indexed), and year
    const day = parseInt(match[1], 10);
    const month = parseInt(match[2], 10) - 1; // Month is 0-indexed in JS Date
    const year = parseInt(match[3], 10);
    return new Date(year, month, day);
  } 
  
  // Otherwise, try to parse as ISO format or other format
  return new Date(dateStr);
}

/**
 * Normalizes a date by setting the time to 00:00:00.000
 * This helps ensure consistent date comparisons by ignoring time components
 */
export function normalizeDate(date: Date): Date {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  return normalized;
}

/**
 * Compares if a date is within a date range (inclusive of both start and end dates)
 * All dates are normalized to ensure consistent comparison regardless of time components
 */
export function isDateInRange(date: Date | string, startDate: Date | string | null, endDate: Date | string | null): boolean {
  if (!date) return false;
  
  // Convert string dates to Date objects if needed
  const dateObj = typeof date === 'string' ? parseDate(date) : date;
  if (!dateObj) return false;
  
  const normalizedDate = normalizeDate(dateObj);
    // Check if date is before start date
  if (startDate) {
    const startDateObj = typeof startDate === 'string' ? parseDate(startDate) : startDate;
    if (startDateObj && normalizeDate(startDateObj) > normalizedDate) {
      return false;
    }
  }
  
  // Check if date is after end date
  if (endDate) {
    const endDateObj = typeof endDate === 'string' ? parseDate(endDate) : endDate;
    if (endDateObj) {
      // For end date, we want to include the entire day
      const normalizedEndDate = normalizeDate(endDateObj);
      // Add one day and then check if date is less than that
      // This effectively makes the comparison include the entire end date
      normalizedEndDate.setDate(normalizedEndDate.getDate() + 1);
      if (normalizedDate >= normalizedEndDate) {
        return false;
      }
    }
  }
  
  return true;
}
