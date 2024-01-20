import { ObjectId } from "mongodb";
import { db } from "../db/index.mjs";

export const getCourseList = ({ currentUserId }, response, next) => {
	((cursor) =>
		cursor
			.toArray()
			.then((courses) => response.json(courses))
			.catch((err) => next(err)))(
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
					courseIds: "$group_mapping.courseIds",
				},
			},
			{
				$lookup: {
					from: "course",
					localField: "courseIds",
					foreignField: "_id",
					as: "course_mapping",
				},
			},
			{
				$unwind: {
					path: "$course_mapping",
				},
			},
			{
				$set: {
					id: "$course_mapping._id",
					name: "$course_mapping.name",
				},
			},
			{
				$project: {
					_id: 0,
					id: 1,
					name: 1,
				},
			},
		])
	);
};

export const getCourseContent = ({ params: { id } }, response, next) => {
	const cursor = db.course.aggregate([
		{
			$match: {
				_id: new ObjectId(id),
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
		.then((info) => {
			if (!info) {
				return response.json(null);
			}

			Promise.all([
				db.courseResource
					.aggregate([
						{
							$match: {
								courseId: new ObjectId(id),
							},
						},
						{
							$lookup: {
								from: "file",
								localField: "fileId",
								foreignField: "_id",
								as: "file_mapping",
							},
						},
						{
							$set: {
								file_mapping: {
									$first: "$file_mapping",
								},
							},
						},
						{
							$project: {
								_id: 0,
								id: "$file_mapping._id",
								name: "$file_mapping.name",
								timestamp: "$file_mapping.timestamp",
								fileURL: {
									$concat: [
										"/api/file/",
										{
											$toString: "$file_mapping._id",
										},
									],
								},
								categoryId: "$categoryId",
								comment: "$resource_mapping.comment",
							},
						},
					])
					.toArray()
					.then(
						(resources) => resources && (info.resources = resources)
					)
					.catch((err) => next(err)),

				db.courseAssignment
					.aggregate([
						{
							$match: {
								courseId: new ObjectId(id),
							},
						},
						{
							$lookup: {
								from: "assignment",
								localField: "assignmentId",
								foreignField: "_id",
								as: "assignment_mapping",
							},
						},
						{
							$set: {
								assignment_mapping: {
									$first: "$assignment_mapping",
								},
							},
						},
						{
							$project: {
								_id: 0,
								id: "$assignment_mapping._id",
								categoryId: "$categoryId",
								note: "$assignment_mapping.note",
								name: "$assignment_mapping.name",
							},
						},
					])
					.toArray()
					.then(
						(assignments) =>
							assignments && (info.assignments = assignments)
					)
					.catch((err) => next(err)),
			]).then(() => response.json(info));
		})
		.catch((err) => next(err));
};

export const getCourseInfo = ({ params: { id } }, response, next) => {
	db.course
		.findOne(
			{ _id: new ObjectId(id) },
			{ projection: { id: "$_id", name: 1, _id: 0 } }
		)
		.then(response.json.bind(response))
		.catch(next);
};
