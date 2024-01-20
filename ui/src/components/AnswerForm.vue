<template>
	<Layout>
		<template #title>{{ course && course.name }}</template>

		<template v-if="assignment">
			<AssignmentDescription :assignment="assignment" />

			<div :class="$style.answer">Ответ:</div>
			<textarea v-model="text" :class="$style.textarea"></textarea>
			<div :class="$style.uploader">
				<div v-if="selectedFile">
					<img
						src="../../public/file-icon.png"
						:class="$style.icon"
					/>
					{{ selectedFileName }}
					<button :class="$style.button" @click="detachFile">
						Удалить файл
					</button>
				</div>
				<div v-else>
					<input type="file" @change="attachFile" />
				</div>
			</div>

			<div :class="$style.buttons">
				<button :class="[$style.button, $style.blue]" @click="save">
					{{ saveButtonText }}
				</button>
				<RouterLink
					:class="$style.button"
					:to="{
						name: 'course-assignment',
						params: {
							id: props.assignmentId,
							courseId: props.courseId,
						},
					}"
				>
					Отмена
				</RouterLink>
			</div>
		</template>
	</Layout>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import { useRouter } from "vue-router";
import {
	getCourseInfo,
	getAssignment,
	saveAnswer,
	editAnswer,
	loadFile,
} from "@/api";
import Layout from "./Layout.vue";
import AssignmentDescription from "./AssignmentDescription.vue";
import { toByteArray } from "@/utils/file";

const props = defineProps({
	assignmentId: String,
	courseId: String,
	isEdit: Boolean,
});

const router = useRouter();

const course = ref(null);
getCourseInfo(props.courseId)
	.then((response) => (course.value = response))
	.catch(alert);

const assignment = ref(null);
getAssignment(props.assignmentId)
	.then(
		(response) => (
			(assignment.value = response),
			(text.value = assignment.value.answer?.text || null),
			assignment.value.answer?.fileId &&
				loadFile(assignment.value.answer.fileId).then(
					(fileContent) =>
						(selectedFile.value = new File(
							[fileContent],
							assignment.value.answer.fileName,
							{ type: "text/plain" }
						))
				)
		)
	)
	.then(
		() => (
			watch(selectedFile, () => (isFileEdited = true)),
			watch(text, () => (isTextEdited = true))
		)
	)
	.catch(alert);

const text = ref("");

const selectedFile = ref(null);
const selectedFileName = computed(() => selectedFile.value?.name);
const attachFile = (event) => {
	selectedFile.value = event.target.files[0];
};
const detachFile = () => {
	selectedFile.value = null;
};

let isTextEdited = false;
let isFileEdited = false;

const saveButtonText = computed(() =>
	props.isEdit ? "Сохранить изменения" : "Добавить ответ"
);
const save = () => {
	if (text.value === null || text.value.trim().length === 0) {
		return alert("Заполните текст ответа");
	}

	const processFile = () =>
		new Promise(
			(resolve, reject) =>
				// prettier-ignore
				isFileEdited &&
					(
						(
							selectedFile.value === null &&
							assignment.value.answer.fileId &&
							resolve(null) // delete file
						)
						||
						(
							selectedFile.value &&
							toByteArray(selectedFile.value)
								.then((bytes) =>
									resolve({
										name: selectedFile.value.name,
										content: bytes,
									})
								)
								.catch(reject)
						)
					)
					||
					resolve(undefined) // no changes
		);

	props.isEdit
		? processFile().then((file) =>
				editAnswer(props.assignmentId, {
					text: isTextEdited ? text.value : undefined,
					file,
				})
					.then(() => alert("Изменения применены"))
					.then(() => {
						isFileEdited = false;
						isTextEdited = false;
					})
					.catch(() => alert("Не удалось внести изменения"))
			)
		: // prettier-ignore
			(
			selectedFile.value &&
			toByteArray(selectedFile.value)
				.then(bytes => ({ name: selectedFile.value.name, content: bytes }))
				.catch()
			|| Promise.resolve(undefined)

		)
		.then(
			(file) =>
				saveAnswer(props.assignmentId, { text: text.value, file })
					.then(() => alert("Ответ добавлен"))
					.then(() => router.push({
							name: "edit-answer",
							params: {
								courseId: props.courseId,
								assignmentId: props.assignmentId,
							},
					}))
					.catch(() => alert("Не удалось добавить ответ"))
		);
};
</script>

<style module>
.answer {
	margin-top: 40px;
}

.textarea {
	margin-top: 8px;
	width: 500px;
	padding: 8px;
}

.uploader {
	display: block;
	margin-top: 8px;
}

.icon {
	width: 16px;
}

.button {
	background-color: #e9ecef;
	padding: 4px 8px;
}

.button:hover {
	text-decoration: none;
}

.buttons {
	margin-top: 24px;
	display: flex;
	column-gap: 8px;
}

.blue {
	background-color: #0e63ae;
	color: #fff;
}
</style>
