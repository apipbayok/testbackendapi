import { Request, Response, NextFunction, } from "express";
import jwt from "jsonwebtoken";

interface PayloadJwt {
    userid: number;
    email: string;
}

export interface AuthReq extends Request {
    user?: PayloadJwt;
}

export const verifToken = (req: AuthReq, res: Response, next: NextFunction): void => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            res.status(401).json({
                message: "Tidak ada Token",
            });
            return;
        }

        const token = authHeader.split(" ")[1];
        if (!token) {
            res.status(401).json({
                message: "Token tidak sesuai",
            });
            return;
        }

        const key = process.env.JWT_SECRET;
        if (!key) {
            res.status(500).json({ message: "Konfigurasi server bermasalah" });
            return;
        }

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET as string
        ) as PayloadJwt;

        req.user = decoded;
        next();
    } catch (err) {
        if (err instanceof jwt.TokenExpiredError) {
            res.status(401).json({ 
                status:108,
                message: "Token sudah kadaluarsa" ,
                data:null
            });
            return;
        }
        if (err instanceof jwt.JsonWebTokenError) {
            res.status(401).json({ 
                status:108,
                message: "Token tidak valid" ,
                data:null
            });
            return;
        }
    }
};