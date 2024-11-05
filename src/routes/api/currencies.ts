import { Router } from 'express';
import { CurrencyService } from '../../services/CurrencyService';
import { authMiddleware } from '../../middleware/auth';

const router = Router();

router.get('/current/:code', authMiddleware, async (req, res) => {
  try {
    const { code } = req.params;
    const rate = await CurrencyService.getCurrentRate(code);
    
    if (!rate) {
      return res.status(404).json({ message: 'Currency not found' });
    }
    
    res.json(rate);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch rate' });
  }
});

router.get('/history/:code', authMiddleware, async (req, res) => {
  try {
    const { code } = req.params;
    const history = await CurrencyService.getRateHistory(code);
    
    if (!history) {
      return res.status(404).json({ message: 'Currency not found' });
    }
    
    res.json(history);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch history' });
  }
});

router.get('/list', authMiddleware, async (req, res) => {
  try {
    const currencies = await CurrencyService.getCurrencyList();
    res.json(currencies);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch currency list' });
  }
});

export default router;