import jwt from "jsonwebtoken";

export default (request, response, next) => {
	try {
		if (request.cookies.token) {
			const parsed = jwt.verify(
				request.cookies.token,
				process.env.SECRET_KEY
			);

			if (parsed && (request.currentUserId = parsed.id)) {
				next();
				return;
			}
		}
	} catch {}

	response.sendStatus(401);
};
