import { post } from "@/utils/request";

/**
 * 获取eBinder受试者列表
 * @param {string} keyword - 搜索关键词
 * @param {number} page_size - 每页数量
 * @param {number} page_index - 页码（从1开始）
 * @returns {Promise}
 */
export function getSubjectList(keyword = "", page_size = 20, page_index = 1) {
  console.log("调用受试者列表API，参数:", {
    keyword,
    page_size,
    page_index,
  });

  return post("/ebinder/getsublist", {
    keyword,
    page_size,
    page_index,
  });
}

/**
 * 获取受试者详情
 * @param {string} subjectId - 受试者ID
 * @returns {Promise}
 */
export function getSubjectDetail(subjectId) {
  return post("/ebinder/getsubdetail", {
    subject_id: subjectId,
  });
}

/**
 * 创建受试者
 * @param {Object} subjectData - 受试者数据
 * @returns {Promise}
 */
export function createSubject(subjectData) {
  return post("/ebinder/createsubject", subjectData);
}

/**
 * 更新受试者信息
 * @param {string} subjectId - 受试者ID
 * @param {Object} subjectData - 受试者数据
 * @returns {Promise}
 */
export function updateSubject(subjectId, subjectData) {
  return post("/ebinder/updatesubject", {
    subject_id: subjectId,
    ...subjectData,
  });
}

/**
 * 删除受试者
 * @param {string} subjectId - 受试者ID
 * @returns {Promise}
 */
export function deleteSubject(subjectId) {
  return post("/ebinder/deletesubject", {
    subject_id: subjectId,
  });
}
