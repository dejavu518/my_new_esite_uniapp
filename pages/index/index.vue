<script>
import { getProjectList } from "@/api/project.js";
import { getToken } from "@/utils/auth.js";

export default {
  data() {
    return {
      // 搜索相关
      searchValue: "",
      // 当前选中的tab索引
      currentTab: 0,
      // 项目列表数据
      prodProjects: [],
      uatProjects: [],
      // 加载状态
      loading: false,
      // 分页相关
      prodPage: 1,
      uatPage: 1,
      hasMoreProd: true,
      hasMoreUat: true,
      // 刷新相关
      refreshing: false,
    };
  },
  computed: {
    // 根据当前tab返回对应的项目列表
    currentProjects() {
      return this.currentTab === 0 ? this.prodProjects : this.uatProjects;
    },
    // 当前环境标识
    currentFlag() {
      return this.currentTab === 0 ? "P" : "T";
    },
    // 当前页码
    currentPage() {
      return this.currentTab === 0 ? this.prodPage : this.uatPage;
    },
    // 是否有更多数据
    hasMore() {
      return this.currentTab === 0 ? this.hasMoreProd : this.hasMoreUat;
    },
  },
  methods: {
    // 处理搜索输入
    handleSearch(e) {
      this.searchValue = e;
      this.resetAndSearch();
    },
    // 重置并搜索
    resetAndSearch() {
      if (this.currentTab === 0) {
        this.prodPage = 1;
        this.hasMoreProd = true;
        this.prodProjects = [];
      } else {
        this.uatPage = 1;
        this.hasMoreUat = true;
        this.uatProjects = [];
      }
      this.loadProjects();
    },
    // 处理清除搜索
    handleSearchClear() {
      this.searchValue = "";
      this.resetAndSearch();
    },
    // 处理tab切换
    handleTabChange(e) {
      this.currentTab = e.currentIndex;
      // 如果切换到的标签页没有数据且不在加载中，则加载数据
      if (
        (this.currentTab === 0 &&
          this.prodProjects.length === 0 &&
          !this.loading) ||
        (this.currentTab === 1 &&
          this.uatProjects.length === 0 &&
          !this.loading)
      ) {
        this.loadProjects();
      }
    },
    // 加载项目列表
    async loadProjects() {
      if (this.loading || !this.hasMore) return;

      try {
        this.loading = true;

        const page = this.currentPage;
        const keyword = this.searchValue;
        const flag = this.currentFlag;

        // 注释掉真实接口调用，使用假数据
        // const res = await getProjectList(page, keyword, flag);

        // 模拟网络延迟
        await new Promise((resolve) => setTimeout(resolve, 800));

        // 模拟项目列表假数据
        const res = {
          code: 0,
          msg: "success",
          data: {
            list: [
              {
                id: "proj_001",
                project_name: "临床试验项目A",
                Database_Id: "DB001",
                Status: 1,
                Update_Time: "2024-01-15",
                description: "心血管疾病临床试验",
              },
              {
                id: "proj_002",
                project_name: "临床试验项目B",
                Database_Id: "DB002",
                Status: 1,
                Update_Time: "2024-01-10",
                description: "糖尿病药物临床试验",
              },
              {
                id: "proj_003",
                project_name: "临床试验项目C",
                Database_Id: "DB003",
                Status: 0,
                Update_Time: "2024-01-05",
                description: "肿瘤免疫治疗试验",
              },
              {
                id: "proj_004",
                project_name: "临床试验项目D",
                Database_Id: "DB004",
                Status: 1,
                Update_Time: "2024-01-20",
                description: "神经系统疾病研究",
              },
              {
                id: "proj_005",
                project_name: "临床试验项目E",
                Database_Id: "DB005",
                Status: 1,
                Update_Time: "2024-01-12",
                description: "呼吸系统药物试验",
              },
            ],
            total: 5,
          },
        };

        // 检查响应格式，适配不同的API返回结构
        let list = [];
        let total = 0;

        if (res) {
          // 尝试不同的数据结构
          if (res.data && (res.data.list || res.data.records)) {
            // 标准格式 { data: { list: [], total: 0 } }
            // 或 { data: { records: [], total: 0 } }
            list = res.data.list || res.data.records || [];
            total = res.data.total || res.data.count || 0;
          } else if (res.list || res.records) {
            // 简化格式 { list: [], total: 0 }
            // 或 { records: [], total: 0 }
            list = res.list || res.records || [];
            total = res.total || res.count || 0;
          } else if (Array.isArray(res)) {
            // 直接返回数组格式
            list = res;
            total = res.length;
          } else if (res.data && Array.isArray(res.data)) {
            // { data: [] } 格式
            list = res.data;
            total = res.data.length;
          }
        }

        if (list.length > 0) {
          // 转换项目数据格式
          const projects = list.map((item) => {
            // 尝试获取各种可能的字段名
            const id =
              item.id ||
              item.Database_Id ||
              item.database_id ||
              item.databaseId ||
              "";
            const projectName =
              item.project_name ||
              item.projectName ||
              item.ProjectName ||
              item.name ||
              "未命名项目";
            const databaseId =
              item.database_id ||
              item.Database_Id ||
              item.databaseId ||
              item.DatabaseId ||
              "";
            const status =
              item.Status === 1 ||
              item.status === 1 ||
              item.status === "running"
                ? "running"
                : "stopped";
            const updateTime =
              item.Update_Time ||
              item.update_time ||
              item.updateTime ||
              item.lastUpdated ||
              new Date().toISOString().split("T")[0];
            const flag = this.currentFlag; // 当前环境标识

            return {
              id,
              name: projectName, // 使用项目名称
              databaseId, // 添加数据库ID
              status,
              lastUpdated: updateTime,
              flag, // 环境标识
              // 保存原始数据，便于后续使用
              rawData: item,
            };
          });

          // 根据当前tab更新对应的项目列表
          if (this.currentTab === 0) {
            if (page === 1) {
              this.prodProjects = projects;
            } else {
              this.prodProjects = [...this.prodProjects, ...projects];
            }
            // 判断是否还有更多数据
            this.hasMoreProd = this.prodProjects.length < total;
            // 更新页码
            if (this.hasMoreProd) {
              this.prodPage++;
            }
          } else {
            if (page === 1) {
              this.uatProjects = projects;
            } else {
              this.uatProjects = [...this.uatProjects, ...projects];
            }
            // 判断是否还有更多数据
            this.hasMoreUat = this.uatProjects.length < total;
            // 更新页码
            if (this.hasMoreUat) {
              this.uatPage++;
            }
          }
        } else {
          // 如果是第一页且没有数据，显示空状态
          if (page === 1) {
            if (this.currentTab === 0) {
              this.prodProjects = [];
            } else {
              this.uatProjects = [];
            }

            if (keyword) {
              uni.showToast({
                title: `未找到匹配"${keyword}"的项目`,
                icon: "none",
              });
            }
          } else {
            // 如果不是第一页且没有数据，说明已经加载完所有数据
            if (this.currentTab === 0) {
              this.hasMoreProd = false;
            } else {
              this.hasMoreUat = false;
            }

            uni.showToast({
              title: "已加载全部项目",
              icon: "none",
            });
          }
        }
      } catch (error) {
        console.error("加载项目列表失败:", error);
        uni.showToast({
          title: "加载失败，请重试",
          icon: "none",
        });
      } finally {
        this.loading = false;
        this.refreshing = false;
      }
    },
    // 处理项目点击
    handleProjectClick(project) {
      // 显示提示，确认点击事件已触发
      uni.showToast({
        title: `正在跳转到项目: ${project.name}`,
        icon: "none",
        duration: 1000,
      });

      // 跳转到首页，并传递项目ID
      setTimeout(() => {
        uni.switchTab({
          url: "/pages/home/home",
          success: () => {
            // 由于switchTab不能携带参数，我们需要将项目信息存储到本地
            uni.setStorageSync("currentProject", project);
          },
          fail: () => {
            uni.showModal({
              title: "跳转失败",
              content: "页面跳转失败，请重试",
              showCancel: false,
            });
          },
        });
      }, 500);
    },
    // 下拉刷新
    onPullDownRefresh() {
      this.refreshing = true;
      this.resetAndSearch();
      setTimeout(() => {
        uni.stopPullDownRefresh();
      }, 1000);
    },
    // 上拉加载更多
    onReachBottom() {
      if (this.hasMore && !this.loading) {
        this.loadProjects();
      }
    },
    // 检查登录状态
    checkLoginStatus() {
      const token = getToken();
      if (!token) {
        uni.reLaunch({
          url: "/pages/login/login",
        });
        return;
      }
      // 加载项目列表
      this.loadProjects();
    },

    // 跳转到登录测试页面
    goToLoginTest() {
      uni.navigateTo({
        url: "/pages/test/login-test",
      });
    },
  },
  onLoad() {
    // 检查登录状态
    this.checkLoginStatus();

    // 设置导航栏标题
    uni.setNavigationBarTitle({
      title: "项目列表",
    });
  },
};
</script>

<template>
  <view class="project-list">
    <!-- 搜索栏 -->
    <view class="search-container">
      <uni-search-bar
        v-model="searchValue"
        placeholder="搜索项目"
        @input="handleSearch"
        @clear="handleSearchClear"
        :radius="100"
      />
      <!-- 测试按钮 -->
      <!-- <button class="test-btn" @click="goToLoginTest">测试登录接口</button> -->
    </view>

    <!-- 环境切换tabs -->
    <view class="tabs-container">
      <uni-segmented-control
        :current="currentTab"
        :values="['PROD', 'UAT']"
        @clickItem="handleTabChange"
        styleType="text"
        activeColor="#4a6feb"
      />
    </view>

    <!-- 项目列表 -->
    <view class="list-container">
      <uni-list v-if="currentProjects.length > 0">
        <view class="list-padding">
          <view
            v-for="project in currentProjects"
            :key="project.id"
            @click="handleProjectClick(project)"
            class="project-wrapper"
          >
            <view class="custom-list-item">
              <!-- 项目标签和名称 -->
              <view class="project-content">
                <view
                  class="project-tag"
                  :class="project.flag === 'P' ? 'prod-tag' : 'uat-tag'"
                >
                  {{ project.flag === "P" ? "PROD" : "UAT" }}
                </view>
                <view class="project-info">
                  <view class="project-name">{{
                    project.name || "未命名项目"
                  }}</view>
                  <view class="database-id">{{
                    project.databaseId || "N/A"
                  }}</view>
                </view>
              </view>

              <!-- 箭头 -->
              <view class="arrow">
                <uni-icons type="right" size="16" color="#bbb"></uni-icons>
              </view>
            </view>
          </view>
        </view>
      </uni-list>

      <!-- 空状态 -->
      <view v-else-if="!loading" class="empty-state">
        <uni-icons type="info" size="64" color="#999"></uni-icons>
        <text class="empty-text">暂无项目</text>
      </view>

      <!-- 加载状态 -->
      <view v-if="loading" class="loading-state">
        <uni-load-more status="loading" />
      </view>
    </view>
  </view>
</template>

<style lang="scss">
.project-list {
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);

  .search-container {
    padding: 15px;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    margin-bottom: 1px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);

    .test-btn {
      width: 100%;
      height: 36px;
      background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
      color: #8b5cf6;
      border: 1px solid rgba(102, 126, 234, 0.2);
      border-radius: 10px;
      font-size: 14px;
      font-weight: 500;
      margin-top: 12px;

      &:active {
        background: linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.15) 100%);
      }
    }

    :deep(.uni-searchbar) {
      padding: 0;

      .uni-searchbar__box {
        border-radius: 20px;
        background: rgba(248, 250, 252, 0.8);
        border: 2px solid transparent;
        height: 40px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
      }

      .uni-searchbar__text-input {
        font-size: 16px;
        color: #333;
      }

      .uni-searchbar__placeholder {
        font-size: 16px;
        color: #999;
      }
    }
  }

  .tabs-container {
    padding: 8px 15px;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    margin-bottom: 10px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);

    :deep(.segmented-control) {
      .segmented-control__item {
        padding: 8px 16px;
        margin: 0 4px;
        border-radius: 10px;
        background: rgba(248, 250, 252, 0.8);
        color: #6b7280;
        font-weight: 500;

        &.segmented-control__item--text {
          border-bottom: none;

          &.segmented-control__item--text--active {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            font-weight: 600;
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
          }
        }
      }
    }
  }

  .list-container {
    padding: 0 15px; // 统一使用15px左右边距

    .project-wrapper {
      cursor: pointer;
      margin-bottom: 10px;
      border-radius: 8px;
      overflow: hidden;
      transition: transform 0.2s;

      &:active {
        transform: scale(0.99);
      }
    }

    .list-padding {
      border-radius: 16px;
      overflow: hidden;
      background: rgba(255, 255, 255, 0.9);
      backdrop-filter: blur(10px);
      border: 2px solid transparent;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
    }

    .custom-list-item {
      padding: 15px;
      position: relative;
      display: flex;
      flex-direction: column;

      &:not(:last-child) {
        border-bottom: 1px solid #f0f0f0;
      }
    }

    .project-content {
      display: flex;
      align-items: flex-start;
      flex-wrap: wrap;
      padding-right: 20px;
    }

    .project-tag {
      padding: 3px 10px;
      border-radius: 4px;
      font-size: 13px;
      margin-right: 8px;
      font-weight: bold;
      color: #fff;

      &.prod-tag {
        background-color: #52c41a;
      }

      &.uat-tag {
        background-color: #faad14;
      }
    }

    .project-info {
      display: flex;
      flex-direction: column;
      flex: 1;
    }

    .project-name {
      font-size: 17px;
      font-weight: 500;
      color: #333;
    }

    .database-id {
      font-size: 14px;
      color: #999;
      margin-top: 2px;
    }

    .arrow {
      position: absolute;
      right: 15px;
      top: 50%;
      transform: translateY(-50%);
    }

    .project-status {
      display: flex;
      align-items: center;
      margin-right: 10px;

      .status-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
      }

      &.running .status-dot {
        background-color: #52c41a;
      }

      &.stopped .status-dot {
        background-color: #ff4d4f;
      }
    }
  }

  .empty-state {
    margin: 0 12px;
    padding: 40px 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: #fff;
    border-radius: 8px;
    border: 1px solid #f0f0f0;

    .empty-text {
      margin-top: 10px;
      color: #999;
      font-size: 14px;
    }
  }

  .loading-state {
    padding: 20px 0;
  }
}
</style>
