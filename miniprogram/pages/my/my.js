const app = getApp();
const config = require("../../config.js");
Page({

      /**
       * 页面的初始数据
       */
      data: {
            showShare: false,
            poster: JSON.parse(config.data).share_poster,
            username: '',
            openid: '',
            roomlist: []
      },
      onShow() {
            this.setData({
                  userinfo: app.userinfo
            })
      },
      onLoad: function (options) {
        this.setData({
          openid: app.openid
        })
        var myid = this.data.openid;
        var _this = this;
        var list = []
        wx.cloud.init({
          env: 'baekli-gabjk',
          traceUser: true
        });
        //初始化数据库
        const db = wx.cloud.database();

        console.log("enter A");
        db.collection('rooms').where({
          p_s: myid
        }).get().then(res => {
          console.log(res.data);
          console.log("1111111111111111111");
          if (res.data.length > 0) {
            for (var i = 0; i < res.data.length; i++) {
              var dia = new Object();
              dia.roomid = res.data[i]._id;
              dia.openid = res.data[i].p_b;
              dia.time = "";
              dia.cha = "买家:";
              dia.name = "";
              dia.image = "";
              list.push(dia);
              console.log(list);
              console.log("list111111111111");
            }
            app.roomlist = list;
          }
        })

        console.log("enter B");
        db.collection('rooms').where({
          p_b: myid
        }).get().then(res => {
          console.log(res.data);
          console.log("333333333333333333333");
          if (res.data.length > 0) {
            for (var i = 0; i < res.data.length; i++) {
              var dia = new Object();
              dia.roomid = res.data[i]._id;
              dia.openid = res.data[i].p_s;
              dia.time = "";
              dia.cha = "卖家:";
              dia.name = "";
              dia.image = "";
              list.push(dia);
              console.log(list);
              console.log("list222222222222");
            }
            app.roomlist = list;
          }

        })
      },
      goo() {
        console.log(app.roomlist);
        wx.navigateTo({
          url: '../message/message',
        })
      },
      go(e) {
            if (e.currentTarget.dataset.status == '1') {
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
            }
            wx.navigateTo({
                  url: e.currentTarget.dataset.go
            })
      },
      //展示分享弹窗
      showShare() {
            this.setData({
                  showShare: true
            });
      },
      //关闭弹窗
      closePop() {
            this.setData({
                  showShare: false,
            });
      },
      //预览图片
      preview(e) {
            wx.previewImage({
                  urls: e.currentTarget.dataset.link.split(",")
            });
      },
      onShareAppMessage() {
            return {
                  title: JSON.parse(config.data).share_title,
                  imageUrl: JSON.parse(config.data).share_img,
                  path: '/pages/start/start'
            }

      },
})
