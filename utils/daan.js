//const URL = "http://localhost:8007/api/Main/"
const URL = "https://www.wutwu.com/api/Main/"
const fetch = require('./fetch')


/**
 * @param  {String} type   类型，例如：'coming_soon'
 * @param  {Objece} params 参数
 * @return {Promise}       包含抓取任务的Promise
 */
function fetchGet(type, params) {
  return fetch.DataGET(URL, type, params)
}
function fetchGet(params) {
  return fetch.DataGET(URL, "GetData", params)
}
/**
 * 获取列表类型的数据
 * @param  {String} type   类型，例如：'coming_soon'
 * @param  {Number} page   页码
 * @param  {Number} count  页条数
 * @param  {String} search 搜索关键词
 * @return {Promise}       包含抓取任务的Promise
 */
function find(type, page = 1, count = 20, search = '') {
  const params = {
    pageIndex: (page - 1) * count,
    pageSize: count
  }
  return fetchGet(type, params).then(res => res.data)
}

/**
 * 获取单条类型的数据
 * @param  {Number} id     电影ID
 * @return {Promise}       包含抓取任务的Promise

function findOne(id) {
  return fetchGet('subject/' + id).then(res => res.data)
} 
*/

/**
 * @param  {String} type   类型，例如：'coming_soon'
 * @param  {Objece} params 参数
 * @return {Promise}       返回状态信息
 */
function fetchPost(params) {
  return fetch.DataPOST(URL, "PostData", params)
}


module.exports = {
  find,
  fetchGet,
  fetchPost
}