import express from 'express';
import { webhookController } from '../controllers/webhookController.js';

const router = express.Router();

// Stripe will POST to this
router.post('/', webhookController);

export default router;
