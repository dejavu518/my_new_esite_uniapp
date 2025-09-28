<template>
  <view class="camera-container">
    <!-- 相机预览 -->
    <camera
      v-if="canUseCamera"
      id="myCamera"
      ref="camera"
      class="camera-preview"
      :device-position="devicePosition"
      :flash="flashMode"
      @initdone="handleCameraInitDone"
      @error="handleCameraError"
    >
      <!-- 扫描框UI -->
      <view class="scan-box-wrapper">
        <view class="scan-box">
          <view class="corner top-left"></view>
          <view class="corner top-right"></view>
          <view class="corner bottom-left"></view>
          <view class="corner bottom-right"></view>
          <view class="scan-line" :class="{ animate: isScanning }"></view>
        </view>
        <view class="scan-tip">请将文档放入框内，并尽量保持平整</view>
      </view>
    </camera>

    <!-- 权限请求或错误提示 -->
    <view v-else class="status-placeholder">
      <view v-if="permissionStatus === 'denied'">
        <view class="status-text">无法访问相机</view>
        <view class="status-tip">请在系统设置中允许应用访问相机</view>
        <button class="settings-btn" @click="openSettings">去设置</button>
      </view>
      <view v-else>
        <view class="status-text">正在初始化相机...</view>
      </view>
    </view>

    <!-- 顶部工具栏 -->
    <view class="top-bar">
      <view class="bar-btn" @click="goBack">
        <uni-icons type="closeempty" size="24" color="#fff"></uni-icons>
      </view>
    </view>

    <!-- 底部控制栏 -->
    <view class="controls-bar">
      <view class="bar-btn" @click="toggleFlash">
        <uni-icons :type="flashMode === 'on' ? 'flash-filled' : 'flash'" size="26" color="#fff"></uni-icons>
      </view>
      
      <view class="capture-btn-wrapper" @click="handleTakePhoto">
        <view class="capture-btn"></view>
      </view>

      <view class="bar-btn" @click="switchCamera">
        <uni-icons type="loop" size="26" color="#fff"></uni-icons>
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
      canUseCamera: false,
      permissionStatus: 'unknown', // unknown, granted, denied
      cameraContext: null,
      isScanning: false,
      flashMode: 'off',
      devicePosition: 'back',
    };
  },

  onLoad(options) {
    this.subjectId = options.subjectId || '';
    this.subjectCode = options.subjectCode || '';
    this.checkPermission();
  },

  onShow() {
    // 从设置页返回时，再次检查权限
    if (this.permissionStatus === 'denied') {
      this.checkPermission();
    }
  },

  methods: {
    // 1. 权限检查
    async checkPermission() {
      // #ifdef APP-PLUS
      const status = await this.requestCameraPermission();
      if (status === 'granted') {
        this.permissionStatus = 'granted';
        // 使用 nextTick 确保 DOM 更新后再渲染 camera 组件
        this.$nextTick(() => {
          this.canUseCamera = true;
        });
      } else {
        this.permissionStatus = 'denied';
        this.canUseCamera = false;
        this.showPermissionGuide();
      }
      // #endif

      // #ifndef APP-PLUS
      // 在非App环境下（如H5），直接认为有权限
      this.permissionStatus = 'granted';
      this.$nextTick(() => {
        this.canUseCamera = true;
      });
      // #endif
    },

    // #ifdef APP-PLUS
    requestCameraPermission() {
      return new Promise((resolve) => {
        const platform = uni.getSystemInfoSync().platform;
        if (platform === 'android') {
          plus.android.requestPermissions(
            ['android.permission.CAMERA'],
            (result) => {
              if (result.granted && result.granted.length > 0) {
                resolve('granted');
              } else {
                resolve('denied');
              }
            },
            () => {
              resolve('denied');
            }
          );
        } else if (platform === 'ios') {
          const AVCaptureDevice = plus.ios.import('AVCaptureDevice');
          const authStatus = AVCaptureDevice.authorizationStatusForMediaType('vide');
          if (authStatus === 3) { // 已授权
            resolve('granted');
          } else if (authStatus === 0) { // 未决定
            AVCaptureDevice.requestAccessForMediaType_completionHandler('vide', (granted) => {
              resolve(granted ? 'granted' : 'denied');
            });
          } else { // 已拒绝或受限
            resolve('denied');
          }
        }
      });
    },
    // #endif

    // 2. 相机初始化
    handleCameraInitDone() {
      console.log('相机初始化完成');
      this.cameraContext = uni.createCameraContext('myCamera', this);
      this.startScanAnimation();
    },

    handleCameraError(e) {
      console.error('相机错误:', e.detail);
      uni.showToast({
        title: '相机启动失败，请重试',
        icon: 'none',
      });
      this.canUseCamera = false;
    },

    // 3. 核心操作
    handleTakePhoto() {
      if (!this.cameraContext) {
        uni.showToast({ title: '相机未准备好', icon: 'none' });
        return;
      }
      uni.showLoading({ title: '正在处理...' });
      this.cameraContext.takePhoto({
        quality: 'high',
        success: (res) => {
          uni.hideLoading();
          uni.navigateTo({
            url: `/pages/ebinder/image-editor?imagePath=${encodeURIComponent(res.tempImagePath)}&subjectId=${this.subjectId}&subjectCode=${this.subjectCode}`
          });
        },
        fail: (err) => {
          uni.hideLoading();
          console.error('拍照失败:', err);
          uni.showToast({ title: '拍照失败，请重试', icon: 'none' });
        },
      });
    },

    // 4. 辅助功能
    toggleFlash() {
      this.flashMode = this.flashMode === 'off' ? 'on' : 'off';
    },

    switchCamera() {
      this.devicePosition = this.devicePosition === 'back' ? 'front' : 'back';
    },

    startScanAnimation() {
      this.isScanning = true;
    },

    goBack() {
      uni.navigateBack();
    },

    // 5. 权限引导
    showPermissionGuide() {
      uni.showModal({
        title: '相机权限未开启',
        content: '拍照功能需要您授权相机权限，请在系统设置中开启。',
        confirmText: '去设置',
        cancelText: '取消',
        success: (res) => {
          if (res.confirm) {
            this.openSettings();
          } else {
            this.goBack();
          }
        },
      });
    },

    openSettings() {
      // #ifdef APP-PLUS
      plus.runtime.openURL('app-settings:');
      // #endif
    },
  },
};
</script>

<style lang="scss" scoped>
.camera-container {
  width: 100vw;
  height: 100vh;
  background-color: #000;
}

.camera-preview {
  width: 100%;
  height: 100%;
}

.status-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #fff;
  background-color: #1c1c1e;
  text-align: center;

  .status-text {
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 10px;
  }

  .status-tip {
    font-size: 14px;
    color: #8e8e93;
    margin-bottom: 20px;
  }

  .settings-btn {
    background-color: #007aff;
    color: #fff;
    border-radius: 8px;
    padding: 10px 20px;
    font-size: 16px;
  }
}

.top-bar {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  padding-top: var(--status-bar-height);
  height: 44px;
  display: flex;
  align-items: center;
  padding-left: 15px;
  z-index: 10;
}

.controls-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 120px;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.7), transparent);
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding-bottom: 20px;
  z-index: 10;
}

.bar-btn {
  width: 60px;
  height: 60px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.capture-btn-wrapper {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.3);
  display: flex;
  justify-content: center;
  align-items: center;
  
  .capture-btn {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background-color: #fff;
    border: 3px solid #000;
  }
}

.scan-box-wrapper {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  pointer-events: none;

  .scan-box {
    width: 80vw;
    height: 60vw;
    border: 1px solid rgba(255, 255, 255, 0.5);
    position: relative;

    .corner {
      position: absolute;
      width: 20px;
      height: 20px;
      border: 3px solid #007aff;
    }
    .top-left {
      top: -2px;
      left: -2px;
      border-right: none;
      border-bottom: none;
    }
    .top-right {
      top: -2px;
      right: -2px;
      border-left: none;
      border-bottom: none;
    }
    .bottom-left {
      bottom: -2px;
      left: -2px;
      border-right: none;
      border-top: none;
    }
    .bottom-right {
      bottom: -2px;
      right: -2px;
      border-left: none;
      border-top: none;
    }

    .scan-line {
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      height: 2px;
      background: linear-gradient(to right, transparent, #007aff, transparent);
      opacity: 0;
      
      &.animate {
        opacity: 1;
        animation: scan 2.5s linear infinite;
      }
    }
  }

  .scan-tip {
    margin-top: 20px;
    color: #fff;
    font-size: 14px;
    background-color: rgba(0, 0, 0, 0.5);
    padding: 5px 10px;
    border-radius: 5px;
  }
}

@keyframes scan {
  0% {
    transform: translateY(0);
  }
  100% {
    transform: translateY(60vw);
  }
}
</style>