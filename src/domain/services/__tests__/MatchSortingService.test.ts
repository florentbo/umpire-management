import { MatchSortingService, MatchWithStatus } from '../MatchSortingService';

describe('MatchSortingService', () => {
  let service: MatchSortingService;

  beforeEach(() => {
    service = new MatchSortingService();
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

    it('should handle empty strings gracefully', () => {
      const result = service.parseDateTime('', '');
      expect(result.getTime()).toBe(0);
    });
  });

  describe('filterByStatus', () => {
    const mockMatches: MatchWithStatus[] = [
      {
        match: { id: { value: '1' }, date: '2025-01-15', time: '14:00', homeTeam: 'A', awayTeam: 'B', division: 'D1', umpireAName: 'U1', umpireBName: 'U2' },
        reportStatus: 'NONE',
        canEdit: true
      },
      {
        match: { id: { value: '2' }, date: '2025-01-16', time: '15:00', homeTeam: 'C', awayTeam: 'D', division: 'D1', umpireAName: 'U3', umpireBName: 'U4' },
        reportStatus: 'DRAFT',
        canEdit: true
      },
      {
        match: { id: { value: '3' }, date: '2025-01-17', time: '16:00', homeTeam: 'E', awayTeam: 'F', division: 'D1', umpireAName: 'U5', umpireBName: 'U6' },
        reportStatus: 'PUBLISHED',
        canEdit: false
      }
    ];

    it('should return all matches when filter is ALL', () => {
      const result = service.filterByStatus(mockMatches, 'ALL');
      expect(result).toHaveLength(3);
    });

    it('should filter by NONE status', () => {
      const result = service.filterByStatus(mockMatches, 'NONE');
      expect(result).toHaveLength(1);
      expect(result[0].reportStatus).toBe('NONE');
    });

    it('should filter by DRAFT status', () => {
      const result = service.filterByStatus(mockMatches, 'DRAFT');
      expect(result).toHaveLength(1);
      expect(result[0].reportStatus).toBe('DRAFT');
    });

    it('should filter by PUBLISHED status', () => {
      const result = service.filterByStatus(mockMatches, 'PUBLISHED');
      expect(result).toHaveLength(1);
      expect(result[0].reportStatus).toBe('PUBLISHED');
    });
  });

  describe('sortMatches', () => {
    it('should sort by priority (NONE > DRAFT > PUBLISHED)', () => {
      const matches: MatchWithStatus[] = [
        {
          match: { id: { value: '3' }, date: '2025-01-17', time: '16:00', homeTeam: 'E', awayTeam: 'F', division: 'D1', umpireAName: 'U5', umpireBName: 'U6' },
          reportStatus: 'PUBLISHED',
          canEdit: false
        },
        {
          match: { id: { value: '1' }, date: '2025-01-15', time: '14:00', homeTeam: 'A', awayTeam: 'B', division: 'D1', umpireAName: 'U1', umpireBName: 'U2' },
          reportStatus: 'NONE',
          canEdit: true
        },
        {
          match: { id: { value: '2' }, date: '2025-01-16', time: '15:00', homeTeam: 'C', awayTeam: 'D', division: 'D1', umpireAName: 'U3', umpireBName: 'U4' },
          reportStatus: 'DRAFT',
          canEdit: true
        }
      ];

      const result = service.sortMatches(matches);
      expect(result[0].reportStatus).toBe('NONE');
      expect(result[1].reportStatus).toBe('DRAFT');
      expect(result[2].reportStatus).toBe('PUBLISHED');
    });

    it('should sort by date within same priority (ascending for urgent tasks)', () => {
      const matches: MatchWithStatus[] = [
        {
          match: { id: { value: '2' }, date: '2025-01-16', time: '15:00', homeTeam: 'C', awayTeam: 'D', division: 'D1', umpireAName: 'U3', umpireBName: 'U4' },
          reportStatus: 'NONE',
          canEdit: true
        },
        {
          match: { id: { value: '1' }, date: '2025-01-15', time: '14:00', homeTeam: 'A', awayTeam: 'B', division: 'D1', umpireAName: 'U1', umpireBName: 'U2' },
          reportStatus: 'NONE',
          canEdit: true
        }
      ];

      const result = service.sortMatches(matches);
      expect(result[0].match.id.value).toBe('1'); // Earlier date should come first
      expect(result[1].match.id.value).toBe('2');
    });

    it('should sort by date within same priority (descending for published)', () => {
      const matches: MatchWithStatus[] = [
        {
          match: { id: { value: '1' }, date: '2025-01-15', time: '14:00', homeTeam: 'A', awayTeam: 'B', division: 'D1', umpireAName: 'U1', umpireBName: 'U2' },
          reportStatus: 'PUBLISHED',
          canEdit: false
        },
        {
          match: { id: { value: '2' }, date: '2025-01-16', time: '15:00', homeTeam: 'C', awayTeam: 'D', division: 'D1', umpireAName: 'U3', umpireBName: 'U4' },
          reportStatus: 'PUBLISHED',
          canEdit: false
        }
      ];

      const result = service.sortMatches(matches);
      expect(result[0].match.id.value).toBe('2'); // Later date should come first for published
      expect(result[1].match.id.value).toBe('1');
    });
  });

  describe('groupMatchesByPriority', () => {
    const mockMatches: MatchWithStatus[] = [
      {
        match: { id: { value: '1' }, date: '2025-01-15', time: '14:00', homeTeam: 'A', awayTeam: 'B', division: 'D1', umpireAName: 'U1', umpireBName: 'U2' },
        reportStatus: 'NONE',
        canEdit: true
      },
      {
        match: { id: { value: '2' }, date: '2025-01-16', time: '15:00', homeTeam: 'C', awayTeam: 'D', division: 'D1', umpireAName: 'U3', umpireBName: 'U4' },
        reportStatus: 'DRAFT',
        canEdit: true
      },
      {
        match: { id: { value: '3' }, date: '2025-01-17', time: '16:00', homeTeam: 'E', awayTeam: 'F', division: 'D1', umpireAName: 'U5', umpireBName: 'U6' },
        reportStatus: 'PUBLISHED',
        canEdit: false
      }
    ];

    it('should group matches correctly', () => {
      const result = service.groupMatchesByPriority(mockMatches);
      
      expect(result.priorityMatches).toHaveLength(2);
      expect(result.priorityMatches[0].reportStatus).toBe('NONE');
      expect(result.priorityMatches[1].reportStatus).toBe('DRAFT');
      
      expect(result.publishedMatches).toHaveLength(1);
      expect(result.publishedMatches[0].reportStatus).toBe('PUBLISHED');
    });
  });

  describe('getSortedAndFilteredMatches', () => {
    const mockMatches: MatchWithStatus[] = [
      {
        match: { id: { value: '3' }, date: '2025-01-17', time: '16:00', homeTeam: 'E', awayTeam: 'F', division: 'D1', umpireAName: 'U5', umpireBName: 'U6' },
        reportStatus: 'PUBLISHED',
        canEdit: false
      },
      {
        match: { id: { value: '1' }, date: '2025-01-15', time: '14:00', homeTeam: 'A', awayTeam: 'B', division: 'D1', umpireAName: 'U1', umpireBName: 'U2' },
        reportStatus: 'NONE',
        canEdit: true
      },
      {
        match: { id: { value: '2' }, date: '2025-01-16', time: '15:00', homeTeam: 'C', awayTeam: 'D', division: 'D1', umpireAName: 'U3', umpireBName: 'U4' },
        reportStatus: 'DRAFT',
        canEdit: true
      }
    ];

    it('should filter and sort correctly', () => {
      const result = service.getSortedAndFilteredMatches(mockMatches, 'ALL');
      
      expect(result).toHaveLength(3);
      expect(result[0].reportStatus).toBe('NONE');
      expect(result[1].reportStatus).toBe('DRAFT');
      expect(result[2].reportStatus).toBe('PUBLISHED');
    });

    it('should filter by specific status and sort', () => {
      const result = service.getSortedAndFilteredMatches(mockMatches, 'DRAFT');
      
      expect(result).toHaveLength(1);
      expect(result[0].reportStatus).toBe('DRAFT');
    });
  });
});