import { post } from "@/utils/request";

/**
 * 用户登录
 * @param {Object} data - 登录参数
 * @param {string} data.projectNum - 项目编号/客户代码
 * @param {string} data.user_name - 用户名
 * @param {string} data.user_pwd - 密码
 * @param {string} data.log_type - 登录类型
 * @returns {Promise}
 */
export function login(data) {
  return post("/login/userlogin", data, {
    header: {
      "Content-Type": "application/json;charset=UTF-8",
    },
  });
}
