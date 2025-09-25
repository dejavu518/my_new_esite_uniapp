<template>
  <view class="icon-generator">
    <view class="icon-preview">
      <view class="icon-item">
        <uni-icons type="home" size="24" color="#999"></uni-icons>
        <text>首页 (未选中)</text>
      </view>
      <view class="icon-item">
        <uni-icons type="home" size="24" color="#4a6feb"></uni-icons>
        <text>首页 (选中)</text>
      </view>
      <view class="icon-item">
        <uni-icons type="person" size="24" color="#999"></uni-icons>
        <text>个人中心 (未选中)</text>
      </view>
      <view class="icon-item">
        <uni-icons type="person" size="24" color="#4a6feb"></uni-icons>
        <text>个人中心 (选中)</text>
      </view>
    </view>

    <view class="instruction">
      <text>请截图保存这些图标，并将它们分别保存为：</text>
      <text>1. static/tabbar/home.png</text>
      <text>2. static/tabbar/home-active.png</text>
      <text>3. static/tabbar/profile.png</text>
      <text>4. static/tabbar/profile-active.png</text>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {};
  },
  onLoad() {
    uni.setNavigationBarTitle({
      title: "图标生成器",
    });
  },
};
</script>

<style>
.icon-generator {
  padding: 30px;
}

.icon-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 30px;
}

.icon-item {
  margin: 20px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.icon-item text {
  margin-top: 10px;
  font-size: 14px;
  color: #333;
}

.instruction {
  background-color: #f7f7f7;
  padding: 15px;
  border-radius: 8px;
  border: 1px solid #f0f0f0;
}

.instruction text {
  display: block;
  margin-bottom: 10px;
  font-size: 14px;
  color: #333;
}
</style>
