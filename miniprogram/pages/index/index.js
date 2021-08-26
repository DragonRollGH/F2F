//index.js
const app = getApp();
var page;
// const db = wx.cloud.database();
// const tb = db.collection('F2F')

var isF2F;
var lastF2F;
var timeStamp = new Date().getTime();

function loadDatabase(cb) {
  tb.doc('index').get({
    success: res => {
      isF2F = res.data.isF2F;
      tb.doc(res.data.new_id).get({
        success: ress => {
          console.log(ress.data); //
          lastF2F = ress.data;
          cb();
        }
      })
    }
  })
}

function initPage() {
  if (isF2F) {
    let a = new Date();

    console.log(a.toLocaleTimeString());
    console.log(a - lastF2F.ET);
    page.setData({
    })
  }
  
}
 
function mainBtn() {
  timeStamp = new Date().getTime();
  page.setData({
    mainBtnTxt: "0时0分0秒"
  });
}

function onLoad() {
  page = this;
  // loadDatabase(initPage);
  setInterval(() => {
    let now = new Date(new Date() - timeStamp);
    page.setData({
      mainBtnTxt: `${now.getHours()-8}时${now.getMinutes()}分${now.getSeconds()}秒`
    });
  },1000);
}


Page({
  data:{
    mainBtnTxt: "0时0分0秒",
    ST: "&nbsp;",
    ET: "&nbsp;",
  },
  mainBtn: mainBtn,
  onLoad: onLoad,

})