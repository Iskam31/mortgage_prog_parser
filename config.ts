export interface Config {
  concurrency: number;
  timeout: number;
  waitAfterLoad: number;
  userAgent: string;
  debug: boolean;
}

const config: Config = {
  concurrency: 3,
  timeout: 60000,
  waitAfterLoad: 3000,
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  debug: process.env.DEBUG === 'true',
};

export default config;
