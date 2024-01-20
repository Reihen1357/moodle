import express from "express";
import fileUpload from "express-fileupload";
import cookieParser from "cookie-parser";
import path from "path";
import cors from "cors";
import { router } from "./routes/index.mjs";
import * as env from "dotenv";
import { db } from "./db/index.mjs";
import { fileURLToPath } from "url";

env.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

process.env.STATIC_PATH = path.resolve(
	__dirname,
	process.env.STATIC_RELATIVE_PATH
);

const app = express();
app.use(express.json({ limit: "50mb" }));
app.use(cookieParser());
app.use("/static", express.static(path.resolve(__dirname, "static")));
app.use(fileUpload());
app.use(
	cors({
		credentials: true,
		origin: [process.env.UI_ORIGIN],
	})
);
app.use("/api", router);

db.connect()
	.then(() => {
		console.log("Database successfully connected");
		app.listen(process.env.PORT, (err) => {
			(err && console.error(err)) ||
				console.log(
					`Server successfully started at port ${process.env.PORT}`
				);
		});
	})
	.catch((err) => {
		console.error(err);
	});
