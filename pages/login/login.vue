<script>
// import { login } from "@/api/user"; // 暂时注释掉真实的登录接口
import { setToken } from "@/utils/auth";

export default {
  data() {
    return {
      form: {
        clientCode: "",
        username: "",
        password: "",
      },
      rememberPassword: false,
      agreePolicy: false,
      loading: false,
    };
  },
  methods: {
    // 处理记住密码状态变化
    handleRememberChange(e) {
      this.rememberPassword = e.detail.value.length > 0;
      console.log("记住密码状态：", this.rememberPassword);
    },
    // 处理协议同意状态变化
    handleAgreeChange(e) {
      this.agreePolicy = e.detail.value.length > 0;
      console.log("协议同意状态：", this.agreePolicy);
    },
    async handleLogin() {
      // 表单验证
      if (!this.form.clientCode) {
        uni.showToast({
          title: "请输入客户代码",
          icon: "none",
        });
        return;
      }
      if (!this.form.username) {
        uni.showToast({
          title: "请输入账号",
          icon: "none",
        });
        return;
      }
      if (!this.form.password) {
        uni.showToast({
          title: "请输入密码",
          icon: "none",
        });
        return;
      }

      // 检查是否同意用户协议和隐私政策
      if (!this.agreePolicy) {
        uni.showModal({
          title: "提示",
          content: "请阅读并同意用户协议和隐私政策",
          showCancel: false,
        });
        return;
      }

      try {
        this.loading = true;
        const info = {
          projectNum: this.form.clientCode,
          user_name: this.form.username,
          user_pwd: this.form.password,
          log_type: "0",
        };

        console.log("准备发送登录请求，参数：", info);

        // 注释掉真实登录接口调用，直接模拟登录成功
        // const res = await login(info);
        
        // 模拟登录成功返回数据
        const res = {
          code: 0,
          msg: "登录成功",
          token: "mock_token_123456789",
          data: {
            user_id: "test_user",
            user_name: this.form.username
          }
        };
        
        console.log("模拟登录接口返回数据：", res);
        console.log("返回数据类型：", typeof res);
        console.log("返回数据结构：", JSON.stringify(res, null, 2));

        // 检查返回的数据结构
        if (!res || typeof res !== "object") {
          throw new Error("登录接口返回数据格式错误");
        }

        // 检查业务状态码 - 根据实际接口返回格式调整
        const businessCode =
          res.code || res.status || res.errCode || res.result;

        if (businessCode !== undefined) {
          // 业务成功的状态码通常是0、1或200
          if (
            businessCode !== 0 &&
            businessCode !== 1 &&
            businessCode !== 200 &&
            businessCode !== "0" &&
            businessCode !== "1" &&
            businessCode !== "200"
          ) {
            // 业务失败
            const errorMessage =
              res.msg ||
              res.message ||
              res.error ||
              `登录失败，错误码：${businessCode}`;

            // 根据不同的错误码给出不同的提示
            let userMessage = errorMessage;
            if (businessCode === 2 || businessCode === "2") {
              userMessage = "用户名或密码错误，请检查后重试";
            } else if (businessCode === 3 || businessCode === "3") {
              userMessage = "账户已被锁定，请联系管理员";
            } else if (businessCode === 4 || businessCode === "4") {
              userMessage = "客户代码不存在，请检查后重试";
            } else if (businessCode === 401) {
              userMessage = "认证失败，请检查用户名和密码";
            } else if (businessCode === 403) {
              userMessage = "权限不足，请联系管理员";
            }

            throw new Error(userMessage);
          }
        }

        // 如果需要记住密码
        if (this.rememberPassword) {
          uni.setStorageSync("loginInfo", {
            projectNum: this.form.clientCode,
            user_name: this.form.username,
            user_pwd: this.form.password,
            log_type: "0",
          });
        } else {
          uni.removeStorageSync("loginInfo");
        }

        // 保存token - 适应不同的返回格式
        const token =
          res.token ||
          res.access_token ||
          res.data?.token ||
          res.data?.access_token;
        if (token) {
          setToken(token);
          console.log("Token已保存：", token);
        } else {
          console.warn("未找到token，可能需要检查接口返回格式");
        }

        // 登录成功提示
        uni.showToast({
          title: "登录成功",
          icon: "success",
          duration: 1500,
        });

        // 延迟跳转，让用户看到成功提示
        setTimeout(() => {
          // 跳转到首页
          uni.reLaunch({
            url: "/pages/index/index",
          });
        }, 1500);
      } catch (error) {
        console.error("登录失败，错误信息：", error);
        console.error("错误详情：", {
          message: error.message,
          stack: error.stack,
          cause: error.cause,
        });

        // 根据错误类型显示不同的处理方式
        let errorTitle = "登录失败";
        let errorContent = error.message || "登录过程中发生错误";
        let showContinueOption = false;

        // 如果是网络错误，提供继续选项
        if (
          error.message &&
          (error.message.includes("网络") ||
            error.message.includes("timeout") ||
            error.message.includes("连接"))
        ) {
          errorTitle = "网络错误";
          errorContent = error.message + "，您可以重试或继续使用";
          showContinueOption = true;
        }

        uni.showModal({
          title: errorTitle,
          content: errorContent,
          showCancel: showContinueOption,
          cancelText: "重试",
          confirmText: showContinueOption ? "继续" : "确定",
          success: (modalRes) => {
            if (modalRes.confirm && showContinueOption) {
              // 用户选择继续，跳转到首页
              uni.showToast({
                title: "正在跳转...",
                icon: "loading",
                duration: 1000,
              });

              setTimeout(() => {
                uni.reLaunch({
                  url: "/pages/index/index",
                });
              }, 1000);
            }
            // 如果用户选择重试或点击确定，什么都不做，可以重新点击登录
          },
        });
      } finally {
        this.loading = false;
      }
    },
    handleForgotPassword() {
      // TODO: 实现忘记密码逻辑
      uni.showToast({
        title: "忘记密码功能开发中",
        icon: "none",
      });
    },

    // 检查是否有保存的登录信息
    checkSavedLoginInfo() {
      const savedInfo = uni.getStorageSync("loginInfo");
      if (savedInfo) {
        this.form = savedInfo;
        this.rememberPassword = true;
      }
    },

    // 显示用户协议
    showUserAgreementDialog() {
      this.$refs.userAgreementPopup.open();
    },

    // 显示隐私政策
    showPrivacyPolicyDialog() {
      this.$refs.privacyPolicyPopup.open();
    },

    // 关闭用户协议弹窗
    closeUserAgreement() {
      this.$refs.userAgreementPopup.close();
    },

    // 关闭隐私政策弹窗
    closePrivacyPolicy() {
      this.$refs.privacyPolicyPopup.close();
    },

    // 同意用户协议
    agreeUserAgreement() {
      this.agreePolicy = true;
      this.$refs.userAgreementPopup.close();
      uni.showToast({
        title: "已同意用户协议",
        icon: "success",
        duration: 1500
      });
    },

    // 同意隐私政策
    agreePrivacyPolicy() {
      this.agreePolicy = true;
      this.$refs.privacyPolicyPopup.close();
      uni.showToast({
        title: "已同意隐私政策",
        icon: "success",
        duration: 1500
      });
    },
  },
  onLoad() {
    // 页面加载时检查保存的登录信息
    this.checkSavedLoginInfo();
  },
};
</script>

<template>
  <view class="login-container">
    <!-- 顶部渐变Banner -->
    <view class="banner">
      <view class="welcome-text">欢迎加入</view>
      <view class="app-name">CIMS-eSite</view>
    </view>

    <!-- 表单区域 -->
    <view class="form-section">
      <view class="input-group">
        <uni-easyinput
          v-model="form.clientCode"
          placeholder="请输入客户代码"
          :clearable="true"
        />
      </view>

      <view class="input-group">
        <uni-easyinput
          v-model="form.username"
          placeholder="请输入账号"
          :clearable="true"
        />
      </view>

      <view class="input-group">
        <uni-easyinput
          v-model="form.password"
          type="password"
          placeholder="请输入密码"
          :clearable="true"
        />
      </view>

      <view class="checkbox-group">
        <!-- 记住密码选项 -->
        <checkbox-group @change="handleRememberChange">
          <view class="checkbox-item">
            <checkbox
              value="remember"
              :checked="rememberPassword"
              style="transform: scale(0.7)"
            />
            <text>记住密码</text>
          </view>
        </checkbox-group>

        <!-- 同意协议选项 -->
        <checkbox-group @change="handleAgreeChange">
          <view class="checkbox-item">
            <checkbox
              value="agree"
              :checked="agreePolicy"
              style="transform: scale(0.7)"
            />
            <text>同意</text>
            <text class="link" @click="showUserAgreementDialog">《用户协议》</text>
            <text>和</text>
            <text class="link" @click="showPrivacyPolicyDialog">《隐私政策》</text>
          </view>
        </checkbox-group>
      </view>

      <view class="button-group">
        <button
          class="login-btn"
          @click="handleLogin"
          :loading="loading"
          :disabled="loading"
        >
          {{ loading ? "登录中..." : "登录" }}
        </button>
        <text class="forgot-password" @click="handleForgotPassword"
          >忘记密码</text
        >
      </view>
    </view>

    <!-- 用户协议弹窗 -->
    <uni-popup ref="userAgreementPopup" type="center">
      <view class="agreement-popup">
        <view class="popup-header">
          <text class="popup-title">用户协议</text>
          <text class="close-btn" @click="closeUserAgreement">×</text>
        </view>
        <scroll-view class="popup-content" scroll-y>
          <view class="agreement-text">
            <text class="section-title">1. 服务条款</text>
            <text class="content-text">欢迎使用CIMS-eSite服务。本协议规定了您使用我们服务的条款和条件...</text>
            
            <text class="section-title">2. 用户责任</text>
            <text class="content-text">您承诺遵守相关法律法规，不得利用本服务从事违法活动...</text>
            
            <text class="section-title">3. 隐私保护</text>
            <text class="content-text">我们重视您的隐私，会按照隐私政策保护您的个人信息...</text>
            
            <text class="section-title">4. 免责声明</text>
            <text class="content-text">在法律允许的范围内，我们对服务的可用性、准确性不作保证...</text>
          </view>
        </scroll-view>
        <view class="popup-footer">
          <button class="cancel-btn" @click="closeUserAgreement">取消</button>
          <button class="agree-btn" @click="agreeUserAgreement">同意</button>
        </view>
      </view>
    </uni-popup>

    <!-- 隐私政策弹窗 -->
    <uni-popup ref="privacyPolicyPopup" type="center">
      <view class="agreement-popup">
        <view class="popup-header">
          <text class="popup-title">隐私政策</text>
          <text class="close-btn" @click="closePrivacyPolicy">×</text>
        </view>
        <scroll-view class="popup-content" scroll-y>
          <view class="agreement-text">
            <text class="section-title">1. 信息收集</text>
            <text class="content-text">我们会收集您主动提供的信息，如注册信息、使用记录等...</text>
            
            <text class="section-title">2. 信息使用</text>
            <text class="content-text">我们使用收集的信息来提供、维护和改进我们的服务...</text>
            
            <text class="section-title">3. 信息共享</text>
            <text class="content-text">除法律要求外，我们不会向第三方分享您的个人信息...</text>
            
            <text class="section-title">4. 信息安全</text>
            <text class="content-text">我们采用行业标准的安全措施来保护您的个人信息...</text>
          </view>
        </scroll-view>
        <view class="popup-footer">
          <button class="cancel-btn" @click="closePrivacyPolicy">取消</button>
          <button class="agree-btn" @click="agreePrivacyPolicy">同意</button>
        </view>
      </view>
    </uni-popup>
  </view>
</template>

<style lang="scss">
page {
  height: 100%;
}

.login-container {
  min-height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
  display: flex;
  flex-direction: column;

  .banner {
    height: 160px;
    padding: 0 30px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;

    .welcome-text {
      color: #fff;
      font-size: 28px;
      font-weight: 600;
      letter-spacing: 1px;
      padding-left: 15px;
      margin-bottom: 8px;
    }

    .app-name {
      color: rgba(255, 255, 255, 0.9);
      font-size: 20px;
      font-weight: 500;
      letter-spacing: 2px;
      padding-left: 15px;
    }
  }

  .form-section {
    flex: 1;
    background: #fff;
    border-radius: 20px 20px 0 0;
    padding: 30px 20px;
    display: flex;
    flex-direction: column;

    .input-group {
      margin-bottom: 20px;

      :deep(.uni-easyinput__content) {
        background-color: rgba(255, 255, 255, 0.9);
        backdrop-filter: blur(10px);
        border-radius: 12px;
        border: 2px solid transparent;
        height: 52px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);

        .uni-easyinput__content-input {
          font-size: 16px;
          color: #333;
        }

        .uni-easyinput__placeholder-class {
          font-size: 16px;
          color: #999;
        }
      }
    }

    .checkbox-group {
      margin: 20px 0;
      flex-shrink: 0;

      .checkbox-item {
        display: flex;
        align-items: center;
        margin-bottom: 10px;

        text {
          font-size: 14px;
          color: #666;
          margin-left: 4px;
        }

        .link {
          color: #4a6feb;
          cursor: pointer;
          text-decoration: underline;
          
          &:hover {
            opacity: 0.8;
          }
        }
      }
    }

    .button-group {
      margin-top: auto;
      padding-bottom: 20px;

      .login-btn {
        width: 100%;
        height: 52px;
        line-height: 52px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: #fff;
        border-radius: 12px;
        font-size: 17px;
        margin-bottom: 15px;
        border: none;
        font-weight: 600;
        box-shadow: 0 8px 24px rgba(102, 126, 234, 0.3);

        &:active {
          opacity: 0.9;
        }

        &[disabled] {
          opacity: 0.7;
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.6), rgba(118, 75, 162, 0.6));
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
        }
      }

      .forgot-password {
        display: block;
        text-align: center;
        font-size: 15px;
        color: #4a6feb;
      }
    }
  }
}

// 协议弹窗样式
.agreement-popup {
  width: 90vw;
  max-width: 500px;
  height: 70vh;
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
    padding: 0;

    .agreement-text {
      padding: 20px;
      
      .section-title {
        display: block;
        font-size: 16px;
        font-weight: 600;
        color: #333;
        margin: 20px 0 10px 0;
        
        &:first-child {
          margin-top: 0;
        }
      }

      .content-text {
        display: block;
        font-size: 14px;
        line-height: 1.6;
        color: #666;
        margin-bottom: 15px;
        text-indent: 2em;
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

    .agree-btn {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #fff;
      
      &:hover {
        opacity: 0.9;
      }
    }
  }
}
</style>
