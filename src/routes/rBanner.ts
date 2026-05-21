import { Router } from 'express';
import { getBanner } from '../controllers/cBanner';

const route = Router();
/**
 * @swagger
 * /banner:
 *   get:
 *     summary: Banner
 *     tags: [Module Informasi]

 *     responses:
 *       201:
 *         description: Informasi Banner
 */

route.get('/banner',getBanner)

export default route;