import { describe, it, expect, beforeEach } from 'vitest';
import { ReportSortingService, ReportForSorting } from '../ReportSortingService';

describe('ReportSortingService', () => {
  let service: ReportSortingService;

  beforeEach(() => {
    service = new ReportSortingService();
  });

  describe('parseDateTime', () => {
    it('should parse YYYY-MM-DD date format correctly', () => {
      const result = service.parseDateTime('2025-01-15', '14:30:00');
      expect(result.getFullYear()).toBe(2025);
      expect(result.getMonth()).toBe(0); // January is 0
      expect(result.getDate()).toBe(15);
      expect(result.getHours()).toBe(14);
      expect(result.getMinutes()).toBe(30);
    });

    it('should parse MM/DD/YYYY date format correctly', () => {
      const result = service.parseDateTime('01/15/2025', '14:30:00');
      expect(result.getFullYear()).toBe(2025);
      expect(result.getMonth()).toBe(0);
      expect(result.getDate()).toBe(15);
    });

    it('should handle time with milliseconds', () => {
      const result = service.parseDateTime('2025-01-15', '14:30:00.0000000');
      expect(result.getHours()).toBe(14);
      expect(result.getMinutes()).toBe(30);
      expect(result.getSeconds()).toBe(0);
    });

    it('should return epoch date for invalid input', () => {
      const result = service.parseDateTime('invalid-date', 'invalid-time');
      expect(result.getTime()).toBe(0);
    });
  });

  describe('sortReports', () => {
    it('should sort by match date/time (primary)', () => {
      const reports: ReportForSorting[] = [
        {
          matchInfo: { date: '2025-01-17', time: '16:00' },
          submittedAt: '2025-01-18T10:00:00Z'
        },
        {
          matchInfo: { date: '2025-01-15', time: '14:00' },
          submittedAt: '2025-01-16T10:00:00Z'
        },
        {
          matchInfo: { date: '2025-01-16', time: '15:00' },
          submittedAt: '2025-01-17T10:00:00Z'
        }
      ];

      const result = service.sortReports(reports);
      
      // Should be sorted by match date (earliest first)
      expect(result[0].matchInfo.date).toBe('2025-01-15');
      expect(result[1].matchInfo.date).toBe('2025-01-16');
      expect(result[2].matchInfo.date).toBe('2025-01-17');
    });

    it('should sort by submission date when match dates are the same', () => {
      const reports: ReportForSorting[] = [
        {
          matchInfo: { date: '2025-01-15', time: '14:00' },
          submittedAt: '2025-01-16T10:00:00Z'
        },
        {
          matchInfo: { date: '2025-01-15', time: '14:00' },
          submittedAt: '2025-01-16T12:00:00Z' // Later submission
        }
      ];

      const result = service.sortReports(reports);
      
      // Should be sorted by submission date (latest first when match dates are same)
      expect(result[0].submittedAt).toBe('2025-01-16T12:00:00Z');
      expect(result[1].submittedAt).toBe('2025-01-16T10:00:00Z');
    });

    it('should handle different date formats', () => {
      const reports: ReportForSorting[] = [
        {
          matchInfo: { date: '01/17/2025', time: '16:00' },
          submittedAt: '2025-01-18T10:00:00Z'
        },
        {
          matchInfo: { date: '2025-01-15', time: '14:00' },
          submittedAt: '2025-01-16T10:00:00Z'
        }
      ];

      const result = service.sortReports(reports);
      
      // Should handle both formats and sort correctly
      expect(result[0].matchInfo.date).toBe('2025-01-15');
      expect(result[1].matchInfo.date).toBe('01/17/2025');
    });

    it('should handle invalid dates gracefully', () => {
      const reports: ReportForSorting[] = [
        {
          matchInfo: { date: 'invalid-date', time: 'invalid-time' },
          submittedAt: '2025-01-18T10:00:00Z'
        },
        {
          matchInfo: { date: '2025-01-15', time: '14:00' },
          submittedAt: '2025-01-16T10:00:00Z'
        }
      ];

      const result = service.sortReports(reports);
      
      // Should not throw and should handle gracefully
      expect(result).toHaveLength(2);
      // Valid date should come after invalid (epoch) date
      expect(result[0].matchInfo.date).toBe('invalid-date');
      expect(result[1].matchInfo.date).toBe('2025-01-15');
    });

    it('should not mutate original array', () => {
      const reports: ReportForSorting[] = [
        {
          matchInfo: { date: '2025-01-17', time: '16:00' },
          submittedAt: '2025-01-18T10:00:00Z'
        },
        {
          matchInfo: { date: '2025-01-15', time: '14:00' },
          submittedAt: '2025-01-16T10:00:00Z'
        }
      ];

      const originalOrder = reports.map(r => r.matchInfo.date);
      service.sortReports(reports);
      
      // Original array should remain unchanged
      expect(reports.map(r => r.matchInfo.date)).toEqual(originalOrder);
    });
  });
});