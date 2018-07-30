//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    userInfo:{},
    result:{},
    pageIndex:1
  },
  //事件处理函数
  bindViewTap: function () {
    wx.navigateTo({
      url: '../list/list'
    })
  },
  onLoad: function () {
  },
  onShow:function(){
    this.setData({
      userInfo: app.data.userInfo
    })
    this.getCache();
  },

  getCache: function () {
    let data = {
      pageIndex: 1,
      userName: app.data.userInfo.nickName,
    }

    let getInfoData = {
      "functionname": "GetOrderPage",
      "body": JSON.stringify(data)
    };
    app.daan.fetchGet(getInfoData).then(d => {
      this.setData({ result:d})
    })
  }


})
