import { createRouter, createWebHistory } from "vue-router";
import DashboardPage from "./pages/DashboardPage.vue";
import PropertiesPage from "./pages/PropertiesPage.vue";
import AddAgentPage from "./pages/AddAgentPage.vue";
import SettingsPage from "./pages/SettingsPage.vue";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", name: "dashboard", component: DashboardPage },
    { path: "/properties", name: "properties", component: PropertiesPage },
    { path: "/agents/new", name: "add-agent", component: AddAgentPage },
    { path: "/settings", name: "settings", component: SettingsPage },
    { path: "/:pathMatch(.*)*", redirect: "/" },
  ],
});

export default router;
