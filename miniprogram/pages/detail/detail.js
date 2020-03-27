const app = getApp()
const db = wx.cloud.database();
const config = require("../../config.js");
const _ = db.command;
let obj = ''
Page({

      /**
       * 页面的初始数据
       */
      data: {
            first_title: true,
            place: '',
            roomID: '此处为聊天室ID',
            goodssaller: '',
            openid: ''
      },
      onLoad(e) {
            obj=e;
            this.getuserdetail();
            this.data.id = e.scene;
            this.getPublish(e.scene);
            if (app.openid) {
              this.setData({
                openid: app.openid
              })
            } else {
              console.log("no openid");
                wx.showModal({
                  title: '温馨提示',
                  content: '该功能需要注册方可使用，是否马上去注册',
                  success(res) {
                    if (res.confirm) {
                      wx.navigateTo({
                        url: '/pages/login/login',
                      })
                    }
                  }
                })
                return false
              }
      },
      goo(e) {
        var myid = this.data.openid;
        var sallerid = this.data.goodssaller;
        console.log(sallerid)
        wx.cloud.init({
          env: 'baekli-gabjk',
          traceUser: true
        });
        //初始化数据库
        const db = wx.cloud.database();
        db.collection('rooms').where({
          p_b: myid,
          p_s: sallerid
        }).get().then(res => {
          console.log(res.data);
          if (res.data.length > 0) {
            this.setData({
              roomID: res.data[0]._id
            })

            wx.navigateTo({
              url: 'room/room?id=' + this.data.roomID,
            })

          } else {

            db.collection('rooms').add({
              data: {
                p_b: myid,
                p_s: sallerid
              },

            }).then(res => {
              console.log(res)
              this.setData({
                roomID: res._id
              })
              wx.navigateTo({
                url: 'room/room?id=' + this.data.roomID,
              })
            })
          }
        })
      },


      changeTitle(e) {
            let that = this;
            that.setData({
                  first_title: e.currentTarget.dataset.id
            })
      },
      //获取发布信息
      getPublish(e) {
            let that = this;
            db.collection('publish').doc(e).get({
                  success: function(res) {
                        that.setData({
                              collegeName: JSON.parse(config.data).college[parseInt(res.data.collegeid) + 1],
                              publishinfo: res.data
                        })
                        that.getSeller(res.data._openid)
                  }
            })
      },
      //获取卖家信息
      getSeller(m, n) {
            let that = this;
            db.collection('user').where({
                  _openid: m
            }).get({
                  success: function(res) {
                    console.log(res.data[0]._openid);
                        that.setData({
                              userinfo: res.data[0],
                              goodssaller:res.data[0]._openid
                        })
                        that.getBook(n)
                  }
            })
      },
      //回到首页
      home() {
            wx.switchTab({
                  url: '/pages/index/index',
            })
      },
      //回到我的
      my(){
            wx.switchTab({
              url: '/pages/my/my',
            })
      },
      //购买检测
      buy() {
            let that = this;
            if (!app.openid) {
                  wx.showModal({
                        title: '温馨提示',
                        content: '该功能需要注册方可使用，是否马上去注册',
                        success(res) {
                              if (res.confirm) {
                                    wx.navigateTo({
                                          url: '/pages/login/login',
                                    })
                              }
                        }
                  })
                  return false
            }
            if (that.data.publishinfo.deliveryid == 1) {
                  if (that.data.place == '') {
                        wx.showToast({
                              title: '请输入您的收货地址',
                              icon: 'none'
                        })
                        return false
                  }
                  that.getStatus();
            }
            that.getStatus();
      },
      //获取订单状态
      getStatus() {
            let that = this;
            let _id = that.data.publishinfo._id;
            console.log(_id);
            db.collection('publish').doc(_id).get({
                  success(e) {
                        if (e.data.status == 0) {
                          that.creatOrder(_id);
                        } 
                        if (e.data.status == 1){
                              wx.showToast({
                                title: '该物品刚刚被抢光了~',
                                icon: 'none'
                              })
                        }
                       if (e.data.status == 2){
                              wx.showToast({
                                    title: '该物品已出售',
                                    icon: 'none'
                              })
                        }
                        if (e.data.status == 3) {
                          wx.showToast({
                            title: '该物品已下架',
                            icon: 'none'
                          })
                        }
                  }
            })
      },
      //创建订单
      creatOrder(iid) {
            let that = this;
            console.log(iid);
            wx.showModal({
                  title: '确认提示',
                  content: '是否确认下单购买此商品？',
                  success(res) {
                    if (res.confirm) {
                      wx.cloud.callFunction({
                        // 云函数名称
                        name: 'node',
                        // 传给云函数的参数
                        data: {
                          _id: iid,
                          status: 1
                        },
                        success: function (res) {
                          console.log(res)
                        },
                        fail: console.error
                      })
                      db.collection('publish').doc(iid).update({
                        data: {
                          status: 1
                        }, 
                        success() {
                          wx.hideLoading();
                          // that.getList();
                          db.collection('order').add({
                            data: {
                              creat: new Date().getTime(),
                              status: 1, //0在售；1买家已付款，但卖家未发货；2买家确认收获，交易完成；
                              price: that.data.publishinfo.price, //售价
                              deliveryid: that.data.publishinfo.deliveryid, //0自1配
                              ztplace: that.data.publishinfo.place, //自提时地址
                              psplace: that.data.place, //配送时买家填的地址
                              bookinfo: {
                                describe: that.data.publishinfo.bookinfo.describe,
                                pic: that.data.publishinfo.bookinfo.pic,
                                good: that.data.publishinfo.bookinfo.good,
                              },
                              seller: that.data.publishinfo._openid,
                              sellid: that.data.publishinfo._id,
                              _id: that.data.publishinfo._id,
                            },
                            success() {
                              wx.showToast({
                                title: '成功预订！',
                                icon: 'none'
                              })
                            },
                            fail() {
                              wx.hideLoading();
                              wx.showToast({
                                title: '发生异常，请及时和管理人员联系处理',
                                icon: 'none'
                              })
                            }
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
                      that.onLoad(obj);
                    }
                  }
            })
      },
      //路由
      go(e) {
            wx.navigateTo({
                  url: e.currentTarget.dataset.go,
            })
      },
      //地址输入
      placeInput(e) {
            this.data.place = e.detail.value
      },
      //为了数据安全可靠，每次进入获取一次用户信息
      getuserdetail() {
            if (!app.openid) {
                  wx.cloud.callFunction({
                        name: 'regist', // 对应云函数名
                        data: {
                              $url: "getid", //云函数路由参数
                        },
                        success: re => {
                              db.collection('user').where({
                                    _openid: re.result
                              }).get({
                                    success: function(res) {
                                          if (res.data.length !== 0) {
                                                app.openid = re.result;
                                                app.userinfo = res.data[0];
                                                console.log(app)
                                          }
                                          console.log(res)
                                    }
                              })
                        }
                  })
            }
      },
      //客服跳动动画
      kefuani: function() {
            let that = this;
            let i = 0
            let ii = 0
            let animationKefuData = wx.createAnimation({
                  duration: 1000,
                  timingFunction: 'ease',
            });
            animationKefuData.translateY(10).step({
                  duration: 800
            }).translateY(0).step({
                  duration: 800
            });
            that.setData({
                  animationKefuData: animationKefuData.export(),
            })
            setInterval(function() {
                  animationKefuData.translateY(20).step({
                        duration: 800
                  }).translateY(0).step({
                        duration: 800
                  });
                  that.setData({
                              animationKefuData: animationKefuData.export(),
                        })
                        ++ii;
                  console.log(ii);
            }.bind(that), 1800);
      },
      onReady() {
            this.kefuani();
      }
})