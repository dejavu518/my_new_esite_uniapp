<script>
export default {
  data() {
    return {
      // 当前选择的药房信息
      currentPharmacy: {
        id: "",
        name: ""
      },
      // 药房管理模块列表
      pharmacyModules: [
        { 
          id: 1, 
          name: "药房接收入库", 
          icon: "plus-circle", 
          color: "#10b981", 
          colorEnd: "#059669",
          description: "接收药物并办理入库手续"
        },
        { 
          id: 2, 
          name: "药房发药", 
          icon: "arrow-right", 
          color: "#3b82f6", 
          colorEnd: "#2563eb",
          description: "向受试者发放试验药物"
        },
        { 
          id: 3, 
          name: "药房回收", 
          icon: "arrow-left", 
          color: "#f59e0b", 
          colorEnd: "#d97706",
          description: "回收受试者未使用的药物"
        },
        { 
          id: 4, 
          name: "药物销毁", 
          icon: "trash", 
          color: "#ef4444", 
          colorEnd: "#dc2626",
          description: "销毁过期或不合规药物"
        },
      ],
    };
  },
  methods: {
    // 处理模块点击
    handleModuleClick(module) {
      console.log("点击模块:", module.name);
      
      // 根据不同的模块执行不同的操作
      switch (module.name) {
        case "药房接收入库":
          this.navigateToModule("receive");
          break;
        case "药房发药":
          this.navigateToModule("dispense");
          break;
        case "药房回收":
          this.navigateToModule("return");
          break;
        case "药物销毁":
          this.navigateToModule("destroy");
          break;
        default:
          uni.showToast({
            title: `${module.name}功能开发中`,
            icon: "none",
          });
          break;
      }
    },
    
    // 跳转到具体功能模块
    navigateToModule(moduleType) {
      // 这里可以根据需要跳转到对应的页面
      // 暂时显示提示信息
      const moduleNames = {
        receive: "药房接收入库",
        dispense: "药房发药", 
        return: "药房回收",
        destroy: "药物销毁"
      };
      
      uni.showToast({
        title: `进入${moduleNames[moduleType]}模块`,
        icon: "none",
        duration: 2000
      });
      
      // TODO: 实际项目中可以跳转到对应的功能页面
      // uni.navigateTo({
      //   url: `/pages/pharmacy/${moduleType}?pharmacyId=${this.currentPharmacy.id}`
      // });
    },
    
    // 返回上一页
    goBack() {
      uni.navigateBack();
    }
  },
  
  onLoad(options) {
    // 获取传递过来的药房信息
    if (options.pharmacyId && options.pharmacyName) {
      this.currentPharmacy = {
        id: options.pharmacyId,
        name: decodeURIComponent(options.pharmacyName)
      };
      console.log("当前药房信息:", this.currentPharmacy);
    } else {
      // 如果没有传递药房信息，返回上一页
      uni.showToast({
        title: "药房信息获取失败",
        icon: "none"
      });
      setTimeout(() => {
        uni.navigateBack();
      }, 1500);
    }
  }
};
</script>

<template>
  <view class="pharmacy-management-page">
    <!-- 顶部导航栏 -->
    <view class="custom-navbar">
      <view class="navbar-content">
        <view class="back-btn" @click="goBack">
          <uni-icons type="left" size="20" color="#fff"></uni-icons>
        </view>
        <view class="navbar-title">
          <text class="title-text">{{ currentPharmacy.name }}</text>
          <text class="subtitle">药房管理</text>
        </view>
        <view class="navbar-placeholder"></view>
      </view>
    </view>

    <!-- 功能模块列表 -->
    <view class="modules-container">
      <view class="modules-list">
        <view
          class="module-item"
          v-for="module in pharmacyModules"
          :key="module.id"
          @click="handleModuleClick(module)"
        >
          <view class="module-icon" :style="{ '--icon-color': module.color, '--icon-color-end': module.colorEnd }">
            <uni-icons :type="module.icon" size="28" color="#fff"></uni-icons>
          </view>
          <view class="module-content">
            <view class="module-name">{{ module.name }}</view>
            <view class="module-description">{{ module.description }}</view>
          </view>
          <view class="module-arrow">
            <uni-icons type="right" size="16" color="#cbd5e1"></uni-icons>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<style lang="scss">
.pharmacy-management-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);

  .custom-navbar {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: 44px 15px 20px;
    position: relative;

    &::after {
      content: "";
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 15px;
      background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
      border-radius: 20px 20px 0 0;
    }

    .navbar-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
      position: relative;
      z-index: 1;

      .back-btn {
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 12px;
        background: rgba(255, 255, 255, 0.2);
        transition: all 0.3s ease;

        &:active {
          background: rgba(255, 255, 255, 0.3);
          transform: scale(0.95);
        }
      }

      .navbar-title {
        flex: 1;
        text-align: center;
        color: #fff;

        .title-text {
          font-size: 18px;
          font-weight: 600;
          display: block;
          line-height: 1.2;
        }

        .subtitle {
          font-size: 12px;
          opacity: 0.8;
          display: block;
          margin-top: 2px;
        }
      }

      .navbar-placeholder {
        width: 40px;
      }
    }
  }

  .modules-container {
    padding: 20px 15px;
    margin-top: -10px;
    position: relative;
    z-index: 2;

    .modules-list {
      .module-item {
        background: rgba(255, 255, 255, 0.9);
        backdrop-filter: blur(10px);
        border-radius: 16px;
        margin-bottom: 12px;
        padding: 20px;
        display: flex;
        align-items: center;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
        border: 2px solid transparent;
        transition: all 0.3s ease;

        &:active {
          transform: scale(0.98);
          background: rgba(255, 255, 255, 0.95);
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.12);
        }

        .module-icon {
          width: 56px;
          height: 56px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 16px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
          background: linear-gradient(135deg, var(--icon-color, #667eea) 0%, var(--icon-color-end, #764ba2) 100%);
        }

        .module-content {
          flex: 1;

          .module-name {
            font-size: 16px;
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 4px;
            letter-spacing: 0.5px;
          }

          .module-description {
            font-size: 12px;
            color: #6b7280;
            line-height: 1.4;
          }
        }

        .module-arrow {
          margin-left: 8px;
        }
      }
    }
  }
}
</style>