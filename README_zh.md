# 适用diyp直播节目源导入、导出和编辑，在线测试源的码率(bitrate)
## 怎样运行
### 前置条件
运行iptv-checker-server
未运行不能在线检测源的码率

### 开发
```sh 
npm run dev
```
打开 http://localhost:8080
### 发布
首先
```sh 
npm run build
```
切换到./iptv-checker-server/dist目录，然后
```sh 
node iptv-checker-server.js
```

## 下一步
### 集成在线播放功能

