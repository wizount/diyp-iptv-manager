<template>
  <el-dialog v-model="checkDilgVisible" :width="1150">
    <check-table :source-list="sourceList">
    </check-table>
  </el-dialog>
  <el-upload  v-model:file-list="txtFile" :auto-upload="false" :show-file-list="false" :accept="txtFileAccept" style="display: none;">
    <template #trigger>
      <el-button  ref="txtFileInvoker"></el-button>
    </template>
  </el-upload>
  <div style="padding: 20px;">

    <div style="display: flex;">
      <el-button-group type="primary">
        <el-button @click="invokerFileChoose(parseDiypFile,undefined)" icon="Document">导入diyp</el-button>
        <el-button @click="invokerFileChoose(parseM3uFile,'.m3u,.m3u8')" icon="Document">导入m3u</el-button>
        <el-button @click="invokerFileChoose(parseDiypFile,undefined,true)" icon="DocumentAdd">加入diyp</el-button>
        <el-button @click="invokerFileChoose(parseM3uFile,'.m3u,.m3u8',true)" icon="DocumentAdd">加入m3u</el-button>
      </el-button-group>
      <el-button-group type="primary">
        <el-button @click="combineSame(false)" title="合并相同的组，之后组内相同的频道合并。">合并</el-button>
        <el-button @click="sortSourceByBitrate" title="对每个频道的播放源，根据位率从大到小排序。">排序</el-button>
        <el-button @click="trimSuffix">去掉后缀</el-button>
        <el-button @click="replaceChName">替换</el-button>
      </el-button-group>
      <el-button-group type="info">
        <el-button @click="checkDilgVisible=true">检测...</el-button>
        <el-button @click="exportAsFile(false)">导出</el-button>
        <el-button @click="exportAsFile(true)">导出有用</el-button>
      </el-button-group>
      <el-button-group type="danger">
        <el-button @click="deleteChannels">删除所有</el-button>
        <el-button @click="deleteInvalid">删除无效连接</el-button>
      </el-button-group>
    </div>

    <draggable :list="tvGroupList" group="title" :animation="340" itemKey="name" handle=".drag-icon">
      <template #item="{element:group,index}">
        <div>
          <div class="typeClass" @dblclick="editGroup(index)">{{
              index + 1
            }}、{{ group.name }}
            <span
                class="drag-icon" style="cursor: move;margin-left:5px;padding-top: 4px">

          <el-icon>
            <Operation/>
          </el-icon>
        </span>
            <el-button-group class="chAction">
              <el-button icon="Edit" type="primary" @click="editGroup(index)" title="编辑此分组"></el-button>
              <el-button icon="Plus" type="primary" @click="addGroup(index)" title="添加分组"></el-button>
              <el-button icon="Sort" type="primary" @click="tansferGroup(index)" title="移动分组下的频道" style="transform: rotate(90deg)">
              </el-button>
              <el-button icon="Minus" type="danger" @click="deleteGroup(index)" title="删除此分组"></el-button>
            </el-button-group>

          </div>
          <draggable :list="group.channels" :animation="340" group="style" itemKey="name"
                     style="display: flex;flex-wrap: wrap;">
            <template #item="{element:channel,index:chIdx}">

              <el-badge :value="channel.sources.length" type="primary">
                <div class="channelDiv"
                     @dblclick="popupEdit($event,channel)"
                     :class="{'changed':channel.changed}">

                  <el-text class="num">{{
                      channelNumBegin[index] + chIdx
                    }}
                  </el-text>
                  <el-button-group class="btns chAction">
                    <el-button icon="Edit" type="primary" @click="popupEdit($event,channel)"></el-button>
                    <el-button icon="Minus" type="danger" @click="deleteChannel($event,channel)"></el-button>
                  </el-button-group>
                  {{ channel.name }}
                </div>
              </el-badge>
            </template>
            <template #footer>
              <div
                  style="width: 120px;height: 40px;margin: 3px;display: flex;align-items: center;">
                <el-button text icon="Plus" @click="newChannel($event,group.channels)"></el-button>
              </div>
            </template>

          </draggable>
        </div>

      </template>

    </draggable>
    <div v-show="tvGroupList.length===0" style="text-align: center;color: lightgray;font-size: 40px;margin:100px">
      请导入频道列表
    </div>
    <popup-input ref="editRef" v-if="inEditChannel">
      <div style="width: 600px">
        <el-form>
          <el-form-item label="名称">
            <el-input v-model="inEditChannel.name"></el-input>
          </el-form-item>
          <el-form-item :label="`链接(${inEditChannel.sources.length})`">
            <draggable :list="inEditChannel.sources" style="width: 100%" handle=".drag-icon" item-key="url">
              <template #item="{element:source,index}">
                <div style="display: flex;width: 100%">
                  <el-input style="flex-grow: 1" v-model="source.url" type="textarea" :autosize="{maxRows:3}"/>
                  <span style="cursor:pointer;color: var(--el-color-danger);"
                        @click="inEditChannel.sources.splice(index,1)">
                  <el-icon>
                    <Minus/>
                  </el-icon>
                    </span>
                  <span
                      class="drag-icon" style="cursor: move;margin-left:5px;padding-top: 4px">
                  <el-icon>
                    <Operation/>
                  </el-icon>
                    </span>
                </div>
              </template>
              <template #footer>
                <el-button text icon="Plus" @click="inEditChannel.sources.push({url:''})"></el-button>
              </template>
            </draggable>
          </el-form-item>
        </el-form>

      </div>

    </popup-input>
    <el-dialog v-model="transferChDlgVisible" title="移动频道">
      <el-form-item label="原分组">
        <el-select v-model="sourceGroupIdx">
          <el-option label="未选择" :value="-1"></el-option>
          <el-option v-for="(g,idx) in tvGroupList" :label="g.name" :value="idx" :key="g.name"></el-option>
        </el-select>

      </el-form-item>
      <el-form-item label="频道" v-if="tvGroupList.length>sourceGroupIdx&&sourceGroupIdx>=0">
        <el-checkbox title="全选/取消全选" @change="toggleTransferSelected"></el-checkbox>
        <el-scrollbar :height="200">
          <el-checkbox v-for="ch in tvGroupList[sourceGroupIdx].channels" v-model="ch.checked" :key="ch.name">{{
              ch.name
            }}
          </el-checkbox>
        </el-scrollbar>
      </el-form-item>
      <el-form-item label="目标分组">
        <el-select v-model="targetGroupIdx">
          <el-option label="未选择" :value="-1"></el-option>
          <el-option v-for="(g,idx) in tvGroupList" :label="g.name" :value="idx"></el-option>
        </el-select>
      </el-form-item>

      <template #footer>
        <el-button @click="transferChDlgVisible=false">取消</el-button>
        <el-button @click="doTransfer(sourceGroupIdx,targetGroupIdx)">确定</el-button>
      </template>
    </el-dialog>
  </div>

  <canvas id="canvas"></canvas>
</template>

<script setup>
import Draggable from 'vuedraggable';
import PopupInput from "@/components/PopupInput/index.vue";
import {Minus, Operation, Sort} from "@element-plus/icons-vue";
import {ElMessage, ElMessageBox} from "element-plus";

const tvGroupList = ref([])
const urlSet = new Set();

function parseDiypFile(txt) {
  let groupList = [];
  let temp
  txt.split(/\n|\r\n/).forEach((s) => {
    s = s.trim();
    if (s) {
      if (s.endsWith("#genre#")) {
        let t = s.split(",")[0];
        temp = {
          name: t,
          channels: []
        };
        groupList.push(temp)
      } else {
        let [name, url] = s.split(",");
        if (!name || !url) {
          return false;
        }
        url = url.trim();
        if (!url.match(hostReg)) {
          return false;
        }
        if (temp) {
          let isHave = false;
          for (const c of temp.channels) {
            if (c.name === name) {
              isHave = true;
              !urlSet.has(url) && c.sources.push({url});
              urlSet.add(url);
            }
          }
          if (!isHave) {
            urlSet.add(url);
            temp.channels.push({
              name: name,
              sources: [{url}]
            });
          }
        }
      }
    }
  })
  return groupList;
}

onMounted(() => {
  const tvGroup = getTvGroup();
  if (Array.isArray(tvGroup) && tvGroup.length > 0) {
    tvGroupList.value = tvGroup
  }
})


//region 导入
//diyp文件导入
const txtFileInvoker = ref();
const txtFileAccept = ref();
const txtFile = ref();

//导入的回调函数
let importCallback;
//是否添加到末尾
let isImportAdd;

function invokerFileChoose(callback, accept, add) {
  importCallback = callback;
  isImportAdd = add;

  txtFileAccept.value = accept;
  nextTick(() => {
    txtFileInvoker.value.$el.click();
  })
}

watch(txtFile, () => {
  if (Array.isArray(txtFile.value) && txtFile.value.length >= 1) {
    const reader = new FileReader();
    reader.readAsText(txtFile.value[0].raw);
    txtFile.value = []
    reader.onload = (res) => {
      if (importCallback) {
        const newTvGroupList = importCallback(reader.result);
        if (!newTvGroupList || newTvGroupList.length === 0) {
          ElMessage.info("列表为空或者出错");
          return;
        }
        if (isImportAdd) {
          tvGroupList.value = tvGroupList.value.concat(newTvGroupList);
        } else {

          if (tvGroupList.value.length === 0) {
            tvGroupList.value = newTvGroupList;
          } else {
            ElMessageBox.confirm("导入将删除之前的记录，是否继续操作？").then(res => {
              tvGroupList.value = newTvGroupList;
            })
          }


        }
        combineSame(true);
      }
    };
  }
})

//m3u导入
const groupReg = /group-title="(\S*)"/;

function parseM3uFile(txt) {
  const groupsMap = {};
  const gName = `g${Math.floor(Math.random() * 1000)}`
  if (txt.indexOf("#EXTM3U") === 0) {
    txt = txt.substring(8);
    txt.split("#EXTINF").forEach(s => {

      const splits = s.split(/,|\r\n|\n/);
      if (splits.length >= 3) {
        const url = splits[2];
        if (!url.match(hostReg)) {
          return false;
        }
        let m = splits[0].match(groupReg);
        const gruopName = m && m[1] || gName;
        if (!groupsMap[gruopName]) {
          groupsMap[gruopName] = {
            name: gruopName,
            channels: []
          }
        }
        groupsMap[gruopName].channels.push(
            {
              name: splits[1],
              sources: [{url}]
            })

      }

    })
    return Object.keys(groupsMap).map(k => groupsMap[k])
  } else {
    ElMessage.error("非m3u文件");
  }
}

//endregion

const inEditChannel = ref();


const editRef = ref()

function popupEdit(event, channel) {
  inEditChannel.value = deepClone(channel);
  nextTick(() => {
    editRef.value.popup({x: event.clientX, y: event.clientY}, inEditChannel.value).then((ch => {
      Object.assign(channel, ch);
    }));
  })
}


function newChannel(event, list) {
  inEditChannel.value = {value: "", sources: []};
  nextTick(() => {
    editRef.value.popup({x: event.clientX, y: event.clientY}, inEditChannel.value).then((ch => {
      list.push(ch);
    }));
  })
}

function deleteChannel($event, channel) {
  ElMessageBox.confirm(`是否删除${channel.name}频道？`).then(() => {
    for (const s of tvGroupList.value) {
      for (let i = 0; i < s.channels.length; i++) {
        if (s.channels[i] === channel) {
          s.channels.splice(i, 1);
          return
        }
      }
    }

  })

}

function deleteGroup(index) {
  ElMessageBox.confirm(`是否删除${tvGroupList.value [index].name}分组？`).then(() => {
    tvGroupList.value.splice(index, 1);
  })

}

function addGroup(index) {
  ElMessageBox.prompt("请输入分组名称。", '提醒', {inputPlaceholder: "分组名称"}).then((res) => {
    tvGroupList.value.splice(index + 1, 0, {value: res.value, children: []});
  })

}

function editGroup(index) {
  ElMessageBox.prompt('请输入分组名称', '提醒', {
    inputValue: tvGroupList.value [index].name,
    inputPlaceholder: "分组名称"
  }).then((res) => {
    tvGroupList.value [index].name = res.value;
  })

}

function combineSame(noShowMessage) {
  const groupNameSet = new Set();
  //先合并相同的groupName
  for (let i = 0; i < tvGroupList.value.length; i++) {
    const g1 = tvGroupList.value[i];
    for (let j = i + 1; j < tvGroupList.value.length; j++) {
      const g2 = tvGroupList.value[j];
      if (g1.name === g2.name) {
        groupNameSet.add(g1.name)
        g1.channels = g1.channels.concat(g2.channels);
        tvGroupList.value.splice(j, 1);
        j--;
      }
    }
  }
  !noShowMessage && groupNameSet.size > 0 && ElMessage.info(Array.from(groupNameSet).join(",") + "分组已合并");

  const chanelNameSet = new Set();
  for (const s of tvGroupList.value) {
    const channelNameMap = {};
    for (let i = 0; i < s.channels.length; i++) {
      const channelName = s.channels[i].name;
      if (channelNameMap[channelName] !== undefined) {
        s.channels[channelNameMap[channelName]].sources = s.channels[channelNameMap[channelName]].sources.concat(s.channels[i].sources);
        s.channels[channelNameMap[channelName]].changed = true
        s.channels.splice(i, 1);
        i--;
        chanelNameSet.add(channelName)
      } else {
        channelNameMap[channelName] = i;
      }
    }
  }
  !noShowMessage && chanelNameSet.size > 0 && ElMessage.info(Array.from(chanelNameSet).join(",") + "已合并");
}

const channelNumBegin = ref({})
watch(tvGroupList, () => {
  let begin = 1;
  for (let i = 0; i < tvGroupList.value.length; i++) {
    channelNumBegin.value[i] = begin;
    begin += tvGroupList.value [i].channels.length
  }
  saveTvGroup(tvGroupList.value)
}, {deep: true})


import CheckTable from "@/views/tv/checkTable.vue";
import {deepClone, getScrollTop, getTvGroup, saveTvGroup} from "@/views/tv/utils.js";

const sourceList = computed(() => {
  const res = [];
  for (const s of tvGroupList.value) {
    for (const c of s.channels) {
      for (const source of c.sources) {
        res.push({
          type: s.name,
          channel: c.name,
          source
        })
      }
    }
  }
  return res;
})

//去掉后缀
function trimSuffix() {
  ElMessageBox.prompt("请输入频道后缀，并以','隔开", '输入', {
    inputPlaceholder: "频道后缀",
    inputValue: "高清,标清,HD"
  }).then((res) => {
    const changeResult = [];
    const suffixes = res.value.split(/,|，/)
    for (const s of tvGroupList.value) {
      for (const c of s.channels) {
        suffixes.forEach(s => {
          if (c.name.endsWith(s)) {
            changeResult.push(c.name)
            c.name = c.name.replace(s, "")
            c.changed = true;
          }
        })

      }
    }
    changeResult.length > 0 && ElMessage.info(changeResult.join(",") + "已经更改！")
  })
}

function replaceChName() {
  ElMessageBox.prompt("请输入频道名称要替换的部分文字", {
    inputPlaceholder: "频道后缀",
    inputValue: "-"
  }).then((before) => {
    before.value && ElMessageBox.prompt("要替换后文字", {
      inputPlaceholder: "频道后缀",
      inputValue: before.value
    }).then((after) => {
      const changeResult = [];
      for (const s of tvGroupList.value) {
        for (const c of s.channels) {
          if(c.name.indexOf(before.value)>=0){
            changeResult.push(c.name);
            c.name = c.name.replace(before.value, after.value || "")
          }
        }
      }
      changeResult.length > 0 && ElMessage.info(changeResult.join(",") + "已经更改！")
    });

  })
}

function deleteChannels() {
  ElMessageBox.confirm("是否删除所有频道？").then(res => {
    tvGroupList.value = [];
  })
}

function deleteInvalid() {
  ElMessageBox.confirm("是否删除所有无效的连接？").then(res => {
    for (let i = 0; i < tvGroupList.value.length; i++) {
      for (let j = 0; j < tvGroupList.value[i].channels.length; j++) {
        const channel = tvGroupList.value[i].channels[j];
        for (let k = 0; k < channel.sources.length; k++) {
          const s = channel.sources[k];
          if (s.status === INVALID) {
            channel.sources.splice(k, 1);
            k--;
          }
        }
        if (channel.sources.length === 0) {
          tvGroupList.value[i].channels.splice(j, 1)
          j--;
        }
      }
      if (tvGroupList.value[i].channels.length === 0) {
        tvGroupList.value.splice(i, 1)
        i--;
      }
    }
  })
}

function sortSourceByBitrate() {
  for (const s of tvGroupList.value) {
    for (const c of s.channels) {
      c.sources.sort((a, b) => b.bitrate - a.bitrate)
    }
  }
  ElMessage.info("根据清晰度排序完成")
}


import {saveAs} from 'file-saver'
import {hostReg, INVALID, NORMAL} from "@/views/tv/variable.js";

function exportAsFile(isValid) {
  ElMessageBox.prompt("请输入文件名称", '提醒', {inputPlaceholder: "文件名", inputValue: "tv.txt"}).then((res) => {
    const nameAndUrls = [];
    tvGroupList.value.forEach(g => {
      const channelNameAndUrls = [];
      console.info(g)
      g.channels.forEach(c => {
        c.sources.filter(src => !isValid || src.status === NORMAL).forEach(src => channelNameAndUrls.push(`${c.name},${src.url}`));
      })

      if (channelNameAndUrls.length > 0) {
        nameAndUrls.push(`${g.name},#genre#`);
        nameAndUrls.push(...channelNameAndUrls);
      }

    });
    const blob = new Blob([nameAndUrls.join("\r\n")], {type: 'text/plain;charset=utf-8'})
    saveAs(blob, res.value)
  })
}

const checkDilgVisible = ref(false);


//region 移动频道
const transferChDlgVisible = ref(false);
const sourceGroupIdx = ref(-1);
const targetGroupIdx = ref(-1);

function toggleTransferSelected(e) {
  tvGroupList.value[sourceGroupIdx.value].channels.forEach(ch => ch.checked = e)
}

function tansferGroup(sIdx) {
  sourceGroupIdx.value=sIdx;
  transferChDlgVisible.value=true;
}
function doTransfer(sIdx, tIdx) {
  if (sIdx < 0) {
    ElMessageBox.alert("请选择要移动的原分组");
    return;
  }
  if (tIdx < 0) {
    ElMessageBox.alert("请选择要移动的目标分组");
    return;
  }
  if (sIdx === tIdx) {
    ElMessageBox.alert("原分组和目标分组一样");
    return;
  }
  for (let idx = 0; idx < tvGroupList.value[sIdx].channels.length; idx++) {
    const ch = tvGroupList.value[sIdx].channels[idx];
    if (ch.checked) {
      tvGroupList.value[tIdx].channels.push(ch);
      ch.checked = false;
      tvGroupList.value[sIdx].channels.splice(idx, 1);
      idx--;
    }
  }

}

//endregion
</script>


<style scoped lang="scss">
:deep(.el-badge__content) {
  top: 8px !important;
  right: 25px !important;
}

.chAction {
  :deep(.el-button) {
    padding: 6px;
    height: 25px;
    width: 25px;
  }
}

.typeClass {
  font-size: 120%;
  font-weight: bold;
  margin-top: 10px;
  margin-bottom: 10px;
  display: flex;

  .chAction {
    display: none;
  }

  &:hover {
    .chAction {
      display: unset;
    }
  }
}

.channelDiv {
  width: 120px;
  height: 40px;
  border: 1px lightgray solid;
  margin: 3px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: move;

  .num {
    position: absolute;
    top: 2px;
    left: 5px;
    font-size: 90%;
  }

  .btns {
    display: none;
    z-index: 12;
    position: absolute;
    top: -5px;
    left: 25px;
  }

  &:hover {
    .btns {
      display: unset;
    }
  }

  &.changed {
    background-color: aliceblue;
  }
}

</style>