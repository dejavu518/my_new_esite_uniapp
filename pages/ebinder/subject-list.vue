<template>
  <view class="subject-list-page">
    <!-- 搜索栏 -->
    <view class="search-container">
      <uni-search-bar
        v-model="searchValue"
        placeholder="搜索受试者"
        @input="handleSearch"
        @clear="handleSearchClear"
        :radius="4"
      />
    </view>

    <!-- 受试者列表 -->
    <scroll-view
      class="list-container"
      scroll-y
      refresher-enabled
      :refresher-triggered="refreshing"
      @refresherrefresh="handleRefresh"
      @scrolltolower="handleLoadMore"
      lower-threshold="100"
    >
      <uni-list v-if="subjects.length > 0">
        <view class="list-padding">
          <uni-list-item
            v-for="subject in subjects"
            :key="subject.id"
            :title="subject.code"
            showArrow
            clickable
            class="list-item"
            @click="handleSubjectClick(subject)"
          >
            <template v-slot:header>
              <view class="subject-avatar">
                <uni-icons type="person" size="20" color="#666"></uni-icons>
              </view>
            </template>
          </uni-list-item>
        </view>
      </uni-list>

      <!-- 空状态 -->
      <view
        v-else-if="!loading && pagination.page_index === 1"
        class="empty-state"
      >
        <uni-icons type="info" size="64" color="#999"></uni-icons>
        <text class="empty-text">{{
          searchValue ? "未找到相关受试者" : "暂无受试者"
        }}</text>
      </view>

      <!-- 加载更多状态 -->
      <view v-if="subjects.length > 0" class="load-more-container">
        <uni-load-more :status="loadMoreStatus" :content-text="loadMoreText" />
      </view>

      <!-- 首次加载状态 -->
      <view v-if="loading && pagination.page_index === 1" class="loading-state">
        <uni-load-more status="loading" />
      </view>
    </scroll-view>
  </view>
</template>

<script>
import { getSubjectList } from "@/api/ebinder.js";

export default {
  data() {
    return {
      searchValue: "",
      subjects: [],
      loading: false,
      refreshing: false,
      pagination: {
        page_index: 1,
        page_size: 20,
        total: 0,
        hasMore: true,
      },
    };
  },
  computed: {
    // 加载更多状态
    loadMoreStatus() {
      if (this.loading && this.pagination.page_index > 1) {
        return "loading";
      }
      if (!this.pagination.hasMore) {
        return "noMore";
      }
      return "more";
    },
    // 加载更多文本
    loadMoreText() {
      return {
        contentdown: "上拉显示更多",
        contentrefresh: "正在加载...",
        contentnomore: "没有更多数据了",
      };
    },
  },
  methods: {
    // 处理搜索输入
    handleSearch(e) {
      this.searchValue = e;
      // 重置分页并重新加载
      this.pagination.page_index = 1;
      this.subjects = [];
      this.loadSubjects();
    },
    // 处理清除搜索
    handleSearchClear() {
      this.searchValue = "";
      // 重置分页并重新加载
      this.pagination.page_index = 1;
      this.subjects = [];
      this.loadSubjects();
    },
    // 处理受试者点击
    handleSubjectClick(subject) {
      uni.navigateTo({
        url: `/pages/ebinder/subject-detail?id=${subject.id}&code=${subject.code}`,
        success: () => {
          console.log("跳转到受试者详情页成功");
        },
        fail: (err) => {
          console.error("跳转失败:", err);
          uni.showToast({
            title: "页面跳转失败",
            icon: "none",
          });
        },
      });
    },
    // 获取状态文本
    getStatusText(status) {
      const statusMap = {
        active: "活跃",
        completed: "已完成",
        withdrawn: "已退出",
        screening: "筛选中",
      };
      return statusMap[status] || status;
    },
    // 加载受试者列表
    async loadSubjects(isRefresh = false) {
      try {
        this.loading = true;

        // 如果是刷新，重置分页
        if (isRefresh) {
          this.pagination.page_index = 1;
          this.subjects = [];
          this.pagination.hasMore = true;
        }

        // 注释掉真实接口调用，使用假数据
        // const res = await getSubjectList(
        //   this.searchValue,
        //   this.pagination.page_size,
        //   this.pagination.page_index
        // );

        // 模拟网络延迟
        await new Promise((resolve) => setTimeout(resolve, 600));

        // 模拟受试者列表假数据
        const allSubjects = [
          {
            subject_id: "S001",
            subject_name: "张三",
            subject_code: "01-001",
            status: "active",
            age: 28,
            gender: "男",
            phone: "138****1234",
            enroll_date: "2024-01-10",
          },
          {
            subject_id: "S002",
            subject_name: "李四",
            subject_code: "01-002",
            status: "completed",
            age: 35,
            gender: "女",
            phone: "139****5678",
            enroll_date: "2024-01-08",
          },
          {
            subject_id: "S003",
            subject_name: "王五",
            subject_code: "01-003",
            status: "withdrawn",
            age: 42,
            gender: "男",
            phone: "136****9012",
            enroll_date: "2024-01-05",
          },
          {
            subject_id: "S004",
            subject_name: "赵六",
            subject_code: "01-004",
            status: "active",
            age: 31,
            gender: "女",
            phone: "137****3456",
            enroll_date: "2024-01-12",
          },
          {
            subject_id: "S005",
            subject_name: "钱七",
            subject_code: "01-005",
            status: "screening",
            age: 26,
            gender: "男",
            phone: "135****7890",
            enroll_date: "2024-01-15",
          },
          {
            subject_id: "S006",
            subject_name: "孙八",
            subject_code: "01-006",
            status: "active",
            age: 39,
            gender: "女",
            phone: "134****2345",
            enroll_date: "2024-01-18",
          },
          {
            subject_id: "S007",
            subject_name: "周九",
            subject_code: "01-007",
            status: "completed",
            age: 33,
            gender: "男",
            phone: "133****6789",
            enroll_date: "2024-01-20",
          },
          {
            subject_id: "S008",
            subject_name: "吴十",
            subject_code: "01-008",
            status: "active",
            age: 29,
            gender: "女",
            phone: "132****0123",
            enroll_date: "2024-01-22",
          },
        ];

        // 根据搜索关键词过滤数据
        let filteredSubjects = allSubjects;
        if (this.searchValue) {
          const keyword = this.searchValue.toLowerCase();
          filteredSubjects = allSubjects.filter(
            (subject) =>
              subject.subject_name.toLowerCase().includes(keyword) ||
              subject.subject_code.toLowerCase().includes(keyword)
          );
        }

        // 模拟分页
        const startIndex =
          (this.pagination.page_index - 1) * this.pagination.page_size;
        const endIndex = startIndex + this.pagination.page_size;
        const pageData = filteredSubjects.slice(startIndex, endIndex);

        const res = {
          code: 0,
          msg: "success",
          data: pageData,
          total: filteredSubjects.length,
        };

        if (res && res.data) {
          // 处理返回的数据
          const newSubjects = res.data.map((item) => ({
            id: item.subject_id || item.id,
            name: item.subject_name || item.name,
            code: item.subject_code || item.code,
            status: item.status || "active",
            // 添加更多字段
            age: item.age,
            gender: item.gender,
            phone: item.phone,
            enrollDate: item.enroll_date,
          }));

          if (this.pagination.page_index === 1) {
            // 第一页，直接替换
            this.subjects = newSubjects;
          } else {
            // 后续页，追加数据
            this.subjects = [...this.subjects, ...newSubjects];
          }

          // 更新分页信息
          this.pagination.total = res.total || 0;
          this.pagination.hasMore =
            newSubjects.length >= this.pagination.page_size;
        } else {
          if (this.pagination.page_index === 1) {
            this.subjects = [];
          }
        }

        this.loading = false;
      } catch (error) {
        console.error("加载受试者列表失败:", error);
        uni.showToast({
          title: "加载失败，请重试",
          icon: "none",
        });
        this.loading = false;

        // 如果是第一页加载失败，显示空状态
        if (this.pagination.page_index === 1) {
          this.subjects = [];
        }
      }
    },

    // 加载更多数据
    async loadMore() {
      if (!this.pagination.hasMore || this.loading) {
        return;
      }

      this.pagination.page_index++;
      await this.loadSubjects();
    },

    // 下拉刷新
    async onRefresh() {
      await this.loadSubjects(true);
    },

    // 处理下拉刷新
    async handleRefresh() {
      this.refreshing = true;
      try {
        await this.loadSubjects(true);
      } finally {
        this.refreshing = false;
      }
    },

    // 处理上拉加载更多
    async handleLoadMore() {
      if (!this.pagination.hasMore || this.loading) {
        return;
      }
      await this.loadMore();
    },
  },
  onLoad() {
    uni.setNavigationBarTitle({
      title: "eBinder - 受试者列表",
    });
    this.loadSubjects();
  },
  onPullDownRefresh() {
    this.loadSubjects().then(() => {
      uni.stopPullDownRefresh();
    });
  },
};
</script>

<style lang="scss">
.subject-list-page {
  min-height: 100vh;
  background-color: #f7f7f7;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;

  .search-container {
    padding: 10px 15px; // 增加左右边距，与列表容器保持一致

    :deep(.uni-searchbar) {
      padding: 0;

      .uni-searchbar__box {
        border-radius: 8px;
        background-color: #f8f9fa;
        border: 1px solid #e0e0e0;
        height: 44px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        transition: all 0.3s ease;

        &:focus-within {
          border-color: #4a6feb;
          background-color: #fff;
          box-shadow: 0 2px 6px rgba(74, 111, 235, 0.2);
        }
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

  .list-container {
    padding: 10px 15px; // 增加左右边距，与其他页面保持一致
    flex: 1;
    height: calc(100vh - 120px); // 减去搜索栏高度
    box-sizing: border-box; // 确保padding包含在宽度内
    width: 100%; // 明确设置宽度

    // 重置uni-list组件的默认样式
    :deep(.uni-list) {
      margin: 0;
      padding: 0;
      width: 100%;
      box-sizing: border-box;
    }

    .list-padding {
      border-radius: 8px;
      overflow: hidden;
      background: #fff;
      border: 1px solid #f0f0f0;
      margin: 0; // 确保没有外边距影响
      width: 100%; // 明确设置宽度
      box-sizing: border-box; // 确保边框包含在宽度内

      .list-item {
        :deep(.uni-list-item__container) {
          padding: 12px 15px;
        }

        &:not(:last-child) {
          :deep(.uni-list-item__container) {
            border-bottom: 1px solid #f0f0f0;
          }
        }

        :deep(.uni-list-item__content-title) {
          font-size: 17px;
          font-weight: 500;
        }

        :deep(.uni-list-item__content-note) {
          font-size: 14px;
          color: #999;
          margin-top: 4px;
        }

        :deep(.uni-list-item__content-title) {
          font-size: 18px;
          font-weight: 600;
          color: #333;
          letter-spacing: 0.5px;
        }
      }
    }

    .subject-avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background-color: #f0f2f5;
      border: 1px solid #e0e0e0;
      color: #666;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 12px;
    }

    .subject-status {
      font-size: 13px;
      padding: 3px 10px;
      border-radius: 10px;

      &.active {
        background-color: #e6f7ff;
        color: #1890ff;
      }

      &.completed {
        background-color: #f6ffed;
        color: #52c41a;
      }

      &.withdrawn {
        background-color: #fff2f0;
        color: #ff4d4f;
      }

      &.screening {
        background-color: #fff7e6;
        color: #fa8c16;
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

  .load-more-container {
    padding: 10px 0;
  }
}
</style>
