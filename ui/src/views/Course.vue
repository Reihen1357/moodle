<template>
	<Layout>
		<template v-if="info" #title>
			{{ info.name }}
		</template>

		<template v-for="(category, idx) in categories" :key="category.id">
			<div :class="$style.title">
				{{ category.name }}
			</div>

			<!-- Resourses -->
			<template v-if="info?.resources">
				<div
					v-for="resource in info.resources.filter(
						(r) => r.categoryId === category.id
					)"
					:key="resource.id"
				>
					<div :class="$style.assignment">
						<img
							src="../../public/file-icon.png"
							:class="$style.icon"
						/>

						<a :href="resource.fileURL" :download="resource.name">
							{{ resource.name }}
						</a>
					</div>

					<div v-if="resource.comment" :class="$style.comment">
						{{ resource.comment }}
					</div>
				</div>
			</template>

			<!-- Assignments -->
			<template v-if="info?.assignments">
				<div
					v-for="assignment in info.assignments.filter(
						(r) => r.categoryId === category.id
					)"
					:key="assignment.id"
				>
					<RouterLink
						:class="$style.assignment"
						:to="{
							name: 'course-assignment',
							params: {
								id: assignment.id,
								courseId: info.id,
							},
						}"
					>
						<img
							src="../../public/assignment.svg"
							alt=""
							:class="$style.icon"
						/>
						{{ assignment.name }}
					</RouterLink>

					<div v-if="assignment.note" :class="$style.comment">
						{{ assignment.note }}
					</div>
				</div>
			</template>

			<div v-if="idx < categories.length - 1" :class="$style.hr"></div>
		</template>
	</Layout>
</template>

<script setup>
import { ref, watchEffect } from "vue";
import { useRoute, RouterLink } from "vue-router";
import Layout from "../components/Layout.vue";
import { getCategories, getCourseContent } from "../api";

const route = useRoute();
const info = ref(null);
const categories = ref(null);

getCategories().then((response) => (categories.value = response));

watchEffect(() => {
	getCourseContent(route.params.id).then(
		(response) => (info.value = response)
	);
});
</script>

<style module>
.title {
	font-size: 30px;
	font-weight: 300;
	color: #1177d1;
}

.hr {
	background-color: rgba(0, 0, 0, 0.125);
	height: 1px;
	width: 100%;
	margin: 24px 0 16px 0;
}

.assignment {
	display: block;
	color: #1177d1;
	padding: 8px 0 8px 24px;
}

.assignment:not(:hover) {
	text-decoration: none;
}

.comment {
	margin-left: 52px;
	padding: 12px 0;
}

.icon {
	width: 24px;
	vertical-align: bottom;
	margin-right: 4px;
}
</style>
