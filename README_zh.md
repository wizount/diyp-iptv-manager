# 适用diyp直播节目源导入、导出和编辑，在线测试源的码率(bitrate) 

[GitHub演示地址](https://wizount.github.io/diyp-iptv-manager/)

## 怎样运行
### 前置条件
如果你需要在线测试直播源的码率，请安装[ffmpeg](https://ffmpeg.org/download.html)

### 开发
```sh 
npm run dev
```
切换到./iptv-checker-server/dist目录，然后
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
npm run build
```
```sh 
node iptv-checker-server.js
```

## 下一步
### 集成在线播放功能

