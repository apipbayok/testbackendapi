import { Request, Response } from "express";
import { z } from "zod";
import { AuthReq } from "../auth";
import { dtSource } from "../con";

const generateInvoice = (): string => {
    const now = new Date();
    const tahun = now.getFullYear();
    const bulan = String(now.getMonth() + 1).padStart(2, "0");
    const tanggal = String(now.getDate()).padStart(2, "0");
    const jam = String(now.getHours()).padStart(2, "0");
    const menit = String(now.getMinutes()).padStart(2, "0");
    const detik = String(now.getSeconds()).padStart(2, "0");
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, "0");

    return `INV${tahun}${bulan}${tanggal}${jam}${menit}${detik}${random}`;
};

export const payment = async (req: AuthReq, res: Response): Promise<void> => {
    const con = dtSource.createQueryRunner();
    await con.connect();
    await con.startTransaction();
    try {
        const userid = req.user?.userid;
        const { layanan_code } = req.body;

        const ambilLay: any = await dtSource.query("SELECT layananid,tarif FROM m_layanan WHERE lay_code = ?", [layanan_code]);
        if (ambilLay.length === 0) {
            res.status(401).json({
                status: 102,
                message: "Layanan Tidak Tersedia",
                data: null
            });
            return;
        }

        const layananid = ambilLay[0].layananid;
        const tarif = ambilLay[0].tarif;

        const cekSaldo: any = await dtSource.query("SELECT saldo FROM m_user WHERE userid = ?", [userid]);
        if (eval(cekSaldo[0].saldo) - eval(tarif) < 0) {
            res.status(401).json({
                status: 102,
                message: "Saldo tidak cukup",
                data: null
            });
            return;
        }

        const invNumb = `P${generateInvoice()}`;
        const insTrans: any = await dtSource.query("INSERT INTO transaksi (inv_numb,layid,trans_type, amount, userid) VALUES (?,?,?,?,?)",
            [invNumb, layananid, "PAYMENT", tarif, userid]);
        if (!insTrans || insTrans.affectedRows === 0) {
            res.status(500).json({ message: "Gagal Insert Transaksi" });
            return;
        }
        const lastId = insTrans.insertId;

        const exekusi: any = await dtSource.query("UPDATE m_user SET saldo= saldo - ? WHERE userid = ?", [tarif, userid]);
        if (!exekusi || exekusi.affectedRows === 0) {
            res.status(500).json({ message: "Gagal update data saldo" });
            return;
        }
        const getLast: any = await dtSource.query(`
            SELECT
            a.tanggal,
            a.amount,
            a.trans_type,
            b.lay_nama,
            b.lay_code, 
	        a.inv_numb 
        FROM
            transaksi AS a
            INNER JOIN m_layanan AS b ON a.layid = b.layananid 
        WHERE
            a.transid =?
                    `,
            [lastId]);

        await con.commitTransaction();

        const lsData = getLast[0];
        res.status(200).json({
            status: 0,
            message: "Transaksi Berhasil",
            data:  lsData 
        });
    } catch (error) {
        await con.rollbackTransaction();
        res.status(500).json({
            status: 1,
            message: "Transaksi gagal",
        });
    } finally {
        await con.release();
    }
}

export const topup = async (req: AuthReq, res: Response): Promise<void> => {
    const con = dtSource.createQueryRunner();
    await con.connect();
    await con.startTransaction();
    try {
        const userid = req.user?.userid;
        const { nominal } = req.body;
        const rule = z.object({
            nominal: z.number().positive({ message: "Nominal harus lebih dari 0" })
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

        const invNumb = `T${generateInvoice()}`;
        const insTrans: any = await dtSource.query("INSERT INTO transaksi (trans_type,inv_numb, amount, userid) VALUES (?,?,?,?)",
            ["TOPUP", invNumb, nominal, userid]);
        if (!insTrans || insTrans.affectedRows === 0) {
            res.status(500).json({ message: "Gagal Insert Transaksi" });
            return;
        }

        const exekusi: any = await dtSource.query("UPDATE m_user SET saldo= saldo + ? WHERE userid = ?", [nominal, userid]);
        if (!exekusi || exekusi.affectedRows === 0) {
            res.status(500).json({ message: "Gagal update data saldo" });
            return;
        }

        await con.commitTransaction();
        res.status(200).json({
            status: 0,
            message: "Top Up Balance Berhasil",
            data: {
                "nominal": nominal
            }
        });
    } catch (error) {
        await con.rollbackTransaction();
        res.status(500).json({
            status: 1,
            message: "Transaksi gagal",
        });
    } finally {
        await con.release();
    }
}

export const riwayat = async (req: AuthReq, res: Response): Promise<void> => {
    try {
        const rule = z.object({
            offset: z.number(),
            limit: z.number()
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
        const { offset, limit } = validasi.data;

        const userid = req.user?.userid;
        let qr = `SELECT
            b.lay_nama,
            b.tarif,
            a.trans_type,
            a.tanggal,
            a.amount,
            a.inv_numb 
        FROM
            transaksi AS a
            INNER JOIN m_layanan AS b ON a.layid = b.layananid
            WHERE a.userid=?
            ORDER BY DATE(a.tanggal)DESC`;
        let par: any[] = [userid]
        if (limit !== undefined) {
            qr += " LIMIT ? OFFSET ?";
            par.push(limit, offset ?? 0);
        }
        const getHis: any = await dtSource.query(qr, par);
        if (getHis.length === 0) {
            res.status(401).json({
                status: 102,
                message: "Tidak ada riwayat transaksi",
                data: null
            });
            return;
        }

        res.status(200).json({
            status: 0,
            message: "List Riwayat Transaksi",
            data:  getHis 
        });
    } catch (error) {
        res.status(500).json({
            status: 1,
            message: "Terjadi kesalahan pada server",
        });
    }
}