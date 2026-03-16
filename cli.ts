import { parseMortgages } from './lib';
import config, { DEFAULT_BANKS } from './config';

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Usage: npm start <region> [--banks] [bank_domain:url] ...');
    console.log('');
    console.log('Options:');
    console.log('  --banks    Use default bank URLs');
    console.log('');
    console.log('Examples:');
    console.log('  npm start moscow --banks');
    console.log('  npm start moscow sberbank.ru:https://www.sberbank.ru/ru/person/credits/home');
    console.log('');
    console.log('Available banks:');
    DEFAULT_BANKS.forEach(b => console.log(`  ${b.name}: ${b.domain}`));
    process.exit(1);
  }
  
  const region = args[0];
  let banks: Array<{ domain: string; url: string }>;
  
  if (args[1] === '--banks') {
    banks = DEFAULT_BANKS.map(b => ({ domain: b.domain, url: b.url }));
  } else {
    banks = args.slice(1).map(arg => {
      const [domain, url] = arg.split(':');
      return { domain, url };
    });
  }
  
  console.log(`Parsing ${banks.length} banks for region: ${region}`);
  
  const results = await parseMortgages(banks, region);
  
  console.log('\nResults:');
  console.log(JSON.stringify(results, null, 2));
  
  const success = results.filter(r => r.status === 'success').length;
  const error = results.filter(r => r.status === 'error').length;
  console.log(`\nSummary: ${success} success, ${error} errors`);
}

main().catch(console.error);
