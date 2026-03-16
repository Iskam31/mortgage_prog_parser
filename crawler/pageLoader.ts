import { Page } from 'playwright';
import { getContext } from './browser';
import config from '../config';

export async function loadPage(url: string): Promise<Page> {
  const context = await getContext();
  const page = await context.newPage();
  
  const maxRetries = 3;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await page.goto(url, {
        waitUntil: 'load',
        timeout: config.timeout,
      });
      
      await page.waitForTimeout(2000);
      
      try {
        await page.waitForSelector('[class*="rate"], [class*="mortgage"], [class*="program"], [class*="offer"], table, .content, main', {
          timeout: 5000,
        });
      } catch {
        // Element not found, continue
      }
      
      await page.waitForTimeout(config.waitAfterLoad);
      
      const ready = await evaluatePageReady(page);
      if (ready) {
        return page;
      }
      
    } catch (error) {
      if (attempt === maxRetries) {
        await page.close();
        throw error;
      }
      await page.waitForTimeout(2000 * attempt);
    }
  }
  
  return page;
}

async function evaluatePageReady(page: Page): Promise<boolean> {
  try {
    const stats = await page.evaluate(() => {
      const body = document.body;
      const textLength = body?.innerText.length ?? 0;
      const hasContent = textLength > 500;
      
      const hasRates = /(\d+[.,]?\d*)\s*%/.test(document.body?.innerText ?? '');
      
      return { hasContent, hasRates, textLength };
    });
    
    return stats.hasContent && stats.hasRates;
  } catch {
    return false;
  }
}

export async function getPageHtml(url: string): Promise<string> {
  const page = await loadPage(url);
  let html = '';
  try {
    html = await page.content();
  } finally {
    await page.close();
  }
  return html;
}
