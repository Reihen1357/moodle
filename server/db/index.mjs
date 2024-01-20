import mongodb from "mongodb";

export const db = {
	connect() {
		const connectionString =
			process.env.CONNECTION_STRING + process.env.CONNECTION_NAME;

		return mongodb.MongoClient.connect(connectionString)
			.then((client) =>
				client
					.db(process.env.CONNECTION_NAME)
					.collections()
					.then((collections) =>
						collections.forEach((c) => (this[c.collectionName] = c))
					)
			)
			.catch((err) => {
				throw new Error(
					`[MongoDB]: conection refused; details: ${err}}`
				);
			});
	},

	disconnect() {
		return this.client.close();
	},
};
