<script>
export default {
  data() {
    return {
      // 项目详情
      project: {
        name: "项目名称",
        number: "PRJ-2024-001",
        sponsor: "某制药公司",
        userRole: "项目管理员",
      },
      // 功能模块列表
      modules: [
        { id: 1, name: "EDC", icon: "list", color: "#1890ff" },
        { id: 2, name: "编盲管理", icon: "eye-slash", color: "#52c41a" },
        { id: 3, name: "库房管理", icon: "shop", color: "#fa8c16" },
        { id: 4, name: "药房管理", icon: "medicine-box", color: "#722ed1" },
        { id: 5, name: "eBinder", icon: "folder", color: "#eb2f96" },
      ],
      // 当前选中的tabbar索引
      currentTab: 0,
    };
  },
  methods: {
    // 处理模块点击
    handleModuleClick(module) {
      console.log("点击模块:", module);
      // TODO: 实现模块跳转逻辑
      uni.showToast({
        title: `进入${module.name}模块`,
        icon: "none",
      });
    },
    // 切换到个人中心
    switchToProfile() {
      uni.navigateTo({
        url: "/pages/profile/profile",
      });
    },
    // 加载项目详情
    loadProjectDetail(id) {
      // TODO: 调用接口获取项目详情
      console.log("加载项目详情, ID:", id);
      // 这里模拟异步加载
      setTimeout(() => {
        // 模拟数据
        this.project = {
          name: "临床试验项目A",
          number: `PRJ-2024-${id}`,
          sponsor: "XX制药有限公司",
          userRole: "项目管理员",
        };
      }, 500);
    },
  },
  onLoad(options) {
    // 设置导航栏标题
    uni.setNavigationBarTitle({
      title: "首页",
    });

    console.log("接收到的参数:", options);

    // 如果有传入项目ID，则加载项目详情
    if (options && options.id) {
      // 确保ID是数字类型
      const projectId = parseInt(options.id) || options.id;
      console.log("加载项目ID:", projectId);
      this.loadProjectDetail(projectId);
    } else {
      console.error("未接收到项目ID");
      uni.showToast({
        title: "加载失败，缺少项目ID",
        icon: "none",
      });
    }
  },
};
</script>

<template>
  <view class="home-page">
    <!-- 顶部Banner -->
    <view class="banner">
      <view class="banner-content">
        <view class="project-name">{{ project.name }}</view>
        <view class="project-info">
          <view class="info-item">
            <text class="label">方案编号：</text>
            <text class="value">{{ project.number }}</text>
          </view>
          <view class="info-item">
            <text class="label">申办方：</text>
            <text class="value">{{ project.sponsor }}</text>
          </view>
          <view class="info-item">
            <text class="label">用户角色：</text>
            <text class="value">{{ project.userRole }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 功能模块宫格 -->
    <view class="modules-container">
      <view class="section-title">功能模块</view>
      <view class="grid-container">
        <view
          class="grid-item"
          v-for="module in modules"
          :key="module.id"
          @click="handleModuleClick(module)"
        >
          <view class="module-icon" :style="{ backgroundColor: module.color }">
            <uni-icons :type="module.icon" size="24" color="#fff"></uni-icons>
          </view>
          <text class="module-name">{{ module.name }}</text>
        </view>
      </view>
    </view>

    <!-- 底部Tabbar -->
    <view class="tabbar">
      <view class="tab-item active">
        <uni-icons type="home" size="24" color="#4a6feb"></uni-icons>
        <text>首页</text>
      </view>
      <view class="tab-item" @click="switchToProfile">
        <uni-icons type="person" size="24" color="#999"></uni-icons>
        <text>个人中心</text>
      </view>
    </view>
  </view>
</template>

<style lang="scss">
.home-page {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 50px; // 为tabbar留出空间

  .banner {
    background: linear-gradient(135deg, #4a6feb, #2b4cb2);
    padding: 20px 15px 30px;
    color: #fff;
    position: relative;

    &::after {
      content: "";
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 20px;
      background-color: #f5f5f5;
      border-radius: 20px 20px 0 0;
    }

    .banner-content {
      position: relative;
      z-index: 1;
    }

    .project-name {
      font-size: 20px;
      font-weight: 600;
      margin-bottom: 15px;
    }

    .project-info {
      .info-item {
        display: flex;
        margin-bottom: 8px;
        font-size: 14px;

        .label {
          opacity: 0.8;
          width: 80px;
        }

        .value {
          flex: 1;
          font-weight: 500;
        }
      }
    }
  }

  .modules-container {
    padding: 0 15px;
    margin-top: -10px;
    position: relative;
    z-index: 2;

    .section-title {
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 15px;
      color: #333;
    }

    .grid-container {
      display: flex;
      flex-wrap: wrap;
      margin: 0 -5px;

      .grid-item {
        width: calc(50% - 10px); // 一行显示2个
        margin: 0 5px 15px;
        background-color: #fff;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
        padding: 15px;
        display: flex;
        flex-direction: column;
        align-items: center;
        transition: transform 0.2s;

        &:active {
          transform: scale(0.98);
        }

        .module-icon {
          width: 50px;
          height: 50px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 10px;
        }

        .module-name {
          font-size: 14px;
          color: #333;
          font-weight: 500;
        }
      }
    }
  }

  .tabbar {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    height: 50px;
    background-color: #fff;
    display: flex;
    box-shadow: 0 -2px 5px rgba(0, 0, 0, 0.05);

    .tab-item {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      color: #999;

      &.active {
        color: #4a6feb;
      }

      text {
        margin-top: 3px;
      }
    }
  }
}
</style>
