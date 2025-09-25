import config from "./config/index.js";
import request from "./utils/request.js";

// #ifndef VUE3
import Vue from "vue";
import App from "./App";

Vue.config.productionTip = false;
Vue.prototype.$config = config;
Vue.prototype.$request = request;

App.mpType = "app";

const app = new Vue({
  ...App,
});
app.$mount();
// #endif

// #ifdef VUE3
import { createSSRApp } from "vue";
import App from "./App.vue";

export function createApp() {
  const app = createSSRApp(App);

  // 全局配置
  app.config.globalProperties.$config = config;
  app.config.globalProperties.$request = request;

  return {
    app,
  };
}
// #endif
