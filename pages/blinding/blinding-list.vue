<template>
  <view class="blinding-list-page">
    <!-- 搜索栏 -->
    <view class="search-container">
      <uni-search-bar
        v-model="searchValue"
        placeholder="搜索编盲计划"
        @input="handleSearch"
        @clear="handleSearchClear"
        :radius="4"
      />
    </view>

    <!-- 标签页切换 -->
    <view class="tabs-container">
      <uni-segmented-control
        :current="currentTab"
        :values="tabList"
        @clickItem="handleTabChange"
        styleType="text"
        activeColor="#8b5cf6"
      />
    </view>

    <!-- 编盲计划列表 -->
    <scroll-view
      class="list-container"
      scroll-y
      refresher-enabled
      :refresher-triggered="refreshing"
      @refresherrefresh="handleRefresh"
      @scrolltolower="handleLoadMore"
      lower-threshold="100"
    >
      <uni-list v-if="blindingPlans.length > 0">
        <view class="list-padding">
          <view
            v-for="plan in blindingPlans"
            :key="plan.id"
            class="plan-item"
            @click="handlePlanClick(plan)"
          >
            <view class="plan-header">
              <view class="plan-name">{{ plan.name }}</view>
              <view class="plan-status" :class="plan.status">
                {{ plan.statusText }}
              </view>
            </view>
            
            <view class="plan-stats">
              <view class="stat-item">
                <view class="stat-label">全部编盲总数</view>
                <view class="stat-value">{{ plan.totalCount }}</view>
              </view>
              <view class="stat-item">
                <view class="stat-label">待编盲数</view>
                <view class="stat-value pending">{{ plan.pendingCount }}</view>
              </view>
              <view class="stat-item">
                <view class="stat-label">已完成数</view>
                <view class="stat-value completed">{{ plan.completedCount }}</view>
              </view>
            </view>
            
            <view class="plan-progress">
              <view class="progress-bar">
                <view 
                  class="progress-fill" 
                  :style="{ width: plan.progressPercent + '%' }"
                ></view>
              </view>
              <view class="progress-text">{{ plan.progressPercent }}%</view>
            </view>
            
            <view class="plan-footer">
              <view class="plan-date">创建时间：{{ plan.createTime }}</view>
              <uni-icons type="right" size="16" color="#ccc"></uni-icons>
            </view>
          </view>
        </view>
      </uni-list>

      <!-- 空状态 -->
      <view
        v-else-if="!loading && pagination.page_index === 1"
        class="empty-state"
      >
        <uni-icons type="info" size="64" color="#999"></uni-icons>
        <text class="empty-text">{{
          currentTab === 0 ? "暂无执行中的编盲计划" : "暂无已完成的编盲计划"
        }}</text>
      </view>

      <!-- 加载更多 -->
      <view v-if="loading && blindingPlans.length > 0" class="loading-more">
        <uni-load-more :status="loadMoreStatus"></uni-load-more>
      </view>
    </scroll-view>
  </view>
</template>

<script>
export default {
  name: "BlindingList",
  data() {
    return {
      // 搜索相关
      searchValue: "",
      searchTimer: null,

      // 标签页
      currentTab: 0,
      tabList: ["执行中", "已完成"],

      // 列表数据
      blindingPlans: [],
      filteredPlans: [],

      // 分页
      pagination: {
        page_index: 1,
        page_size: 20,
        total: 0,
      },

      // 状态
      loading: false,
      refreshing: false,
      loadMoreStatus: "more",
    };
  },

  computed: {
    // 根据当前标签页过滤数据
    currentPlans() {
      const status = this.currentTab === 0 ? "executing" : "completed";
      return this.blindingPlans.filter((plan) => plan.status === status);
    },
  },

  onLoad() {
    this.loadBlindingPlans();
  },

  onShow() {
    // 页面显示时刷新数据
    this.handleRefresh();
  },

  methods: {
    // 加载编盲计划列表
    async loadBlindingPlans(isRefresh = false) {
      if (this.loading) return;

      this.loading = true;

      if (isRefresh) {
        this.pagination.page_index = 1;
        this.blindingPlans = [];
      }

      try {
        // 模拟API调用
        const mockData = this.getMockBlindingPlans();
        
        if (isRefresh) {
          this.blindingPlans = mockData;
        } else {
          this.blindingPlans.push(...mockData);
        }

        this.pagination.total = mockData.length;
        this.loadMoreStatus = mockData.length < this.pagination.page_size ? "noMore" : "more";
      } catch (error) {
        console.error("加载编盲计划失败:", error);
        uni.showToast({
          title: "加载失败",
          icon: "error",
        });
      } finally {
        this.loading = false;
        this.refreshing = false;
      }
    },

    // 获取模拟数据
    getMockBlindingPlans() {
      const executingPlans = [
        {
          id: 1,
          name: "CIMS-2024-001 编盲计划",
          status: "executing",
          statusText: "执行中",
          totalCount: 120,
          pendingCount: 45,
          completedCount: 75,
          progressPercent: 62.5,
          createTime: "2024-01-15 10:30",
        },
        {
          id: 2,
          name: "临床试验A组编盲方案",
          status: "executing",
          statusText: "执行中",
          totalCount: 80,
          pendingCount: 20,
          completedCount: 60,
          progressPercent: 75.0,
          createTime: "2024-01-10 14:20",
        },
        {
          id: 3,
          name: "多中心随机编盲计划",
          status: "executing",
          statusText: "执行中",
          totalCount: 200,
          pendingCount: 150,
          completedCount: 50,
          progressPercent: 25.0,
          createTime: "2024-01-08 09:15",
        },
      ];

      const completedPlans = [
        {
          id: 4,
          name: "CIMS-2023-005 编盲计划",
          status: "completed",
          statusText: "已完成",
          totalCount: 100,
          pendingCount: 0,
          completedCount: 100,
          progressPercent: 100,
          createTime: "2023-12-20 16:45",
        },
        {
          id: 5,
          name: "临床试验B组编盲方案",
          status: "completed",
          statusText: "已完成",
          totalCount: 60,
          pendingCount: 0,
          completedCount: 60,
          progressPercent: 100,
          createTime: "2023-12-15 11:30",
        },
      ];

      return this.currentTab === 0 ? executingPlans : completedPlans;
    },

    // 标签页切换
    handleTabChange(e) {
      this.currentTab = e.currentIndex;
      this.handleRefresh();
    },

    // 搜索处理
    handleSearch(value) {
      clearTimeout(this.searchTimer);
      this.searchTimer = setTimeout(() => {
        this.performSearch(value);
      }, 300);
    },

    // 执行搜索
    performSearch(keyword) {
      if (!keyword.trim()) {
        this.handleRefresh();
        return;
      }

      this.blindingPlans = this.blindingPlans.filter((plan) =>
        plan.name.toLowerCase().includes(keyword.toLowerCase())
      );
    },

    // 清除搜索
    handleSearchClear() {
      this.searchValue = "";
      this.handleRefresh();
    },

    // 下拉刷新
    handleRefresh() {
      this.refreshing = true;
      this.loadBlindingPlans(true);
    },

    // 加载更多
    handleLoadMore() {
      if (this.loadMoreStatus === "more" && !this.loading) {
        this.pagination.page_index++;
        this.loadBlindingPlans();
      }
    },

    // 点击编盲计划
    handlePlanClick(plan) {
      uni.navigateTo({
        url: `/pages/blinding/blinding-detail?id=${plan.id}&name=${encodeURIComponent(plan.name)}`,
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.blinding-list-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  display: flex;
  flex-direction: column;
  box-sizing: border-box;

  .search-container {
    padding: 10px 15px;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);

    :deep(.uni-searchbar) {
      padding: 0;

      .uni-searchbar__box {
        border-radius: 12px;
        background: rgba(255, 255, 255, 0.9);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(139, 92, 246, 0.2);
        height: 44px;
        box-shadow: 0 2px 8px rgba(139, 92, 246, 0.1);
        transition: all 0.3s ease;

        &:focus-within {
          border-color: #8b5cf6;
          box-shadow: 0 4px 12px rgba(139, 92, 246, 0.2);
        }
      }

      .uni-searchbar__text-input {
        font-size: 16px;
        color: #333;
      }
    }
  }

  .tabs-container {
    padding: 15px;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);

    :deep(.uni-segmented-control) {
      border-radius: 12px;
      overflow: hidden;
      background: rgba(255, 255, 255, 0.9);
      backdrop-filter: blur(10px);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

      .uni-segmented-control__item {
        height: 44px;
        line-height: 44px;
        font-size: 16px;
        font-weight: 500;
        transition: all 0.3s ease;

        &.uni-segmented-control__item--button--active {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          box-shadow: 0 2px 8px rgba(139, 92, 246, 0.3);
        }
      }
    }
  }

  .list-container {
    padding: 10px 15px;
    flex: 1;
    height: calc(100vh - 180px);
    box-sizing: border-box;
    width: 100%;

    :deep(.uni-list) {
      margin: 0;
      padding: 0;
      width: 100%;
      box-sizing: border-box;
    }

    .list-padding {
      margin: 0;
      width: 100%;
      box-sizing: border-box;

      .plan-item {
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(10px);
        border-radius: 16px;
        padding: 20px;
        margin-bottom: 15px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        border: 1px solid rgba(139, 92, 246, 0.1);
        transition: all 0.3s ease;

        &:active {
          transform: scale(0.98);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
        }

        .plan-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;

          .plan-name {
            font-size: 18px;
            font-weight: 600;
            color: #333;
            flex: 1;
            margin-right: 10px;
          }

          .plan-status {
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 500;

            &.executing {
              background: linear-gradient(135deg, #10b981 0%, #059669 100%);
              color: white;
            }

            &.completed {
              background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
              color: white;
            }
          }
        }

        .plan-stats {
          display: flex;
          justify-content: space-between;
          margin-bottom: 15px;

          .stat-item {
            text-align: center;
            flex: 1;

            .stat-label {
              font-size: 12px;
              color: #666;
              margin-bottom: 5px;
            }

            .stat-value {
              font-size: 20px;
              font-weight: 600;
              color: #333;

              &.pending {
                color: #f59e0b;
              }

              &.completed {
                color: #10b981;
              }
            }
          }
        }

        .plan-progress {
          display: flex;
          align-items: center;
          margin-bottom: 15px;

          .progress-bar {
            flex: 1;
            height: 8px;
            background: rgba(139, 92, 246, 0.1);
            border-radius: 4px;
            overflow: hidden;
            margin-right: 10px;

            .progress-fill {
              height: 100%;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              border-radius: 4px;
              transition: width 0.3s ease;
            }
          }

          .progress-text {
            font-size: 14px;
            font-weight: 500;
            color: #8b5cf6;
            min-width: 40px;
            text-align: right;
          }
        }

        .plan-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;

          .plan-date {
            font-size: 12px;
            color: #999;
          }
        }
      }
    }
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px 20px;
    color: #999;

    .empty-text {
      margin-top: 15px;
      font-size: 16px;
    }
  }

  .loading-more {
    padding: 20px;
  }
}
</style>
