import { CurrencyService } from '../services/CurrencyService';

async function main() {
  try {
    console.log('Starting currency rates update...');
    await CurrencyService.updateRates();
    console.log('Currency rates updated successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error updating rates:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}