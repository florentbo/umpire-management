export interface MatchWithStatus {
  match: {
    id: { value: string };
    date: string;
    time: string;
    homeTeam: string;
    awayTeam: string;
    division: string;
    umpireAName: string;
    umpireBName: string;
  };
  reportStatus: 'NONE' | 'DRAFT' | 'PUBLISHED';
  canEdit: boolean;
}

export interface SortedMatchGroups {
  priorityMatches: MatchWithStatus[];
  publishedMatches: MatchWithStatus[];
}

export class MatchSortingService {
  /**
   * Parse date and time strings into a Date object with robust error handling
   */
  parseDateTime(dateStr: string, timeStr: string): Date {
    try {
      // Handle different date formats that might come from CSV
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
        console.warn(`Invalid date/time: ${dateStr} ${timeStr}`);
        return new Date(0); // Return epoch as fallback
      }
      
      return dateTime;
    } catch (error) {
      console.warn(`Error parsing date/time: ${dateStr} ${timeStr}`, error);
      return new Date(0); // Return epoch as fallback
    }
  }

  /**
   * Get priority value for sorting - lower numbers = higher priority
   */
  private getPriority(status: 'NONE' | 'DRAFT' | 'PUBLISHED'): number {
    switch (status) {
      case 'NONE':
        return 1; // Highest priority - needs to be created
      case 'DRAFT':
        return 2; // Second priority - needs to be completed
      case 'PUBLISHED':
        return 3; // Lowest priority - already done
      default:
        return 4;
    }
  }

  /**
   * Filter matches by status
   */
  filterByStatus(matches: MatchWithStatus[], statusFilter: 'NONE' | 'DRAFT' | 'PUBLISHED' | 'ALL'): MatchWithStatus[] {
    if (statusFilter === 'ALL') {
      return matches;
    }
    return matches.filter(match => match.reportStatus === statusFilter);
  }

  /**
   * Sort matches with priority-based logic
   */
  sortMatches(matches: MatchWithStatus[]): MatchWithStatus[] {
    return [...matches].sort((a, b) => {
      const priorityA = this.getPriority(a.reportStatus);
      const priorityB = this.getPriority(b.reportStatus);

      // If different priorities, sort by priority
      if (priorityA !== priorityB) {
        return priorityA - priorityB;
      }

      // Within same priority, sort by date and time
      const dateA = this.parseDateTime(a.match.date, a.match.time);
      const dateB = this.parseDateTime(b.match.date, b.match.time);

      // For urgent tasks (NONE/DRAFT), show earliest dates first
      // For completed tasks (PUBLISHED), show latest dates first
      if (priorityA <= 2) { // NONE or DRAFT
        return dateA.getTime() - dateB.getTime(); // Ascending (earliest first)
      } else { // PUBLISHED
        return dateB.getTime() - dateA.getTime(); // Descending (latest first)
      }
    });
  }

  /**
   * Group matches by priority for display
   */
  groupMatchesByPriority(matches: MatchWithStatus[]): SortedMatchGroups {
    const sortedMatches = this.sortMatches(matches);
    
    const priorityMatches = sortedMatches.filter(
      match => match.reportStatus === 'NONE' || match.reportStatus === 'DRAFT'
    );
    
    const publishedMatches = sortedMatches.filter(
      match => match.reportStatus === 'PUBLISHED'
    );

    return { priorityMatches, publishedMatches };
  }

  /**
   * Get sorted and filtered matches
   */
  getSortedAndFilteredMatches(
    matches: MatchWithStatus[], 
    statusFilter: 'NONE' | 'DRAFT' | 'PUBLISHED' | 'ALL'
  ): MatchWithStatus[] {
    const filtered = this.filterByStatus(matches, statusFilter);
    return this.sortMatches(filtered);
  }
}