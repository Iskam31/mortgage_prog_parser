import { loadPage } from './crawler/pageLoader';
import { extractRates, findMinRate, findMaxRate } from './extractors/rateExtractor';
import { detectProgramTypes } from './extractors/programExtractor';
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
    
    const rateCandidates = extractRates($);
    
    if (rateCandidates.length === 0) {
      return {
        domain,
        status: 'error',
        error: 'No mortgage rates found',
      };
    }
    
    const uniqueRates = [...new Set(rateCandidates.map(r => r.rate))].sort((a, b) => a - b);
    const rateMin = findMinRate(rateCandidates) ?? uniqueRates[0];
    const rateMax = findMaxRate(rateCandidates) ?? uniqueRates[uniqueRates.length - 1];
    
    const programTypes = detectProgramTypes($);
    
    const programs: MortgageProgram[] = [];
    
    if (programTypes.length > 0) {
      for (const pt of programTypes) {
        programs.push({
          type: pt.type,
          regionCode: region,
          rateMin,
          rateMax,
          isSpecial: pt.isSpecial,
          specialName: pt.specialName,
          sourceUrl: url,
        });
      }
    } else {
      programs.push({
        type: 'new_building',
        regionCode: region,
        rateMin,
        rateMax,
        isSpecial: false,
        sourceUrl: url,
      });
    }
    
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
