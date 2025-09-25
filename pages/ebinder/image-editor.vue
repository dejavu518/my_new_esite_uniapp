<template>
  <view class="image-editor-page">
    <!-- 自定义导航栏 -->
    <view class="custom-navbar">
      <view class="navbar-content">
        <view class="nav-left" @click="goBack">
          <uni-icons type="left" size="20" color="#333"></uni-icons>
        </view>
        <view class="nav-title">编辑图片</view>
        <view class="nav-right" @click="saveImage">
          <text class="save-text">保存</text>
        </view>
      </view>
    </view>

    <!-- Canvas编辑区域 -->
    <view class="canvas-container">
      <canvas
        canvas-id="imageEditor"
        class="image-canvas"
        :style="{ width: canvasWidth + 'px', height: canvasHeight + 'px' }"
        @touchstart="onTouchStart"
        @touchmove="onTouchMove"
        @touchend="onTouchEnd"
      ></canvas>
    </view>

    <!-- 工具栏 -->
    <view class="toolbar">
      <!-- 工具选择 -->
      <view class="tool-section">
        <view class="tool-title">工具</view>
        <view class="tool-buttons">
          <view
            class="tool-btn"
            :class="{ active: currentTool === 'brush' }"
            @click="selectTool('brush')"
          >
            <text>涂抹</text>
          </view>
          <view
            class="tool-btn"
            :class="{ active: currentTool === 'mosaic' }"
            @click="selectTool('mosaic')"
          >
            <text>马赛克</text>
          </view>
        </view>
      </view>

      <!-- 画笔设置 -->
      <view v-if="currentTool === 'brush'" class="setting-section">
        <view class="setting-title">画笔大小</view>
        <view class="brush-sizes">
          <view
            v-for="size in brushSizes"
            :key="size"
            class="brush-size-btn"
            :class="{ active: brushSize === size }"
            @click="setBrushSize(size)"
          >
            <view
              class="brush-preview"
              :style="{ width: size / 2 + 'px', height: size / 2 + 'px' }"
            ></view>
          </view>
        </view>
      </view>

      <!-- 马赛克设置 -->
      <view v-if="currentTool === 'mosaic'" class="setting-section">
        <view class="setting-title">马赛克大小</view>
        <view class="mosaic-sizes">
          <view
            v-for="size in mosaicSizes"
            :key="size"
            class="mosaic-size-btn"
            :class="{ active: mosaicSize === size }"
            @click="setMosaicSize(size)"
          >
            <text>{{ size }}px</text>
          </view>
        </view>
      </view>

      <!-- 操作按钮 -->
      <view class="action-section">
        <view class="action-buttons">
          <view class="action-btn" @click="undoAction">
            <text>撤销</text>
          </view>
          <view class="action-btn" @click="redoAction">
            <text>重做</text>
          </view>
          <view class="action-btn" @click="clearAll">
            <text>清除</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      // Canvas相关
      ctx: null,
      canvasWidth: 0,
      canvasHeight: 0,

      // 图片相关
      imagePath: "",
      originalImageData: null,

      // 工具状态
      currentTool: "brush", // brush, mosaic
      isDrawing: false,

      // 画笔设置
      brushSize: 20,
      brushSizes: [10, 20, 30, 40, 50],

      // 马赛克设置
      mosaicSize: 10,
      mosaicSizes: [5, 10, 15, 20, 25],

      // 历史记录
      history: [],
      historyIndex: -1,

      // 绘制路径
      currentPath: [],
    };
  },

  methods: {
    // 初始化Canvas
    initCanvas() {
      this.ctx = uni.createCanvasContext("imageEditor", this);

      // 获取系统信息，设置Canvas尺寸
      const systemInfo = uni.getSystemInfoSync();
      this.canvasWidth = systemInfo.windowWidth - 30; // 左右各15px边距
      // 限制Canvas高度，为工具栏留出更多空间
      this.canvasHeight = Math.min(
        systemInfo.windowHeight * 0.4, // 减少到40%
        this.canvasWidth * 0.8 // 调整宽高比
      );

      // 设置Canvas背景色
      this.ctx.fillStyle = "#f5f5f5";
      this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
      this.ctx.draw();

      // 加载图片
      this.loadImage();
    },

    // 加载图片到Canvas
    loadImage() {
      if (!this.imagePath) return;

      // 获取图片信息
      uni.getImageInfo({
        src: this.imagePath,
        success: (res) => {
          const imgWidth = res.width;
          const imgHeight = res.height;

          // 计算适配尺寸
          const scale = Math.min(
            this.canvasWidth / imgWidth,
            this.canvasHeight / imgHeight
          );
          const drawWidth = imgWidth * scale;
          const drawHeight = imgHeight * scale;

          // 居中绘制
          const x = (this.canvasWidth - drawWidth) / 2;
          const y = (this.canvasHeight - drawHeight) / 2;

          // 绘制图片
          this.ctx.drawImage(this.imagePath, x, y, drawWidth, drawHeight);
          this.ctx.draw(false, () => {
            // 保存初始状态
            this.saveToHistory();
          });
        },
        fail: (err) => {
          console.error("加载图片失败:", err);
          uni.showToast({
            title: "图片加载失败",
            icon: "none",
          });
        },
      });
    },

    // 选择工具
    selectTool(tool) {
      this.currentTool = tool;
    },

    // 设置画笔大小
    setBrushSize(size) {
      this.brushSize = size;
    },

    // 设置马赛克大小
    setMosaicSize(size) {
      this.mosaicSize = size;
    },

    // 触摸开始
    onTouchStart(e) {
      this.isDrawing = true;
      this.currentPath = [];

      const touch = e.touches[0];
      const x = touch.x;
      const y = touch.y;

      this.currentPath.push({ x, y });

      if (this.currentTool === "brush") {
        this.startBrush(x, y);
      } else if (this.currentTool === "mosaic") {
        this.applyMosaic(x, y);
      }
    },

    // 触摸移动
    onTouchMove(e) {
      if (!this.isDrawing) return;

      const touch = e.touches[0];
      const x = touch.x;
      const y = touch.y;

      this.currentPath.push({ x, y });

      if (this.currentTool === "brush") {
        this.drawBrush(x, y);
      } else if (this.currentTool === "mosaic") {
        this.applyMosaic(x, y);
      }
    },

    // 触摸结束
    onTouchEnd() {
      this.isDrawing = false;

      // 保存到历史记录
      this.saveToHistory();
    },

    // 开始画笔绘制
    startBrush(x, y) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, y);
      this.ctx.lineWidth = this.brushSize;
      this.ctx.lineCap = "round";
      this.ctx.lineJoin = "round";
      this.ctx.strokeStyle = "#888888"; // 柔和的灰色涂抹
    },

    // 画笔绘制
    drawBrush(x, y) {
      this.ctx.lineTo(x, y);
      this.ctx.stroke();
      this.ctx.draw(true);
    },

    // 应用马赛克效果
    applyMosaic(x, y) {
      const size = this.mosaicSize;
      const halfSize = size / 2;

      // 创建马赛克效果的方块
      this.ctx.fillStyle = "#888888";
      this.ctx.globalAlpha = 0.7;
      this.ctx.fillRect(x - halfSize, y - halfSize, size, size);
      this.ctx.globalAlpha = 1.0;
      this.ctx.draw(true);
    },

    // 保存到历史记录
    saveToHistory() {
      // 清除当前位置之后的历史记录
      this.history = this.history.slice(0, this.historyIndex + 1);

      // 保存当前Canvas状态
      uni.canvasToTempFilePath(
        {
          canvasId: "imageEditor",
          success: (res) => {
            this.history.push(res.tempFilePath);
            this.historyIndex = this.history.length - 1;

            // 限制历史记录数量，避免内存过大
            if (this.history.length > 10) {
              this.history.shift();
              this.historyIndex--;
            }
          },
        },
        this
      );
    },

    // 撤销操作
    undoAction() {
      if (this.historyIndex > 0) {
        this.historyIndex--;
        this.restoreFromHistory();
        uni.showToast({
          title: "撤销成功",
          icon: "none",
        });
      } else {
        uni.showToast({
          title: "无法撤销",
          icon: "none",
        });
      }
    },

    // 重做操作
    redoAction() {
      if (this.historyIndex < this.history.length - 1) {
        this.historyIndex++;
        this.restoreFromHistory();
        uni.showToast({
          title: "重做成功",
          icon: "none",
        });
      } else {
        uni.showToast({
          title: "无法重做",
          icon: "none",
        });
      }
    },

    // 从历史记录恢复
    restoreFromHistory() {
      const imagePath = this.history[this.historyIndex];
      if (imagePath) {
        // 清空Canvas
        this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);

        // 绘制历史状态的图片
        this.ctx.drawImage(
          imagePath,
          0,
          0,
          this.canvasWidth,
          this.canvasHeight
        );
        this.ctx.draw();
      }
    },

    // 清除所有编辑
    clearAll() {
      uni.showModal({
        title: "确认清除",
        content: "确定要清除所有编辑内容吗？",
        success: (res) => {
          if (res.confirm) {
            this.loadImage(); // 重新加载原图
          }
        },
      });
    },

    // 保存图片
    saveImage() {
      uni.showLoading({
        title: "保存中...",
      });

      // 将Canvas内容保存为图片
      uni.canvasToTempFilePath(
        {
          canvasId: "imageEditor",
          success: (res) => {
            uni.hideLoading();

            // 返回编辑后的图片路径
            const pages = getCurrentPages();
            const prevPage = pages[pages.length - 2];

            if (prevPage && prevPage.handleEditedImage) {
              prevPage.handleEditedImage(res.tempFilePath);
            }

            uni.navigateBack();
          },
          fail: (err) => {
            uni.hideLoading();
            console.error("保存失败:", err);
            uni.showToast({
              title: "保存失败",
              icon: "none",
            });
          },
        },
        this
      );
    },

    // 返回上一页
    goBack() {
      uni.showModal({
        title: "确认退出",
        content: "退出将丢失所有编辑内容，确定要退出吗？",
        success: (res) => {
          if (res.confirm) {
            uni.navigateBack();
          }
        },
      });
    },
  },

  onLoad(options) {
    // 获取传递的图片路径
    if (options.imagePath) {
      this.imagePath = decodeURIComponent(options.imagePath);
    }
  },

  onReady() {
    // 页面渲染完成后初始化Canvas
    this.$nextTick(() => {
      this.initCanvas();
    });
  },
};
</script>

<style lang="scss" scoped>
.image-editor-page {
  height: 100vh;
  background-color: #f8f8f8;
  display: flex;
  flex-direction: column;
  overflow: hidden; // 禁止页面滚动
  position: fixed; // 固定定位，防止下拉刷新
  width: 100%;
  top: 0;
  left: 0;
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
      width: 60px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: flex-start;
    }

    .nav-title {
      flex: 1;
      text-align: center;
      font-size: 18px;
      font-weight: 600;
      color: #333;
    }

    .nav-right {
      width: 60px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: flex-end;

      .save-text {
        color: #8b5cf6;
        font-size: 16px;
        font-weight: 600;
      }
    }
  }
}

// Canvas容器
.canvas-container {
  height: 50vh; // 固定高度为视口高度的50%
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 15px;
  overflow: hidden; // 禁止滚动

  .image-canvas {
    border: 1px solid #ddd;
    border-radius: 8px;
    background-color: #fff;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    max-width: 100%;
    max-height: 100%;
  }
}

// 工具栏
.toolbar {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-top: 1px solid rgba(0, 0, 0, 0.05);
  padding: 20px 20px;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 100;
}

// 工具选择区域
.tool-section {
  margin-bottom: 20px;

  .tool-title {
    font-size: 14px;
    color: #666;
    margin-bottom: 10px;
    font-weight: 500;
  }

  .tool-buttons {
    display: flex;
    gap: 15px;

    .tool-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 8px 16px;
      border: 1px solid #e0e0e0;
      border-radius: 6px;
      background-color: #f9f9f9;

      &.active {
        border: 2px solid transparent;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);

        text {
          color: white;
          font-weight: 600;
        }
      }

      text {
        font-size: 14px;
        color: #666;
      }
    }
  }
}

// 设置区域
.setting-section {
  margin-bottom: 20px;

  .setting-title {
    font-size: 14px;
    color: #666;
    margin-bottom: 10px;
    font-weight: 500;
  }
}

// 画笔大小选择
.brush-sizes {
  display: flex;
  gap: 10px;

  .brush-size-btn {
    width: 40px;
    height: 40px;
    border: 1px solid #e0e0e0;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #f9f9f9;

    &.active {
      border: 2px solid transparent;
      background: linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.2) 100%);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
    }

    .brush-preview {
      background-color: #888888;
      border-radius: 50%;
    }
  }
}

// 马赛克大小选择
.mosaic-sizes {
  display: flex;
  gap: 10px;

  .mosaic-size-btn {
    padding: 8px 12px;
    border: 1px solid #e0e0e0;
    border-radius: 6px;
    background-color: #f9f9f9;

    &.active {
      border: 2px solid transparent;
      background: linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.2) 100%);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);

      text {
        color: #8b5cf6;
        font-weight: 600;
      }
    }

    text {
      font-size: 10px;
      color: #666;
    }
  }
}

// 操作按钮区域
.action-section {
  .action-buttons {
    display: flex;
    justify-content: center; // 居中对齐
    gap: 20px;

    .action-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 12px 18px;
      border: 2px solid rgba(139, 92, 246, 0.2);
      border-radius: 12px;
      background: rgba(248, 250, 252, 0.8);
      backdrop-filter: blur(10px);
      min-width: 56px;

      text {
        font-size: 12px;
        color: #6b7280;
        font-weight: 500;
      }

      // 按下效果
      &:active {
        background: rgba(139, 92, 246, 0.1);
        border-color: rgba(139, 92, 246, 0.3);
      }
    }
  }
}
</style>
