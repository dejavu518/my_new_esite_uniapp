const TOKEN_KEY = "token";

/**
 * 获取token
 */
export function getToken() {
  return uni.getStorageSync(TOKEN_KEY);
}

/**
 * 设置token
 * @param {string} token
 */
export function setToken(token) {
  return uni.setStorageSync(TOKEN_KEY, token);
}

/**
 * 移除token
 */
export function removeToken() {
  return uni.removeStorageSync(TOKEN_KEY);
}
