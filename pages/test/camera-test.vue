<template>
  <view class="camera-test-page">
    <view class="header">
      <view class="title">相机功能测试</view>
      <view class="status" :class="{ ready: cameraReady, error: hasError }">
        {{ statusText }}
      </view>
    </view>

    <view class="test-buttons">
      <button class="test-btn" @click="testCustomCamera">测试自定义相机</button>
      <button class="test-btn" @click="testSystemCamera">测试系统相机</button>
      <button class="test-btn" @click="testCameraContext">测试相机上下文</button>
      <button class="test-btn" @click="testPermission">测试权限检查</button>
    </view>

    <view class="log-area">
      <view class="log-title">调试日志：</view>
      <scroll-view class="log-content" scroll-y>
        <view v-for="(log, index) in logs" :key="index" class="log-item">
          <text class="log-time">{{ log.time }}</text>
          <text class="log-text" :class="log.type">{{ log.text }}</text>
        </view>
      </scroll-view>
    </view>

    <!-- 简单的相机预览 -->
    <view class="camera-preview" v-if="showCamera">
      <camera 
        id="testCamera"
        device-position="back"
        flash="off"
        class="test-camera-view"
        @error="onCameraError"
        @initdone="onCameraReady"
      ></camera>
      <button class="close-camera" @click="closeCamera">关闭相机</button>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      cameraReady: false,
      hasError: false,
      logs: [],
      showCamera: false,
      cameraContext: null
    };
  },
  
  computed: {
    statusText() {
      if (this.hasError) return '相机错误';
      if (this.cameraReady) return '相机就绪';
      return '正在检测...';
    }
  },
  
  onLoad() {
    this.addLog('页面加载完成', 'info');
    this.testEnvironment();
  },
  
  methods: {
    // 添加日志
    addLog(text, type = 'info') {
      const now = new Date();
      const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
      
      this.logs.push({
        time,
        text,
        type
      });
      
      // 限制日志数量
      if (this.logs.length > 50) {
        this.logs.shift();
      }
      
      console.log(`[${time}] ${text}`);
    },
    
    // 测试环境
    testEnvironment() {
      this.addLog('开始环境检测', 'info');
      
      // 获取系统信息
      const systemInfo = uni.getSystemInfoSync();
      this.addLog(`平台: ${systemInfo.platform}`, 'info');
      this.addLog(`系统: ${systemInfo.system}`, 'info');
      this.addLog(`版本: ${systemInfo.version}`, 'info');
      
      // #ifdef H5
      this.addLog('当前环境: H5', 'info');
      if (navigator.mediaDevices) {
        this.addLog('浏览器支持 mediaDevices API', 'success');
      } else {
        this.addLog('浏览器不支持 mediaDevices API', 'error');
      }
      // #endif
      
      // #ifdef MP-WEIXIN
      this.addLog('当前环境: 微信小程序', 'info');
      // #endif
      
      // #ifdef APP-PLUS
      this.addLog('当前环境: APP', 'info');
      // #endif
    },
    
    // 测试自定义相机
    testCustomCamera() {
      this.addLog('测试自定义相机页面跳转', 'info');
      try {
        uni.navigateTo({
          url: '/pages/ebinder/custom-camera?subjectId=test&subjectCode=TEST001',
          success: () => {
            this.addLog('自定义相机页面跳转成功', 'success');
          },
          fail: (err) => {
            this.addLog(`自定义相机页面跳转失败: ${JSON.stringify(err)}`, 'error');
          }
        });
      } catch (error) {
        this.addLog(`自定义相机测试异常: ${error.message}`, 'error');
      }
    },
    
    // 测试系统相机
    testSystemCamera() {
      this.addLog('测试系统相机', 'info');
      uni.chooseImage({
        count: 1,
        sourceType: ['camera'],
        success: (res) => {
          this.addLog(`系统相机成功，获得 ${res.tempFilePaths.length} 张图片`, 'success');
          this.addLog(`图片路径: ${res.tempFilePaths[0]}`, 'info');
        },
        fail: (err) => {
          this.addLog(`系统相机失败: ${JSON.stringify(err)}`, 'error');
        }
      });
    },
    
    // 测试相机上下文
    testCameraContext() {
      this.addLog('测试相机上下文创建', 'info');
      this.showCamera = true;
      
      this.$nextTick(() => {
        try {
          this.cameraContext = uni.createCameraContext('testCamera', this);
          this.addLog('相机上下文创建成功', 'success');
        } catch (error) {
          this.addLog(`相机上下文创建失败: ${error.message}`, 'error');
        }
      });
    },
    
    // 测试权限检查
    testPermission() {
      this.addLog('测试相机权限', 'info');
      
      // #ifdef APP-PLUS
      uni.authorize({
        scope: 'scope.camera',
        success: () => {
          this.addLog('APP相机权限授权成功', 'success');
        },
        fail: (err) => {
          this.addLog(`APP相机权限授权失败: ${JSON.stringify(err)}`, 'error');
        }
      });
      // #endif
      
      // #ifdef H5
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ 
          video: { 
            facingMode: 'environment',
            width: { ideal: 1280 },
            height: { ideal: 720 }
          } 
        })
          .then((stream) => {
            this.addLog('H5相机权限获取成功', 'success');
            // 立即停止流
            stream.getTracks().forEach(track => track.stop());
          })
          .catch((error) => {
            this.addLog(`H5相机权限获取失败: ${error.message}`, 'error');
          });
      } else {
        this.addLog('H5环境不支持getUserMedia', 'error');
      }
      // #endif
      
      // #ifdef MP-WEIXIN
      uni.authorize({
        scope: 'scope.camera',
        success: () => {
          this.addLog('小程序相机权限授权成功', 'success');
        },
        fail: (err) => {
          this.addLog(`小程序相机权限授权失败: ${JSON.stringify(err)}`, 'error');
        }
      });
      // #endif
    },
    
    // 相机就绪
    onCameraReady() {
      this.addLog('测试相机初始化完成', 'success');
      this.cameraReady = true;
      this.hasError = false;
    },
    
    // 相机错误
    onCameraError(error) {
      this.addLog(`测试相机错误: ${JSON.stringify(error)}`, 'error');
      this.hasError = true;
      this.cameraReady = false;
    },
    
    // 关闭相机
    closeCamera() {
      this.showCamera = false;
      this.addLog('测试相机已关闭', 'info');
    }
  }
};
</script>

<style lang="scss" scoped>
.camera-test-page {
  padding: 20px;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f5f5f5;
}

.header {
  margin-bottom: 20px;
  
  .title {
    font-size: 24px;
    font-weight: bold;
    margin-bottom: 10px;
    color: #333;
  }
  
  .status {
    padding: 8px 16px;
    border-radius: 20px;
    font-size: 14px;
    text-align: center;
    background-color: #ffa500;
    color: white;
    
    &.ready {
      background-color: #4caf50;
    }
    
    &.error {
      background-color: #f44336;
    }
  }
}

.test-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 20px;
  
  .test-btn {
    flex: 1;
    min-width: 45%;
    padding: 12px;
    background-color: #007aff;
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 14px;
    
    &:active {
      background-color: #0056b3;
    }
  }
}

.log-area {
  flex: 1;
  border: 1px solid #ddd;
  border-radius: 8px;
  background-color: white;
  overflow: hidden;
  
  .log-title {
    padding: 10px;
    background-color: #f8f9fa;
    border-bottom: 1px solid #ddd;
    font-weight: bold;
    font-size: 16px;
  }
  
  .log-content {
    height: 300px;
    padding: 10px;
  }
  
  .log-item {
    display: flex;
    margin-bottom: 5px;
    font-size: 12px;
    
    .log-time {
      width: 60px;
      color: #666;
      margin-right: 10px;
    }
    
    .log-text {
      flex: 1;
      
      &.info {
        color: #333;
      }
      
      &.success {
        color: #4caf50;
        font-weight: bold;
      }
      
      &.error {
        color: #f44336;
        font-weight: bold;
      }
    }
  }
}

.camera-preview {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 9999;
  background-color: #000;
  
  .test-camera-view {
    width: 100%;
    height: 100%;
  }
  
  .close-camera {
    position: absolute;
    top: 50px;
    right: 20px;
    padding: 10px 20px;
    background-color: rgba(255, 255, 255, 0.8);
    border: none;
    border-radius: 20px;
    font-size: 14px;
  }
}
</style>