var app = getApp();
const config = require("../../config.js");

Page({

      /**
       * 页面的初始数据
       */
      data: {
            qq: JSON.parse(config.data).kefu.qq,
            banner: "/images/kefu.jpg"
      },
      onLoad() {

      },

      //复制
      copy(e) {
            wx.setClipboardData({
                  data: e.currentTarget.dataset.copy,
                  success: res => {
                        wx.showToast({
                              title: '复制' + e.currentTarget.dataset.name+'成功',
                              icon: 'success',
                              duration: 1000,
                        })
                  }
            })
      },
})
