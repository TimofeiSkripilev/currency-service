import cron from 'node-cron';
import { CurrencyService } from '../services/CurrencyService';

export function setupCronJobs(): void {
  cron.schedule('30 11 * * *', async () => {
    try {
      console.log('Running scheduled currency update...');
      await CurrencyService.updateRates();
      console.log('Scheduled update completed successfully');
    } catch (error) {
      console.error('Error in scheduled update:', error);
    }
  });
}
