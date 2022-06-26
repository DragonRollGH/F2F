const app = getApp();
var page;
const db = wx.cloud.database();

const MAX_LIMIT = 20
const NOW = new Date();
const YEAR = NOW.getFullYear();
const DATAS = {}

function onLoad() {
  page = this;

  getDatas();
}

function getDatas() {
  // for collection YEAR
  db.collection(String(YEAR)).count().then(async res => {
    let total = res.total;
    const batchTimes = Math.ceil(total / MAX_LIMIT);
    for (let i = 0; i < batchTimes; i++) {
      await db.collection(String(YEAR)).skip(i * MAX_LIMIT).limit(MAX_LIMIT).get().then(async res => {
        if (DATAS[YEAR]) {
          DATAS[YEAR].concat(res.data);
        } else {
          DATAS[YEAR] = res.data;
        }
      });
    }
    // got collection YEAR
    console.log(DATAS);
    page.setData({
      dayFormatter: dayFormatter,
    });
  });
}

function dayFormatter(day) {
  let y = day.date.getFullYear();
  let m = day.date.getMonth();
  let d = day.date.getDate();

  // 屏蔽选中高亮
  if ("selected" == day.type) {
    day.type = "";
  }

  // 有数据日期高亮
  if (DATAS[y]) {
    if (DATAS[y].find(o => m == o.mm && d == o.dd)) {
      day.type = "selected";
    }
  }

  return day;
}

function onCalendarConfirm(e) {
  let y = e.detail.getFullYear();
  let m = e.detail.getMonth();
  let d = e.detail.getDate();

  let url = `../detail/index?yy=${y}&mm=${m}&dd=${d}`;

  let day_data = DATAS[YEAR].find(o => m == o.mm && d == o.dd);

  if (day_data) {
    url += `&y_id=${day_data._id}&d_id=${day_data.d_id}`;
  }

  wx.navigateTo({
    url: url,
  });
}

Page({
  data:{
    mindate: new Date(YEAR, 0, 1).getTime(),
    maxdate: NOW.getTime(),
    defaultdate: NOW.getTime(),
  },
  onLoad: onLoad,
  onCalendarConfirm: onCalendarConfirm,
})