import { db } from "../db/index.mjs";

export const getCategories = (request, response, next) =>
	db.courseCategory
		.find()
		.project({ _id: 0, id: "$_id", name: 1 })
		.toArray()
		.then((categories) => response.json(categories))
		.catch((err) => next(err));
