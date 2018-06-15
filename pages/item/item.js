// pages/item/item.js

const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    title: '',
    movie: {}
  },

  /*生命周期函数--监听页面加载*/
  onLoad: function (params) {
    wx.showLoading({ title: '拼命加载中...' })
    //params.id = 27133303
    app.douban.findOne(params.id).then(d => {
      this.setData({ title: d.title, movie: d })
      wx.setNavigationBarTitle({
        title: d.title + ' « 电影 « 豆瓣',
      })
      wx.hideLoading()
    }).catch(e => {
      this.setData({ title: '获取数据异常', movie: {} })
      console.error(e)
      wx.hideLoading()
    })
  },

  /*生命周期函数--监听页面初次渲染完成*/
  onReady() {
    wx.setNavigationBarTitle({
      title: ' « 电影 « 豆瓣',
    })
  },
  onShareAppMessage() {
    return {
      title: this.data.title,
      desc: this.data.title,
      path: 'pages/item?id=' + this.data.id
    }
  }

})

