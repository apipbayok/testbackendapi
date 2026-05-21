import { Router } from "express";
import { verifToken } from "../auth";
import { payment, riwayat, topup } from "../controllers/cTransaksi";

const route = Router();

/** 
* @swagger
 * /topup:
 *   post:
 *     summary: Top Up Saldo
 *     tags: [Module Transaksi]
 *
 *     requestBody:
 *       required: true
 *
 *       content:
 *         application/json:
 *
 *           schema:
 *             type: object
 *
 *             properties:
 *               nominal:
 *                 type: number
 *
 *     responses:
 *       201:
 *         description: Berhasil Top Up
 */

/** 
* @swagger
 * /transaksi:
 *   post:
 *     summary: Transaksi
 *     tags: [Module Transaksi]
 *
 *     requestBody:
 *       required: true
 *
 *       content:
 *         application/json:
 *
 *           schema:
 *             type: object
 *
 *             properties:
 *               layanan_code:
 *                 type: string
 *
 *     responses:
 *       201:
 *         description: Transaksi Berhasil
 */

/**
 * @swagger
 * /riwayat:
 *   post:
 *     summary: Riwayat Transaksi
 *     tags: [Module Transaksi]
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               offset:
 *                 type: number
 *                 example: 0
 *               limit:
 *                 type: number
 *                 example: 10
 *     responses:
 *       200:
 *         description: Get List Riwayat Berhasil
 */

route.post('/topup', verifToken, topup);
route.post('/transaksi', verifToken, payment);
route.post('/riwayat', verifToken, riwayat);

export default route;