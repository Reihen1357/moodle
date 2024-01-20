import { hash, compare } from "bcrypt";
import jwt from "jsonwebtoken";
import { db } from "../db/index.mjs";
import { ObjectId } from "mongodb";

export const login = (request, response, next) => {
	const { login, password } = request.body;

	hash(password, 8).then((hashedPassword) =>
		db.user
			.findOne({ login })
			.then((user) => {
				if (user && compare(hashedPassword, user.passwordHash)) {
					const jwtKey = jwt.sign(
						{ id: user._id },
						process.env.SECRET_KEY,
						{
							expiresIn: "24h",
						}
					);

					response.cookie("token", jwtKey, {
						maxAge: 1000 * 60 * 60 * 24,
					});
					response.sendStatus(200);
				} else {
					next("User not found or wrong password");
				}
			})
			.catch((err) => next(err))
	);
};

export const register = (request, response, next) => {
	const { login, password } = request.body;

	hash(password, 8).then((hashedPassword) =>
		db.user
			.insertOne({ login, hashedPassword })
			.then(() => {
				response.sendStatus(200);
			})
			.catch((err) => {
				next("An error was occured during the sign up");
			})
	);
};

export const info = ({ currentUserId }, response, next) => {
	((cursor) => {
		cursor
			.hasNext()
			.then((hasNext) => (hasNext && cursor.next()) || null)
			.then(
				(user) =>
					(user && (response.json(user), true)) ||
					next("User not found")
			);
	})(
		db.user.aggregate([
			{
				$match: {
					_id: new ObjectId(currentUserId),
				},
			},
			{
				$lookup: {
					from: "group",
					localField: "groupId",
					foreignField: "_id",
					as: "group_mapping",
				},
			},
			{
				$set: {
					group_mapping: {
						$first: "$group_mapping",
					},
				},
			},
			{
				$set: {
					groupName: "$group_mapping.name",
					id: "$_id",
				},
			},
			{
				$unset: [
					"_id",
					"login",
					"groupId",
					"passwordHash",
					"group_mapping",
				],
			},
			{
				$limit: 1,
			},
		])
	);
};
