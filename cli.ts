import { parseMortgages } from './lib';

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Usage: npm start <region> <bank1_domain:url> [bank2_domain:url] ...');
    console.log('Example: npm start moscow sberbank.ru:https://ipoteka.sberbank.ru/ vtb.ru:https://www.vtb.ru/mortgage/');
    process.exit(1);
  }
  
  const region = args[0];
  const banks = args.slice(1).map(arg => {
    const [domain, url] = arg.split(':');
    return { domain, url };
  });
  
  console.log(`Parsing ${banks.length} banks for region: ${region}`);
  
  const results = await parseMortgages(banks, region);
  
  console.log('\nResults:');
  console.log(JSON.stringify(results, null, 2));
}

main().catch(console.error);
