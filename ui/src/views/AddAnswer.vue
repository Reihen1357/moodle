<template>
	<AnswerForm
		:is-edit="false"
		:assignment-id="props.assignmentId"
		:course-id="props.courseId"
	/>
</template>

<script setup>
import AnswerForm from "@/components/AnswerForm.vue";

const props = defineProps({
	assignmentId: String,
	courseId: String,
});
</script>
