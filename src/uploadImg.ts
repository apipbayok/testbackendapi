import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "src/uploads");
    },

    filename: (req, file, cb) => {
        const randNama =
            Date.now() +
            path.extname(file.originalname);
        cb(null, randNama);
    },
});

const fileFilter: multer.Options["fileFilter"] = (req, file, cb) => {
    const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/jpg",
    ];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(
            new Error("Harus file gambar")
        );
    }
};

const upload = multer({
    storage,
    limits: { fileSize: 2 * 1024 * 1024, },
    fileFilter,
});

export default upload;