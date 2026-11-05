import express from 'express';
import { login, register, getMe, logout } from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';

const router = express.Router();

router.post('/login', validateBody(['email', 'password']), login);
router.post('/register', validateBody(['name', 'email', 'password']), register);
router.get('/me', authenticate, getMe);
router.post('/logout', authenticate, logout);

export default router;
