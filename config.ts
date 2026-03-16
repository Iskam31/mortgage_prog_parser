export interface BankConfig {
  name: string;
  domain: string;
  url: string;
}

export interface Config {
  concurrency: number;
  timeout: number;
  waitAfterLoad: number;
  userAgent: string;
  debug: boolean;
  banks: BankConfig[];
}

export const DEFAULT_BANKS: BankConfig[] = [
  { name: 'Сбер', domain: 'sberbank.ru', url: 'https://www.sberbank.ru/ru/person/credits/home' },
  { name: 'ВТБ', domain: 'vtb.ru', url: 'https://www.vtb.ru/personal/ipoteka/' },
  { name: 'Альфа', domain: 'alfabank.ru', url: 'https://alfabank.ru/get-money/mortgage/' },
  { name: 'Газпромбанк', domain: 'gazprombank.ru', url: 'https://www.gazprombank.ru/personal/mortgage/' },
  { name: 'Дом.РФ', domain: 'domrfbank.ru', url: 'https://domrfbank.ru/mortgage/' },
  { name: 'Россельхозбанк', domain: 'rshb.ru', url: 'https://www.rshb.ru/natural/loans/mortgage' },
  { name: 'Промсвязьбанк', domain: 'psbank.ru', url: 'https://www.psbank.ru/mortgage/' },
  { name: 'Тинькофф', domain: 'tinkoff.ru', url: 'https://www.tinkoff.ru/mortgage/' },
];

const config: Config = {
  concurrency: 2,
  timeout: 120000,
  waitAfterLoad: 5000,
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  debug: process.env.DEBUG === 'true',
  banks: DEFAULT_BANKS,
};

export default config;
