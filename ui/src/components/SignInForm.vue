<template>
	<Box :class="$style.form">
		<div :class="$style.title">Вход</div>

		<div :class="$style.field">
			<label>
				<div>Логин</div>

				<input v-model="login" type="text" :class="$style.input" />
			</label>
		</div>

		<div :class="$style.field">
			<label>
				<div>Пароль</div>

				<input
					v-model="password"
					type="password"
					:class="$style.input"
				/>
			</label>
		</div>

		<button type="button" :class="$style.button" @click="signIn">
			Вход
		</button>
	</Box>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import useAuthStore from "../stores/auth";
import Box from "./Box.vue";

const authStore = useAuthStore();
const router = useRouter();

const login = ref("");
const password = ref("");
const signIn = () => {
	authStore
		.authorize(login.value, password.value)
		.then(() => router.push({ name: "home" }))
		.catch(() => alert("Неверный логин или пароль"));
};
</script>

<style module>
.title {
	font-size: 18px;
}

.form {
	display: flex;
	flex-direction: column;
	row-gap: 16px;
}

.field,
.input {
	width: 100%;
}

.input {
	border: 1px solid #ced4da;
	border-radius: 4px;
	padding: 4px;
	outline-color: #1177d1;
	margin-top: 4px;
}

.button {
	background-color: #1177d1;
	padding: 8px;
	color: #fff;
}
</style>
