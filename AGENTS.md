# AGENTS.md

Instructions for agents operating on this codebase.

---

## Project Overview

- **Type**: Node.js/TypeScript HTTP service
- **Purpose**: Parser for collecting mortgage programs from bank websites
- **Stack**: Express, Playwright, Cheerio, TypeScript

---

## Commands

### Development

```bash
# Install dependencies
npm install

# Install Playwright browser
npx playwright install chromium

# Start HTTP server
npm run serve

# Run CLI
npm start <region> <bank:url> [bank:url...]

# Type check
./node_modules/.bin/tsc --noEmit
```

### Running a Single Test

This project does not have a test framework configured. For development, test manually via:

```bash
# Start server and test with curl
npm run serve
curl -X POST http://localhost:3000/api/parse \
  -H "Content-Type: application/json" \
  -d '{"region": "moscow", "banks": [{"domain": "sberbank.ru", "url": "https://www.sberbank.ru/ru/person/credits/home"}]}'
```

---

## Code Style Guidelines

### General

- Use TypeScript with strict mode enabled
- No comments unless absolutely necessary for explanation
- Keep functions small and focused (single responsibility)
- Use async/await for all asynchronous operations

### Naming Conventions

- **Files**: camelCase (e.g., `pageLoader.ts`, `rateExtractor.ts`)
- **Interfaces**: PascalCase with descriptive names (e.g., `MortgageProgram`, `ParseResult`)
- **Functions**: camelCase, verb-prefixed (e.g., `extractRates`, `parseMortgage`)
- **Variables**: camelCase, descriptive names
- **Constants**: UPPER_SNAKE_CASE for config values
- **Types**: Use explicit types, avoid `any`

### Imports

Order imports as follows:

```typescript
// 1. Node.js built-ins
import { Page } from 'playwright';

// 2. External libraries
import express from 'express';
import * as cheerio from 'cheerio';

// 3. Internal modules (relative paths)
import { loadPage } from './crawler/pageLoader';
import { extractRates } from './extractors/rateExtractor';

// 4. Types
import { ParseResult, MortgageProgram } from './types';

// 5. Config
import config from './config';
```

### TypeScript

- Always specify return types for functions
- Use interfaces for object shapes
- Avoid `any`, use `unknown` when type is truly unknown
- Use strict null checks

```typescript
// Good
export async function parseMortgage(
  url: string,
  domain: string,
  region: string
): Promise<ParseResult> {
  // ...
}

// Bad
export async function parseMortgage(url, domain, region) {
  // ...
}
```

### Error Handling

- Always wrap async operations in try/catch
- Return typed error results, don't throw in async functions
- Include meaningful error messages

```typescript
// Good
export async function parseMortgage(...): Promise<ParseResult> {
  try {
    // ... logic
    return { domain, status: 'success', programs };
  } catch (error) {
    return {
      domain,
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
```

### Formatting

- Use 2 spaces for indentation
- Trailing commas in objects and arrays
- Single quotes for strings
- No semicolons (optional in JavaScript)
- Maximum line length: 100 characters

### React/Frontend Patterns

Not applicable - this is a backend Node.js service.

### Testing

This project uses manual testing via HTTP requests. When adding tests:

- Use descriptive test names
- Test edge cases and error conditions
- Mock external services where possible
- Keep tests independent and isolated

### Git Conventions

- Use conventional commits: `feat:`, `fix:`, `docs:`, `chore:`, `refactor:`
- Commit early and often
- Write meaningful commit messages

```bash
git commit -m "feat: add rate extraction for mortgage programs"
git commit -m "fix: improve SPA page loading"
```

---

## File Structure

```
mortgage_prog_parser/
├── server.ts              # HTTP server entry point
├── cli.ts                 # CLI entry point
├── lib.ts                 # Core parsing logic
├── config.ts              # Configuration
├── crawler/
│   ├── browser.ts         # Playwright browser management
│   └── pageLoader.ts      # Page loading with retry logic
├── extractors/
│   ├── programExtractor.ts # Program and rate extraction
│   └── rateExtractor.ts   # Rate utilities
└── types/
    └── index.ts           # TypeScript interfaces
```

---

## Key Patterns

### Retry Logic

Page loader includes automatic retry with exponential backoff:

```typescript
for (let attempt = 1; attempt <= maxRetries; attempt++) {
  try {
    // ... loading logic
  } catch (error) {
    if (attempt === maxRetries) throw error;
    await page.waitForTimeout(2000 * attempt);
  }
}
```

### Parallel Processing

Use p-limit for controlled concurrency:

```typescript
const pLimit = await import('p-limit');
const limit = pLimit.default(config.concurrency);
const tasks = banks.map(bank => limit(() => parseMortgage(...)));
const results = await Promise.all(tasks);
```

### Rate Extraction

Universal regex approach for finding percentages:

```typescript
const RATE_REGEX = /(\d+[.,]?\d*)\s*%/g;
// Filter to valid mortgage rates (1-30%)
if (rate >= 1 && rate <= 30) { ... }
```

---

## Common Tasks

### Adding a New Bank

No code changes needed - just call the API with the bank's URL:

```bash
curl -X POST http://localhost:3000/api/parse \
  -H "Content-Type: application/json" \
  -d '{"region": "moscow", "banks": [{"domain": "newbank.ru", "url": "https://newbank.ru/mortgage"}]}'
```

### Adding New Program Types

Edit `extractors/programExtractor.ts`, add to `TYPE_KEYWORDS`:

```typescript
const TYPE_KEYWORDS: Record<string, { type: string; isSpecial: boolean }> = {
  'новое название': { type: 'new_building', isSpecial: false },
  // ...
};
```

### Debugging

Enable debug mode in `config.ts`:

```typescript
const config: Config = {
  debug: process.env.DEBUG === 'true',
  // ...
};
```

Or set environment variable:

```bash
DEBUG=true npm run serve
```

---

## Known Limitations

- Some banks (e.g., Газпромбанк) may require custom parsers due to complex SPA implementations
- Rate extraction uses universal regex - may include non-mortgage percentages
- Region parameter is passed but not used for bank-specific content filtering
