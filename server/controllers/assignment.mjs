import { ObjectId } from "mongodb";
import { db } from "../db/index.mjs";
import { v4 as uuidv4 } from "uuid";
import { writeFile, rm } from "node:fs";
import { extname, join } from "node:path";

export const getById = ({ params: { id } }, response, next) => {
	const cursor = db.assignment.aggregate([
		{
			$match: {
				_id: new ObjectId(id),
			},
		},
		{
			$lookup: {
				from: "file",
				localField: "attachments",
				foreignField: "_id",
				as: "attachments",
			},
		},
		{
			$set: {
				id: "$_id",
			},
		},
		{
			$unset: "_id",
		},
	]);

	cursor
		.hasNext()
		.then((hasNext) => (hasNext && cursor.next()) || null)
		.then((assignment) => {
			if (!assignment) {
				return response.json(null);
			}

			assignment.answer &&
				(assignment.answer.fileURL = `/api/file/${assignment.answer.fileId}`);
			assignment.attachments = assignment.attachments?.map((a) => ({
				id: a._id,
				name: a.name,
				timestamp: a.timestamp,
				fileURL: `/api/file/${a._id}`,
			}));

			db.user
				.find({
					_id: {
						$in: [new ObjectId(assignment.authorId)].concat(
							((id) => (id ? new ObjectId(id) : []))(
								assignment?.comments.find(
									(c) =>
										c.authorId.toString() !==
										assignment.authorId.toString()
								)?.authorId
							)
						),
					},
				})
				.project({ id: "$_id", _id: 0, fullName: 1 })
				.toArray()
				.then((users) => {
					const authors = users.reduce(
						(acc, user) => (
							(acc[user.id.toString()] = user.fullName), acc
						),
						{}
					);
					assignment.author = authors[assignment.authorId.toString()];
					assignment.comments &&
						assignment.comments.forEach(
							(comment) =>
								(comment.author = authors[comment.authorId])
						);
					response.json(assignment);
				})
				.catch((err) => next(err));
		})
		.catch((err) => next(err));
};

export const addComment = (
	{ currentUserId, body: { content }, params: { id } },
	response,
	next
) => {
	const newCommentId = new ObjectId();
	db.assignment
		.updateOne(
			{ _id: new ObjectId(id) },
			{
				$push: {
					comments: {
						id: newCommentId,
						authorId: new ObjectId(currentUserId),
						content,
						date: new Date(),
					},
				},
			}
		)
		.then(() =>
			db.assignment
				.findOne({ _id: new ObjectId(id) }, { _id: 0, comments: 1 })
				.then((assignment) =>
					assignment.comments.find(
						(c) => c.id.toString() === newCommentId.toString()
					)
				)
		)
		.then((comment) =>
			db.user
				.findOne(
					{ _id: new ObjectId(comment.authorId) },
					{ _id: 0, fullName: 1 }
				)
				.then((user) =>
					response.json(((comment.author = user.fullName), comment))
				)
		)
		.catch(
			(err) => (
				console.error(err), next("Не удалось сохранить комментарий")
			)
		);
};

export const deleteComment = (
	{ params: { id, commentId } },
	response,
	next
) => {
	db.assignment
		.updateOne(
			{
				_id: new ObjectId(id),
			},
			{
				$pull: {
					comments: {
						id: new ObjectId(commentId),
					},
				},
			}
		)
		.then(() => response.sendStatus(200))
		.catch((err) => next("Не удалось удалить комментарий"));
};

const saveAnswerFile = (file) =>
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
	});

export const saveAnswer = (
	{ params: { id }, body: { text, file } },
	response,
	next
) => {
	(!file ? Promise.resolve() : saveAnswerFile(file)).then((fileId) => {
		const answer = { text };
		fileId && ((answer.fileId = fileId), (answer.fileName = file.name));

		db.assignment
			.updateOne(
				{ _id: new ObjectId(id) },
				{
					$set: {
						answer,
						isSentForChecking: true,
						answerDate: new Date(),
					},
				}
			)
			.then(() => response.sendStatus(200))
			.catch(
				(err) => (
					console.error(err), next("Не удалось добавить ответы")
				)
			);
	});
};

export const editAnswer = (
	{ params: { id }, body: { text: updatedText, file: updatedFile } },
	response,
	next
) => {
	const cursor = db.assignment.aggregate([
		{
			$match: { _id: new ObjectId(id) },
		},
		{
			$lookup: {
				from: "file",
				localField: "answer.fileId",
				foreignField: "_id",
				as: "answer_file",
			},
		},
		{
			$set: {
				answer_file: {
					$first: "$answer_file",
				},
			},
		},
	]);

	cursor
		.hasNext()
		.then((hasNext) =>
			hasNext ? cursor.next() : Promise.reject("Задание не найдено")
		)
		.then((assignment) => {
			const updatedAnswer = assignment.answer;

			updatedText && (updatedAnswer.text = updatedText);

			const deleteFile = (serviceName, fileId) =>
				Promise.all([
					new Promise((resolve, reject) =>
						rm(
							join(process.env.STATIC_PATH, serviceName),
							(err) => (err && reject(err)) || resolve()
						)
					),
					db.file.deleteOne({ _id: new ObjectId(fileId) }),
				]).then(() => {
					updatedAnswer.fileId = undefined;
					updatedAnswer.fileName = undefined;
				});

			const editAnswerFile = (serviceName, fileId) =>
				Promise.all([
					deleteFile(serviceName, fileId),
					saveAnswerFile(updatedFile),
				]).then(({ 1: savedFileId }) => {
					updatedAnswer.fileId = savedFileId;
					updatedAnswer.fileName = updatedFile.name;
				});

			// prettier-ignore
			(
				(
					updatedFile &&
					(
						(
							assignment.answer_file &&
							editAnswerFile(
								assignment.answer_file.serviceName,
								assignment.answer_file._id.toString()
							)
						)
						||
						saveAnswerFile(updatedFile)
							.then((savedFileId) => {
								updatedAnswer.fileId = savedFileId;
								updatedAnswer.fileName = updatedFile.name;
							})
					)
				)
				||
				(
					updatedFile === null &&
					deleteFile(
						assignment.answer_file.serviceName,
						assignment.answer_file._id
					)
					||
					Promise.resolve()
				)
			)
				.then(() =>
					db.assignment.updateOne(
						{ _id: new ObjectId(id) },
						{
							$set: {
								answer: updatedAnswer,
								answerDate: new Date(),
							}
						}
					)
				)
				.then(() => response.sendStatus(200))
				.catch(
					(err) => (
						console.error(err), next("Ошибка сохранения изменений")
					)
				);
		});
};

export const deleteAnswer = ({ params: { id } }, response, next) => {
	db.assignment
		.updateOne(
			{ _id: new ObjectId(id) },
			{
				$set: {
					answer: null,
					isSentForChecking: false,
					answerDate: null,
				},
			}
		)
		.then(() => response.sendStatus(200))
		.catch((err) => (console.error(err), next("Не удалось удалить ответ")));
};
