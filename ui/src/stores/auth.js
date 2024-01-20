import { ref, readonly, computed } from "vue";
import { signIn, getUserInfo, logOut as _logOut } from "../api";
import { defineStore } from "pinia";

export default defineStore("auth-store", () => {
	const user = ref(null);
	const isLogged = computed(() => user.value !== null);
	const authorize = (login, password) => signIn(login, password);
	const logOut = () => {
		_logOut();
		user.value = null;
	};
	const fetchUserInfo = () =>
		getUserInfo()
			.then((info) => (user.value = info ?? null))
			.catch(() => (user.value = null));

	return {
		user: readonly(user),
		isLogged,
		authorize,
		logOut,
		fetchUserInfo,
	};
});
