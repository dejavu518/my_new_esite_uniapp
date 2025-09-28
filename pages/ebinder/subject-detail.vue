<template>
  <view class="subject-detail-page">
    <!-- 自定义导航栏 -->
    <view class="custom-navbar">
      <view class="navbar-content">
        <view class="nav-left" @click="goBack">
          <uni-icons type="left" size="20" color="#333"></uni-icons>
        </view>
        <view class="nav-title">{{ subjectCode }}</view>
        <view class="nav-right"></view>
      </view>
    </view>

    <!-- 标签页 -->
    <view class="tab-container">
      <view class="tab-list">
        <view
          class="tab-item"
          :class="{ active: activeTab === 'time' }"
          @click="switchTab('time')"
        >
          按时间
        </view>
        <view
          class="tab-item"
          :class="{ active: activeTab === 'form' }"
          @click="switchTab('form')"
        >
          按表单
        </view>
        <view
          class="tab-item"
          :class="{ active: activeTab === 'status' }"
          @click="switchTab('status')"
        >
          按状态
        </view>
      </view>
    </view>

    <!-- 内容列表 -->
    <scroll-view
      class="content-container"
      scroll-y
      :style="{ height: contentHeight + 'px' }"
    >
      <!-- 按时间显示 -->
      <template v-if="activeTab === 'time'">
        <!-- 日期分组 -->
        <view
          v-for="dateGroup in visitGroups"
          :key="dateGroup.date"
          class="date-group"
        >
          <view class="date-header" @click="toggleDateGroup(dateGroup.date)">
            <text class="date-text"
              >{{ dateGroup.date }} ({{ dateGroup.visits.length }})</text
            >
            <uni-icons
              :type="dateGroup.expanded ? 'up' : 'down'"
              size="16"
              color="#666"
            ></uni-icons>
          </view>

          <!-- 访问记录网格 -->
          <view v-if="dateGroup.expanded" class="visit-grid">
            <view
              v-for="visit in dateGroup.visits"
              :key="visit.id"
              class="visit-item"
              :class="{
                'new-photo': visit.isNewPhoto,
                'selection-mode': isSelectionMode,
                selected: selectedItems.includes(visit.id),
              }"
              @click="handleVisitClick(visit)"
              @longpress="handleLongPress(visit)"
            >
              <!-- 状态指示器 -->
              <view class="status-indicator" :class="visit.status"></view>

              <!-- 新照片标识 -->
              <view v-if="visit.isNewPhoto" class="new-photo-badge">
                <text class="new-text">新</text>
              </view>

              <!-- 访问图片/缩略图 -->
              <view class="visit-thumbnail">
                <image
                  v-if="visit.thumbnail"
                  :src="visit.thumbnail"
                  class="thumbnail-image"
                  mode="aspectFill"
                />
                <view v-else class="placeholder-thumbnail">
                  <uni-icons type="image" size="24" color="#ccc"></uni-icons>
                </view>
              </view>

              <!-- 访问信息 -->
              <view class="visit-info">
                <text class="visit-title">{{ visit.title }}</text>
                <text class="visit-time">{{ visit.time }}</text>
              </view>

              <!-- 选择框 -->
              <view
                v-if="isSelectionMode"
                class="selection-checkbox"
                @click.stop="toggleSelection(visit.id)"
              >
                <uni-icons
                  :type="
                    selectedItems.includes(visit.id)
                      ? 'checkbox-filled'
                      : 'checkbox'
                  "
                  size="20"
                  :color="selectedItems.includes(visit.id) ? '#4a6feb' : '#ddd'"
                ></uni-icons>
              </view>
            </view>
          </view>
        </view>
      </template>

      <!-- 按表单显示 -->
      <template v-if="activeTab === 'form'">
        <!-- 表单分组 -->
        <view
          v-for="formGroup in formGroups"
          :key="formGroup.name"
          class="date-group"
        >
          <view class="date-header" @click="toggleFormGroup(formGroup.name)">
            <text class="date-text"
              >{{ formGroup.name }} ({{ formGroup.forms.length }})</text
            >
            <uni-icons
              :type="formGroup.expanded ? 'up' : 'down'"
              size="16"
              color="#666"
            ></uni-icons>
          </view>

          <!-- 表单记录网格 -->
          <view v-if="formGroup.expanded" class="visit-grid">
            <view
              v-for="form in formGroup.forms"
              :key="form.id"
              class="visit-item"
              :class="{
                'selection-mode': isSelectionMode,
                selected: selectedItems.includes(form.id),
              }"
              @click="handleFormClick(form)"
              @longpress="handleLongPressForm(form)"
            >
              <!-- 状态指示器 -->
              <view class="status-indicator" :class="form.status"></view>

              <!-- 表单图片/缩略图 -->
              <view class="visit-thumbnail">
                <image
                  v-if="form.thumbnail"
                  :src="form.thumbnail"
                  class="thumbnail-image"
                  mode="aspectFill"
                />
                <view v-else class="placeholder-thumbnail">
                  <uni-icons type="image" size="24" color="#ccc"></uni-icons>
                </view>
              </view>

              <!-- 表单信息 -->
              <view class="visit-info">
                <text class="visit-title">{{ form.title }}</text>
                <text class="visit-time">{{ form.date }}</text>
              </view>

              <!-- 选择框 -->
              <view
                v-if="isSelectionMode"
                class="selection-checkbox"
                @click.stop="toggleSelection(form.id)"
              >
                <uni-icons
                  :type="
                    selectedItems.includes(form.id)
                      ? 'checkbox-filled'
                      : 'checkbox'
                  "
                  size="20"
                  :color="selectedItems.includes(form.id) ? '#4a6feb' : '#ddd'"
                ></uni-icons>
              </view>
            </view>
          </view>
        </view>
      </template>

      <!-- 按状态显示 -->
      <template v-if="activeTab === 'status'">
        <!-- 状态分组 -->
        <view
          v-for="statusGroup in statusGroups"
          :key="statusGroup.code"
          class="date-group"
        >
          <view
            class="date-header"
            @click="toggleStatusGroup(statusGroup.code)"
          >
            <text class="date-text"
              >{{ statusGroup.name }} ({{ statusGroup.items.length }})</text
            >
            <uni-icons
              :type="statusGroup.expanded ? 'up' : 'down'"
              size="16"
              color="#666"
            ></uni-icons>
          </view>

          <!-- 状态记录网格 -->
          <view v-if="statusGroup.expanded" class="visit-grid">
            <view
              v-for="item in statusGroup.items"
              :key="item.id"
              class="visit-item"
              :class="{
                'selection-mode': isSelectionMode,
                selected: selectedItems.includes(item.id),
              }"
              @click="handleStatusClick(item)"
              @longpress="handleLongPressStatus(item)"
            >
              <!-- 状态指示器 -->
              <view class="status-indicator" :class="item.status"></view>

              <!-- 状态图片/缩略图 -->
              <view class="visit-thumbnail">
                <image
                  v-if="item.thumbnail"
                  :src="item.thumbnail"
                  class="thumbnail-image"
                  mode="aspectFill"
                />
                <view v-else class="placeholder-thumbnail">
                  <uni-icons type="image" size="24" color="#ccc"></uni-icons>
                </view>
              </view>

              <!-- 状态信息 -->
              <view class="visit-info">
                <text class="visit-title">{{ item.title }}</text>
                <text class="visit-time">{{ item.date }}</text>
              </view>

              <!-- 选择框 -->
              <view
                v-if="isSelectionMode"
                class="selection-checkbox"
                @click.stop="toggleSelection(item.id)"
              >
                <uni-icons
                  :type="
                    selectedItems.includes(item.id)
                      ? 'checkbox-filled'
                      : 'checkbox'
                  "
                  size="20"
                  :color="selectedItems.includes(item.id) ? '#4a6feb' : '#ddd'"
                ></uni-icons>
              </view>
            </view>
          </view>
        </view>
      </template>
    </scroll-view>

    <!-- 底部操作栏 -->
    <view class="bottom-toolbar">
      <!-- 普通模式：拍照按钮 -->
      <template v-if="!isSelectionMode">
        <button class="photo-btn" @click="chooseImage">
          <uni-icons type="camera" size="20" color="#fff"></uni-icons>
          <text>拍照</text>
        </button>
      </template>

      <!-- 选择模式：操作按钮 -->
      <template v-else>
        <view class="selection-toolbar">
          <button class="cancel-btn" @click="exitSelectionMode">
            <text>取消</text>
          </button>
          <view class="selection-info">
            <text>已选择 {{ selectedItems.length }} 项</text>
          </view>
          <button
            class="delete-btn"
            :disabled="selectedItems.length === 0"
            @click="deleteSelectedItems"
          >
            <uni-icons type="trash" size="18" color="#fff"></uni-icons>
            <text>删除</text>
          </button>
        </view>
      </template>
    </view>

    <!-- 底部导航 -->
    <view class="bottom-nav">
      <view class="nav-item" @click="goToIndex">
        <text class="nav-text">首页</text>
      </view>
      <view class="nav-item" @click="goToProfile">
        <text class="nav-text">个人中心</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      subjectId: "",
      subjectCode: "001",
      activeTab: "time",
      visitGroups: [],
      formGroups: [],
      statusGroups: [],
      contentHeight: 0,
      // 批量选择相关状态
      isSelectionMode: false, // 是否处于选择模式
      selectedItems: [], // 已选择的项目ID列表
    };
  },
  methods: {
    // 初始化假数据
    initMockData() {
      // 按时间分组的访问数据
      this.visitGroups = [
        {
          date: "2025-05-29",
          expanded: true,
          visits: [
            {
              id: "v001",
              title: "基线访问",
              time: "09:30",
              status: "completed",
              thumbnail: null,
            },
            {
              id: "v002",
              title: "随访1",
              time: "10:15",
              status: "pending",
              thumbnail: null,
            },
            {
              id: "v003",
              title: "随访2",
              time: "11:00",
              status: "completed",
              thumbnail: null,
            },
            {
              id: "v004",
              title: "随访3",
              time: "14:30",
              status: "pending",
              thumbnail: null,
            },
            {
              id: "v005",
              title: "随访4",
              time: "15:15",
              status: "completed",
              thumbnail: null,
            },
            {
              id: "v006",
              title: "随访5",
              time: "16:00",
              status: "pending",
              thumbnail: null,
            },
            {
              id: "v007",
              title: "随访6",
              time: "16:45",
              status: "pending",
              thumbnail: null,
            },
            {
              id: "v008",
              title: "随访7",
              time: "17:30",
              status: "pending",
              thumbnail: null,
            },
            {
              id: "v009",
              title: "随访8",
              time: "09:00",
              status: "pending",
              thumbnail: null,
            },
            {
              id: "v010",
              title: "随访9",
              time: "10:30",
              status: "completed",
              thumbnail: null,
            },
            {
              id: "v011",
              title: "随访10",
              time: "11:15",
              status: "pending",
              thumbnail: null,
            },
            {
              id: "v012",
              title: "随访11",
              time: "14:00",
              status: "pending",
              thumbnail: null,
            },
            {
              id: "v013",
              title: "随访12",
              time: "15:30",
              status: "pending",
              thumbnail: null,
            },
            {
              id: "v014",
              title: "随访13",
              time: "16:15",
              status: "pending",
              thumbnail: null,
            },
            {
              id: "v015",
              title: "随访14",
              time: "17:00",
              status: "pending",
              thumbnail: null,
            },
          ],
        },
      ];

      // 按表单分组的数据
      this.formGroups = [
        {
          name: "既往病史",
          expanded: true,
          forms: [
            {
              id: "f001",
              title: "既往病史表1",
              date: "2025-05-29",
              status: "completed",
              thumbnail: null,
            },
            {
              id: "f002",
              title: "既往病史表2",
              date: "2025-05-28",
              status: "completed",
              thumbnail: null,
            },
          ],
        },
        {
          name: "知情同意",
          expanded: true,
          forms: [
            {
              id: "f003",
              title: "知情同意书",
              date: "2025-05-29",
              status: "completed",
              thumbnail: null,
            },
            {
              id: "f004",
              title: "知情同意补充",
              date: "2025-05-29",
              status: "completed",
              thumbnail: null,
            },
            {
              id: "f005",
              title: "知情同意确认",
              date: "2025-05-28",
              status: "completed",
              thumbnail: null,
            },
            {
              id: "f006",
              title: "知情同意变更",
              date: "2025-05-27",
              status: "pending",
              thumbnail: null,
            },
            {
              id: "f007",
              title: "知情同意撤回",
              date: "2025-05-26",
              status: "pending",
              thumbnail: null,
            },
          ],
        },
        {
          name: "不良事件",
          expanded: true,
          forms: [
            {
              id: "f008",
              title: "不良事件报告",
              date: "2025-05-25",
              status: "pending",
              thumbnail: null,
            },
          ],
        },
      ];

      // 按状态分组的数据
      this.statusGroups = [
        {
          code: "000",
          name: "未归类",
          expanded: true,
          items: [
            {
              id: "s001",
              title: "图片001",
              date: "2025-05-29",
              status: "uncategorized",
              thumbnail: null,
            },
            {
              id: "s002",
              title: "图片002",
              date: "2025-05-29",
              status: "uncategorized",
              thumbnail: null,
            },
            {
              id: "s003",
              title: "图片003",
              date: "2025-05-28",
              status: "uncategorized",
              thumbnail: null,
            },
          ],
        },
        {
          code: "005",
          name: "归类失败",
          expanded: true,
          items: [
            {
              id: "s004",
              title: "图片004",
              date: "2025-05-28",
              status: "failed",
              thumbnail: null,
            },
            {
              id: "s005",
              title: "图片005",
              date: "2025-05-27",
              status: "failed",
              thumbnail: null,
            },
          ],
        },
        {
          code: "006",
          name: "归类进行中",
          expanded: true,
          items: [
            {
              id: "s006",
              title: "图片006",
              date: "2025-05-29",
              status: "processing",
              thumbnail: null,
            },
            {
              id: "s007",
              title: "图片007",
              date: "2025-05-29",
              status: "processing",
              thumbnail: null,
            },
            {
              id: "s008",
              title: "图片008",
              date: "2025-05-28",
              status: "processing",
              thumbnail: null,
            },
            {
              id: "s009",
              title: "图片009",
              date: "2025-05-28",
              status: "processing",
              thumbnail: null,
            },
          ],
        },
        {
          code: "010",
          name: "已归类-待审核",
          expanded: true,
          items: [
            {
              id: "s010",
              title: "图片010",
              date: "2025-05-27",
              status: "pending-review",
              thumbnail: null,
            },
            {
              id: "s011",
              title: "图片011",
              date: "2025-05-27",
              status: "pending-review",
              thumbnail: null,
            },
            {
              id: "s012",
              title: "图片012",
              date: "2025-05-26",
              status: "pending-review",
              thumbnail: null,
            },
          ],
        },
        {
          code: "020",
          name: "已审核",
          expanded: true,
          items: [
            {
              id: "s013",
              title: "图片013",
              date: "2025-05-26",
              status: "reviewed",
              thumbnail: null,
            },
            {
              id: "s014",
              title: "图片014",
              date: "2025-05-25",
              status: "reviewed",
              thumbnail: null,
            },
            {
              id: "s015",
              title: "图片015",
              date: "2025-05-25",
              status: "reviewed",
              thumbnail: null,
            },
            {
              id: "s016",
              title: "图片016",
              date: "2025-05-24",
              status: "reviewed",
              thumbnail: null,
            },
            {
              id: "s017",
              title: "图片017",
              date: "2025-05-24",
              status: "reviewed",
              thumbnail: null,
            },
          ],
        },
      ];
    },

    // 切换标签页
    switchTab(tab) {
      this.activeTab = tab;
    },

    // 切换日期分组展开/收起
    toggleDateGroup(date) {
      const group = this.visitGroups.find((g) => g.date === date);
      if (group) {
        group.expanded = !group.expanded;
      }
    },

    // 切换表单分组展开/收起
    toggleFormGroup(name) {
      const group = this.formGroups.find((g) => g.name === name);
      if (group) {
        group.expanded = !group.expanded;
      }
    },

    // 处理访问记录点击
    handleVisitClick(visit) {
      if (this.isSelectionMode) {
        // 选择模式下，点击切换选择状态
        this.toggleSelection(visit.id);
      } else {
        // 普通模式下，显示详情
        uni.showToast({
          title: `查看${visit.title}`,
          icon: "none",
        });
        // TODO: 跳转到具体的访问详情页面
      }
    },

    // 处理长按事件
    handleLongPress(visit) {
      if (!this.isSelectionMode) {
        // 进入选择模式
        this.isSelectionMode = true;
        this.selectedItems = [visit.id]; // 长按的项目自动选中

        // 震动反馈
        uni.vibrateShort();

        uni.showToast({
          title: "已进入选择模式",
          icon: "none",
          duration: 1500,
        });
      }
    },

    // 切换选择状态
    toggleSelection(itemId) {
      const index = this.selectedItems.indexOf(itemId);
      if (index > -1) {
        // 如果已选中，则取消选择
        this.selectedItems.splice(index, 1);
      } else {
        // 如果未选中，则添加到选择列表
        this.selectedItems.push(itemId);
      }
    },

    // 退出选择模式
    exitSelectionMode() {
      this.isSelectionMode = false;
      this.selectedItems = [];
    },

    // 删除选中的项目
    deleteSelectedItems() {
      if (this.selectedItems.length === 0) {
        return;
      }

      uni.showModal({
        title: "确认删除",
        content: `确定要删除选中的 ${this.selectedItems.length} 张图片吗？`,
        success: (res) => {
          if (res.confirm) {
            this.performDelete();
          }
        },
      });
    },

    // 执行删除操作
    performDelete() {
      const deleteCount = this.selectedItems.length;

      // 从按时间分组中删除选中的项目
      this.visitGroups.forEach((group) => {
        group.visits = group.visits.filter(
          (visit) => !this.selectedItems.includes(visit.id)
        );
      });

      // 从按表单分组中删除选中的项目
      this.formGroups.forEach((group) => {
        group.forms = group.forms.filter(
          (form) => !this.selectedItems.includes(form.id)
        );
      });

      // 从按状态分组中删除选中的项目
      this.statusGroups.forEach((group) => {
        group.items = group.items.filter(
          (item) => !this.selectedItems.includes(item.id)
        );
      });

      // 移除空的分组
      this.visitGroups = this.visitGroups.filter(
        (group) => group.visits.length > 0
      );
      this.formGroups = this.formGroups.filter(
        (group) => group.forms.length > 0
      );
      this.statusGroups = this.statusGroups.filter(
        (group) => group.items.length > 0
      );

      // 显示删除成功提示
      uni.showToast({
        title: `已删除 ${deleteCount} 项`,
        icon: "success",
      });

      // 退出选择模式
      this.exitSelectionMode();
    },

    // 处理表单记录点击
    handleFormClick(form) {
      if (this.isSelectionMode) {
        // 选择模式下，点击切换选择状态
        this.toggleSelection(form.id);
      } else {
        // 普通模式下，显示详情
        uni.showToast({
          title: `查看${form.title}`,
          icon: "none",
        });
        // TODO: 跳转到具体的表单详情页面
      }
    },

    // 处理表单长按事件
    handleLongPressForm(form) {
      if (!this.isSelectionMode) {
        // 进入选择模式
        this.isSelectionMode = true;
        this.selectedItems = [form.id]; // 长按的项目自动选中

        // 震动反馈
        uni.vibrateShort();

        uni.showToast({
          title: "已进入选择模式",
          icon: "none",
          duration: 1500,
        });
      }
    },

    // 切换状态分组展开/收起
    toggleStatusGroup(code) {
      const group = this.statusGroups.find((g) => g.code === code);
      if (group) {
        group.expanded = !group.expanded;
      }
    },

    // 处理状态记录点击
    handleStatusClick(item) {
      if (this.isSelectionMode) {
        // 选择模式下，点击切换选择状态
        this.toggleSelection(item.id);
      } else {
        // 普通模式下，显示详情
        uni.showToast({
          title: `查看${item.title}`,
          icon: "none",
        });
        // TODO: 跳转到具体的状态详情页面
      }
    },

    // 处理状态长按事件
    handleLongPressStatus(item) {
      if (!this.isSelectionMode) {
        // 进入选择模式
        this.isSelectionMode = true;
        this.selectedItems = [item.id]; // 长按的项目自动选中

        // 震动反馈
        uni.vibrateShort();

        uni.showToast({
          title: "已进入选择模式",
          icon: "none",
          duration: 1500,
        });
      }
    },

    // 选择图片（拍照或相册）
    chooseImage() {
      uni.showActionSheet({
        itemList: ['使用相机拍照', '从相册选择'],
        success: (res) => {
          if (res.tapIndex === 0) {
            // 使用自定义相机拍照
            this.openCustomCamera();
          } else if (res.tapIndex === 1) {
            // 从相册选择
            this.chooseFromAlbum();
          }
        },
        fail: (err) => {
          console.error('操作取消:', err);
        }
      });
    },

    // 打开自定义相机页面
    openCustomCamera() {
      uni.navigateTo({
        url: '/pages/ebinder/custom-camera?subjectId=' + this.subjectId + '&subjectCode=' + this.subjectCode
      });
    },

    // 从相册选择图片
    chooseFromAlbum() {
      uni.chooseImage({
        count: 1,
        sourceType: ['album'], // 只允许从相册选择
        success: (res) => {
          if (res.tempFilePaths && res.tempFilePaths.length > 0) {
            const imagePath = res.tempFilePaths[0];
            // 跳转到图片编辑页面
            uni.navigateTo({
              url: `/pages/ebinder/image-editor?imagePath=${encodeURIComponent(
                imagePath
              )}`
            });
          }
        },
        fail: (err) => {
          console.error('选择图片失败:', err);
          uni.showToast({
            title: '选择图片失败',
            icon: 'none'
          });
        }
      });
    },

    // 处理编辑后的图片
    handleEditedImage(editedImagePath) {
      // 上传编辑后的图片
      this.uploadPhoto(editedImagePath);
    },

    // 上传照片
    uploadPhoto(imagePath) {
      // 显示上传中提示
      uni.showLoading({
        title: "正在上传照片...",
      });

      // 模拟上传过程 - 可以替换为真实的上传API调用
      setTimeout(() => {
        // 生成当前日期
        const now = new Date();
        const currentDate = this.formatDate(now);
        const currentTime = this.formatTime(now);

        // 生成新的访问记录
        const newVisit = {
          id: `v_${Date.now()}`,
          title: "新拍照片",
          time: currentTime,
          status: "completed",
          thumbnail: imagePath, // 使用拍照的图片路径
          isNewPhoto: true, // 标记为新拍照片
        };

        // 添加到对应的日期分组
        this.addToDateGroup(currentDate, newVisit);

        // 隐藏加载提示
        uni.hideLoading();

        // 显示成功提示
        uni.showToast({
          title: "上传成功",
          icon: "success",
        });

        // 自动切换到按时间标签页
        this.activeTab = "time";

        // 5秒后移除新照片标识
        setTimeout(() => {
          this.removeNewPhotoFlag(newVisit.id);
        }, 5000);
      }, 1500); // 模拟1.5秒的上传时间
    },

    // 添加到日期分组
    addToDateGroup(date, visit) {
      // 查找是否已存在该日期的分组
      let dateGroup = this.visitGroups.find((group) => group.date === date);

      if (dateGroup) {
        // 如果分组存在，添加到该分组
        dateGroup.visits.unshift(visit); // 添加到开头，显示最新的
        dateGroup.expanded = true; // 确保分组是展开的
      } else {
        // 如果分组不存在，创建新的分组
        const newGroup = {
          date: date,
          expanded: true,
          visits: [visit],
        };
        // 添加到开头，显示最新的日期
        this.visitGroups.unshift(newGroup);
      }
    },

    // 格式化日期 (YYYY-MM-DD)
    formatDate(date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    },

    // 格式化时间 (HH:MM)
    formatTime(date) {
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");
      return `${hours}:${minutes}`;
    },

    // 移除新照片标识
    removeNewPhotoFlag(visitId) {
      // 遍历所有日期分组，找到对应的访问记录并移除新照片标识
      this.visitGroups.forEach((group) => {
        const visit = group.visits.find((v) => v.id === visitId);
        if (visit && visit.isNewPhoto) {
          visit.isNewPhoto = false;
        }
      });
    },

    // 返回上一页
    goBack() {
      uni.navigateBack();
    },

    // 跳转到首页
    goToIndex() {
      uni.switchTab({
        url: "/pages/home/home",
      });
    },

    // 跳转到个人中心
    goToProfile() {
      uni.switchTab({
        url: "/pages/profile/profile",
      });
    },

    // 计算内容区域高度
    calculateContentHeight() {
      const systemInfo = uni.getSystemInfoSync();
      const windowHeight = systemInfo.windowHeight;
      const statusBarHeight = systemInfo.statusBarHeight || 0;

      // 导航栏高度 (44px) + 状态栏高度 + 标签页高度 (54px) + 底部操作栏高度 (64px) + 底部导航高度 (60px) + 安全距离 (10px)
      const fixedHeight = 44 + statusBarHeight + 54 + 64 + 60 + 10;

      this.contentHeight = windowHeight - fixedHeight;
    },
  },

  onLoad(options) {
    // 获取传递的受试者信息
    if (options.id) {
      this.subjectId = options.id;
    }
    if (options.code) {
      this.subjectCode = options.code;
    }

    // 初始化数据
    this.initMockData();
  },

  onReady() {
    // 页面渲染完成后计算内容高度
    this.$nextTick(() => {
      this.calculateContentHeight();
    });
  },
};
</script>

<style lang="scss" scoped>
.subject-detail-page {
  height: 100vh;
  background-color: #f5f5f5;
  display: flex;
  flex-direction: column;
  position: relative;
}

// 自定义导航栏
.custom-navbar {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  padding-top: var(--status-bar-height);
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);

  .navbar-content {
    height: 44px;
    display: flex;
    align-items: center;
    padding: 0 15px;

    .nav-left {
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .nav-title {
      flex: 1;
      text-align: center;
      font-size: 18px;
      font-weight: 600;
      color: #333;
    }

    .nav-right {
      width: 40px;
    }
  }
}

// 标签页
.tab-container {
  background-color: #fff;
  border-bottom: 1px solid #f0f0f0;

  .tab-list {
    display: flex;
    padding: 0 15px;

    .tab-item {
      flex: 1;
      text-align: center;
      padding: 15px 0;
      font-size: 16px;
      color: #666;
      position: relative;

      &.active {
        color: #4a6feb;
        font-weight: 600;

        &::after {
          content: "";
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 30px;
          height: 3px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 2px;
        }
      }
    }
  }
}

// 内容区域
.content-container {
  padding: 10px 0 20px 0; // 移除左右内边距，让子元素自己控制边距
  overflow-y: auto;
}

// 日期分组
.date-group {
  margin-bottom: 20px;

  .date-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 15px;
    background-color: #fff;
    border-radius: 8px;
    margin-bottom: 10px;

    .date-text {
      font-size: 16px;
      font-weight: 600;
      color: #333;
    }
  }
}

// 访问记录网格
.visit-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px; // 适中的间距
  margin: 0; // 移除外边距
  padding: 0 15px; // 与date-header保持一致的左右内边距
  width: 100%;
  box-sizing: border-box;
}

.visit-item {
  background-color: #fff;
  border-radius: 6px;
  padding: 4px; // 进一步减小padding
  position: relative;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  min-height: 95px; // 减小最小高度
  box-sizing: border-box;

  .status-indicator {
    position: absolute;
    top: 3px;
    right: 3px;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    z-index: 10;

    &.completed {
      background-color: #52c41a;
    }

    &.pending {
      background-color: #ff7875;
    }

    &.in-progress {
      background-color: #faad14;
    }

    &.uncategorized {
      background-color: #d9d9d9; // 灰色 - 未归类
    }

    &.failed {
      background-color: #ff4d4f; // 红色 - 归类失败
    }

    &.processing {
      background-color: #1890ff; // 蓝色 - 归类进行中
    }

    &.pending-review {
      background-color: #faad14; // 橙色 - 待审核
    }

    &.reviewed {
      background-color: #52c41a; // 绿色 - 已审核
    }
  }

  .visit-thumbnail {
    width: 100%;
    height: 45px; // 再次减小图片高度
    border-radius: 4px;
    overflow: hidden;
    margin-bottom: 4px;
    background-color: #f5f5f5;

    .thumbnail-image {
      width: 100%;
      height: 100%;
    }

    .placeholder-thumbnail {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #fafafa;
      border: 1px dashed #d9d9d9;
    }
  }

  .visit-info {
    padding-bottom: 16px; // 为底部选择框留出空间

    .visit-title {
      display: block;
      font-size: 11px; // 减小字体
      color: #333;
      font-weight: 500;
      margin-bottom: 2px;
      line-height: 1.2;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .visit-time {
      font-size: 9px; // 减小字体
      color: #999;
    }
  }

  .visit-checkbox {
    position: absolute;
    bottom: 3px;
    left: 3px;
  }

  // 新照片样式
  &.new-photo {
    border: 2px solid #4a6feb;
    box-shadow: 0 2px 8px rgba(74, 111, 235, 0.3);
  }

  // 选择模式样式
  &.selection-mode {
    .visit-thumbnail {
      opacity: 0.8;
    }
  }

  // 已选中样式
  &.selected {
    border: 2px solid #4a6feb;
    background-color: rgba(74, 111, 235, 0.1);

    .visit-thumbnail {
      opacity: 0.7;
    }
  }

  .new-photo-badge {
    position: absolute;
    top: -2px;
    left: -2px;
    background-color: #ff4d4f;
    border-radius: 8px;
    padding: 2px 6px;
    z-index: 15;

    .new-text {
      color: #fff;
      font-size: 8px;
      font-weight: bold;
    }
  }

  // 选择框样式
  .selection-checkbox {
    position: absolute;
    bottom: 3px;
    right: 3px;
    background-color: rgba(255, 255, 255, 0.9);
    border-radius: 50%;
    padding: 2px;
    z-index: 10;
  }
}

// 底部操作栏
.bottom-toolbar {
  position: fixed;
  bottom: 60px; // 底部导航高度
  left: 0;
  right: 0;
  background-color: #fff;
  padding: 10px 15px; // 减少上下padding
  border-top: 1px solid #f0f0f0;
  z-index: 100;

  .photo-btn {
    width: 100%;
    height: 48px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #fff;
    border: none;
    border-radius: 12px;
    box-shadow: 0 8px 24px rgba(102, 126, 234, 0.3);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    font-size: 16px;
    font-weight: 600;
  }

  // 选择模式工具栏
  .selection-toolbar {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;

    .cancel-btn {
      background-color: #f5f5f5;
      color: #666;
      border: none;
      border-radius: 6px;
      padding: 8px 16px;
      font-size: 14px;
    }

    .selection-info {
      flex: 1;
      text-align: center;

      text {
        color: #666;
        font-size: 14px;
      }
    }

    .delete-btn {
      background-color: #ff4d4f;
      color: #fff;
      border: none;
      border-radius: 6px;
      padding: 8px 16px;
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 14px;

      &:disabled {
        background-color: #d9d9d9;
        color: #999;
      }
    }
  }
}

// 底部导航
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: #fff;
  border-top: 1px solid #f0f0f0;
  display: flex;
  padding: 8px 0;
  z-index: 100;
  height: 60px;
  box-sizing: border-box;

  .nav-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 8px 0;
    cursor: pointer;
    max-width: 50%; // 限制最大宽度，让两个选项居中

    &:active {
      background-color: #f5f5f5;
    }

    .nav-text {
      font-size: 12px;
      color: #666;
      font-weight: 500;
    }
  }
}
</style>
