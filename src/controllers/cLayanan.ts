import { Request, Response } from "express";
import { dtSource } from "../con";
import { AuthReq } from "../auth";

export const getLay = async (req: AuthReq, res: Response): Promise<void> => {
    try {
        const ambilDt: any = await dtSource.query("SELECT lay_code,lay_nama,lay_ico,tarif FROM m_layanan");
        res.status(200).json({
            status: 0,
            message: "Sukses",
            data:  ambilDt ,
        });
    } catch (error) {
        res.status(500).json({
            status: 1,
            message: "Terjadi kesalahan pada server",
        });
    }
}