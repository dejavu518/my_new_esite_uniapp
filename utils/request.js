import { getToken, setToken, removeToken } from "./auth";
import config from "@/config";

/**
 * 请求失败后的错误统一处理
 * @param {number} status 请求失败的状态码
 * @param {string} msg 错误信息
 */
const handleError = (status, msg = "") => {
  // 清除loading
  uni.hideLoading();

  switch (status) {
    case 401:
      // token过期
      uni.showModal({
        title: "提示",
        content: "登录已过期，请重新登录",
        showCancel: false,
        success: () => {
          removeToken();
          // 重启应用
          uni.reLaunch({
            url: "/pages/login/login",
          });
        },
      });
      break;

    case 402:
      uni.showModal({
        title: "提示",
        content: msg || "用户权限不足",
        showCancel: false,
      });
      return Promise.reject(new Error(msg, { cause: "402" }));

    default:
      uni.showModal({
        title: "提示",
        content: "网络异常，请重新登录",
        showCancel: false,
        success: () => {
          removeToken();
          uni.reLaunch({
            url: "/pages/login/login",
          });
        },
      });
      break;
  }
};

/**
 * 请求拦截器
 */
const requestInterceptor = (options = {}) => {
  // 不传递默认开启loading
  if (!options.hideLoading) {
    uni.showLoading({
      title: "加载中...",
      mask: true,
    });
  }

  // 设置请求头
  options.header = {
    "Content-Type": "application/json",
    "Accept": "application/json",
    ...options.header,
  };

  // 添加api版本参数到URL
  const separator = options.url.includes("?") ? "&" : "?";
  options.url = `${options.url}${separator}api-version=${config.apiVersion}`;

  // 获取token
  const token = getToken();
  if (token) {
    options.header = {
      ...options.header,
      Authorization: "Bearer " + token,
    };
  }

  // 添加语言设置
  const systemInfo = uni.getSystemInfoSync();
  const lang = systemInfo.language;
  options.header = {
    ...options.header,
    Language: lang,
  };

  return options;
};

/**
 * 响应拦截器
 */
const responseInterceptor = (response) => {
  const { statusCode, data, header } = response;

  // 清除loading
  uni.hideLoading();

  // 遍历所有header键，查找包含"token"的键（不区分大小写）
  if (header) {
    Object.keys(header).forEach((key) => {
      if (key.toLowerCase().includes("token")) {
        setToken(header[key]);
      }
    });
  }

  // 处理项目状态 - 检查大小写两种情况
  if (header) {
    const proStatus =
      header.pro_status || header.Pro_status || header.PRO_STATUS;
    if (proStatus) {
      data.project_status = proStatus;
    }
  }

  // 处理响应状态
  if (statusCode >= 200 && statusCode < 300) {
    // HTTP状态码成功，直接返回数据让业务层处理
    console.log("HTTP请求成功，返回数据：", data);
    return data;
  } else {
    // HTTP状态码错误
    console.error("HTTP请求失败，状态码：", statusCode, "数据：", data);
    return handleError(data?.status || statusCode, data?.msg || "HTTP请求失败");
  }
};

/**
 * 封装请求
 * @param {Object} options - 请求配置
 */
const request = (options = {}) => {
  // 处理请求地址
  if (!options.url.startsWith("http")) {
    options.url = config.baseApi + options.url;
  }

  // 请求拦截
  options = requestInterceptor(options);

  console.log("发送请求：", {
    url: options.url,
    method: options.method,
    data: options.data,
    header: options.header,
    platform: process.env.UNI_PLATFORM,
    nodeEnv: process.env.NODE_ENV
  });

  return new Promise((resolve, reject) => {
    uni.request({
      ...options,
      timeout: 180000, // 3分钟超时
      success: (response) => {
        try {
          const result = responseInterceptor(response);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      },
      fail: (error) => {
        console.error("Request Failed:", error);
        uni.hideLoading();

        let errorMessage = "网络异常";
        if (error.errMsg) {
          if (error.errMsg.includes("timeout")) {
            errorMessage = "请求超时，请检查网络";
          } else if (error.errMsg.includes("fail")) {
            errorMessage = "网络连接失败，请检查网络设置";
          }
        }

        uni.showToast({
          title: errorMessage,
          icon: "none",
          duration: 3000,
        });
        reject(error);
      },
      complete: () => {
        if (!options.hideLoading) {
          uni.hideLoading();
        }
      },
    });
  });
};

// 封装GET请求
export const get = (url, data = {}, options = {}) => {
  return request({
    url,
    data,
    method: "GET",
    ...options,
  });
};

// 封装POST请求
export const post = (url, data = {}, options = {}) => {
  return request({
    url,
    data,
    method: "POST",
    ...options,
  });
};

// 封装PUT请求
export const put = (url, data = {}, options = {}) => {
  return request({
    url,
    data,
    method: "PUT",
    ...options,
  });
};

// 封装DELETE请求
export const del = (url, data = {}, options = {}) => {
  return request({
    url,
    data,
    method: "DELETE",
    ...options,
  });
};

export default {
  get,
  post,
  put,
  del,
};
