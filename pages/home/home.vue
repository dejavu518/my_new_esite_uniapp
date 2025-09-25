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
        { id: 1, name: "EDC", icon: "database", color: "#667eea", colorEnd: "#764ba2" },
        { id: 2, name: "编盲管理", icon: "eye-slash", color: "#8b5cf6", colorEnd: "#a855f7" },
        { id: 3, name: "库房管理", icon: "box", color: "#ec4899", colorEnd: "#f472b6" },
        { id: 4, name: "药房管理", icon: "medicine-box", color: "#6366f1", colorEnd: "#8b5cf6" },
        { id: 5, name: "eBinder", icon: "folder", color: "#764ba2", colorEnd: "#f093fb" },
      ],
      // 药房选择弹窗相关
      showPharmacyModal: false,
      pharmacyList: [
        { id: 1, name: "01药房" },
        { id: 2, name: "02药房" },
      ],
      selectedPharmacy: null,
      // 下拉菜单控制
      showDropdown: false,
    };
  },
  methods: {
    // 处理模块点击
    handleModuleClick(module) {
      // 根据不同的模块执行不同的跳转
      switch (module.name) {
        case "eBinder":
          console.log("跳转到eBinder受试者列表");
          // 尝试使用reLaunch方法
          try {
            uni.showLoading({
              title: "正在跳转...",
            });

            setTimeout(() => {
              uni.hideLoading();
              uni.navigateTo({
                url: "/pages/ebinder/subject-list",
                success: function () {
                  console.log("跳转成功");
                },
                fail: function (err) {
                  console.error("跳转失败:", err);
                  // 尝试使用另一种方式跳转
                  uni.redirectTo({
                    url: "/pages/ebinder/subject-list",
                  });
                },
              });
            }, 200);
          } catch (error) {
            console.error("跳转出错:", error);
            uni.showToast({
              title: "跳转失败，请重试",
              icon: "none",
            });
          }
          break;
        case "编盲管理":
          console.log("跳转到编盲管理");
          try {
            uni.showLoading({
              title: "正在跳转...",
            });

            setTimeout(() => {
              uni.hideLoading();
              uni.navigateTo({
                url: "/pages/blinding/blinding-list",
                success: function () {
                  console.log("跳转编盲管理成功");
                },
                fail: function (err) {
                  console.error("跳转编盲管理失败:", err);
                  uni.showToast({
                    title: "跳转失败，请重试",
                    icon: "none",
                  });
                },
              });
            }, 200);
          } catch (error) {
            console.error("跳转编盲管理出错:", error);
            uni.showToast({
              title: "跳转失败，请重试",
              icon: "none",
            });
          }
          break;
        case "药房管理":
          console.log("显示药房选择弹窗");
          this.showPharmacyModal = true;
          break;
        default:
          // 其他模块暂时只显示提示
          uni.showToast({
            title: `进入${module.name}模块`,
            icon: "none",
          });
          break;
      }
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
    // 关闭药房选择弹窗
    closePharmacyModal() {
      this.showPharmacyModal = false;
      this.selectedPharmacy = null;
      this.showDropdown = false;
    },
    // 切换下拉菜单
    toggleDropdown() {
      this.showDropdown = !this.showDropdown;
    },
    // 选择药房
    selectPharmacy(pharmacy) {
      this.selectedPharmacy = pharmacy;
      this.showDropdown = false;
      console.log("选择的药房:", this.selectedPharmacy);
    },
    // 药房选择改变
    onPharmacyChange(e) {
      const index = e.detail.value;
      this.selectedPharmacy = this.pharmacyList[index];
      console.log("选择的药房:", this.selectedPharmacy);
    },
    // 确认选择药房
    confirmPharmacySelection() {
      if (!this.selectedPharmacy) {
        uni.showToast({
          title: "请选择药房",
          icon: "none",
        });
        return;
      }
      
      console.log("选择的药房:", this.selectedPharmacy);
      
      // 关闭弹窗
      this.showPharmacyModal = false;
      
      // 跳转到药房管理页面，传递选中的药房信息
      uni.navigateTo({
        url: `/pages/pharmacy/pharmacy-management?pharmacyId=${this.selectedPharmacy.id}&pharmacyName=${encodeURIComponent(this.selectedPharmacy.name)}`,
        success: () => {
          console.log("跳转药房管理成功");
        },
        fail: (err) => {
          console.error("跳转药房管理失败:", err);
          uni.showToast({
            title: "跳转失败，请重试",
            icon: "none",
          });
        },
      });
    },
  },
  onLoad() {
    // 尝试从本地存储获取当前项目信息
    const currentProject = uni.getStorageSync("currentProject");
    if (currentProject) {
      console.log("从本地存储获取项目信息:", currentProject);
      this.project = currentProject;
    } else {
      // 如果没有存储的项目信息，加载默认项目
      console.log("未找到存储的项目信息，加载默认项目");
      this.loadProjectDetail(1); // 加载ID为1的项目作为默认
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
      <view class="grid-layout">
        <view
          class="grid-item"
          v-for="module in modules"
          :key="module.id"
          @click="handleModuleClick(module)"
        >
          <view class="module-icon" :style="{ '--icon-color': module.color, '--icon-color-end': module.colorEnd }">
            <uni-icons :type="module.icon" size="24" color="#fff"></uni-icons>
          </view>
          <text class="module-name">{{ module.name }}</text>
        </view>
      </view>
    </view>
    
    <!-- 药房选择弹窗 -->
    <view v-if="showPharmacyModal" class="modal-overlay" @click="closePharmacyModal">
      <view class="pharmacy-modal" @click.stop>
        <view class="modal-header">
          <text class="modal-title">选择药房</text>
          <view class="close-btn" @click="closePharmacyModal">
            <uni-icons type="close" size="20" color="#666"></uni-icons>
          </view>
        </view>
        
        <view class="modal-content">
          <view class="select-container">
            <text class="select-label">请选择药房：</text>
            <view class="custom-select">
              <view class="select-trigger" @click="toggleDropdown">
                <text class="select-text">{{ selectedPharmacy ? selectedPharmacy.name : '请选择药房' }}</text>
                <uni-icons 
                  :type="showDropdown ? 'up' : 'down'" 
                  size="16" 
                  color="#999"
                  :class="{ 'rotate': showDropdown }"
                ></uni-icons>
              </view>
              <view v-if="showDropdown" class="dropdown-list">
                <view 
                  class="dropdown-item" 
                  v-for="pharmacy in pharmacyList" 
                  :key="pharmacy.id"
                  :class="{ 'selected': selectedPharmacy && selectedPharmacy.id === pharmacy.id }"
                  @click="selectPharmacy(pharmacy)"
                >
                  <text class="item-text">{{ pharmacy.name }}</text>
                  <uni-icons 
                    v-if="selectedPharmacy && selectedPharmacy.id === pharmacy.id" 
                    type="checkmarkempty" 
                    size="16" 
                    color="#667eea"
                  ></uni-icons>
                </view>
              </view>
            </view>
          </view>
        </view>
        
        <view class="modal-footer">
          <button class="cancel-btn" @click="closePharmacyModal">取消</button>
          <button class="confirm-btn" @click="confirmPharmacySelection">确定</button>
        </view>
      </view>
    </view>
  </view>
</template>

<style lang="scss">
.home-page {
  height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  display: flex;
  flex-direction: column;
  overflow: hidden;

  .banner {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: 20px 15px 30px;
    color: #fff;
    position: relative;
    flex-shrink: 0;

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
    padding: 20px 15px;
    flex: 1;
    overflow-y: auto;
    display: flex;
    flex-direction: column;

    .section-title {
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 15px;
      color: #333;
    }

    .grid-layout {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 15px;
      flex: 1;
      align-content: start;

      .grid-item {
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(10px);
        border-radius: 16px;
        padding: 20px 16px;
        display: flex;
        flex-direction: column;
        align-items: center;
        transition: all 0.3s ease;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
        border: 1px solid rgba(255, 255, 255, 0.2);

        &:active {
          transform: scale(0.96);
          background: rgba(255, 255, 255, 1);
          box-shadow: 0 8px 28px rgba(0, 0, 0, 0.12);
        }

        .module-icon {
          width: 56px;
          height: 56px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 14px;
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
          background: linear-gradient(135deg, var(--icon-color, #667eea) 0%, var(--icon-color-end, #764ba2) 100%);
        }

        .module-name {
          font-size: 14px;
          color: #374151;
          font-weight: 600;
          letter-spacing: 0.5px;
        }
      }
    }
  }
}

// 药房选择弹窗样式
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 99999;
  animation: fadeIn 0.3s ease;

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
}

.pharmacy-modal {
  background: #fff;
  border-radius: 16px;
  width: 300px;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  animation: slideUp 0.3s ease;

  @keyframes slideUp {
    from {
      transform: translateY(20px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px;
    border-bottom: 1px solid #f1f5f9;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #fff;

    .modal-title {
      font-size: 16px;
      font-weight: 600;
    }

    .close-btn {
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.2);
      transition: all 0.3s ease;

      &:active {
        background: rgba(255, 255, 255, 0.3);
        transform: scale(0.95);
      }
    }
  }

  .modal-content {
    padding: 24px 20px;

    .select-container {
      .select-label {
        font-size: 14px;
        color: #374151;
        margin-bottom: 16px;
        display: block;
        font-weight: 500;
      }

      .custom-select {
        position: relative;

        .select-trigger {
          background: #f8fafc;
          border: 2px solid #e2e8f0;
          border-radius: 8px;
          padding: 12px 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          transition: all 0.3s ease;
          cursor: pointer;

          &:active {
            background: #f1f5f9;
            border-color: #667eea;
          }

          .select-text {
            font-size: 14px;
            color: #374151;
            flex: 1;
          }

          .rotate {
            transform: rotate(180deg);
          }
        }

        .dropdown-list {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background: #fff;
          border: 2px solid #e2e8f0;
          border-top: none;
          border-radius: 0 0 8px 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          z-index: 999999;
          max-height: 200px;
          overflow-y: auto;
          animation: dropdownSlide 0.2s ease;

          @keyframes dropdownSlide {
            from {
              opacity: 0;
              transform: translateY(-10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          .dropdown-item {
            padding: 12px 16px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            transition: all 0.3s ease;
            cursor: pointer;
            border-bottom: 1px solid #f1f5f9;

            &:last-child {
              border-bottom: none;
            }

            &:hover {
              background: #f8fafc;
            }

            &.selected {
              background: #eef2ff;
              color: #667eea;
            }

            &:active {
              background: #e0e7ff;
            }

            .item-text {
              font-size: 14px;
              flex: 1;
            }
          }
        }
      }
    }
  }

  .modal-footer {
    display: flex;
    gap: 12px;
    padding: 0 20px 20px;

    .cancel-btn,
    .confirm-btn {
      flex: 1;
      height: 44px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      border: none;
      transition: all 0.3s ease;
    }

    .cancel-btn {
      background: #f8fafc;
      color: #64748b;

      &:active {
        background: #f1f5f9;
        transform: scale(0.98);
      }
    }

    .confirm-btn {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #fff;

      &:active {
        transform: scale(0.98);
        opacity: 0.9;
      }
    }
  }
}
</style>
