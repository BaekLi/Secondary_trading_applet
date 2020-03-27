const db = wx.cloud.database();
const app = getApp();
const config = require("../../config.js");
Page({
      data: {
            systeminfo: app.systeminfo,
            imgUrl: '',
            entime: {
                  enter: 600,
                  leave: 300
            }, //进入褪出动画时长
            college: JSON.parse(config.data).college.splice(1),
            steps: [
                  {
                        text: '步骤一',
                        desc: '补充物品信息'
                  },
                  {
                        text: '步骤二',
                        desc: '发布成功'
                  },
            ],
      },
      //恢复初始态
      initial() {
            let that = this;
            that.setData({
                  dura: 30,
                  price: 15,
                  place: '',
                  chooseDelivery: 0,
                  cids: '-1', //类别选择的默认值
                  show_b: true,
                  show_c: false,
                  active: 0,
                  chooseCollege: false,
                  note_counts: 0,
                  desc_counts: 0,
                  notes: '',
                  describe: '',
                  good:'',
                  kindid: 0,
                  kind: [{
                        name: '通用',
                        id: 0,
                        check: true,
                  }, {
                        name: '用途',
                        id: 1,
                        check: false
                  }],
                  delivery: [{
                        name: '自提',
                        id: 0,
                        check: true,
                  }, {
                        name: '帮送',
                        id: 1,
                        check: false
                  }],
            })
      },
      onLoad() {
            this.initial();
      },
      //价格输入改变
      priceChange(e) {
            this.data.price = e.detail;
      },
      //时长才输入改变
      duraChange(e) {
            this.data.dura = e.detail;
      },
      //地址输入
      placeInput(e) {
            console.log(e)
            this.data.place = e.detail.value
      },
      //物品输入
      goodInput(e) {
        console.log(e)
        this.data.good = e.detail.value
      },
      //类别选择
      kindChange(e) {
            let that = this;
            let kind = that.data.kind;
            let id = e.detail.value;
            for (let i = 0; i < kind.length; i++) {
                  kind[i].check = false
            }
            kind[id].check = true;
            if (id == 1) {
                  that.setData({
                        kind: kind,
                        chooseCollege: true,
                        kindid: id
                  })
            } else {
                  that.setData({
                        kind: kind,
                        cids: '-1',
                        chooseCollege: false,
                        kindid: id
                  })
            }
      },
      //选择专业
      choCollege(e) {
            let that = this;
            that.setData({
                  cids: e.detail.value
            })
      },
      //取货方式改变
      delChange(e) {
            let that = this;
            let delivery = that.data.delivery;
            let id = e.detail.value;
            for (let i = 0; i < delivery.length; i++) {
                  delivery[i].check = false
            }
            delivery[id].check = true;
            if (id == 1) {
                  that.setData({
                        delivery: delivery,
                        chooseDelivery: 1
                  })
            } else {
                  that.setData({
                        delivery: delivery,
                        chooseDelivery: 0
                  })
            }
      },
      //输入备注
      noteInput(e) {
            let that = this;
            that.setData({
                  note_counts: e.detail.cursor,
                  notes: e.detail.value,
            })
      },
      //输入描述
      describeInput(e) {
        let that = this;
        that.setData({
          desc_counts: e.detail.cursor,
          describe: e.detail.value,
        })
      },
      //发布校检
      check_pub() {
            let that = this;
            //如果用户选择了用途，需要选择用途类别
            if (that.data.kind[1].check) {
                  if (that.data.cids == -1) {
                        wx.showToast({
                              title: '请选择用途',
                              icon: 'none',
                        });
                        return false;
                  }
            }
            //如果用户选择了自提，需要填入详细地址
            if (that.data.delivery[0].check) {
                  if (that.data.place == '') {
                        wx.showToast({
                              title: '请输入地址',
                              icon: 'none',
                        });
                        return false;
                  }
            }
            that.publish();
      },
      //正式发布
      publish() {
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
            if (that.data.good == '') {
              wx.showToast({
                title: '请输入商品名称',
                icon: 'none',
              });
              return false;
            }
            if (that.data.describe == '') {
              wx.showToast({
                title: '请输入商品的详细描述',
                icon: 'none',
              });
              return false;
            }
            if (that.data.imgUrl == '') {
              wx.showToast({
                title: '请选择图片',
                icon: 'none',
              });
              return false;
            }
            wx.showModal({
                  title: '温馨提示',
                  content: '经检测您填写的信息无误，是否马上发布？',
                  success(res) {
                        if (res.confirm) {
                              db.collection('goods').add({
                                data:{
                                  goodsinfo:{
                                    good: that.data.good,
                                    describe: that.data.describe,
                                    pic: that.data.tempFilePaths,
                                  },
                                  key: that.data.good,
                                  status: 0, //0在售；1买家已付款，但卖家未发货；2买家确认收获，交易完成；3、交易作废，退还买家钱款
                                  price: that.data.price, //售价

                                }
                              }),

                              db.collection('publish').add({
                                    data: {
                                          creat: new Date().getTime(),
                                          dura: new Date().getTime() + that.data.dura * (24 * 60 * 60 * 1000),
                                          status: 0, //0在售；1买家已付款，但卖家未发货；2买家确认收获，交易完成；3、交易作废，退还买家钱款
                                          price: that.data.price, //售价
                                          //分类
                                          kindid: that.data.kindid, //区别通用还是用途
                                          collegeid: that.data.cids, //学院id，-1表示通用类
                                          deliveryid: that.data.chooseDelivery, //0自1配
                                          place: that.data.place, //选择自提时地址
                                          notes: that.data.notes, //备注
                                          bookinfo: {
                                                pic: that.data.imgUrl,
                                                good: that.data.good,
                                                describe: that.data.describe,
                                          },
                                          key: that.data.good,
                                    },
                                    success(e) {
                                          console.log(e)
                                          that.setData({
                                                show_b: false,
                                                show_c: true,
                                                active: 2,
                                                detail_id: e._id
                                          });
                                          //滚动到顶部
                                          wx.pageScrollTo({
                                                scrollTop: 0,
                                          })
                                    }
                              })
                        }
                  }
            })
      },
  chooseimage: function () {
    var that = this;
    var timestamp = (new Date()).valueOf();
    wx.chooseImage({
      success: chooseResult => {
        wx.showLoading({
          title: '上传中。。。',
        })
        // 将图片上传至云存储空间
        wx.cloud.uploadFile({
          // 指定上传到的云路径
          cloudPath: timestamp + '.png',
          // 指定要上传的文件的小程序临时文件路径
          filePath: chooseResult.tempFilePaths[0],
          // 成功回调
          success: res => {
            console.log('上传成功', res)
            wx.hideLoading()
            wx.showToast({
              title: '上传图片成功',
            })
            if (res.fileID) {
              that.setData({
                imgUrl: res.fileID
              })
            }

          },
        })
      },
      // count: 1, // 默认9
      // sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      // sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      // success: function (res) {
      //   // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
      //   _this.setData({
      //     tempFilePaths: res.tempFilePaths
      //   })
      // }
    })
  },
      detail() {
            let that = this;
            wx.navigateTo({
                  url: '/pages/detail/detail?scene=' + that.data.detail_id,
            })
      }
})
