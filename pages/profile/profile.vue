<script>
export default {
  data() {
    return {
      // 用户信息
      userInfo: {
        avatar: "/static/avatar.png", // 默认头像
        name: "张三",
        userId: "U2024001",
      },
      // 设置项
      settings: [
        { id: 1, name: "修改密码", icon: "locked", action: "changePassword" },
        { id: 2, name: "切换项目", icon: "reload", action: "switchProject" },
        { id: 3, name: "切换项目角色", icon: "staff", action: "switchRole" },
        {
          id: 4,
          name: "简体中文",
          icon: "language",
          action: "switchLanguage",
          hasSwitch: true,
        },
        {
          id: 5,
          name: "版本",
          icon: "info",
          value: "V1.0.0",
          action: "checkVersion",
        },
        {
          id: 6,
          name: "退出登录",
          icon: "logout",
          action: "logout",
          danger: true,
        },
      ],
    };
  },
  methods: {
    // 处理设置项点击
    handleSettingClick(setting) {
      console.log("点击设置项:", setting);

      // 根据不同的action执行不同的操作
      switch (setting.action) {
        case "changePassword":
          this.changePassword();
          break;
        case "switchProject":
          this.switchProject();
          break;
        case "switchRole":
          this.switchRole();
          break;
        case "switchLanguage":
          this.switchLanguage();
          break;
        case "checkVersion":
          this.checkVersion();
          break;
        case "logout":
          this.logout();
          break;
      }
    },
    // 编辑个人资料
    editProfile() {
      uni.showToast({
        title: "编辑个人资料功能开发中",
        icon: "none",
      });
    },
    // 修改密码
    changePassword() {
      uni.showToast({
        title: "修改密码功能开发中",
        icon: "none",
      });
    },
    // 切换项目
    switchProject() {
      uni.navigateTo({
        url: "/pages/index/index",
      });
    },
    // 切换项目角色
    switchRole() {
      uni.showToast({
        title: "切换项目角色功能开发中",
        icon: "none",
      });
    },
    // 切换语言
    switchLanguage() {
      uni.showToast({
        title: "切换语言功能开发中",
        icon: "none",
      });
    },
    // 检查版本
    checkVersion() {
      uni.showToast({
        title: "当前已是最新版本",
        icon: "none",
      });
    },
    // 退出登录
    logout() {
      uni.showModal({
        title: "提示",
        content: "确定要退出登录吗？",
        success: (res) => {
          if (res.confirm) {
            // TODO: 清除登录状态和缓存
            uni.reLaunch({
              url: "/pages/login/login",
            });
          }
        },
      });
    },
  },
  onLoad() {
    // TODO: 加载用户信息
  },
};
</script>

<template>
  <view class="profile-page">
    <!-- 用户信息banner -->
    <view class="user-banner">
      <view class="avatar-container">
        <image class="avatar" :src="userInfo.avatar" mode="aspectFill"></image>
      </view>
      <view class="user-info">
        <view class="user-name">{{ userInfo.name }}</view>
        <view class="user-id">ID: {{ userInfo.userId }}</view>
      </view>
      <view class="edit-btn" @click="editProfile">
        <uni-icons type="compose" size="18" color="#fff"></uni-icons>
      </view>
    </view>

    <!-- 设置列表 -->
    <view class="settings-container">
      <view
        class="setting-item"
        v-for="setting in settings"
        :key="setting.id"
        @click="handleSettingClick(setting)"
        :class="{ danger: setting.danger }"
      >
        <view class="setting-left">
          <uni-icons
            :type="setting.icon"
            size="18"
            :color="setting.danger ? '#ff4d4f' : '#666'"
          ></uni-icons>
          <text class="setting-name">{{ setting.name }}</text>
        </view>
        <view class="setting-right">
          <text v-if="setting.value" class="setting-value">{{
            setting.value
          }}</text>
          <switch
            v-if="setting.hasSwitch"
            :checked="true"
            color="#8b5cf6"
            style="transform: scale(0.8)"
          />
          <uni-icons
            v-else-if="!setting.danger"
            type="right"
            size="14"
            color="#ccc"
          ></uni-icons>
        </view>
      </view>
    </view>
  </view>
</template>

<style lang="scss">
.profile-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  display: flex;
  flex-direction: column;

  .user-banner {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: 24px 20px;
    color: #fff;
    display: flex;
    align-items: center;
    position: relative;
    flex-shrink: 0;

    .avatar-container {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      overflow: hidden;
      border: 3px solid rgba(255, 255, 255, 0.8);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
    }

    .avatar {
      width: 100%;
      height: 100%;
    }

    .user-info {
      margin-left: 15px;
      flex: 1;

      .user-name {
        font-size: 18px;
        font-weight: 600;
        margin-bottom: 5px;
      }

      .user-id {
        font-size: 14px;
        opacity: 0.8;
      }
    }

    .edit-btn {
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.25);
      backdrop-filter: blur(10px);
      transition: all 0.3s ease;

      &:active {
        background: rgba(255, 255, 255, 0.35);
        transform: scale(0.95);
      }
    }
  }

  .settings-container {
    flex: 1;
    margin: 15px;
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(10px);
    border-radius: 16px;
    overflow: hidden;
    border: 2px solid transparent;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);

    .setting-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 18px 20px;
      border-bottom: 1px solid rgba(0, 0, 0, 0.05);
      transition: all 0.3s ease;

      &:active {
        background: rgba(139, 92, 246, 0.05);
      }

      &:last-child {
        border-bottom: none;
      }

      &.danger {
        .setting-name {
          color: #ff4d4f;
        }
      }

      .setting-left {
        display: flex;
        align-items: center;

        .setting-name {
          margin-left: 12px;
          font-size: 15px;
          color: #374151;
          font-weight: 500;
        }
      }

      .setting-right {
        display: flex;
        align-items: center;

        .setting-value {
          margin-right: 5px;
          font-size: 14px;
          color: #999;
        }
      }
    }
  }
}
</style>
