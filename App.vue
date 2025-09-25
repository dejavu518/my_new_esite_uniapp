<script>
import { getToken } from "@/utils/auth.js";

export default {
  onLaunch: function () {
    console.log("App Launch");
    // 检查登录状态
    this.checkLoginStatus();
  },
  onShow: function () {
    console.log("App Show");
  },
  onHide: function () {
    console.log("App Hide");
  },
  methods: {
    // 检查登录状态
    checkLoginStatus() {
      const token = getToken();
      const pages = getCurrentPages();
      const currentPage = pages.length > 0 ? pages[pages.length - 1].route : "";

      console.log("当前页面:", currentPage);

      // 如果没有token且当前不在登录页面，则跳转到登录页面
      if (!token && currentPage !== "pages/login/login") {
        console.log("用户未登录，跳转到登录页面");
        uni.reLaunch({
          url: "/pages/login/login",
        });
      }
    },
  },
};
</script>

<style lang="scss">
/*每个页面公共css */
@import "@/uni_modules/uni-scss/index.scss";
/* #ifndef APP-NVUE */
@import "@/static/customicons.css";
// 设置整个项目的背景色
page {
  background-color: #f5f5f5;
}

/* #endif */
.example-info {
  font-size: 14px;
  color: #333;
  padding: 10px;
}
</style>
