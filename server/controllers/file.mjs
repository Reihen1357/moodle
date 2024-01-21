import { ObjectId } from "mongodb";
import { db } from "../db/index.mjs";
import { v4 as uuidv4 } from "uuid";
import { writeFile, rm, createReadStream } from "node:fs";
import { extname, join } from "node:path";

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

export const save = ({ body: { file } }, response, next) =>
	new Promise((resolve, reject) => {
		const fileName = `${uuidv4()}${extname(file.name)}`;
		const staticPath = process.env.STATIC_PATH;
		const filePath = join(staticPath, fileName);

		writeFile(
			filePath,
			new Uint8Array(Buffer.from(file.content)),
			(err) => {
				if (err) {
					console.error(err);
					return next("Не удалось загрузить файл");
				}

				db.file
					.insertOne({
						name: file.name,
						serviceName: fileName,
						timestamp: new Date(),
					})
					.then((result) => resolve(result.insertedId))
					.catch(reject);
			}
		);
	})
		.then((fileId) => response.json({ id: fileId }))
		.catch((err) => next(err));
