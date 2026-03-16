import { Page } from 'playwright';
import { getContext } from './browser';
import config from '../config';

export async function loadPage(url: string): Promise<Page> {
  const context = await getContext();
  const page = await context.newPage();
  
  try {
    await page.goto(url, {
      waitUntil: 'networkidle',
      timeout: config.timeout,
    });
    
    await page.waitForTimeout(config.waitAfterLoad);
    
    return page;
  } catch (error) {
    await page.close();
    throw error;
  }
}

export async function getPageHtml(url: string): Promise<string> {
  const page = await loadPage(url);
  const html = await page.content();
  await page.close();
  return html;
}
