<template>
	<div :class="$style.root">
		<div :class="$style.header">
			<div :class="$style.logo">
				<img src="../../public/VSTU-logo.jpg" alt="Logo" :class="$style.logo_img">

				ЭИОС ВГТУ
			</div>

			<div :class="$style.actions">
				<img :class="$style.action" src="../../public/loupe.webp" alt="">
				<img :class="$style.action" src="../../public/notification.webp" alt="">
				<img :class="$style.action" src="../../public/message.webp" alt="">
			</div>

			<div :class="$style.profile">
				<div v-if="authStore.isLogged">
					{{ authStore.user.fullName }}
				</div>
				<div v-else :class="$style.grey">Вы не вошли в систему</div>
				<img src="../../public/profile.png" alt="" :class="$style.profile_img">
			</div>
		</div>

		<div :class="$style.body">
			<Box :class="$style.title_card">
				<h3 :class="$style.title">
					<slot name="title">
						<img src="../../public/default-title.jpg" alt="">
					</slot>
				</h3>
			</Box>

			<div :class="$style.nav">
				<Nav v-if="authStore.isLogged" />
				<SignInForm v-else />
			</div>

			<Box>
				<slot>
					<MoodleInfo />
				</slot>
			</Box>
		</div>

		<div :class="$style.footer">
			<span v-if="authStore.isLogged">
				Вы зашли под именем {{ authStore.user.fullName }} <button type="button" :class="$style.logout" @click="handleLogOut">(Выход)</button>
			</span>
			<span :class="$style.grey" v-else>Вы не вошли в систему</span>
		</div>
	</div>
</template>

<script setup>
import { useRouter } from "vue-router";
import Box from "./Box.vue";
import Nav from "./Nav.vue";
import MoodleInfo from "./MoodleInfo.vue";
import SignInForm from "./SignInForm.vue";
import useAuthStore from "../stores/auth";

const authStore = useAuthStore();
const router = useRouter();

const handleLogOut = () => {
	authStore.logOut();
	router.push({ name: "sign-in" });
}
</script>

<style module>
.root {
	min-height: 100vh;
	display: flex;
	flex-direction: column;
	justify-content: space-between;
}

.header {
	background-color: #373a3c;
	padding: 8px 16px;
	display: flex;
	column-gap: 16px;
	position: sticky;
	top: 0;
	color: #fff;
}

.logo {
	display: flex;
	column-gap: 4px;
	align-items: center;
	font-size: 18px;
}

.logo_img {
	height: 35px;
}

.action {
	height: 18px;
	cursor: pointer;
}

.actions {
	display: flex;
	align-items: center;
	column-gap: 16px;
	margin-left: auto;
}

.profile {
	display: flex;
	column-gap: 4px;
	align-items: center;
}

.profile_img {
	border-radius: 50%;
	overflow: hidden;
}

.body {
	flex-grow: 1;
	display: grid;
	grid-template: auto 1fr / 350px 1fr;
	gap: 16px;
	padding: 16px;
}

.nav {
	height: fit-content;
}

.title_card {
	grid-column: span 2;
	text-align: center;
}

.title {
	font-size: 38px;
}

.footer {
	padding: 8px;
	background-color: #373a3c;
	display: flex;
	justify-content: center;
	color: #fff;
}

.logout {
	margin-left: 4px;
}

.grey {
	color: rgba(255,255,255,.5);
}
</style>