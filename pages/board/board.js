
const app = getApp()

// pages/board.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
  boards:[
    {key:'in_theaters'},
    {key:'coming_soon'},
    {key:'new_movies'},
    {key:'top250'}
  ]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.showLoading({
      title: '拼命加载中...'
    })  
    
    const tasks = this.data.boards.map(board=>{
      return app.douban.find(board.key,1,8).then(d=>{
        board.title=d.title
        board.movies = d.subjects
        return board
      })
    })
    Promise.all(tasks).then(boards=>
    {
      this.setData({boards:boards,loading:false})
      wx.hideLoading()
    })
  },
  onShareAppMessage() {
    return {
      title: "世事一场大梦，人生几度秋凉？",
      path: "pages/splash/splash",
      imageUrl: "../images/banner/800.jpg"
    }
  }
})