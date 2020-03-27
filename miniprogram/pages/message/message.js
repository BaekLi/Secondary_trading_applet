const app = getApp()
let time = require('../../utils/util.js');

Page({

  data: {
    roomlist:[],
    openid:''

  },

  onLoad: function (options) {
    this.setData({
      openid: app.openid,
      roomlist: app.roomlist
    })
    this.findtime();
    var test = setTimeout(this.timesort, "1000");

  },
  findtime() {
    console.log("111111111111111111111111111");
    wx.cloud.init({
      env: 'baekli-gabjk',
      traceUser: true
    });
    //初始化数据库
    const db = wx.cloud.database();
    var list = this.data.roomlist;
    var that = this;
    console.log(list);
    for (var i = 0; i < list.length; i++) {
      (function (i) {
        db.collection('chatroom').where({
          groupId: list[i].roomid
        }).get().then(res => {
          console.log("输出聊天数据" + res.data.length);
          console.log(res.data);
          //list[i].time = time.formatTime(res.data[res.data.length - 1].sendTime);
          list[i].time = res.data[res.data.length - 1].sendTime;
          that.setData({
            roomlist: list
          })
          console.log(list);
        })

      })(i);
    }
  },
  timesort() {
    this.data.roomlist.sort(function (a, b) {

      console.log(a.time);
      console.log(b.time);
      if (a.time > b.time) {
        console.log("变变变");
        return -1;
      } else if (a.time == b.time) {
        console.log("不变变");
        return 0;
      } else {
        console.log("我也不变变");
        return 1;
      }

    });
    var test1 = setTimeout(this.changetime, "1000");

  },
  changetime() {
    var list = this.data.roomlist
    for (var i = 0; i < list.length; i++) {
      console.log("改格式" + time.formatTime(list[i].time));
      list[i].time = time.formatTime(list[i].time);
    }
    this.setData({
      roomlist: list
    })
  },
  go(e) {
    wx.navigateTo({
      url: '../detail/room/room?id=' + e.currentTarget.dataset.id,
    })
  },
  onShow(){
    console.log("2222222222222222222222222222222")
    wx.cloud.init({
      env: 'baekli-gabjk',
      traceUser: true
    });
    //初始化数据库
    const db = wx.cloud.database();
    var list = this.data.roomlist;
    var that = this;
    console.log(list);
    for (var i = 0; i < list.length; i++) {
      (function (i) {
        db.collection('user').where({
          _openid: list[i].openid
        }).get().then(res => {
          console.log(res.data[0]);
          list[i].image = res.data[0].info.avatarUrl;
          list[i].name = res.data[0].info.nickName;
          //list[i].name = res.data[0]._id;
          that.setData({
            roomlist: list
          })
          console.log(list);
        })
      })(i);
    }
  }
  

  
})
