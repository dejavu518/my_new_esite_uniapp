<template>
  <view class="blinding-detail-page">
    <!-- 自定义导航栏 -->
    <view class="custom-navbar">
      <view class="navbar-content">
        <view class="navbar-left" @click="goBack">
          <uni-icons type="left" size="20" color="#333"></uni-icons>
        </view>
        <view class="navbar-title">{{ planInfo.name }}</view>
        <view class="navbar-right">
          <uni-icons type="more-filled" size="20" color="#8b5cf6"></uni-icons>
        </view>
      </view>
    </view>

    <!-- 计划信息卡片 -->
    <view class="plan-info-card">
      <view class="info-header">
        <view class="plan-name">{{ planInfo.name }}</view>
        <view class="plan-status" :class="planInfo.status">
          {{ planInfo.statusText }}
        </view>
      </view>
      
      <view class="info-stats">
        <view class="stat-item" @click="showDetailList('total')">
          <view class="stat-value">{{ planInfo.totalCount }}</view>
          <view class="stat-label">全部编盲总数</view>
        </view>
        <view class="stat-divider"></view>
        <view class="stat-item" @click="showDetailList('pending')">
          <view class="stat-value pending">{{ planInfo.pendingCount }}</view>
          <view class="stat-label">待编盲数</view>
        </view>
        <view class="stat-divider"></view>
        <view class="stat-item" @click="showDetailList('completed')">
          <view class="stat-value completed">{{ planInfo.completedCount }}</view>
          <view class="stat-label">已完成数</view>
        </view>
      </view>
      
      <view class="info-progress">
        <view class="progress-bar">
          <view 
            class="progress-fill" 
            :style="{ width: planInfo.progressPercent + '%' }"
          ></view>
        </view>
        <view class="progress-text">{{ planInfo.progressPercent }}% 完成</view>
      </view>
    </view>

    <!-- 扫码区域 -->
    <view class="scan-container">
      <!-- 手动按钮 -->
      <view class="manual-btn" @click="handleManualBlinding">
        <uni-icons type="compose" size="20" color="#8b5cf6"></uni-icons>
      </view>
      
      <!-- 未选择药物时显示大扫码区域 -->
      <view v-if="selectedDrugs.length === 0" class="scan-area" @click="handleScanCode">
        <view class="scan-frame">
          <view class="corner top-left"></view>
          <view class="corner top-right"></view>
          <view class="corner bottom-left"></view>
          <view class="corner bottom-right"></view>
        </view>
        <text class="scan-text">扫一扫</text>
      </view>
      
      <!-- 已选择药物列表 -->
      <view v-else class="selected-drugs-container">
        <view class="drugs-header">
          <text class="drugs-title">已选择药物 ({{ selectedDrugs.length }})</text>
          <view class="mini-scan" @click="handleScanCode">
            <view class="scan-border">
              <view class="scan-corner top-left"></view>
              <view class="scan-corner top-right"></view>
              <view class="scan-corner bottom-left"></view>
              <view class="scan-corner bottom-right"></view>
            </view>
          </view>
        </view>
        <scroll-view class="drugs-scroll-list" scroll-y>
          <view 
            v-for="drug in selectedDrugs" 
            :key="drug.id" 
            class="drug-list-item"
          >
            <view class="drug-info">
              <text class="drug-name">{{ drug.name }}</text>
              <text class="drug-time">已核查</text>
            </view>
            <view class="drug-actions">
              <view class="remove-btn" @click="removeDrug(drug)">
                <uni-icons type="clear" size="16" color="#f87171"></uni-icons>
              </view>
            </view>
          </view>
        </scroll-view>
      </view>
    </view>

    <!-- 底部工具栏 -->
    <view class="toolbar">
      <view class="tool-item" @click="goToHome">
        <uni-icons type="home" size="24" color="#666"></uni-icons>
        <text class="tool-text">首页</text>
      </view>
      <view class="tool-item" @click="goToProfile">
        <uni-icons type="person" size="24" color="#666"></uni-icons>
        <text class="tool-text">我的</text>
      </view>
    </view>

    <!-- 药物选择弹窗 -->
    <uni-popup ref="drugSelectionPopup" type="center">
      <view class="drug-selection-popup">
        <view class="popup-header">
          <text class="popup-title">选择药物（可多选）</text>
          <text class="close-btn" @click="closeDrugSelection">×</text>
        </view>
        <view class="popup-content">
          <checkbox-group @change="handleDrugCheckChange">
            <view 
              v-for="drug in getUnselectedDrugs()" 
              :key="drug.id" 
              class="drug-checkbox-item"
            >
              <checkbox 
                :value="drug.id" 
                :checked="drug.checked"
                style="transform: scale(0.8)"
              />
              <text class="drug-label">{{ drug.name }}</text>
            </view>
            <view v-if="getUnselectedDrugs().length === 0" class="no-drugs">
              <text class="no-drugs-text">所有药物已选择完毕</text>
            </view>
          </checkbox-group>
        </view>
        <view class="popup-footer">
          <button class="cancel-btn" @click="closeDrugSelection">取消</button>
          <button class="confirm-btn" @click="confirmDrugSelection">确定</button>
        </view>
      </view>
    </uni-popup>

    <!-- 统计详情弹窗 -->
    <uni-popup ref="statisticsDetailPopup" type="center">
      <view class="statistics-detail-popup">
        <view class="popup-header">
          <text class="popup-title">{{ currentStatType.title }}</text>
          <text class="close-btn" @click="closeStatisticsDetail">×</text>
        </view>
        <view class="popup-content">
          <scroll-view class="detail-scroll-list" scroll-y>
            <view 
              v-for="drug in currentStatType.drugList" 
              :key="drug.id" 
              class="detail-drug-item"
            >
              <text class="drug-code">{{ drug.code }}</text>
              <view class="drug-status-badge" :class="drug.status">
                {{ drug.statusText }}
              </view>
            </view>
            <view v-if="currentStatType.drugList.length === 0" class="empty-list">
              <text class="empty-text">暂无数据</text>
            </view>
          </scroll-view>
        </view>
        <view class="popup-footer">
          <button class="close-only-btn" @click="closeStatisticsDetail">关闭</button>
        </view>
      </view>
    </uni-popup>
  </view>
</template>

<script>
export default {
  name: "BlindingDetail",
  data() {
    return {
      // 计划信息
      planInfo: {
        id: null,
        name: "",
        status: "executing",
        statusText: "执行中",
        totalCount: 0,
        pendingCount: 0,
        completedCount: 0,
        progressPercent: 0,
      },
      // 已选择的药物列表
      selectedDrugs: [],
      // 可选药物列表
      availableDrugs: [
        { id: 'D0001', name: 'D0001', checked: false },
        { id: 'D0002', name: 'D0002', checked: false },
        { id: 'D0003', name: 'D0003', checked: false },
        { id: 'D0004', name: 'D0004', checked: false },
        { id: 'D0005', name: 'D0005', checked: false },
        { id: 'D0006', name: 'D0006', checked: false },
      ],
      // 当前统计详情类型
      currentStatType: {
        title: '',
        drugList: []
      },
    };
  },

  onLoad(options) {
    if (options.id) {
      this.planInfo.id = options.id;
    }
    if (options.name) {
      this.planInfo.name = decodeURIComponent(options.name);
    }
    
    this.loadPlanDetail();
  },

  methods: {
    // 返回上一页
    goBack() {
      uni.navigateBack({
        fail: () => {
          // 如果无法返回，则跳转到首页
          uni.switchTab({
            url: '/pages/index/index'
          });
        }
      });
    },

    // 跳转到首页
    goToHome() {
      uni.switchTab({
        url: '/pages/index/index'
      });
    },

    // 跳转到个人中心
    goToProfile() {
      uni.switchTab({
        url: '/pages/profile/profile'
      });
    },

    // 加载计划详情
    async loadPlanDetail() {
      try {
        // 模拟API调用
        const mockData = {
          id: this.planInfo.id,
          name: this.planInfo.name,
          status: "executing",
          statusText: "执行中",
          totalCount: 120,
          pendingCount: 45,
          completedCount: 75,
          progressPercent: 62.5,
        };
        
        this.planInfo = { ...this.planInfo, ...mockData };
      } catch (error) {
        console.error("加载计划详情失败:", error);
      }
    },

    // 扫码编盲
    handleScanCode() {
      // #ifdef APP-PLUS
      uni.scanCode({
        success: (res) => {
          console.log('扫码结果：', res);
          this.processBlindingCode(res.result);
        },
        fail: (err) => {
          console.error('扫码失败:', err);
          uni.showToast({
            title: '扫码失败',
            icon: 'error'
          });
        }
      });
      // #endif
      
      // #ifdef H5
      // H5环境下模拟扫码
      uni.showModal({
        title: '模拟扫码',
        content: '检测到编盲二维码\n受试者编号: S006\n是否进行编盲？',
        success: (res) => {
          if (res.confirm) {
            this.processBlindingCode('BLINDING_S006_202401');
          }
        }
      });
      // #endif
    },

    // 处理编盲码
    async processBlindingCode(code) {
      try {
        uni.showLoading({
          title: '正在编盲...'
        });
        
        // 模拟编盲处理
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const blindingResult = {
          subjectCode: 'S006',
          blindingCode: 'BL' + Date.now(),
          groupName: Math.random() > 0.5 ? '试验组A' : '对照组B',
          operateTime: new Date().toLocaleString()
        };
        
        uni.hideLoading();
        
        // 显示编盲结果
        uni.showModal({
          title: '编盲成功',
          content: `受试者: ${blindingResult.subjectCode}\n编盲码: ${blindingResult.blindingCode}\n分组: ${blindingResult.groupName}`,
          showCancel: false,
          success: () => {
            // 更新计划统计信息
            this.planInfo.completedCount++;
            this.planInfo.pendingCount--;
            this.planInfo.progressPercent = Math.round(
              (this.planInfo.completedCount / this.planInfo.totalCount) * 100
            );
          }
        });
        
      } catch (error) {
        uni.hideLoading();
        console.error('编盲处理失败:', error);
        uni.showToast({
          title: '编盲失败',
          icon: 'error'
        });
      }
    },

    // 手动编盲
    handleManualBlinding() {
      // 获取未选择的药物列表
      const unselectedDrugs = this.availableDrugs.filter(drug => 
        !this.selectedDrugs.some(selected => selected.id === drug.id)
      );
      
      if (unselectedDrugs.length === 0) {
        uni.showToast({
          title: '所有药物已选择完毕',
          icon: 'none'
        });
        return;
      }
      
      // 重置未选择药物的选中状态
      unselectedDrugs.forEach(drug => {
        drug.checked = false;
      });
      
      // 打开药物选择弹窗
      this.$refs.drugSelectionPopup.open();
    },

    // 处理药物复选框变化
    handleDrugCheckChange(e) {
      const checkedValues = e.detail.value;
      
      // 更新所有药物的选中状态
      this.availableDrugs.forEach(drug => {
        drug.checked = checkedValues.includes(drug.id);
      });
    },

    // 关闭药物选择弹窗
    closeDrugSelection() {
      this.$refs.drugSelectionPopup.close();
    },

    // 确认药物选择
    confirmDrugSelection() {
      // 获取未选择的药物中被勾选的
      const unselectedDrugs = this.availableDrugs.filter(drug => 
        !this.selectedDrugs.some(selected => selected.id === drug.id)
      );
      const newlyCheckedDrugs = unselectedDrugs.filter(drug => drug.checked);
      
      if (newlyCheckedDrugs.length === 0) {
        uni.showToast({
          title: '请至少选择一个药物',
          icon: 'none'
        });
        return;
      }
      
      // 添加到已选择列表（保留原有的，加上新选的）
      this.selectedDrugs = [...this.selectedDrugs, ...newlyCheckedDrugs];
      
      // 关闭弹窗
      this.closeDrugSelection();
      
      // 这里将来调用接口提交数据
      // await this.submitDrugVerification(newlyCheckedDrugs);
      
      uni.showToast({
        title: `新增${newlyCheckedDrugs.length}个药物，共${this.selectedDrugs.length}个`,
        icon: 'success'
      });
    },

    // 移除药物
    removeDrug(drugToRemove) {
      uni.showModal({
        title: '确认移除',
        content: `确认移除 ${drugToRemove.name} 吗？`,
        success: (res) => {
          if (res.confirm) {
            this.selectedDrugs = this.selectedDrugs.filter(drug => drug.id !== drugToRemove.id);
            // 重置对应药物的选中状态
            const availableDrug = this.availableDrugs.find(drug => drug.id === drugToRemove.id);
            if (availableDrug) {
              availableDrug.checked = false;
            }
            
            uni.showToast({
              title: '已移除',
              icon: 'success'
            });
          }
        }
      });
    },

    // 获取可选药物列表（排除已选的）
    getUnselectedDrugs() {
      return this.availableDrugs.filter(drug => 
        !this.selectedDrugs.some(selected => selected.id === drug.id)
      );
    },

    // 查看记录
    handleViewRecords() {
      uni.navigateTo({
        url: '/pages/blinding/blinding-list?planId=' + this.planInfo.id
      });
    },

    // 显示统计详情列表
    showDetailList(type) {
      let title = '';
      let drugList = [];
      
      switch(type) {
        case 'total':
          title = '全部编盲药物列表';
          drugList = this.getMockDrugList('all');
          break;
        case 'pending':
          title = '待编盲药物列表';
          drugList = this.getMockDrugList('pending');
          break;
        case 'completed':
          title = '已完成编盲药物列表';
          drugList = this.getMockDrugList('completed');
          break;
      }
      
      this.currentStatType = {
        title,
        drugList
      };
      
      this.$refs.statisticsDetailPopup.open();
    },

    // 获取模拟药物详情数据
    getMockDrugList(type) {
      const allDrugs = [
        {
          id: 'D0001',
          code: 'D0001',
          status: 'completed',
          statusText: '已完成',
          group: '试验组A',
          blindingCode: 'BL001234',
          operateTime: '2024-01-15 14:30',
          operator: '张医生'
        },
        {
          id: 'D0002',
          code: 'D0002',
          status: 'pending',
          statusText: '待编盲',
          group: '对照组B',
          blindingCode: null,
          operateTime: null,
          operator: null
        },
        {
          id: 'D0003',
          code: 'D0003',
          status: 'completed',
          statusText: '已完成',
          group: '试验组A',
          blindingCode: 'BL001235',
          operateTime: '2024-01-14 16:20',
          operator: '李医生'
        },
        {
          id: 'D0004',
          code: 'D0004',
          status: 'pending',
          statusText: '待编盲',
          group: '对照组B',
          blindingCode: null,
          operateTime: null,
          operator: null
        },
        {
          id: 'D0005',
          code: 'D0005',
          status: 'completed',
          statusText: '已完成',
          group: '试验组A',
          blindingCode: 'BL001236',
          operateTime: '2024-01-13 10:15',
          operator: '王医生'
        },
        {
          id: 'D0006',
          code: 'D0006',
          status: 'pending',
          statusText: '待编盲',
          group: '对照组B',
          blindingCode: null,
          operateTime: null,
          operator: null
        }
      ];
      
      switch(type) {
        case 'pending':
          return allDrugs.filter(drug => drug.status === 'pending');
        case 'completed':
          return allDrugs.filter(drug => drug.status === 'completed');
        case 'all':
        default:
          return allDrugs;
      }
    },

    // 关闭统计详情弹窗
    closeStatisticsDetail() {
      this.$refs.statisticsDetailPopup.close();
    },
  },
};
</script>

<style lang="scss" scoped>
.blinding-detail-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  display: flex;
  flex-direction: column;
  padding-bottom: 80px; // 为底部操作栏留空间

  // 自定义导航栏
  .custom-navbar {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
    position: sticky;
    top: 0;
    z-index: 100;

    .navbar-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 44px;
      padding: 0 15px;

      .navbar-left,
      .navbar-right {
        width: 44px;
        height: 44px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        transition: all 0.3s ease;

        &:active {
          background: rgba(139, 92, 246, 0.1);
          transform: scale(0.95);
        }
      }

      .navbar-title {
        flex: 1;
        text-align: center;
        font-size: 18px;
        font-weight: 600;
        color: #333;
        margin: 0 10px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
  }

  // 计划信息卡片
  .plan-info-card {
    margin: 15px;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    border-radius: 16px;
    padding: 20px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    border: 1px solid rgba(139, 92, 246, 0.1);

    .info-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;

      .plan-name {
        font-size: 20px;
        font-weight: 600;
        color: #333;
        flex: 1;
        margin-right: 15px;
      }

      .plan-status {
        padding: 8px 16px;
        border-radius: 20px;
        font-size: 14px;
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

    .info-stats {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 20px;

      .stat-item {
        text-align: center;
        flex: 1;
        cursor: pointer;
        padding: 8px;
        border-radius: 12px;
        transition: all 0.3s ease;
        
        &:active {
          background: rgba(139, 92, 246, 0.05);
          transform: scale(0.98);
        }

        .stat-value {
          font-size: 28px;
          font-weight: 700;
          color: #333;
          margin-bottom: 5px;

          &.pending {
            color: #f59e0b;
          }

          &.completed {
            color: #10b981;
          }
        }

        .stat-label {
          font-size: 12px;
          color: #666;
        }
      }

      .stat-divider {
        width: 1px;
        height: 40px;
        background: rgba(139, 92, 246, 0.2);
        margin: 0 15px;
      }
    }

    .info-progress {
      display: flex;
      align-items: center;

      .progress-bar {
        flex: 1;
        height: 10px;
        background: rgba(139, 92, 246, 0.1);
        border-radius: 5px;
        overflow: hidden;
        margin-right: 15px;

        .progress-fill {
          height: 100%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 5px;
          transition: width 0.3s ease;
        }
      }

      .progress-text {
        font-size: 16px;
        font-weight: 600;
        color: #8b5cf6;
        min-width: 80px;
        text-align: right;
      }
    }
  }

  // 扫码区域
  .scan-container {
    flex: 1;
    display: flex;
    align-items: flex-start;
    justify-content: center;
    padding: 20px 20px 40px;
    position: relative;
    
    // 手动按钮
    .manual-btn {
      position: absolute;
      bottom: 100px;
      right: 20px;
      width: 44px;
      height: 44px;
      background: rgba(139, 92, 246, 0.1);
      border: 1px solid rgba(139, 92, 246, 0.2);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.3s ease;
      z-index: 10;
      
      &:active {
        background: rgba(139, 92, 246, 0.15);
        transform: scale(0.95);
      }
    }

    .scan-area {
      display: flex;
      flex-direction: column;
      align-items: center;
      cursor: pointer;
      margin-top: 20px;

      .scan-frame {
        width: 200px;
        height: 200px;
        background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
        border-radius: 50%;
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s ease;
        box-shadow: 0 8px 24px rgba(139, 92, 246, 0.3);
        
        &:active {
          transform: scale(0.95);
        }
        
        // ... existing code ...
        
        // 四个角的扫描框
        .corner {
          position: absolute;
          width: 30px;
          height: 30px;
          border: 3px solid white;
          
          &.top-left {
            top: 60px;
            left: 60px;
            border-right: none;
            border-bottom: none;
          }
          
          &.top-right {
            top: 60px;
            right: 60px;
            border-left: none;
            border-bottom: none;
          }
          
          &.bottom-left {
            bottom: 60px;
            left: 60px;
            border-right: none;
            border-top: none;
          }
          
          &.bottom-right {
            bottom: 60px;
            right: 60px;
            border-left: none;
            border-top: none;
          }
        }
      }

      .scan-text {
        margin-top: 20px;
        font-size: 18px;
        color: #333;
        font-weight: 500;
      }
    }
    
    // 已选择药物容器
    .selected-drugs-container {
      width: 100%;
      margin-top: 10px;
      flex: 1;
      display: flex;
      flex-direction: column;
      
      .drugs-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
        flex-shrink: 0;
        
        .drugs-title {
          font-size: 20px;
          font-weight: 600;
          color: #333;
        }
        
        .mini-scan {
          width: 40px;
          height: 40px;
          background: rgba(139, 92, 246, 0.1);
          border: 1px solid rgba(139, 92, 246, 0.2);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
          
          &:active {
            transform: scale(0.95);
            background: rgba(139, 92, 246, 0.15);
          }
          
          .scan-border {
            width: 24px;
            height: 24px;
            position: relative;
            
            .scan-corner {
              position: absolute;
              width: 6px;
              height: 6px;
              border: 2px solid #8b5cf6;
              
              &.top-left {
                top: 0;
                left: 0;
                border-right: none;
                border-bottom: none;
              }
              
              &.top-right {
                top: 0;
                right: 0;
                border-left: none;
                border-bottom: none;
              }
              
              &.bottom-left {
                bottom: 0;
                left: 0;
                border-right: none;
                border-top: none;
              }
              
              &.bottom-right {
                bottom: 0;
                right: 0;
                border-left: none;
                border-top: none;
              }
            }
          }
        }
        
        // ... existing code ...
      }
      
      .drugs-scroll-list {
        flex: 1;
        overflow-y: auto;
        
        .drug-list-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          margin-bottom: 8px;
          background: rgba(255, 255, 255, 0.9);
          border: 1px solid rgba(139, 92, 246, 0.1);
          border-radius: 12px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
          transition: all 0.3s ease;
          
          &:hover {
            box-shadow: 0 4px 8px rgba(139, 92, 246, 0.1);
          }
          
          .drug-info {
            flex: 1;
            display: flex;
            flex-direction: column;
            gap: 4px;
            
            .drug-name {
              font-size: 16px;
              font-weight: 500;
              color: #333;
            }
            
            .drug-time {
              font-size: 12px;
              color: #10b981;
              background: rgba(16, 185, 129, 0.1);
              padding: 2px 8px;
              border-radius: 10px;
              align-self: flex-start;
            }
          }
          
          .drug-actions {
            display: flex;
            align-items: center;
            
            .remove-btn {
              width: 32px;
              height: 32px;
              background: rgba(248, 113, 113, 0.1);
              border: 1px solid rgba(248, 113, 113, 0.2);
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              cursor: pointer;
              transition: all 0.3s ease;
              
              &:active {
                background: rgba(248, 113, 113, 0.15);
                transform: scale(0.95);
              }
            }
          }
        }
      }
    }
  }

  // 底部工具栏
  .toolbar {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    border-top: 1px solid rgba(0, 0, 0, 0.1);
    display: flex;
    padding: 10px 0;
    
    .tool-item {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 8px;
      cursor: pointer;
      transition: all 0.3s ease;
      
      &:active {
        background: rgba(0, 0, 0, 0.05);
      }
      
      .tool-text {
        margin-top: 4px;
        font-size: 12px;
        color: #666;
      }
    }
  }
}

// 药物选择弹窗样式
.drug-selection-popup {
  width: 85vw;
  max-width: 400px;
  max-height: 70vh;
  background: #fff;
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);

  .popup-header {
    padding: 20px;
    border-bottom: 1px solid #eee;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
    color: #fff;

    .popup-title {
      font-size: 18px;
      font-weight: 600;
    }

    .close-btn {
      font-size: 24px;
      font-weight: bold;
      cursor: pointer;
      width: 30px;
      height: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.2);
      
      &:hover {
        background: rgba(255, 255, 255, 0.3);
      }
    }
  }

  .popup-content {
    flex: 1;
    padding: 20px;
    overflow-y: auto;

    .drug-checkbox-item {
      display: flex;
      align-items: center;
      padding: 12px 0;
      border-bottom: 1px solid rgba(0, 0, 0, 0.05);
      
      &:last-child {
        border-bottom: none;
      }
      
      .drug-label {
        margin-left: 12px;
        font-size: 16px;
        color: #333;
        flex: 1;
      }
    }
    
    .no-drugs {
      padding: 40px 20px;
      text-align: center;
      
      .no-drugs-text {
        font-size: 16px;
        color: #999;
      }
    }
  }

  .popup-footer {
    padding: 20px;
    border-top: 1px solid #eee;
    display: flex;
    gap: 12px;
    background: #fafafa;

    button {
      flex: 1;
      height: 44px;
      border-radius: 8px;
      font-size: 16px;
      border: none;
      cursor: pointer;
      transition: all 0.3s;
    }

    .cancel-btn {
      background: #f5f5f5;
      color: #666;
      
      &:hover {
        background: #e8e8e8;
      }
    }

    .confirm-btn {
      background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
      color: #fff;
      
      &:hover {
        opacity: 0.9;
      }
    }
  }
}

// 统计详情弹窗样式
.statistics-detail-popup {
  width: 90vw;
  max-width: 500px;
  max-height: 75vh;
  background: #fff;
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);

  .popup-header {
    padding: 20px;
    border-bottom: 1px solid #eee;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #fff;

    .popup-title {
      font-size: 18px;
      font-weight: 600;
    }

    .close-btn {
      font-size: 24px;
      font-weight: bold;
      cursor: pointer;
      width: 30px;
      height: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.2);
      
      &:hover {
        background: rgba(255, 255, 255, 0.3);
      }
    }
  }

  .popup-content {
    flex: 1;
    overflow: hidden;

    .detail-scroll-list {
      height: 100%;
      padding: 20px 20px 20px 20px;
      
      .detail-drug-item {
        background: rgba(255, 255, 255, 0.9);
        border: 1px solid rgba(139, 92, 246, 0.1);
        border-radius: 12px;
        padding: 16px;
        margin-bottom: 12px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        transition: all 0.3s ease;
        display: flex;
        justify-content: space-between;
        align-items: center;
        
        &:hover {
          box-shadow: 0 4px 8px rgba(139, 92, 246, 0.1);
        }
        
        .drug-code {
          font-size: 18px;
          font-weight: 600;
          color: #333;
        }
        
        .drug-status-badge {
          padding: 6px 12px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 500;
          
          &.pending {
            background: rgba(245, 158, 11, 0.1);
            color: #f59e0b;
            border: 1px solid rgba(245, 158, 11, 0.2);
          }
          
          &.completed {
            background: rgba(16, 185, 129, 0.1);
            color: #10b981;
            border: 1px solid rgba(16, 185, 129, 0.2);
          }
        }
      }
      
      .empty-list {
        padding: 60px 20px;
        text-align: center;
        
        .empty-text {
          font-size: 16px;
          color: #999;
        }
      }
    }
  }

  .popup-footer {
    padding: 20px;
    border-top: 1px solid #eee;
    background: #fafafa;

    .close-only-btn {
      width: 100%;
      height: 44px;
      border-radius: 8px;
      font-size: 16px;
      border: none;
      cursor: pointer;
      transition: all 0.3s;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #fff;
      
      &:hover {
        opacity: 0.9;
      }
    }
  }
}
</style>
