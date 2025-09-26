<template>
  <view class="custom-camera-page">
    <!-- 相机组件 -->
    <camera 
      id="camera"
      device-position="back" 
      flash="off" 
      class="camera-view"
      @error="onCameraError"
      @initdone="onCameraReady"
      @scancode="onScanCode"
    >
      <!-- 扫描框覆盖层 -->
      <view class="scan-overlay">
        <!-- 半透明遮罩 -->
        <view class="overlay-mask">
          <!-- 上部遮罩 -->
          <view class="mask-top"></view>
          
          <!-- 中间行 -->
          <view class="mask-middle">
            <view class="mask-left"></view>
            <view class="scan-area">
              <!-- 四个角的扫描框 -->
              <view class="scan-corner top-left"></view>
              <view class="scan-corner top-right"></view>
              <view class="scan-corner bottom-left"></view>
              <view class="scan-corner bottom-right"></view>
              
              <!-- 扫描线动画 -->
              <view class="scan-line" :class="{ scanning: isScanning }"></view>
            </view>
            <view class="mask-right"></view>
          </view>
          
          <!-- 下部遮罩 -->
          <view class="mask-bottom"></view>
        </view>
        
        <!-- 引导文字 -->
        <view class="guide-text">
          <text class="guide-title">请将文档对准扫描框</text>
          <text class="guide-subtitle">保持文档平整，确保光线充足</text>
        </view>
      </view>
    </camera>

    <!-- 顶部操作栏 -->
    <view class="top-toolbar">
      <view class="toolbar-left" @click="goBack">
        <uni-icons type="left" size="24" color="#fff"></uni-icons>
      </view>
      <view class="toolbar-center">
        <text class="camera-title">拍摄文档</text>
      </view>
      <view class="toolbar-right" @click="toggleFlash">
        <uni-icons 
          :type="flashMode === 'on' ? 'flash-on' : 'flash-off'" 
          size="24" 
          color="#fff"
        ></uni-icons>
      </view>
    </view>

    <!-- 底部操作栏 -->
    <view class="bottom-toolbar">
      <view class="camera-controls">
        <!-- 相册按钮 -->
        <view class="control-btn album-btn" @click="chooseFromAlbum">
          <uni-icons type="image" size="24" color="#fff"></uni-icons>
        </view>
        
        <!-- 拍照按钮 -->
        <view class="capture-btn" @click="takePhoto">
          <view class="capture-inner"></view>
        </view>
        
        <!-- 切换摄像头按钮 -->
        <view class="control-btn switch-btn" @click="switchCamera">
          <uni-icons type="refresh" size="24" color="#fff"></uni-icons>
        </view>
        
        <!-- 降级按钮：使用系统相机 -->
        <view class="control-btn fallback-btn" @click="useSystemCamera">
          <uni-icons type="gear" size="20" color="#fff"></uni-icons>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      subjectId: '',
      subjectCode: '',
      flashMode: 'off',
      cameraPosition: 'back',
      isScanning: false,
      cameraContext: null,
      cameraReady: false
    };
  },
  
  onLoad(options) {
    console.log('自定义相机页面加载:', options);
    
    if (options.subjectId) {
      this.subjectId = options.subjectId;
    }
    if (options.subjectCode) {
      this.subjectCode = options.subjectCode;
    }
    
    console.log('参数初始化完成:', {
      subjectId: this.subjectId,
      subjectCode: this.subjectCode
    });
    
    // 显示加载提示
    uni.showToast({
      title: '正在初始化相机...',
      icon: 'loading',
      duration: 2000
    });
    
    // 延迟启动扫描动画，等待相机初始化
    setTimeout(() => {
      if (!this.cameraReady) {
        console.log('相机还没有准备好，先启动扫描动画');
        this.startScanAnimation();
      }
    }, 1000);
  },
  
  onReady() {
    console.log('页面ready，开始初始化相机');
    
    // 创建相机上下文 - 使用组件ID而不是ref
    this.cameraContext = uni.createCameraContext('camera', this);
    
    // 延迟检查权限，确保页面完全加载
    setTimeout(() => {
      this.checkCameraPermission();
    }, 500);
  },
  
  onUnload() {
    // 停止扫描动画
    this.stopScanAnimation();
  },
  
  methods: {
    // 检查相机权限
    checkCameraPermission() {
      console.log('开始检查相机权限');
      
      // #ifdef APP-PLUS
      // APP端权限检查
      uni.authorize({
        scope: 'scope.camera',
        success: () => {
          console.log('APP相机权限获取成功');
          this.initCamera();
        },
        fail: () => {
          console.log('APP相机权限被拒绝');
          this.showPermissionDialog();
        }
      });
      // #endif
      
      // #ifdef H5
      console.log('H5环境，检查浏览器相机支持');
      // H5环境下直接尝试初始化，错误会在相机组件中捕获
      this.initCamera();
      // #endif
      
      // #ifdef MP-WEIXIN
      // 微信小程序权限检查
      uni.authorize({
        scope: 'scope.camera',
        success: () => {
          console.log('小程序相机权限获取成功');
          this.initCamera();
        },
        fail: () => {
          console.log('小程序相机权限被拒绝');
          this.showWeChatPermissionDialog();
        }
      });
      // #endif
      
      // #ifdef MP-ALIPAY
      // 支付宝小程序
      my.authorize({
        scopes: ['camera'],
        success: () => {
          console.log('支付宝小程序相机权限获取成功');
          this.initCamera();
        },
        fail: () => {
          console.log('支付宝小程序相机权限被拒绝');
          this.showPermissionDialog();
        }
      });
      // #endif
    },
    
    // 初始化相机
    initCamera() {
      console.log('初始化相机');
      
      // 如果相机还没有准备好，启动扫描动画作为占位
      if (!this.cameraReady) {
        this.startScanAnimation();
        
        // 设置超时检查
        setTimeout(() => {
          if (!this.cameraReady) {
            console.log('相机初始化超时');
            this.showCameraInitFailDialog();
          }
        }, 5000); // 5秒超时
      }
    },
    
    // 显示相机初始化失败对话框
    showCameraInitFailDialog() {
      uni.showModal({
        title: '相机初始化失败',
        content: '自定义相机无法正常启动，可能是设备兼容性问题。是否使用系统相机？',
        confirmText: '使用系统相机',
        cancelText: '重试',
        success: (res) => {
          if (res.confirm) {
            this.fallbackToSystemCamera();
          } else {
            // 重试初始化
            this.checkCameraPermission();
          }
        }
      });
    },
    
    // 显示权限对话框
    showPermissionDialog() {
      uni.showModal({
        title: '需要相机权限',
        content: '请允许应用访问相机权限，否则无法使用拍照功能。您可以选择去设置开启权限，或使用系统相机。',
        confirmText: '去设置',
        cancelText: '系统相机',
        success: (res) => {
          if (res.confirm) {
            // #ifdef APP-PLUS
            plus.runtime.openURL('app-settings:');
            // #endif
            // #ifdef H5
            uni.showToast({
              title: '请在浏览器设置中允许相机权限',
              icon: 'none',
              duration: 3000
            });
            // #endif
          } else {
            // 使用系统相机作为降级方案
            this.useSystemCamera();
          }
        }
      });
    },
    
    // 显示浏览器不支持对话框
    showBrowserNotSupportDialog() {
      uni.showModal({
        title: '浏览器不支持',
        content: '当前浏览器不支持摄像头功能，将使用系统相机',
        showCancel: false,
        confirmText: '继续',
        success: () => {
          this.useSystemCamera();
        }
      });
    },
    
    // 微信小程序权限对话框
    showWeChatPermissionDialog() {
      uni.showModal({
        title: '需要相机权限',
        content: '请在小程序设置中开启相机权限',
        confirmText: '去设置',
        cancelText: '稍后',
        success: (res) => {
          if (res.confirm) {
            uni.openSetting();
          }
        }
      });
    },
    
    // 相机初始化完成
    onCameraReady() {
      console.log('相机初始化完成');
      this.cameraReady = true;
      this.startScanAnimation();
      
      // 显示成功提示
      uni.showToast({
        title: '相机已就绪',
        icon: 'success',
        duration: 1500
      });
    },
    
    // 扫码结果处理
    onScanCode(e) {
      console.log('扫码结果:', e);
      // 这里可以处理扫码结果
    },
    
    // 开始扫描动画
    startScanAnimation() {
      this.isScanning = true;
    },
    
    // 停止扫描动画
    stopScanAnimation() {
      this.isScanning = false;
    },
    
    // 拍照
    takePhoto() {
      // 首先检查相机是否可用
      if (!this.cameraContext) {
        console.log('相机上下文不存在，尝试使用系统相机');
        this.fallbackToSystemCamera();
        return;
      }
      
      if (!this.cameraReady) {
        uni.showToast({
          title: '相机正在初始化，请稍候...',
          icon: 'none'
        });
        // 3秒后如果还没准备好，提供降级方案
        setTimeout(() => {
          if (!this.cameraReady) {
            this.showCameraFallbackDialog();
          }
        }, 3000);
        return;
      }
      
      // 停止扫描动画
      this.stopScanAnimation();
      
      // 显示拍照中提示
      uni.showLoading({
        title: '正在拍照...'
      });
      
      this.cameraContext.takePhoto({
        quality: 'high',
        success: (res) => {
          uni.hideLoading();
          console.log('拍照成功:', res);
          
          // 拍照成功，跳转到图片编辑页面
          uni.navigateTo({
            url: `/pages/ebinder/image-editor?imagePath=${encodeURIComponent(res.tempImagePath)}&subjectId=${this.subjectId}&subjectCode=${this.subjectCode}`
          });
        },
        fail: (err) => {
          uni.hideLoading();
          console.error('拍照失败:', err);
          
          // 拍照失败时提供降级方案
          this.handleCameraError(err);
        }
      });
    },
    
    // 处理相机错误并提供降级方案
    handleCameraError(err) {
      console.error('相机操作失败:', err);
      
      let errorMsg = '拍照失败';
      let useSystemCamera = false;
      
      if (err.errMsg) {
        if (err.errMsg.includes('permission')) {
          errorMsg = '没有相机权限';
        } else if (err.errMsg.includes('busy')) {
          errorMsg = '相机正在被其他应用使用';
          useSystemCamera = true;
        } else if (err.errMsg.includes('not available')) {
          errorMsg = '相机不可用';
          useSystemCamera = true;
        } else {
          useSystemCamera = true;
        }
      } else {
        useSystemCamera = true;
      }
      
      if (useSystemCamera) {
        uni.showModal({
          title: '相机错误',
          content: errorMsg + '，是否使用系统相机？',
          confirmText: '使用系统相机',
          cancelText: '重试',
          success: (res) => {
            if (res.confirm) {
              this.fallbackToSystemCamera();
            } else {
              // 重新开始扫描动画
              this.startScanAnimation();
            }
          }
        });
      } else {
        uni.showToast({
          title: errorMsg,
          icon: 'none',
          duration: 3000
        });
        // 重新开始扫描动画
        this.startScanAnimation();
      }
    },
    
    // 显示相机降级对话框
    showCameraFallbackDialog() {
      uni.showModal({
        title: '相机初始化超时',
        content: '自定义相机初始化失败，是否使用系统相机？',
        confirmText: '使用系统相机',
        cancelText: '继续等待',
        success: (res) => {
          if (res.confirm) {
            this.fallbackToSystemCamera();
          }
        }
      });
    },
    
    // 降级到系统相机
    fallbackToSystemCamera() {
      uni.chooseImage({
        count: 1,
        sourceType: ['camera'],
        success: (result) => {
          if (result.tempFilePaths && result.tempFilePaths.length > 0) {
            const imagePath = result.tempFilePaths[0];
            uni.navigateTo({
              url: `/pages/ebinder/image-editor?imagePath=${encodeURIComponent(imagePath)}&subjectId=${this.subjectId}&subjectCode=${this.subjectCode}`
            });
          }
        },
        fail: (err) => {
          console.error('系统相机也失败了:', err);
          uni.showToast({
            title: '无法使用相机功能',
            icon: 'none',
            duration: 3000
          });
        }
      });
    },
    
    // 切换闪光灯
    toggleFlash() {
      this.flashMode = this.flashMode === 'on' ? 'off' : 'on';
      
      // 这里可以添加实际的闪光灯控制逻辑
      // 注意：uni-app的camera组件可能不支持动态切换闪光灯
      uni.showToast({
        title: `闪光灯${this.flashMode === 'on' ? '开启' : '关闭'}`,
        icon: 'none',
        duration: 1000
      });
    },
    
    // 切换摄像头
    switchCamera() {
      this.cameraPosition = this.cameraPosition === 'back' ? 'front' : 'back';
      
      uni.showToast({
        title: `已切换到${this.cameraPosition === 'back' ? '后置' : '前置'}摄像头`,
        icon: 'none',
        duration: 1000
      });
    },
    
    // 从相册选择
    chooseFromAlbum() {
      uni.chooseImage({
        count: 1,
        sourceType: ['album'],
        success: (res) => {
          if (res.tempFilePaths && res.tempFilePaths.length > 0) {
            const imagePath = res.tempFilePaths[0];
            uni.navigateTo({
              url: `/pages/ebinder/image-editor?imagePath=${encodeURIComponent(imagePath)}&subjectId=${this.subjectId}&subjectCode=${this.subjectCode}`
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
    
    // 相机错误处理
    onCameraError(error) {
      console.error('相机错误:', error);
      
      let errorMsg = '相机无法正常工作';
      let showSystemOption = true;
      
      if (error.detail && error.detail.errMsg) {
        const errMsg = error.detail.errMsg;
        console.log('错误信息:', errMsg);
        
        if (errMsg.includes('permission')) {
          errorMsg = '没有相机权限';
          showSystemOption = false; // 权限问题，系统相机也不可用
        } else if (errMsg.includes('busy')) {
          errorMsg = '相机正在被其他应用使用';
        } else if (errMsg.includes('not available') || errMsg.includes('not supported')) {
          errorMsg = '设备不支持相机功能';
        } else if (errMsg.includes('system error')) {
          errorMsg = '系统错误，相机初始化失败';
        }
      }
      
      // 停止扫描动画
      this.stopScanAnimation();
      
      if (showSystemOption) {
        uni.showModal({
          title: '相机错误',
          content: errorMsg + '。自定义相机不可用，是否使用系统相机？',
          confirmText: '使用系统相机',
          cancelText: '返回',
          success: (res) => {
            if (res.confirm) {
              this.fallbackToSystemCamera();
            } else {
              this.goBack();
            }
          }
        });
      } else {
        // 权限问题，引导用户开启权限
        this.showPermissionDialog();
      }
    },
    
    // 使用系统相机（降级方案）
    useSystemCamera() {
      uni.showModal({
        title: '使用系统相机',
        content: '将使用系统自带相机拍照，无法显示扫描框效果',
        confirmText: '继续',
        success: (res) => {
          if (res.confirm) {
            uni.chooseImage({
              count: 1,
              sourceType: ['camera'],
              success: (result) => {
                if (result.tempFilePaths && result.tempFilePaths.length > 0) {
                  const imagePath = result.tempFilePaths[0];
                  uni.navigateTo({
                    url: `/pages/ebinder/image-editor?imagePath=${encodeURIComponent(imagePath)}&subjectId=${this.subjectId}&subjectCode=${this.subjectCode}`
                  });
                }
              },
              fail: (err) => {
                console.error('系统相机拍照失败:', err);
                uni.showToast({
                  title: '拍照失败',
                  icon: 'none'
                });
              }
            });
          }
        }
      });
    },
    
    // 返回上一页
    goBack() {
      uni.navigateBack();
    }
  }
};
</script>

<style lang="scss" scoped>
.custom-camera-page {
  width: 100vw;
  height: 100vh;
  background-color: #000;
  position: relative;
  overflow: hidden;
}

.camera-view {
  width: 100%;
  height: 100%;
  position: relative;
  background-color: #000;
}

.scan-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 10;
  pointer-events: none;
}

.overlay-mask {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.mask-top,
.mask-bottom {
  flex: 1;
  background-color: rgba(0, 0, 0, 0.5);
}

.mask-middle {
  height: 280px;
  display: flex;
  flex-direction: row;
}

.mask-left,
.mask-right {
  flex: 1;
  background-color: rgba(0, 0, 0, 0.5);
}

.scan-area {
  width: 280px;
  height: 280px;
  position: relative;
  border: 2px solid rgba(255, 255, 255, 0.8);
  border-radius: 12px;
}

.scan-corner {
  position: absolute;
  width: 20px;
  height: 20px;
  border: 3px solid #4A90E2;
  
  &.top-left {
    top: -3px;
    left: -3px;
    border-right: none;
    border-bottom: none;
    border-radius: 8px 0 0 0;
  }
  
  &.top-right {
    top: -3px;
    right: -3px;
    border-left: none;
    border-bottom: none;
    border-radius: 0 8px 0 0;
  }
  
  &.bottom-left {
    bottom: -3px;
    left: -3px;
    border-right: none;
    border-top: none;
    border-radius: 0 0 0 8px;
  }
  
  &.bottom-right {
    bottom: -3px;
    right: -3px;
    border-left: none;
    border-top: none;
    border-radius: 0 0 8px 0;
  }
}

.scan-line {
  position: absolute;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, #4A90E2, transparent);
  border-radius: 1px;
  opacity: 0;
  
  &.scanning {
    animation: scanning 2s linear infinite;
  }
}

@keyframes scanning {
  0% {
    top: 0;
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    top: 100%;
    opacity: 0;
  }
}

.guide-text {
  position: absolute;
  bottom: 120px;
  left: 0;
  right: 0;
  text-align: center;
  pointer-events: none;
  
  .guide-title {
    display: block;
    color: #fff;
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 8px;
    text-shadow: 0 1px 3px rgba(0, 0, 0, 0.8);
  }
  
  .guide-subtitle {
    display: block;
    color: rgba(255, 255, 255, 0.8);
    font-size: 14px;
    text-shadow: 0 1px 3px rgba(0, 0, 0, 0.8);
  }
}

.top-toolbar {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 88px;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.6) 0%, transparent 100%);
  display: flex;
  align-items: flex-end;
  padding: 0 20px 12px 20px;
  z-index: 20;
  pointer-events: auto;
  
  .toolbar-left,
  .toolbar-right {
    width: 44px;
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background-color: rgba(0, 0, 0, 0.3);
    backdrop-filter: blur(10px);
    cursor: pointer;
    transition: all 0.3s ease;
    
    &:active {
      transform: scale(0.9);
      background-color: rgba(0, 0, 0, 0.5);
    }
  }
  
  .toolbar-center {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    
    .camera-title {
      color: #fff;
      font-size: 18px;
      font-weight: 600;
      text-shadow: 0 1px 3px rgba(0, 0, 0, 0.8);
    }
  }
}

.bottom-toolbar {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 120px;
  background: linear-gradient(0deg, rgba(0, 0, 0, 0.6) 0%, transparent 100%);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 20px;
  z-index: 20;
  pointer-events: auto;
}

.camera-controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  max-width: 350px;
}

.control-btn {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 255, 255, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:active {
    transform: scale(0.9);
    background-color: rgba(255, 255, 255, 0.3);
  }
  
  &.fallback-btn {
    width: 40px;
    height: 40px;
    background-color: rgba(255, 255, 255, 0.15);
  }
}

.capture-btn {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.9);
  border: 4px solid #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  
  &:active {
    transform: scale(0.95);
    background-color: rgba(255, 255, 255, 0.8);
  }
  
  .capture-inner {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background-color: #fff;
    box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
  }
}
</style>