const app = getApp()
const db = wx.cloud.database();
const config = require("../../../config.js");
const _ = db.command;
Page({

      /**
       * 页面的初始数据
       */
      data: {
            list: [],
            page: 1,
            scrollTop: 0,
            nomore: false,
      },

      /**
       * 生命周期函数--监听页面加载
       */
      onLoad: function(options) {
            wx.showLoading({
                  title: '加载中',
            })
            this.getList();
      },
      getList() {
            let that = this;
            db.collection('publish').where({
                  _openid: app.openid
            }).orderBy('creat', 'desc').limit(20).get({
                  success: function(res) {
                        wx.hideLoading();
                        wx.stopPullDownRefresh(); //暂停刷新动作
                        that.setData({
                              list: res.data,
                              nomore: false,
                              page: 0,
                        })
                        console.log(res.data)
                  }
            })
      },
      //删除
      del(e) {
            let that = this;
            let del = e.currentTarget.dataset.del;
            wx.showModal({
                  title: '温馨提示',
                  content: '您确定要删除此条订单吗？',
                  success(res) {
                        if (res.confirm) {
                              wx.showLoading({
                                    title: '正在删除'
                              })
                              db.collection('publish').doc(del._id).remove({
                                    success() {
                                      // db.collection('goods').doc(del._id).remove({
                                      //   success(){
                                          wx.hideLoading();
                                          wx.showToast({
                                            title: '成功删除',
                                          })
                                          that.getList();
                                      //   },
                                      //   fail(){
                                      //     wx.hideLoading();
                                      //     wx.showToast({
                                      //       title: '删除失败',
                                      //       icon: 'none'
                                      //     })
                                      //   }
                                      // })
                                    },
                                    fail() {
                                          wx.hideLoading();
                                          wx.showToast({
                                                title: '删除失败',
                                                icon: 'none'
                                          })
                                    }
                              })
                        }
                  }
            })
      },
      //擦亮
      crash(e) {
            let that = this;
            let crash = e.currentTarget.dataset.crash;
            wx.showModal({
                  title: '温馨提示',
                  content: '您确定要擦亮此条订单吗？',
                  success(res) {
                        if (res.confirm) {
                              wx.showLoading({
                                    title: '正在擦亮'
                              })
                              db.collection('publish').doc(crash._id).update({
                                    data: {
                                          creat: new Date().getTime(),
                                          dura: new Date().getTime() + 7 * (24 * 60 * 60 * 1000), //每次擦亮管7天
                                    },
                                    success() {
                                          wx.hideLoading();
                                          wx.showToast({
                                                title: '成功擦亮',
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
      //取消交易
      quxiao(e){
        let that = this;
        let quxiao = e.currentTarget.dataset.quxiao;
        wx.showModal({
          title: '温馨提示',
          content: '您确定要取消此条订单吗？',
          success(res) {
            if (res.confirm) {
              wx.showLoading({
                title: '正在取消'
              })
              db.collection('publish').doc(quxiao._id).update({
                data: {
                  status: 3,
                },
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
                name: 'sell',
                // 传给云函数的参数
                data: {
                  _id: quxiao._id,
                },
                success: function (res) {
                  console.log(res)
                },
                fail: console.error
              })
            }
          }
        })
      },
      //完成交易
      wancheng(e){
        let that = this;
        let wancheng = e.currentTarget.dataset.wancheng;
        wx.showModal({
          title: '温馨提示',
          content: '您确定要此条订单完成了吗？',
          success(res) {
            if (res.confirm) {
              wx.showLoading({
                title: '正在操作'
              })
              db.collection('order').doc(wancheng._id).get({
                success(e) {
                  if (e.data.status == 2) {
                    wx.hideLoading();
                    wx.showToast({
                      title: '该订单完成交易',
                    })
                    that.getList();
                  } else {
                    wx.hideLoading();
                    wx.showToast({
                      title: '买家未确认，操作失败',
                      icon: 'none'
                    })
                  }
                }
              })
            }
          }
        })
      },
      //重新上架
      up(e) {
        let that = this;
        let up = e.currentTarget.dataset.up;
        wx.showModal({
          title: '温馨提示',
          content: '您确定要重新上架该商品吗？',
          success(res) {
            if (res.confirm) {
              wx.showLoading({
                title: '正在操作'
              })
              db.collection('publish').doc(up._id).update({
                data: {
                  status: 0,
                },
                success() {
                  wx.hideLoading();
                  wx.showToast({
                    title: '该商品成功上架',
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
      //查看详情
      detail(e) {
            let that = this;
            let detail = e.currentTarget.dataset.detail;
            if (detail.status == 0 || detail.status == 1 || detail.status == 2 || detail.status == 3) {
                  wx.navigateTo({
                        url: '/pages/detail/detail?scene=' + detail._id,
                  })
            }
      },
      //下拉刷新
      onPullDownRefresh() {
            this.getList();
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
            db.collection('publish').where({
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
