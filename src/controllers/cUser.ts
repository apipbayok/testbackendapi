import { dtSource } from "../con";
import { Request, Response } from "express";
import { z } from "zod";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { AuthReq } from "../auth";

export const daftar = async (req: Request, res: Response): Promise<void> => {
    try {
        const rule = z.object({
            firstName: z.string().trim().min(3, {
                message: "Nama depan minimal 3 karakter",
            }).max(30, {
                message: "Nama depan maksimal 30 karakter",
            }),
            lastName: z.string().trim(),
            email: z.email({ message: "Email tidak valid" }),
            password: z.string().min(8, {
                message: "Password minimal 8 karakter",
            })
        });

        const validasi = rule.safeParse(req.body);

        if (!validasi.success) {
            res.status(400).json({
                status: 102,
                message: validasi.error.issues[0]?.message,
                data: null
            })
            return;
        }
        const { firstName, lastName, email, password } = validasi.data;

        const cekUser: any = await dtSource.query("SELECT userid FROM m_user WHERE email = ?", [email]);

        if (cekUser.length > 0) {
            res.status(400).json({
                status: 102,
                message: "Email sudah terdaftar",
                data: null
            });
            return;
        }

        const encPass = await bcrypt.hash(password, 10);
        const result: any = await dtSource.query("INSERT INTO m_user (first_name, last_name, email, password) VALUES (?,?,?,?)",
            [firstName, lastName, email, encPass]);
        if (!result || result.affectedRows === 0) {
            res.status(500).json({ message: "Gagal menyimpan data" });
            return;
        }

        res.status(201).json({
            status: 0,
            message: "Registrasi berhasil, silahkan login",
            data: null
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Terjadi kesalahan pada server",
        })
    }
}

export const login = async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;
    try {
        const rule = z.object({
            email: z.email({ message: "Email tidak valid" }),
            password: z.string().min(8, {
                message: "Password minimal 8 karakter",
            })
        });

        const validasi = rule.safeParse(req.body);

        if (!validasi.success) {
            res.status(400).json({ message: validasi.error.issues[0]?.message });
            return;
        }

        const { email, password } = validasi.data;

        const cekUser: any = await dtSource.query("SELECT userid, email, password FROM m_user WHERE email = ?", [email]);
        if (cekUser.length === 0) {
            res.status(401).json({
                status: 102,
                message: "Email tidak terdaftar",
                data: null
            });
            return;
        }

        const decPass = await bcrypt.compare(password, cekUser[0].password);

        if (!decPass) {
            res.status(401).json({
                status: 103,
                message: "Password salah",
                data: null
            });
            return;
        }

        const token = jwt.sign({
            userid: cekUser[0].userid,
            email: cekUser[0].email,
        }, process.env.JWT_SECRET!, { expiresIn: "12h" });

        res.status(200).json({
            status: 0,
            message: "Login Sukses",
            "data": { token },
        });
    } catch (error) {
        res.status(500).json(error);
    }
}

export const cekSaldo = async (req: AuthReq, res: Response): Promise<void> => {
    try {
        const userid = req.user?.userid;
        const cek: any = await dtSource.query("SELECT saldo FROM m_user WHERE userid = ?", [userid]);
        const saldo =
            res.status(200).json({
                status: 0,
                message: "Cek Saldo Sukses",
                data: { saldo: cek[0].saldo },
            });
    } catch (error) {
        res.status(500).json({
            status: 1,
            message: "Terjadi kesalahan pada server",
        });
    }
}

export const userProfil = async (req: AuthReq, res: Response): Promise<void> => {
    try {
        const userid = req.user?.userid;
        const ambilDt: any = await dtSource.query("SELECT first_name,last_name,email,photo FROM m_user WHERE userid = ?", [userid]);
        const usr = ambilDt[0]
        res.status(200).json({
            status: 0,
            message: "Sukses",
            "data": { usr },
        });
    } catch (error) {
        res.status(500).json({
            status: 1,
            message: "Terjadi kesalahan pada server",
        });
    }
}

export const updateProfil = async (req: AuthReq, res: Response): Promise<void> => {
    try {
        const rule = z.object({
            firstName: z.string().trim().min(3, {
                message: "Nama depan minimal 3 karakter",
            }).max(30, {
                message: "Nama depan maksimal 30 karakter",
            }),
            lastName: z.string().trim(),
        });
        const validasi = rule.safeParse(req.body);

        if (!validasi.success) {
            res.status(400).json({
                status: 102,
                message: validasi.error.issues[0]?.message,
                data: null
            })
            return;
        }
        const { firstName, lastName } = validasi.data;
        const userid = req.user?.userid;
        const exekusi: any = await dtSource.query("UPDATE m_user SET first_name=?,last_name=? WHERE userid = ?", [firstName, lastName, userid]);
        if (!exekusi || exekusi.affectedRows === 0) {
            res.status(500).json({ message: "Gagal update data" });
            return;
        }
        const ambilDt: any = await dtSource.query("SELECT first_name,last_name,email,photo FROM m_user WHERE userid = ?", [userid]);
        const usrUp = ambilDt[0]
        res.status(200).json({
            status: 0,
            message: "Update Profile Berhasil",
            "data": { usrUp },
        });
    } catch (error) {
        res.status(500).json({
            status: 1,
            message: "Terjadi kesalahan pada server",
        });
    }
}

export const uploadImage = async (req: AuthReq, res: Response): Promise<void> => {
    try {
        const userid = req.user?.userid;
        const file = req.file;

        if (!file) {
            res.status(400).json({ status: 1, message: "Image wajib diupload" });
            return;
        }

        const imageUrl = `http://localhost:3000/uploads/${file.filename}`;

        await dtSource.query(
            "UPDATE m_user SET photo = ? WHERE userid = ?",
            [imageUrl, userid]
        );

        res.status(200).json({
            status: 0,
            message: "Profile picture diperbarui",
            data: { image: imageUrl }
        });

    } catch (error) {
        res.status(500).json({
            status: 1,
            message: "Terjadi kesalahan pada server",
        });
    }
};