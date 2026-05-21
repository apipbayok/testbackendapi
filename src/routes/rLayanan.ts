import { Router } from 'express';
import { verifToken } from '../auth';
import { getLay } from '../controllers/cLayanan';

const route = Router();

/**
 * @swagger
 * /layanan:
 *   get:
 *     summary: Banner
 *     tags: [Module Informasi]

 *     responses:
 *       201:
 *         description: Informasi Layanan
 */

route.get('/layanan',verifToken,getLay)

export default route;