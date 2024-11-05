import { Router } from 'express';
import { User } from '../../models/User';
import { env } from '../../config';
import jwt from 'jsonwebtoken';

const router = Router();

router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    const hashedPassword = await User.hashPassword(password);
    
    const user = await User.query().insert({
      username,
      password: hashedPassword
    });

    res.status(201).json({ message: 'User created' });
  } catch (error) {
    res.status(400).json({ message: 'Registration failed' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.query().findOne({ username });

    if (!user || !(await user.verifyPassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username },
      env.JWT_SECRET!,
      { expiresIn: '24h' }
    );

    res.json({ token });
  } catch (error) {
    res.status(400).json({ message: 'Login failed' });
  }
});

export default router;