import { loadPage } from './crawler/pageLoader';
import { extractProgramsWithRates } from './extractors/programExtractor';
import { ParseResult, MortgageProgram } from './types';
import config from './config';
import * as cheerio from 'cheerio';

export async function parseMortgage(
  url: string,
  domain: string,
  region: string
): Promise<ParseResult> {
  try {
    const page = await loadPage(url);
    const html = await page.content();
    await page.close();
    
    const $ = cheerio.load(html);
    
    const programsWithRates = extractProgramsWithRates($);
    
    if (programsWithRates.length === 0) {
      return {
        domain,
        status: 'error',
        error: 'No mortgage programs found',
      };
    }
    
    const programs: MortgageProgram[] = programsWithRates.map(p => ({
      name: p.name,
      type: p.type,
      regionCode: region,
      rateMin: p.rateMin,
      rateMax: p.rateMax,
      isSpecial: p.isSpecial,
      specialName: p.specialName,
      sourceUrl: url,
    }));
    
    return {
      domain,
      status: 'success',
      programs,
    };
  } catch (error) {
    return {
      domain,
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function parseMortgages(
  banks: Array<{ domain: string; url: string }>,
  region: string
): Promise<ParseResult[]> {
  const pLimit = await import('p-limit');
  const limit = pLimit.default(config.concurrency);
  
  const tasks = banks.map(bank =>
    limit(() => parseMortgage(bank.url, bank.domain, region))
  );
  
  return Promise.all(tasks);
}
