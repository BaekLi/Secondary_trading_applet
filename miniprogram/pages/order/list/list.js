const app = getApp()
const db = wx.cloud.database();
const config = require("../../../config.js");
const _ = db.command;
Page({

      /**
       * 页面的初始数据
       */
      data: {
            scrollTop: 0,
            nomore: false,
            tab: [{
                        name: '全部',
                        id: 0,
                  },
                  {
                        name: '交易中',
                        id: 1,
                  },
                  {
                        name: '交易完成',
                        id: 2,
                  },
                  // {
                  //       name: '已取消',
                  //       id: 3,
                  // }
            ],
            tabid: 0,
      },
      //导航栏切换
      changeTab(e) {
            let that = this;
            that.setData({
                  tabid: e.currentTarget.dataset.id
            })
            that.getlist();
      },
      //跳转详情页
      godetail(e) {
            let that = this;
            let detail = e.currentTarget.dataset.id;
            wx.navigateTo({
                  url: '/pages/detail/detail?scene=' + detail,
            })
      },
      onLoad() {
            wx.showLoading({
                  title: '加载中',
            })
            this.getlist();
      },
      //获取列表
      getlist() {
            let that = this;
            let status = that.data.tabid;
            if (status == 0) {
                  var statusid = _.neq(0); //除-2之外所有
            } else {
                  var statusid = parseInt(status) //小程序搜索必须对应格式
            }
              db.collection('order').where({
                status: statusid,
                _openid: app.openid
              }).orderBy('creat', 'desc').get({
                success(re) {
                  wx.stopPullDownRefresh(); //暂停刷新动作
                  that.setData({
                    nomore: false,
                    page: 0,
                    list: re.data
                  })
                  wx.hideLoading();
                }
              })
      },
      //取消订单(仅当订单为交易中时候，取消后卖家状态恢复)
      cancel(ord) {
            let that = this;
            let detail = ord.currentTarget.dataset.ord;
            wx.showModal({
                  title: '温馨提示',
                  content: '您确认要取消并删除该订单吗',
                  success(res) {
                        if (res.confirm) {
                              wx.showLoading({
                                    title: '正在处理',
                              })
                              db.collection('order').doc(detail._id).remove({
                                success() {
                                  wx.hideLoading();
                                  wx.showToast({
                                    title: '成功取消该订单',
                                  })
                                  that.getList();
                                },
                                fail() {
                                  wx.hideLoading();
                                  wx.showToast({
                                    title: '操作失败',
                                    icon: 'none'
                                  })
                                }
                              })
                          wx.cloud.callFunction({
                            // 云函数名称
                            name: 'node',
                            // 传给云函数的参数
                            data: {
                              _id: detail._id,
                              status: 3
                            },
                            success: function (res) {
                              console.log(res);
                              wx.hideLoading();
                              wx.showToast({
                                title: '成功取消该订单',
                              })
                            },
                            fail() {
                              wx.hideLoading();
                              wx.showToast({
                                title: '操作失败',
                                icon: 'none'
                              })
                            }
                          })
                        }
                  }
            })
      },
      //下拉刷新
      onPullDownRefresh() {
            this.getlist();
      },
      //确认收货
      confirm(ord) {
            let that = this;
            let detail = ord.currentTarget.dataset.ord;
            wx.showModal({
                  title: '温馨提示',
                  content: '您确认已收货吗',
                  success(res) {
                        if (res.confirm) {
                              wx.showLoading({
                                    title: '正在处理',
                              })
                              wx.cloud.callFunction({
                                // 云函数名称
                                name: 'node',
                                // 传给云函数的参数
                                data: {
                                  _id: detail._id,
                                  status: 2
                                },
                                success: function (res) {
                                  console.log(res);
                                  wx.hideLoading();
                                  wx.showToast({
                                    title: '该订单完成交易',
                                  })
                                },
                                fail() {
                                  console.error;
                                  wx.hideLoading();
                                  wx.showToast({
                                    title: '操作失败',
                                    icon: 'none'
                                  })
                                }
                              })
                              db.collection('order').doc(detail._id).update({
                                data: {
                                  status: 2,
                                },
                                success() {
                                  wx.hideLoading();
                                  wx.showToast({
                                    title: '该订单完成交易',
                                  })
                                  that.getList();
                                },
                                fail() {
                                  wx.hideLoading();
                                  wx.showToast({
                                    title: '操作失败',
                                    icon: 'none'
                                  })
                                }
                              })
                        }
                  }
            })
      },

      //删除订单
      delete(ord) {
            let that = this;
            let detail = ord.currentTarget.dataset.ord;
            wx.showModal({
                  title: '温馨提示',
                  content: '您确认要删除此订单吗',
                  success(res) {
                        if (res.confirm) {
                              wx.showLoading({
                                    title: '正在处理',
                              })
                              db.collection('order').doc(detail._id).remove({
                                    success() {
                                          that.getlist();
                                    },
                                    fail: console.error
                              })
                        }
                  }
            })
      },
      //至顶
      gotop() {
            wx.pageScrollTo({
                  scrollTop: 0
            })
      },
      //监测屏幕滚动
      onPageScroll: function(e) {
            this.setData({
                  scrollTop: parseInt((e.scrollTop) * wx.getSystemInfoSync().pixelRatio)
            })
      },
      onReachBottom() {
            this.more();
      },
      //加载更多
      more() {
            let that = this;
            if (that.data.nomore || that.data.list.length < 20) {
                  return false
            }
            let page = that.data.page + 1;
            let status = that.data.tabid;
            if (status == 0) {
                  var statusid = _.neq(0); //除-2之外所有
            } else {
                  var statusid = parseInt(status) //小程序搜索必须对应格式
            }
            db.collection('order').where({
                  status: statusid,
                  _openid: app.openid
            }).orderBy('creat', 'desc').skip(page * 20).limit(20).get({
                  success: function(res) {
                        if (res.data.length == 0) {
                              that.setData({
                                    nomore: true
                              })
                              return false;
                        }
                        if (res.data.length < 20) {
                              that.setData({
                                    nomore: true
                              })
                        }
                        that.setData({
                              page: page,
                              list: that.data.list.concat(res.data)
                        })
                  },
                  fail() {
                        wx.showToast({
                              title: '获取失败',
                              icon: 'none'
                        })
                  }
            })
      },
})
