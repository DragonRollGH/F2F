//index.js
const app = getApp();
var page;
const db = wx.cloud.database();
const tb = db.collection('F2F')

var isF2F;
var lastF2F;
var timeStamp = new Date().getTime();

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
}


Page({
  data:{
    mainBtnTxt: "0分0秒",
    mainBtnClr: "white",
    ST: "&nbsp;",
    ET: "&nbsp;",
  },
  mainBtn: mainBtn,
  onLoad: onLoad,

})