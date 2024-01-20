import "./assets/main.css";

import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import router from "./router";
import useAuthStore from "./stores/auth";

const pinia = createPinia();
const app = createApp(App);

app.use(pinia);
app.use(router);

const store = useAuthStore();
router.beforeEach((to) => {
	store.fetchUserInfo().finally(() => {
		const isSignIn = to.name === "sign-in";

		if (isSignIn && store.isLogged) {
			return {
				name: "home",
			};
		}

		if (to.meta.allowAnonymous === true) {
			return;
		}

		if (store.isLogged) {
			return true;
		}

		router.push({ name: "sign-in" });
	});
});

app.mount("#app");
