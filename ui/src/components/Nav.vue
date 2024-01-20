<template>
	<Box>
		<h3 :class="$style.subtitle">Навигация</h3>

		<h4 :class="$style.h4">Мои курсы</h4>
		<ul :class="$style.list">
			<li v-for="course in courses" :key="course.id">
				<RouterLink :to="{ name: 'course', params: { id: course.id } }">
					{{ course.name }}
				</RouterLink>
			</li>
		</ul>
	</Box>
</template>

<script setup>
import { RouterLink } from "vue-router";
import { ref } from "vue";
import Box from "./Box.vue";
import { getCourses } from "../api";

const courses = ref();
getCourses()
	.then((response) => (courses.value = response))
	.catch((err) => alert("Не удалось загрузить список курсов"));
</script>

<style module>
.subtitle {
	font-size: 18px;
	margin-bottom: 8px;
}

.h4 {
	text-decoration: underline;
}

.list {
	list-style-type: none;
	color: #1177d1;
}

.list li {
	cursor: pointer;
	padding: 4px;
}

.list li:hover {
	background-color: rgb(235, 227, 227);
	text-decoration: underline;
}
</style>
