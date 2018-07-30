function login() {
  return new Promise((resolve, reject) => {
    wx.login({ success: resolve, fail: reject })
  })
}


function getUserInfo() {
  return new Promise((resolve, reject) => {
    wx.getUserInfo({ success: resolve, fail: reject })
  })
}

function setStorage(key, value) {
  return new Promise((resolve, reject) => {
    wx.setStorage({ key: key, data: value, success: resolve, fail: reject })
  })
}

function getStorage(key) {
  return new Promise((resolve, reject) => {
    wx.getstorage({ type: type, success: resolve, fail: reject })
  })
}

//从本地缓存中同步获取指定 key 对应的内容。
function getStorageSync(key) {
  try {
    var value = wx.getStorageSync(key)
    if (value) {
      //console.log(value)
      return value;
    }
  } catch (e) {
    console.error(e);
  }
}

function getLocation(type) {
  return new Promise((resolve, reject) => {
    wx.getLocation({
      type: type,
      success: resolve,
      fail: reject
    })
  })
}

module.exports = {
  login,
  getUserInfo,
  setStorage,
  getStorage,
  getStorageSync,
  getLocation,
  original: wx
}