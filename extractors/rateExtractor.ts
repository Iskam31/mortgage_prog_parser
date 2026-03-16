import * as cheerio from 'cheerio';

interface RateCandidate {
  rate: number;
  context: string;
}

const RATE_REGEX = /(\d+[.,]\d+)\s*%/;

export function extractRates($: cheerio.CheerioAPI): RateCandidate[] {
  const candidates: RateCandidate[] = [];
  const seen = new Set<number>();
  
  const searchElements = () => {
    $('*').each((_, el) => {
      const element = $(el);
      const text = element.text();
      
      const matches = text.matchAll(RATE_REGEX);
      for (const match of matches) {
        const rate = parseFloat(match[1].replace(',', '.'));
        if (rate >= 1 && rate <= 50 && !seen.has(rate)) {
          seen.add(rate);
          const context = text.trim().slice(0, 200);
          candidates.push({ rate, context });
        }
      }
    });
  };
  
  searchElements();
  
  return candidates;
}

export function findMinRate(candidates: RateCandidate[]): number | null {
  if (candidates.length === 0) return null;
  return Math.min(...candidates.map(c => c.rate));
}

export function findMaxRate(candidates: RateCandidate[]): number | null {
  if (candidates.length === 0) return null;
  return Math.max(...candidates.map(c => c.rate));
}
