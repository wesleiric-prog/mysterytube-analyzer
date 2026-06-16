import { describe, expect, it } from 'vitest';
import { formatViews, getViralLabel, sortVideosByViralScore } from './dashboard-utils';

describe('dashboard-utils', () => {
  it('formats views using compact notation', () => {
    expect(formatViews(999)).toBe('999');
    expect(formatViews(1200)).toBe('1.2K');
    expect(formatViews(1500000)).toBe('1.5M');
  });

  it('returns labels by viral score band', () => {
    expect(getViralLabel(220)).toContain('Explosivo');
    expect(getViralLabel(100)).toContain('Médio');
    expect(getViralLabel(10)).toContain('Insuficiente');
  });

  it('sorts higher viral scores first', () => {
    const sorted = sortVideosByViralScore([
      {
        id: '1',
        channel_id: 'c1',
        title: 'One',
        thumbnail_url: '',
        view_count: 100,
        duration: '10:00',
        published_at: 'Hoje',
        viral_score: 50,
      },
      {
        id: '2',
        channel_id: 'c1',
        title: 'Two',
        thumbnail_url: '',
        view_count: 100,
        duration: '10:00',
        published_at: 'Hoje',
        viral_score: 200,
      },
    ]);

    expect(sorted.map((item) => item.id)).toEqual(['2', '1']);
  });
});