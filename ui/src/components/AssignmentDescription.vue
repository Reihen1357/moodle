<template>
	<div :class="$style.title">{{ props.assignment.name }}</div>

	<div v-if="props.assignment.content" :class="$style.content">
		{{ props.assignment.content }}
	</div>

	<div v-if="props.assignment.attachments" :class="$style.attachments">
		<div
			v-for="attachment in props.assignment.attachments"
			:key="attachment.id"
		>
			<img src="../../public/file-icon.png" :class="$style.icon" />
			<a :href="attachment.fileURL" :download="attachment.name">
				{{ attachment.name }}
			</a>
			{{ formatDate(attachment.timestamp) }}
		</div>
	</div>
</template>

<script setup>
import { formatDate } from "@/utils/formatters";

const props = defineProps({
	assignment: Object,
});
</script>

<style module>
.title {
	font-size: 30px;
	font-weight: 300;
	margin-top: 16px;
}

.content {
	margin-top: 36px;
	font-size: 16px;
}

.attachments {
	margin-top: 36px;
	margin-left: 32px;
	color: #1177d1;
}

.icon {
	width: 16px;
}
</style>
