import { Request, Response } from "express";
import { dtSource } from "../con";

export const getBanner = async (req: Request, res: Response): Promise<void> => {
    try {
        const ambilDt: any = await dtSource.query("SELECT banner_name,banner_image,description FROM m_banner");
        res.status(200).json({
            status: 0,
            message: "Sukses",
            "data":  ambilDt ,
        });
    } catch (error) {
        res.status(500).json({
            status: 1,
            message: "Terjadi kesalahan pada server",
        });
    }
}