import { createRouter, createWebHistory } from "vue-router";

const router = createRouter({
	history: createWebHistory(import.meta.env.BASE_URL),
	routes: [
		{
			path: "/sign-in",
			name: "sign-in",
			component: () => import("../views/SignIn.vue"),
			meta: {
				allowAnonymous: true,
			},
		},
		{
			path: "/",
			name: "home",
			component: () => import("../views/Dashboard.vue"),
		},
		{
			path: "/course/:id",
			name: "course",
			component: () => import("../views/Course.vue"),
		},
		{
			path: "/course/:courseId/assignment/:id",
			props: true,
			name: "course-assignment",
			component: () => import("@/views/CourseAssignment.vue"),
		},
		{
			path: "/course/:courseId/assignment/:assignmentId/add-answer",
			props: true,
			name: "add-answer",
			component: () => import("@/views/AddAnswer.vue"),
		},
		{
			path: "/course/:courseId/assignment/:assignmentId/edit-answer",
			props: true,
			name: "edit-answer",
			component: () => import("@/views/EditAnswer.vue"),
		},
		{
			path: "/load-file",
			name: "load-file",
			component: () => import("@/views/__LoadFile.vue"),
		},
	],
});

export default router;
