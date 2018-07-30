// pages/list/list.js

const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    banners: [],
    curIndex: 0,
    details: [],
    details_back: [],
    orders: {}, //订单
    toView: 'guowei',
    isShowbanner: true,
    containerHeight: 70,
    isShowShoppingCart: false,
    flag: false, //选规格控制显示面板
    selectGood: [],
    userInfo:{}
  },

  /**
   * 生命周期函数--监听页面加载
   * 加载数据
   */
  onLoad: function() {
    this.orders = {
      num: 0,
      sumPrice: 0,
      list: []
    }
  },
  onReady: function() {

    var self = this;
    self.GetNoticeImgs();

    var value = app.wechat.getStorageSync("last_index_data");
    if (value) {
      this.setData({
        details: value.details,
        details_back: value.details
      })
    }
    //console.log(this.data.menus)
    if (this.data.details == undefined || this.data.details.length == 0) {
      let data={
        functionname:"GetTeaList"
      }
      app.daan.fetchGet(data).then(d => {
        //console.log(d.data.body);
        this.setData({
          details: d.data.body,
          details_back: d.data.body
        })
        return app.wechat.setStorage('last_index_data', {
          details: d.data.body,
          details_back: d.data.body,
          expires: Date.now()
        })
      }).then(() => console.log('storage last index data'))
    }
  },

  GetNoticeImgs(){
    let data = {
      functionname: "GetNoticeImgs"
    }
    app.daan.fetchGet(data).then(d => {
      //console.log(d.data.body);
      this.setData({
        banners: d.data.body,
      })
      // { "code": 1, "msg": "请求成功", "totalCount": 0, "body": ["https://www.wutwu.com/Content/NoticeImg/243.png", "https://www.wutwu.com/Content/NoticeImg/301.png", "https://www.wutwu.com/Content/NoticeImg/320.png"] }
    }).then(() => console.log('storage last index data'))
  },

  //点击左边的导航菜单
  switchTab(e) {
    //console.log(e.target.dataset.id)
    const self = this;
    setTimeout(function() {
      self.setData({
        toView: e.target.dataset.id,
        curIndex: e.target.dataset.index
      })
    }, 0)
  },

  //根据 scroll-view 的滑动高度，隐藏/显示Banner
  toCateGroyLeft: function(e) {

    var that = this;

    let list = that.data.details;
    let viewDom = [];
    for (let i = 0; i < list.length; i++) { // + 

      let query = wx.createSelectorQuery().select('#tea' + list[i].id).boundingClientRect()

      query.exec(function(res) {

        let minHeught = 0;
        let maxHeight = res[0].height;
        if (viewDom.length > 0) {
          minHeught = viewDom[i - 1].maxHeight;
          maxHeight = viewDom[i - 1].maxHeight + res[0].height;
        }

        let data = {
          id: res[0].id,
          index: res[0].dataset.index,
          minHeught: minHeught,
          maxHeight: maxHeight
        }
        viewDom.push(data);


        for (let i = 0; i < viewDom.length; i++) {
          if (e.detail.scrollTop > viewDom[i].minHeught && e.detail.scrollTop < viewDom[i].maxHeight) {
            let index = viewDom[i].index

            that.setData({
              curIndex: index
            })
          }
        }

      })
    }

    if (e.detail.scrollTop > 300) {
      //console.log("hidder banner");
      that.setData({
        isShowbanner: false,
        containerHeight: 100
      })

    } else if (e.detail.scrollTop < 50) {
      //console.log("show banner");
      that.setData({
        isShowbanner: true,
        containerHeight: 70
      })
    }
  },

  //取消一个选中单
  rmNum: function(e) {
    var that = this;

    let categroy = e.currentTarget.dataset.categroy
    let index = e.currentTarget.dataset.index
    let info = e.currentTarget.dataset.info
    let detail = that.data.details[categroy].goods[index]

    let num = detail["num"]
    if (num == undefined) {
      num = 0
    }
    detail["num"] = num - 1

    let tempIndex = -1;
    let tempOrders = that.data.orders;
    let list = tempOrders.list;

    for (let i = 0; i < list.length; i++) {

      if (list[i].details == categroy && list[i].rightIndex == index && (info == "" ||info==undefined)) { //无规格的订单

        if (list[i].num == 1) { //下单一件 移除
          tempIndex = i; //标记 待移除

        } else if (list[i].num > 1) { //下单多件 

          list[i].num = parseInt(list[i].num) - 1;
          list[i].SumPrice = list[i].Price * list[i].num;
          tempOrders.num = tempOrders.num - 1;
          tempOrders.sumPrice = tempOrders.sumPrice - parseInt(detail.Price);
        }

      } else if (list[i].details == categroy && list[i].rightIndex == index //有规格的订单
        &&
        info != "" && list[i].GoodsInfo.toString() == info) {

        if (list[i].num == 1) { //下单一件 移除
          tempIndex = i; //标记 待移除

        } else if (list[i].num > 1) { //下单多件 
          list[i].num = parseInt(list[i].num) - 1;
          list[i].SumPrice = list[i].Price * list[i].num;
          tempOrders.num = tempOrders.num - 1;
          tempOrders.sumPrice = tempOrders.sumPrice - parseInt(detail.Price);
        }
      }

    }

    if (tempIndex > -1) { //移除
      let newList = new Array;
      for (let i = 0; i < list.length; i++) {
        if (tempIndex == i) {
          tempOrders.num = tempOrders.num - 1;
          tempOrders.sumPrice = tempOrders.sumPrice - parseInt(detail.Price);
        } else {
          newList.push(list[i]);
        }
      }
      tempOrders.list = newList;
    }

    that.setData({
      details: that.data.details,
      orders: tempOrders
    })

    if (tempOrders.num == 0) {
      that.emptyshopingbtn();
    }
  },

  //增加一个订单
  addNum: function(e) {
    var that = this;

    let categroy = e.currentTarget.dataset.categroy //菜单下标
    let index = e.currentTarget.dataset.index //产品下标
    let info = e.currentTarget.dataset.info
    let detail = that.data.details[categroy].goods[index]

    let num = detail["num"]
    if (num == undefined) {
      num = 0
    }
    detail["num"] = num + 1 //菜单数变更

    //加入购物车 orders
    let tempOrders = that.data.orders;
    if (tempOrders.list == undefined) {
      tempOrders.list = []
    }
    if (tempOrders.num == null) {
      tempOrders.num = 0
    }
    if (tempOrders.sumPrice == null) {
      tempOrders.sumPrice = 0
    }
    let list = tempOrders.list;
    let order = {};
    let isexist = false; //购物车里初始化不存在一样的商品
    for (let i = 0; i < list.length; i++) {

      if (info == undefined || info == "") { //无规格的订单
        if (list[i].details == categroy && list[i].rightIndex == index) {
          isexist = true;
          list[i].num = parseInt(list[i].num) + 1; //数据追加
          list[i].SumPrice = list[i].Price * list[i].num;

          tempOrders.num = tempOrders.num + 1;
          tempOrders.sumPrice = tempOrders.sumPrice + parseInt(detail.Price);
        }
      } else if (list[i].details == categroy && list[i].rightIndex == index //有规格的订单
        &&
        info != "" && list[i].GoodsInfo.toString() == info) {
        isexist = true;
        list[i].num = parseInt(list[i].num) + 1; //数据追加
        list[i].SumPrice = list[i].Price * list[i].num;
        tempOrders.num = tempOrders.num + 1;
        tempOrders.sumPrice = tempOrders.sumPrice + parseInt(detail.Price);

      }
    }


    if (!isexist) {
      //console.log("购物车 需要添加")
      order["details"] = categroy;
      order["rightIndex"] = index;
      order["GoodsName"] = detail.GoodsName;
      order["GoodsInfo"] = "";
      order["Price"] = detail.Price;
      order["num"] = 1;
      order["SumPrice"] = parseInt(detail.Price);

      tempOrders.list.push(order);
      tempOrders.num = tempOrders.num + 1;
      tempOrders.sumPrice = tempOrders.sumPrice + parseInt(detail.Price);
    }
    that.setData({
      details: that.data.details,
      orders: tempOrders
    })
    that.OrderShoppShow();
    //console.log(that.orders);
  },

  //购物车动画
  OrderShoppShow: function(e) {
    // 用that取代this，防止不必要的情况发生
    var that = this;
    if (that.data.isShopping == true) {
      return false;
    }
    // 创建一个动画实例
    var animation = wx.createAnimation({
      // 动画持续时间
      duration: 500,
      // 定义动画效果，当前是匀速
      timingFunction: 'linear'
    })
    // 将该变量赋值给当前动画
    that.animation = animation
    // 先在y轴偏移，然后用step()完成一个动画
    animation.translateY(200).step()
    // 用setData改变当前动画
    that.setData({
      // 通过export()方法导出数据
      animationData: animation.export(),
      isShopping: true
    })
    // 设置setTimeout来改变y轴偏移量，实现有感觉的滑动
    setTimeout(function() {
      animation.translateY(0).step()
      that.setData({
        animationData: animation.export(),
      })
    }, 200)
  },

  //隐藏区域显示
  hideModal: function(e) {
    var that = this;
    that.setData({
      isShowShoppingCart: false,
      chooseSize: false,
      isShopping: true
    })
  },

  //购物车列表显示
  shoppinglist: function() {
    var that = this;
    //console.log(that.data.isShowShoppingCart)
    that.setData({
      isShowShoppingCart: !that.data.isShowShoppingCart,
      chooseSize: !that.data.chooseSize,
    })
  },

  //清空购物车
  emptyshopingbtn: function() {
    var that = this;
    var animation = wx.createAnimation({
      duration: 1000,
      timingFunction: 'linear'
    })
    that.animation = animation
    animation.translateY(200).step()
    that.setData({
      animationData: animation.export(),
      chooseSize: false,
      isShowShoppingCart: false
    })
    setTimeout(function() {
      animation.translateY(0).step()
      that.setData({
        animationData: animation.export(),
        isShopping: false
      })
    }, 200)

    this.initializeData()
  },

  //待选规格
  selectLabel: function(e) {
    var that = this;

    let categroy = e.currentTarget.dataset.categroy //菜单下标
    let index = e.currentTarget.dataset.index //产品下标
    let selectGood = that.data.details[categroy].goods[index]
    let selectLable = [];

    for (let i = 0; i < selectGood.lbs.length; i++) {
      // for (let i = 0; i < selectGood.lbs[i]; i++) {
      // }
      selectLable.push(selectGood.lbs[i].lbDetails[0].lable)
    }
    console.log(selectLable)

    that.setData({
      flag: true,
      selectGood: {
        categroy: categroy,
        index: index,
        selectLable: selectLable,
        entity: selectGood
      }
    })
  },

  //待选规格 隐藏
  hidSelLayer: function() {
    var that = this;
    that.setData({
      flag: false
    })
  },

  //点击左边的导航菜单
  LabelTab(e) {
    //console.log(e.target.dataset.id)
    let that = this;
    let tempSelectGood = that.data.selectGood;

    let selectLable = tempSelectGood.selectLable;
    // e.target.dataset.lbindex  标签列表下标
    selectLable[e.target.dataset.lbindex] = e.target.dataset.lable;
    tempSelectGood.selectLable = selectLable;

    that.setData({
      selectGood: tempSelectGood
    })
  },


  //选规格 添加订单
  addOrder: function() {
    var that = this;
    let tempOrders = that.data.orders;
    if (tempOrders.list == undefined) {
      tempOrders.list = []
    }
    if (tempOrders.num == null) {
      tempOrders.num = 0
    }
    if (tempOrders.sumPrice == null) {
      tempOrders.sumPrice = 0
    }

    let isExist = false;
    let list = that.data.orders.list
    for (let i = 0; i < list.length; i++) {
      //相同的菜单 && 相同的规格
      if (list[i].GoodsName == that.data.selectGood.entity.GoodsName &&
        list[i].GoodsInfo.toString() == that.data.selectGood.selectLable.toString()) {
        isExist = true;
        list[i].num += 1;
        list[i].SumPrice = list[i].num * that.data.selectGood.entity.Price;

      }
    }
    if (!isExist) {
      let order = {};
      order["details"] = that.data.selectGood.categroy;
      order["rightIndex"] = that.data.selectGood.index;
      order["GoodsName"] = that.data.selectGood.entity.GoodsName;
      order["GoodsInfo"] = that.data.selectGood.selectLable;
      order["Price"] = that.data.selectGood.entity.Price;
      order["num"] = 1;
      order["SumPrice"] = that.data.selectGood.entity.Price;
      tempOrders.list.push(order);
    }

    tempOrders.num = tempOrders.num + 1;
    tempOrders.sumPrice = tempOrders.sumPrice + that.data.selectGood.entity.Price;

    that.OrderShoppShow();
    let goods = that.data.details[that.data.selectGood.categroy].goods[that.data.selectGood.index];
    if (goods.num == undefined) {
      goods.num = 0;
    }

    that.data.details[that.data.selectGood.categroy].goods[that.data.selectGood.index].num = goods.num + 1;
    that.setData({
      orders: tempOrders,
      details: that.data.details
    })
  },

  //清空购物车，下单完成后 ，初始化界面数据
  initializeData: function() {
    this.setData({
      orders: {},
      details: this.data.details_back
    })
  },

  //结算
  SettlementPrice: function () {

    this.data.orders.user={
      userID:1,
      userName: app.data.userInfo.nickName,
      userPhone:"",
      userAddress: app.data.formatted_address
    }

    let getInfoData = {
      "functionname": "CreateOrder",
      "body": JSON.stringify(this.data.orders)
    };

    //console.log(getInfoData)
    app.daan.fetchPost(getInfoData).then(d => {
      if (d.data.code == 1) {

        wx.showToast({
          title: '下单成功',
          icon: 'success',
          duration: 2000
        })
        this.emptyshopingbtn()
      }
    })

  },

  onShareAppMessage() {
    return {
      title: "西江月·世事一场大梦__苏轼 \
      世事一场大梦，人生几度秋凉？夜来风叶已鸣廊。看取眉头鬓上。\
      酒贱常愁客少，月明多被云妨。中秋谁与共孤光。把盏凄然北望。",
      path: "pages/splash/splash",
      imageUrl: "../images/banner/800.jpg"
    }
  }
})