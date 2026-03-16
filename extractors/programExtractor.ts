import * as cheerio from 'cheerio';

export interface ProgramInfo {
  name: string;
  type: 'new_building' | 'secondary' | 'refinancing';
  isSpecial: boolean;
  specialName?: string;
}

const TYPE_KEYWORDS: Record<string, { type: string; isSpecial: boolean }> = {
  'новостройка': { type: 'new_building', isSpecial: false },
  'строительство': { type: 'new_building', isSpecial: false },
  'вторичка': { type: 'secondary', isSpecial: false },
  'вторичное жильё': { type: 'secondary', isSpecial: false },
  'рефинансирование': { type: 'refinancing', isSpecial: false },
  'перекредитование': { type: 'refinancing', isSpecial: false },
  'семейная': { type: 'new_building', isSpecial: true },
  'семейная ипотека': { type: 'new_building', isSpecial: true },
  'it': { type: 'new_building', isSpecial: true },
  'it-ипотека': { type: 'new_building', isSpecial: true },
  'военная': { type: 'new_building', isSpecial: true },
  'военная ипотека': { type: 'new_building', isSpecial: true },
  'дальневосточная': { type: 'new_building', isSpecial: true },
  'дальневосточная ипотека': { type: 'new_building', isSpecial: true },
  'льготная': { type: 'new_building', isSpecial: true },
  'льготная ипотека': { type: 'new_building', isSpecial: true },
  'господдержка': { type: 'new_building', isSpecial: true },
};

export function detectProgramTypes($: cheerio.CheerioAPI): ProgramInfo[] {
  const programs: ProgramInfo[] = [];
  
  const title = $('title').text().toLowerCase();
  const h1 = $('h1').first().text().toLowerCase();
  const h2 = $('h2').text().toLowerCase();
  const bodyText = title + ' ' + h1 + ' ' + h2;
  
  const cardSelectors = [
    '.program-card',
    '.offer-card',
    '.mortgage-offer',
    '[class*="program"]',
    '[class*="offer"]',
    'table tr',
  ];
  
  for (const selector of cardSelectors) {
    try {
      $(selector).each((_, el) => {
        const text = $(el).text().toLowerCase();
        
        for (const [keyword, info] of Object.entries(TYPE_KEYWORDS)) {
          if (text.includes(keyword)) {
            if (!programs.find(p => p.name === keyword)) {
              programs.push({
                name: keyword,
                type: info.type as ProgramInfo['type'],
                isSpecial: info.isSpecial,
                specialName: info.isSpecial ? keyword : undefined,
              });
            }
          }
        }
      });
    } catch {
      // Selector might not be valid
    }
  }
  
  if (programs.length === 0) {
    for (const [keyword, info] of Object.entries(TYPE_KEYWORDS)) {
      if (bodyText.includes(keyword)) {
        programs.push({
          name: keyword,
          type: info.type as ProgramInfo['type'],
          isSpecial: info.isSpecial,
          specialName: info.isSpecial ? keyword : undefined,
        });
        break;
      }
    }
  }
  
  return programs;
}
