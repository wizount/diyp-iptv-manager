<template>
  <div>
    <el-table-v2 :height="600" :width="1100" :data="sourceList" :columns="columns">


    </el-table-v2>
    <div style="display: flex;width: 100%">
      <el-checkbox v-model="skipUnreachedHost" style="margin: 5px">跳过相同HOST</el-checkbox>
      <div style="text-align: right;width: 100%;margin: 5px">
        <el-button @click="inRunning=false" :disabled="!inRunning">停止</el-button>
        <el-button type="primary" @click="popupSecDialog(0,batchCheck)" :disabled="inRunning">批量检查</el-button>
      </div>


    </div>

  </div>
</template>
<script setup>
import {ElMessageBox} from "element-plus";
import {hostReg, INVALID, NO_RUN, NORMAL, SKIP, statusMap} from "@/views/tv/variable.js";

const props = defineProps(["sourceList"]);

const skipUnreachedHost = ref(false)
const columns = [
  {
    key: "xh",
    title: '编号',
    headerClass: 'header-center',
    cellRenderer: ({rowIndex}) => `${rowIndex + 1}`,
    align: 'center',
    width: 60
  },
  {
    align: "center",
    key: "type",
    dataKey: "type",
    title: "大类",
    width: 120,
  },
  {
    align: "center",
    key: "channel",
    dataKey: "channel",
    title: "频道",
    width: 160,
  },
  {
    align: "center",
    key: "url",
    dataKey: "source.url",
    title: "url",
    width: 250,
  },
  {
    align: "center",
    key: "connectedTime",
    dataKey: "source.connectedTime",
    title: "连接时间(ms)",
    width: 120,
    cellRenderer: ({rowData}) => {
      const {connectedTime, processing} = rowData.source;
      if (processing && connectedTime === undefined) {
        return h(resolveComponent('el-button'), {text: true, icon: "Loading"}, () => "等待连接")
      } else if (connectedTime > 0) {
        return connectedTime
      }

    },
  },
  {
    align: "center",
    key: "bitrate",
    dataKey: "source.bitrate",
    title: "位率kb/s",
    width: 200,
    cellRenderer: ({rowData}) => {
      const {bitrate, ratio, processing, status} = rowData.source;

      if (processing) {
        return h(resolveComponent('el-progress'), {
          style: {width: '100%'},
          "text-inside": true,
          "stroke-width": 20,
          percentage: ratio
        }, () => bitrate)
      } else {
        if (bitrate) {
          return bitrate;
        } else {
          return h(resolveComponent('el-text'), {type: "warning"}, () => statusMap[status || NO_RUN])
        }

      }

    },
  },
  {
    align: "center",
    key: "check",
    dataKey: "check",
    title: "操作",
    cellRenderer: ({rowData}) => {
      return h(resolveComponent('el-button'), {
        type: 'primary', title: "检查连通情况",
        onclick: () => popupSecDialog(rowData, checkOne)
      }, () => "检查")

    },
  },
]

const unreachedHost = new Set();

function buildWebSocket(path) {
  let {host} = window.location;
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(`ws://${host}/${path}`);
    ws.onopen = () => {
      resolve(ws);
    }
  })
}

function checkOne({source}, sec) {

  sec = sec || 10;
  return new Promise((resolve, reject) => {
    if (!inRunning.value) {
      reject("已停止");
    }
    buildWebSocket("ws").then(ws => {
      ws.onmessage = ({data}) => {
        try {
          let msgArray = JSON.parse(data);
          if (!Array.isArray(msgArray) || msgArray.length < 2) return;
          switch (msgArray[0]) {
            case "bitRate":
              source.bitrate = parseInt(msgArray[3]);
              source.ratio = parseFloat(msgArray[2]) * 100 / parseFloat(msgArray[4]) / sec;
              break;
            case "connectedTime":
              source.connectedTime = msgArray[1];
              break;
            case "exit":
              ws.close();
              source.processing = false;
              if (source.ratio > 0) {
                source.ratio = 100;
                source.status = NORMAL
              } else {
                let a = source.url.match(hostReg);
                if (a != null) {
                  unreachedHost.add(a[2]);
                }
                source.status = INVALID
              }
              if(inRunning.value){
                resolve("next");
              }else{
                reject("已停止");
              }

              break;
          }
        } catch (e) {
          reject(e);
        }
      }
      source.connectedTime = undefined;
      source.ratio = 0;
      source.status = NO_RUN;
      source.processing = true;
      source.bitrate = undefined;
      ws.send(JSON.stringify(["url", source.url, sec]));

    });
  })

}

let inputSec = undefined;

function popupSecDialog(param, callback) {
  if (!inputSec) {
    ElMessageBox.prompt("请输入测试时间（秒）", '提醒', {
      inputPlaceholder: "测试时间",
      inputValue: "10",
      inputPattern: /^[1-5][0-9]|60$/,
      inputType: Number,
      inputErrorMessage: "测试时间在10到60之间"
    }).then((res) => {
      inRunning.value=true;
      inputSec = res.value
      callback(param, res.value)
    });
  } else {
    inRunning.value=true;
    callback(param, inputSec)
  }

}

const inRunning = ref(false);

function batchCheck(idx, sec) {
  if (idx === 0) {
    unreachedHost.clear();
  }
  if (idx >= props.sourceList.length) {
    return;
  }

  const nextSrc = props.sourceList[idx];
  let isUnreached = false;
  if (skipUnreachedHost.value) {
    const a = nextSrc.source.url.match(hostReg);
    if (a != null) {
      if (unreachedHost.has(a[2])) {
        nextSrc.source.status = SKIP
        isUnreached = true;
      }
    }
  }
  if ((nextSrc.source.bitrate > 0 && nextSrc.source.ratio === 100) || isUnreached || nextSrc.source.status === INVALID) {
    return batchCheck(idx + 1, sec);
  }
  checkOne(nextSrc, sec).then(r => {
    batchCheck(idx + 1, sec);
  }).catch(e => {
    ElMessageBox.alert(e)
  })
}
</script>
<style scoped>

</style>