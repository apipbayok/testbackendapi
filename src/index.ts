import express from "express"
import { dtSource } from "./con";
import swaggerui from "swagger-ui-express";
import swaggerSpec from "./swagger";
import userRoute from "./routes/rUser"
import TrRoute from "./routes/rTransaksi"
import BaRoute from "./routes/rBanner"
import LaRoute from "./routes/rLayanan"

const main = async () => {
    try {
        await dtSource.initialize();
        console.log("DB Sukses");
        const app = express();
        app.use(express.json());

        app.use(userRoute, TrRoute, BaRoute, LaRoute)

        app.use(
            "/api-docs",
            swaggerui.serve,
            swaggerui.setup(swaggerSpec)
        );

        app.use(
            "/uploads",
            express.static("src/uploads")
        );
        

        app.listen(3000, () => {
            console.log("Sukses http://localhost:3000")
        })
    } catch (er) {
        console.error("Error ", er)
    }
}
main();