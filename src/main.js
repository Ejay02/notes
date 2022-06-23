import { createApp } from "vue";
import App from "./App.vue";
import "./main.css";

import { createApolloClient } from "@nhost/apollo";
import { NhostClient } from "@nhost/vue";
import { DefaultApolloClient } from "@vue/apollo-composable";

import { createRouter, createWebHistory } from "vue-router";

const nhost = new NhostClient({
  subdomain: "qwuhnsomjpnxfeqlycwn",
  region: "eu-west-2",
});

const apolloClient = createApolloClient({ nhost });

const routes = [
  {
    path: "/",
    name: "Home",
    component: () => import("./views/Home.vue"),
    meta: {
      protected: true,
    },
  },
  {
    path: "/login",
    name: "Login",
    component: () => import("./views/Login.vue"),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Guard protected routes against unauthorized users
// before load the next route do this ⬇️
router.beforeEach(async (to, from, next) => {
  // If record is meta: true protected, check if user is authenthicated/logged in
  if (to.matched.some((record) => record.meta.protected)) {
    const isAuthenthicated = await nhost.auth.isAuthenticatedAsync();

    // if unauthenthicatd, redirect to login page
    if (!isAuthenthicated) {
      return next("/login");
    }
  }
  next();
});

createApp(App)
  .provide(DefaultApolloClient, apolloClient)
  .use(nhost)
  .use(router)
  .mount("#app");
