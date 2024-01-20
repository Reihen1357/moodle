const baseURL = import.meta.env.VITE_API_URL;

const baseHeaders = {
	"Content-Type": "application/json",
};
const _queryParams = (url, params) =>
	new URL(
		Object.entries(params)
			.reduce((acc, param) => acc + `${param[0]}=${param[1]}&`, "?")
			.slice(0, -1),
		url
	);
const isContentTypeJson = (headers) =>
	headers.get("Content-Type")?.split(";")?.[0] === "application/json";

const _request = ({ method, body, url, withCredentials }) =>
	new Promise((resolve, reject) =>
		fetch(new URL(url, baseURL), {
			method,
			credentials: withCredentials ? "include" : "omit",
			headers: baseHeaders,
			body: JSON.stringify(body),
		}).then((response) =>
			response.ok
				? isContentTypeJson(response.headers)
					? response.json().then(resolve)
					: response.text().then(resolve)
				: response
						.text()
						.then((err) => (console.error(err), err))
						.then(reject)
		)
	);
const _get = (url, withCredentials = true) =>
	_request({ method: "GET", url, withCredentials });
const _post = (url, body, withCredentials = true) =>
	_request({ method: "POST", url, withCredentials, body });
const _delete = (url, withCredentials = true) =>
	_request({ method: "DELETE", url, withCredentials });
const _put = (url, body, withCredentials = true) =>
	_request({ method: "PUT", url, withCredentials, body });

// COURSES
export const getCourses = () => _get("course/list");
export const getCourseInfo = (id) => _get(`course/${id}`);
export const getCourseContent = (id) => _get(`course/${id}/content`);
export const getCategories = () => _get("category/list");

// COMMENTS
export const saveComment = (content, assignmentId) =>
	_post(`assignment/${assignmentId}/add-comment`, { content });
export const removeComment = (commentId, assignmentId) =>
	_delete(`assignment/${assignmentId}/remove-comment/${commentId}`);

// ASSIGNMENTS
export const getAssignment = (id) => _get(`assignment/${id}`);
export const saveAnswer = (id, data) =>
	_post(`assignment/${id}/save-answer`, data);
export const editAnswer = (id, data) =>
	_put(`assignment/${id}/edit-answer`, data);
export const deleteAnswer = (id) => _delete(`assignment/${id}/delete-answer`);

// FILE
export const loadFile = (id) => _get(`file/${id}`);

// AUTH
export const signIn = (login, password) =>
	_post("auth/login", { login, password });
export const logOut = () => {
	document.cookie = "token=; Max-Age=0";
};
export const getUserInfo = () => _get("auth/info");
