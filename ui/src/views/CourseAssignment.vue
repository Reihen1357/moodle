<template>
	<Layout>
		<template #title>{{ course?.name }}</template>

		<template v-if="assignment">
			<AssignmentDescription :assignment="assignment" />

			<div :class="$style.title">Состояние ответа</div>
			<div :class="$style.grid">
				<div>Состояние ответа на задание</div>
				<div
					:class="[
						$style.grey,
						{ [$style.green]: assignment.isSentForChecking },
					]"
				>
					{{
						assignment.isSentForChecking
							? "Отправлено для оценивания"
							: "Ни одной попытки"
					}}
				</div>
				<div>Состояние оценивания</div>
				<div
					:class="[
						$style.grey,
						{ [$style.green]: assignment.isChecked },
					]"
				>
					{{ assignment.isChecked ? "Оценено" : "Не оценено" }}
				</div>
				<div>Последний срок сдачи</div>
				<div>{{ formatDate(assignment.deadline) }}</div>
				<div>Оставшеемся время</div>
				<div>{{ getTimeLeft() }}</div>
				<div>Последнее изменение</div>
				<div>
					{{
						assignment.answerDate &&
						formatDate(assignment.answerDate)
					}}
				</div>
				<div>Ответ</div>
				<div>
					<template v-if="assignment.answer">
						<div>{{ assignment.answer.text }}</div>
						<div v-if="assignment.answer.fileId">
							<img
								src="../../public/file-icon.png"
								:class="$style.icon"
							/>
							<a
								:href="assignment.answer.fileURL"
								:download="assignment.answer.fileName"
							>
								{{ assignment.answer.fileName }}
							</a>
						</div>
					</template>
				</div>
				<div>Комментарии к ответу</div>
				<AssignmentComments
					:comments="assignment.comments"
					@comment-added="onNewComment"
					@comment-removed="onCommentRemoved"
				/>
			</div>

			<div :class="$style.answer_buttons">
				<RouterLink
					v-if="!assignment.answer"
					:class="$style.button"
					:to="{
						name: 'add-answer',
						params: {
							assignmentId: assignment.id,
							courseId: props.courseId,
						},
					}"
				>
					Добавить ответ
				</RouterLink>
				<RouterLink
					v-if="assignment.answer"
					:class="$style.button"
					:to="{
						name: 'edit-answer',
						params: {
							assignmentId: assignment.id,
							courseId: props.courseId,
						},
					}"
				>
					Редактировать ответ
				</RouterLink>
				<button
					v-if="assignment.answer"
					:class="$style.button"
					@click="onDeleteAnswer"
				>
					Удалить ответ
				</button>
			</div>

			<template v-if="assignment.isChecked">
				<div :class="$style.title">Отзыв</div>

				<div :class="$style.grid">
					<div>Оценка</div>
					<div>{{ assignment.score }}</div>
					<div>Оценено в</div>
					<div>{{ formatDate(assignment.scoreDate) }}</div>
					<div>Оценено</div>
					<div>
						<img
							src="../../public/profile.png"
							:class="$style.profile_icon"
						/>
						{{ assignment.author }}
					</div>
				</div>
			</template>
		</template>
	</Layout>
</template>

<script setup>
import { RouterLink } from "vue-router";
import { ref } from "vue";
import Layout from "@/components/Layout.vue";
import { getAssignment, getCourseInfo, deleteAnswer } from "@/api";
import { formatDate, declineWordByNumber } from "@/utils/formatters";
import AssignmentComments from "@/components/AssignmentComments.vue";
import AssignmentDescription from "@/components/AssignmentDescription.vue";

const props = defineProps({
	courseId: String,
	id: String,
});

const assignment = ref(null);
const course = ref(null);

const loadAssignment = () =>
	getAssignment(props.id)
		.then((response) => (assignment.value = response))
		.catch(alert);
loadAssignment();
getCourseInfo(props.courseId).then((response) => (course.value = response));

const getTimeLeft = () => {
	const deadline = new Date(assignment.value.deadline);
	const now = new Date();

	const calcDifference = (diff) => {
		const absDiff = Math.abs(diff);

		const data = [
			{
				coef: 1000,
				format: (seconds) =>
					declineWordByNumber(
						seconds,
						"секунда",
						"секунды",
						"секунд"
					),
			},
			{
				coef: 60,
				format: (minutes) =>
					declineWordByNumber(minutes, "минута", "минуты", "минут"),
			},
			{
				coef: 60,
				format: (hourses) =>
					declineWordByNumber(hourses, "час", "часа", "часов"),
			},
			{
				coef: 24,
				format: (days) =>
					declineWordByNumber(days, "день", "дня", "дней"),
			},
		];
		let acc = absDiff;
		let results = [];
		for (let x = 0; x < data.length; x++) {
			const { coef, format } = data[x];

			if ((acc /= coef) < 1) {
				break;
			}

			results.push({ value: acc, format });
			results[x - 1] &&
				(results[x - 1].value = results[x - 1].value % coef);
		}

		return results
			.slice(-2)
			.reduceRight(
				(acc, r) => (acc += `${~~r.value} ${r.format(~~r.value)} `),
				""
			);
	};

	if (assignment.value.answer) {
		const diff = deadline - new Date(assignment.value.answerDate);

		if (diff < 0) {
			return `Задание предоставлено с опозданием - ${calcDifference(
				diff
			)}`;
		} else {
			return `Задание предоставлено заранее - ${calcDifference(diff)}`;
		}
	}

	const diff = deadline - now;

	return diff < 0
		? "Время вышло"
		: `Осталось времени - ${calcDifference(diff)}`;
};

const onNewComment = (comment) => assignment.value.comments.push(comment);
const onCommentRemoved = (commentId) =>
	(assignment.value.comments = assignment.value.comments.filter(
		(c) => c.id !== commentId
	));

const onDeleteAnswer = () =>
	deleteAnswer(assignment.value.id)
		.then(() => (alert("Ответ удален"), loadAssignment()))
		.catch(() => alert("Не удалось удалить ответ"));
</script>

<style module>
.title {
	font-size: 30px;
	font-weight: 300;
	margin-top: 16px;
}

.grid {
	display: grid;
	grid-template: auto / 300px 1fr;
	border-top: 1px solid rgba(0, 0, 0, 0.125);
	margin-top: 16px;
}

.grid > div {
	border-bottom: 1px solid rgba(0, 0, 0, 0.125);
	padding: 16px;
	font-size: 18px;
}

.grid > div:nth-child(odd) {
	font-weight: 600;
}

.grid > div:nth-child(4n + 2),
.grid > div:nth-child(4n + 1) {
	background-color: rgba(0, 0, 0, 0.125);
}

.grid > div.green {
	background-color: #cfefcf;
}

.answer_buttons {
	margin-top: 40px;
	display: flex;
	column-gap: 16px;
	justify-content: center;
	font-size: 18px;
}

.button {
	display: block;
	background-color: #e9ecef;
	color: #000;
	padding: 12px;
}

.button:hover {
	text-decoration: none;
}

.icon {
	width: 16px;
}

.profile_icon {
	width: 30px;
	border-radius: 50%;
	vertical-align: bottom;
}
</style>
