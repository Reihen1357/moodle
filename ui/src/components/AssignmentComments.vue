<template>
	<div :class="$style.root">
		<div :class="$style.header" @click="toggle">
			<div :class="$style.arrow"></div>
			<div>Комментарии ({{ props.comments?.length || 0 }})</div>
		</div>
		<div v-if="isOpen">
			<div
				:class="$style.comment"
				v-for="comment in props.comments"
				:key="comment.id"
			>
				<div :class="$style.author">
					<img src="../../public/profile.png" :class="$style.icon" />
					<div :class="$style.author_name">
						{{ comment.author }}
					</div>
					-
					{{ formatDate(comment.date) }}
				</div>
				<div :class="$style.content">{{ comment.content }}</div>
				<img
					v-if="comment.authorId === authStore.user.id"
					src="../../public/trash.png"
					title="Удалить комментарий"
					:class="$style.trash"
					@click="deleteComment(comment.id)"
				/>
			</div>

			<div :class="$style.form">
				<textarea
					v-model="newCommentContent"
					:class="$style.textarea"
				></textarea>
				<button :class="$style.button" @click="save">Отправить</button>
			</div>
		</div>
	</div>
</template>

<script setup>
import { formatDate } from "@/utils/formatters";
import { ref } from "vue";
import { saveComment, removeComment } from "@/api/index";
import { useRoute } from "vue-router";
import useAuthStore from "@/stores/auth";

const props = defineProps({
	comments: [Array, null],
});
const emit = defineEmits(["comment-added", "comment-removed"]);

const authStore = useAuthStore();
const route = useRoute();

const isOpen = ref(false);
const toggle = () => (isOpen.value = !isOpen.value);

const newCommentContent = ref("");
const save = () => {
	saveComment(newCommentContent.value, route.params.id)
		.then((comment) => emit("comment-added", comment))
		.then(() => (newCommentContent.value = ""))
		.catch(alert);
};
const deleteComment = (id) =>
	removeComment(id, route.params.id)
		.then(() => emit("comment-removed", id))
		.catch(alert);
</script>

<style module>
.header {
	display: flex;
	column-gap: 8px;
	align-items: center;
	color: #1177d1;
	cursor: pointer;
}

.arrow {
	width: 0px;
	height: 0px;
	border-bottom: 6px solid transparent;
	border-top: 6px solid transparent;
	border-left: 6px solid #1177d1;
}

.author {
	display: flex;
	align-items: center;
	column-gap: 4px;
}

.author_name {
	color: #1177d1;
}

.comment {
	font-size: 12px;
	margin-top: 16px;
	position: relative;
	max-width: 90%;
}

.content {
	margin-left: 24px;
	white-space: pre-wrap;
}

.icon {
	width: 20px;
	border-radius: 50%;
}

.form {
	margin-top: 16px;
	width: 400px;
}

.textarea {
	width: 100%;
	resize: vertical;
	min-height: 50px;
	padding: 8px;
}

.button {
	color: #1177d1;
}

.trash {
	position: absolute;
	top: 50%;
	right: -50px;
	transform: translateY(-50%);
	height: 16px;
	cursor: pointer;
}
</style>
