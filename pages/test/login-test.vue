<template>
  <view class="test-page">
    <view class="header">
      <text class="title">登录接口测试</text>
    </view>
    
    <view class="form">
      <view class="input-group">
        <text class="label">客户代码:</text>
        <input v-model="form.clientCode" placeholder="请输入客户代码" />
      </view>
      
      <view class="input-group">
        <text class="label">用户名:</text>
        <input v-model="form.username" placeholder="请输入用户名" />
      </view>
      
      <view class="input-group">
        <text class="label">密码:</text>
        <input v-model="form.password" type="password" placeholder="请输入密码" />
      </view>
      
      <button @click="testLogin" :disabled="loading">
        {{ loading ? '测试中...' : '测试登录接口' }}
      </button>

      <button @click="testProxy" :disabled="loading" style="margin-top: 10px;">
        {{ loading ? '测试中...' : '测试代理连接' }}
      </button>
    </view>
    
    <view class="result">
      <text class="result-title">测试结果:</text>
      <view class="result-content">
        <text>{{ result }}</text>
      </view>
    </view>
    
    <view class="config">
      <text class="config-title">当前配置:</text>
      <view class="config-content">
        <text>API地址: {{ apiUrl }}</text>
        <text>API版本: {{ apiVersion }}</text>
        <text>运行平台: {{ platform }}</text>
        <text>运行环境: {{ nodeEnv }}</text>
        <text>实际请求地址: {{ actualApiUrl }}</text>
      </view>
    </view>
  </view>
</template>

<script>
import { login } from "@/api/user";
import config from "@/config";

export default {
  data() {
    return {
      form: {
        clientCode: "",
        username: "",
        password: "",
      },
      loading: false,
      result: "暂无测试结果",
      apiUrl: config.baseApi,
      apiVersion: config.apiVersion,
      platform: process.env.UNI_PLATFORM || 'unknown',
      nodeEnv: process.env.NODE_ENV || 'unknown',
      actualApiUrl: ''
    };
  },
  methods: {
    async testLogin() {
      if (!this.form.clientCode || !this.form.username || !this.form.password) {
        this.result = "请填写完整的登录信息";
        return;
      }

      try {
        this.loading = true;
        this.result = "正在测试...";

        const info = {
          projectNum: this.form.clientCode,
          user_name: this.form.username,
          user_pwd: this.form.password,
          log_type: "0",
        };

        console.log("测试登录参数：", info);
        console.log("当前运行平台：", process.env.UNI_PLATFORM);
        console.log("当前环境：", process.env.NODE_ENV);

        const res = await login(info);

        console.log("测试登录结果：", res);

        this.result = `测试成功！\n返回数据：${JSON.stringify(res, null, 2)}`;

      } catch (error) {
        console.error("测试登录失败：", error);

        // 检查是否是跨域错误
        let errorType = "未知错误";
        if (error.message && error.message.includes("CORS")) {
          errorType = "跨域错误 (CORS)";
        } else if (error.message && error.message.includes("Network")) {
          errorType = "网络错误";
        } else if (error.message && error.message.includes("timeout")) {
          errorType = "请求超时";
        }

        this.result = `测试失败！\n错误类型：${errorType}\n错误信息：${error.message}\n平台：${process.env.UNI_PLATFORM}\n详细错误：${JSON.stringify(error, null, 2)}`;
      } finally {
        this.loading = false;
      }
    },

    // 测试代理连接
    async testProxy() {
      try {
        this.loading = true;
        this.result = "正在测试代理连接...";

        console.log("测试代理连接");
        console.log("当前API配置:", config.baseApi);
        console.log("当前平台:", process.env.UNI_PLATFORM);

        // 直接使用uni.request测试代理
        const testUrl = config.baseApi + '/login/userlogin?api-version=' + config.apiVersion;
        console.log("测试URL:", testUrl);

        uni.request({
          url: testUrl,
          method: 'POST',
          data: {
            projectNum: 'test',
            user_name: 'test',
            user_pwd: 'test',
            log_type: '0'
          },
          header: {
            'Content-Type': 'application/json'
          },
          success: (res) => {
            console.log("代理测试成功:", res);
            this.result = `代理连接成功！\n状态码: ${res.statusCode}\n响应: ${JSON.stringify(res.data, null, 2)}`;
          },
          fail: (err) => {
            console.error("代理测试失败:", err);
            this.result = `代理连接失败！\n错误: ${JSON.stringify(err, null, 2)}`;
          },
          complete: () => {
            this.loading = false;
          }
        });

      } catch (error) {
        console.error("代理测试异常:", error);
        this.result = `代理测试异常！\n错误: ${error.message}`;
        this.loading = false;
      }
    }
  },

  mounted() {
    // 计算实际的API地址
    this.actualApiUrl = this.apiUrl + '/login/userlogin?api-version=' + this.apiVersion;
  }
};
</script>

<style lang="scss" scoped>
.test-page {
  padding: 20px;
  
  .header {
    text-align: center;
    margin-bottom: 30px;
    
    .title {
      font-size: 24px;
      font-weight: bold;
      color: #333;
    }
  }
  
  .form {
    margin-bottom: 30px;
    
    .input-group {
      margin-bottom: 15px;
      
      .label {
        display: block;
        font-size: 16px;
        color: #666;
        margin-bottom: 5px;
      }
      
      input {
        width: 100%;
        height: 40px;
        padding: 0 15px;
        border: 1px solid #ddd;
        border-radius: 5px;
        font-size: 16px;
      }
    }
    
    button {
      width: 100%;
      height: 50px;
      background-color: #4a6feb;
      color: white;
      border: none;
      border-radius: 5px;
      font-size: 18px;
      margin-top: 20px;
      
      &:disabled {
        background-color: #ccc;
      }
    }
  }
  
  .result, .config {
    margin-bottom: 20px;
    
    .result-title, .config-title {
      font-size: 18px;
      font-weight: bold;
      color: #333;
      margin-bottom: 10px;
    }
    
    .result-content, .config-content {
      background-color: #f5f5f5;
      padding: 15px;
      border-radius: 5px;
      
      text {
        display: block;
        font-size: 14px;
        color: #666;
        line-height: 1.5;
        white-space: pre-wrap;
        word-break: break-all;
      }
    }
  }
}
</style>
