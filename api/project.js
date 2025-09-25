import { post } from "@/utils/request";

/**
 * 获取项目列表
 * @param {number} page - 页码
 * @param {string} keyword - 搜索关键词
 * @param {string} flag - 数据库标识（PROD/UAT）
 * @param {number} pageSize - 每页数量，默认12
 * @param {string} orderField - 排序字段，默认Database_Id
 * @param {string} orderType - 排序方式，默认ASC
 * @returns {Promise}
 */
export function getProjectList(
  page,
  keyword = "",
  flag = "",
  pageSize = 12,
  orderField = "Database_Id",
  orderType = "ASC"
) {
  return post("/project/list", {
    keyword: keyword,
    flag: flag,
    page_index: page,
    page_size: pageSize,
    order_field: orderField,
    order_type: orderType,
  });
}

/**
 * 获取项目详情
 * @param {string} projectId - 项目ID
 * @returns {Promise}
 */
export function getProjectDetail(projectId) {
  return post("/project/detail", {
    project_id: projectId,
  });
}

/**
 * 切换项目
 * @param {string} projectId - 项目ID
 * @returns {Promise}
 */
export function switchProject(projectId) {
  return post("/project/switch", {
    project_id: projectId,
  });
}
