//index.js
const app = getApp();
var page;
const db = wx.cloud.database();
// const tb = db.collection('F2F');

var edit = {
  key: null,
  value: null
};

const DETAIL = {
  "_id": "17e3426e62235ecd1201a1015026e56f",
  "NO": 2.0,
  "ST": "06:54",
  "ET": "12:55",
  "EV": [
      {
          "LOC": {
              "I": "location",
              "S": "地点1"
          },
          "CON": {
              "I": "footprint",
              "S": "散步"
          },
          "DET": [
              {
                  "I": "drink",
                  "S": "喜茶1"
              },
              {
                  "I": "drink",
                  "S": "喜茶2"
              },
              {
                  "I": "drink",
                  "S": "喜茶3"
              },
          ]
      },
      {
          "LOC": {
              "I": "location",
              "S": "地点2"
          },
          "CON": {
              "I": "food",
              "S": "午饭"
          },
          "DET": [
              {
                  "I": "hambergur",
                  "S": "猪扒包"
              }
          ]
      }
  ]
}



function onLoad() {
  page = this;
}

function updateDetail() {
  var idxs = edit.key.split('.');
  console.log(idxs);
  switch (idxs.length) {
    case 1:
      DETAIL[idxs[0]] = edit.value;
      break;
    case 2:
      DETAIL[idxs[0]][idxs[1]] = edit.value;
      break;
    case 3:
      DETAIL[idxs[0]][idxs[1]][idxs[2]] = edit.value;
      break;
    case 4:
      DETAIL[idxs[0]][idxs[1]][idxs[2]][idxs[3]] = edit.value;
      break;
    case 5:
      DETAIL[idxs[0]][idxs[1]][idxs[2]][idxs[3]][idxs[4]] = edit.value;
      break;
    default:
      break;
  }
  page.setData({
    DETAIL: DETAIL,
  });
  console.log(DETAIL);
}


function pressToEdit(e) {
  edit.key = e.currentTarget.id;
  console.log(e);
  modalShow();
}

function modalShow() {
  page.setData({
    modal_hidden: false
  });
}

function modalHide() {
  page.setData({
    modal_hidden: true,
    input_value: ""
  });
}

function onModalConfirm() {
  updateDetail();
  modalHide();
}

function onModalCancel() {
  edit.key = null;
  edit.value = null;
  modalHide();
}

function onInputPress() {
  console.log("changeIcon");
}

function onInputConfirm(e) {
  edit.value = e.detail.value;
}


Page({
  data:{
    DETAIL: DETAIL,
    modal_hidden: true,
  },
  onLoad: onLoad,
  pressToEdit: pressToEdit,
  modalShow: modalShow,
  onModalConfirm: onModalConfirm,
  onModalCancel: onModalCancel,
  onInputPress: onInputPress,
  onInputConfirm: onInputConfirm,
})