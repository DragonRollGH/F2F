//index.js
const app = getApp();
var page;
const db = wx.cloud.database();
// const tb = db.collection('F2F');

var isF2F;
var lastF2F;
var timeStamp = new Date().getTime();
var show = 0;

function checkin() {
  let now = new Date();
  timeStamp = now;
  isF2F = true;
  page.setData({
    mainBtnClr: "white",
    ST: now.toLocaleTimeString(),
    ET: "&nbsp;",
  })
  tb.add({
    data: {
      ST: now,
      SR: 1,
    },
    success: (res) => {
      tb.doc('index').update({
        data: {
          isF2F: true,
          new_id: res._id
        }
      });
    }
  })
}

function checkout() {
  let now = new Date();
  timeStamp = now;
  isF2F = false;
  page.setData({
    mainBtnClr: "gray",
    ET: now.toLocaleTimeString(),
  })
  tb.doc('index').get({
    success: res => {
      tb.doc(res.data.new_id).update({
        data: {
          ET: now,
          ER: 1,  
        },
        success: (res) => {
          tb.doc('index').update({
            data: {
              isF2F: false,
            }
          });
        }
      })
    }
  })
}

function loadDatabase(cb) {
  tb.doc('index').get({
    success: res => {
      isF2F = res.data.isF2F;
      tb.doc(res.data.new_id).get({
        success: ress => {
          lastF2F = ress.data;
          cb();
        }
      })
    }
  })
}

function initPage() {
  console.log("initPage()");
  if (isF2F) {
    timeStamp = lastF2F.ST;
    page.setData({
      mainBtnClr: "white",
      ST: lastF2F.ST.toLocaleTimeString(),
    });
  } else {
    timeStamp = lastF2F.ET;
    page.setData({
      mainBtnClr: "gray",
      ST: lastF2F.ST.toLocaleTimeString(),
      ET: lastF2F.ET.toLocaleTimeString(),
    })
  }
}
 
function mainBtn() {
  page.setData({
    mainBtnTxt: "0分0秒"
  });
  isF2F ? checkout() : checkin();
}

function onLoad() {
  page = this;
  tb.get({
    success: res => {
      console.log(res.data);
      let timeTable = [];
      for (let t in res.data) {
        if (res.data[t].ST && res.data[t].ET) {
          timeTable.unshift({
            DT: res.data[t].ST.toLocaleDateString(),
            ST: res.data[t].ST.toLocaleTimeString(),
            ET: res.data[t].ET.toLocaleTimeString(),
          });
        }
      }
      page.setData({
        timeTable: timeTable,
      })
    }
  })
  loadDatabase(initPage);
  setInterval(() => {
    let nows = new Date() - timeStamp;
    let now = new Date(nows - 8*3600000); 
    if(nows < 3600000) {  // 1 hour
      page.setData({
        mainBtnTxt: `${now.getMinutes()}分${now.getSeconds()}秒`
      });
    } else if (nows < 24*3600000) {  // 1 day
      page.setData({
        mainBtnTxt: `${now.getHours()}时${now.getMinutes()}分`
      });
    } else {
      page.setData({
        mainBtnTxt: `${Math.floor(now / (24*3600000))}天${now.getHours()}时`
      });
    }
  },1000);
  wx.getSystemInfo({
    success: e => {
      this.globalData.StatusBar = e.statusBarHeight;
      let custom = wx.getMenuButtonBoundingClientRect();
      this.globalData.Custom = custom;  
      this.globalData.CustomBar = custom.bottom + custom.top - e.statusBarHeight;
    }
  });
}


Page({
  data:{
    mainBtnTxt: "0分0秒",
    mainBtnClr: "white",
    ST: "&nbsp;",
    ET: "&nbsp;",
    listData:[
      {"code":"01","text":"text1","type":"type1"},
      {"code":"02","text":"text2","type":"type2"},
      {"code":"03","text":"text3","type":"type3"},
      {"code":"04","text":"text4","type":"type4"},
      {"code":"05","text":"text5","type":"type5"},
      {"code":"06","text":"text6","type":"type6"},
      {"code":"07","text":"text7","type":"type7"}
    ],
    show: show,
    fold: [
      {i:2200, n:'2022', v:0, m:[
        {i:2201, n:'&emsp;2022-01',v:0},
        {i:2202, n:'&emsp;2022-02',v:1},
      ]},
      {i:2100, n:'2021', v:1, m:[
        {i:2101, n:'&emsp;2021-01',v:1},
        {i:2102, n:'&emsp;2021-02',v:1},
      ]},
    ],
  },
  mainBtn: mainBtn,
  onLoad: onLoad,
  ontap1: ()=>{
    show = !show;
    page.setData({
      show:show,
      fold:{
        code: 0,
      }
    })
    console.log("1");
  }
})