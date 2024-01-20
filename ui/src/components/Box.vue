<template>
	<div :class="$style.box">
		<slot />
	</div>
</template>

<style module>
.box {
	border: 1px solid rgba(0,0,0,.125);
    border-radius: 0.25rem;
	padding: 16px;
}
</style>