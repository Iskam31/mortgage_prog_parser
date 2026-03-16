import * as cheerio from 'cheerio';

export interface ProgramWithRate {
  name: string;
  type: 'new_building';
  isSpecial: boolean;
  specialName?: string;
  rateMin: number;
  rateMax: number;
}

const NEW_BUILDING_KEYWORDS: Record<string, { type: string; isSpecial: boolean }> = {
  'новостройка': { type: 'new_building', isSpecial: false },
  'строительство жилья': { type: 'new_building', isSpecial: false },
  'новое жильё': { type: 'new_building', isSpecial: false },
  'семейная ипотека': { type: 'new_building', isSpecial: true },
  'семейная': { type: 'new_building', isSpecial: true },
  'it-ипотека': { type: 'new_building', isSpecial: true },
  'для IT': { type: 'new_building', isSpecial: true },
  'военная ипотека': { type: 'new_building', isSpecial: true },
  'военная': { type: 'new_building', isSpecial: true },
  'дальневосточная ипотека': { type: 'new_building', isSpecial: true },
  'дальневосточная': { type: 'new_building', isSpecial: true },
  'льготная ипотека': { type: 'new_building', isSpecial: true },
  'льготная': { type: 'new_building', isSpecial: true },
  'господдержка': { type: 'new_building', isSpecial: true },
  'ипотека с господдержкой': { type: 'new_building', isSpecial: true },
};

const RATE_REGEX = /(\d+[.,]?\d*)\s*%/g;

function extractRates(text: string): number[] {
  const rates: number[] = [];
  const matches = text.matchAll(RATE_REGEX);
  
  for (const match of matches) {
    const numStr = match[1].replace(',', '.');
    const rate = parseFloat(numStr);
    if (rate >= 1 && rate <= 30 && !rates.includes(rate)) {
      rates.push(rate);
    }
  }
  
  return rates.sort((a, b) => a - b);
}

function findProgramType(text: string): { type: string; isSpecial: boolean; name: string } | null {
  const lowerText = text.toLowerCase();
  
  const sortedKeywords = Object.keys(NEW_BUILDING_KEYWORDS).sort((a, b) => b.length - a.length);
  
  for (const keyword of sortedKeywords) {
    if (lowerText.includes(keyword)) {
      return {
        type: NEW_BUILDING_KEYWORDS[keyword].type,
        isSpecial: NEW_BUILDING_KEYWORDS[keyword].isSpecial,
        name: keyword,
      };
    }
  }
  return null;
}

export function extractProgramsWithRates($: cheerio.CheerioAPI): ProgramWithRate[] {
  const programs: ProgramWithRate[] = [];
  const bodyText = $('body').text();
  
  const programKeywords = Object.keys(NEW_BUILDING_KEYWORDS).sort((a, b) => b.length - a.length);
  
  for (const keyword of programKeywords) {
    const regex = new RegExp(keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '[\\s\\S]{0,200}', 'gi');
    const matches = bodyText.match(regex);
    
    if (matches) {
      for (const match of matches) {
        const rates = extractRates(match);
        
        if (rates.length > 0) {
          const info = NEW_BUILDING_KEYWORDS[keyword];
          const existing = programs.find(p => p.name === keyword);
          
          if (existing) {
            if (rates[0] < existing.rateMin) existing.rateMin = rates[0];
            if (rates[rates.length - 1] > existing.rateMax) existing.rateMax = rates[rates.length - 1];
          } else {
            programs.push({
              name: keyword,
              type: 'new_building',
              isSpecial: info.isSpecial,
              specialName: info.isSpecial ? keyword : undefined,
              rateMin: rates[0],
              rateMax: rates[rates.length - 1],
            });
          }
        }
      }
    }
  }
  
  if (programs.length === 0) {
    const pageText = $('title').text() + ' ' + $('h1').first().text();
    const info = findProgramType(pageText);
    
    if (info) {
      const allRates = extractRates(bodyText);
      if (allRates.length > 0) {
        programs.push({
          name: info.name,
          type: 'new_building',
          isSpecial: info.isSpecial,
          specialName: info.isSpecial ? info.name : undefined,
          rateMin: allRates[0],
          rateMax: allRates[allRates.length - 1],
        });
      }
    }
  }
  
  return programs;
}
