import { Router } from 'express';
import { cekSaldo, daftar, login, updateProfil, uploadImage, userProfil } from '../controllers/cUser';
import { verifToken } from '../auth';
import upload from '../uploadImg';

const route = Router();
/**
 * @swagger
 * /register:
 *   post:
 *     summary: Register user
 *     tags: [Module Membership]
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
 *
 *               firstName:
 *                 type: string
 *
 *               lastName:
 *                 type: string
 *
 *               email:
 *                 type: string
 *
 *               password:
 *                 type: string
 *
 *     responses:
 *       201:
 *         description: Register Berhasil
 */

/**
 * @swagger
 * /login:
 *   post:
 *     summary: Login
 *     tags: [Module Membership]
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
 * 
 *               email:
 *                 type: string
 *
 *               password:
 *                 type: string
 *
 *     responses:
 *       201:
 *         description: Login Berhasil
 */

/**
 * @swagger
 * /profile:
 *   get:
 *     summary: Profile
 *     tags: [Module Membership]

 *     responses:
 *       201:
 *         description: Informasi User
 */

/**
 * @swagger
 * /saldo:
 *   get:
 *     summary: Saldo
 *     tags: [Module Transaksi]

 *     responses:
 *       201:
 *         description: Jumlah Saldo
 */

/**
 * @swagger
 * /profile/update:
 *   put:
 *     summary: Update Profile
 *     tags: [Module Membership]
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
 * 
 *               firstName:
 *                 type: string
 *
 *               lastName:
 *                 type: string
 *
 *     responses:
 *       201:
 *         description: Update Profile Berhasil
 */

/**
 * @swagger
 * /profile/image:
 *   put:
 *     summary: Upload profile image User
 *     tags: [Module Membership]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Request Successfully
 */

route.post('/register', daftar);
route.post('/login', login);
route.get('/saldo', verifToken, cekSaldo);
route.get('/profile', verifToken, userProfil);
route.put('/profile/update', verifToken, updateProfil);
route.put('/profile/image', verifToken, upload.single("file"), uploadImage);

export default route;