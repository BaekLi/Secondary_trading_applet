const db = wx.cloud.database();
const app = getApp();
const config = require("../../config.js");
Page({

      /**
       * 页面的初始数据
       */
      data: {
            ids: -1,
            // phone: '',
            wxnum: '',
            qqnum: '',
            email: '',
            campus: JSON.parse(config.data).campus,
      },
      choose(e) {
            let that = this;
            that.setData({
                  ids: e.detail.value
            })
            //下面这种办法无法修改页面数据
            /* this.data.ids = e.detail.value;*/
      },
      //学号获取
      xhInput(e){
        this.data.xhnum=e.detail.value;
      },
      //专业获取
      zyInput(e) {
        this.data.zyname = e.detail.value;
      },
      getUserInfo(e) {
            let that = this;
            console.log(e);
            let test = e.detail.errMsg.indexOf("ok");
            if (test == '-1') {
                  wx.showToast({
                        title: '请授权后方可使用',
                        icon: 'none',
                        duration: 2000
                  });
            } else {
                  that.setData({
                        userInfo: e.detail.userInfo
                  })
                  that.check();
            }
      },
      //校检
      check() {
            let that = this;
            //校检校区
            let ids = that.data.ids;
            let campus = that.data.campus;
            if (ids == -1) {
                  wx.showToast({
                        title: '请先获取您的校区',
                        icon: 'none',
                        duration: 2000
                  });
            }
            //校检学号
            let xhnum=that.data.xhnum;
            if (!(/^\s*[.0-9]{12}\s*$/.test(xhnum))) {
              wx.showToast({
                title: '请输入正确学号',
                icon: 'none',
                duration: 2000
              });
              return false;
            }
            //校检专业
            let zyname = that.data.zyname;
            if (!(/^[\u4E00-\u9FA5A-Za-z]+$/.test(zyname))) {
              wx.showToast({
                title: '请输入正确专业名称',
                icon: 'none',
                duration: 2000
              });
              return false;
            }
            wx.showLoading({
                  title: '正在提交',
            })
            db.collection('user').add({
                  data: {
                        campus: that.data.campus[that.data.ids],
                        xhnum: that.data.xhnum,
                        zyname:that.data.zyname,
                        stamp: new Date().getTime(),
                        info: that.data.userInfo,
                        useful: true,
                        parse: 0,
                  },
                  success: function(res) {
                        console.log(res)
                        db.collection('user').doc(res._id).get({
                              success: function(res) {
                                    app.userinfo = res.data;
                                    app.openid = res.data._openid;
                                    wx.navigateBack({})
                              },
                        })
                  },
                  fail() {
                        wx.hideLoading();
                        wx.showToast({
                              title: '注册失败，请重新提交',
                              icon: 'none',
                        })
                  }
            })
      },
})
