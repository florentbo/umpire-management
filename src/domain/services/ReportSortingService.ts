export interface ReportForSorting {
  matchInfo: {
    date: string;
    time: string;
  };
  submittedAt: string;
}

export class ReportSortingService {
  /**
   * Parse date and time strings into a Date object with robust error handling
   */
  parseDateTime(dateStr: string, timeStr: string): Date {
    try {
      // Handle different date formats
      let normalizedDate = dateStr;
      
      // If date is in YYYY-MM-DD format, convert to a standard format
      if (dateStr.includes('-')) {
        const parts = dateStr.split('-');
        if (parts.length === 3) {
          normalizedDate = `${parts[1]}/${parts[2]}/${parts[0]}`; // Convert to MM/DD/YYYY
        }
      }
      
      // Clean up time string - remove milliseconds if present
      const cleanTime = timeStr.split('.')[0];
      
      // Create date object
      const dateTime = new Date(`${normalizedDate} ${cleanTime}`);
      
      // Validate the date
      if (isNaN(dateTime.getTime())) {
        console.warn(`Invalid date/time in reports: ${dateStr} ${timeStr}`);
        return new Date(0); // Return epoch as fallback
      }
      
      return dateTime;
    } catch (error) {
      console.warn(`Error parsing date/time in reports: ${dateStr} ${timeStr}`, error);
      return new Date(0); // Return epoch as fallback
    }
  }

  /**
   * Sort reports by match date/time (primary) and submission date (secondary)
   */
  sortReports<T extends ReportForSorting>(reports: T[]): T[] {
    return [...reports].sort((a, b) => {
      // Sort by match date and time (earliest first for better chronological order)
      const dateA = this.parseDateTime(a.matchInfo.date, a.matchInfo.time);
      const dateB = this.parseDateTime(b.matchInfo.date, b.matchInfo.time);
      
      // Primary sort: by match date/time (ascending - earliest first)
      const timeDiff = dateA.getTime() - dateB.getTime();
      if (timeDiff !== 0) {
        return timeDiff;
      }
      
      // Secondary sort: by submission date (latest first if match dates are the same)
      const submissionA = new Date(a.submittedAt);
      const submissionB = new Date(b.submittedAt);
      return submissionB.getTime() - submissionA.getTime();
    });
  }
}