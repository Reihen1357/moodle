import { ObjectId } from "mongodb";
import { db } from "../db/index.mjs";
import { join } from "node:path";
import { createReadStream } from "node:fs";

export const get = ({ params: { id } }, response, next) => {
	db.file
		.findOne({ _id: new ObjectId(id) })
		.then((file) => {
			const name = file.serviceName;
			const staticPath = process.env.STATIC_PATH;
			const path = join(staticPath, name);

			response.writeHead(200, {
				"Content-Type": "application/octet-stream",
			});

			createReadStream(path).pipe(response);
		})
		.catch(
			(err) => (console.error(err), next(`Файл с id = ${id} не найден`))
		);
};
