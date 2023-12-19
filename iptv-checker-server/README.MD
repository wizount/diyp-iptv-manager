# 怎样运行
## 前置条件

需要安装ffmpeg

## 开发
```sh 
npm run dev
```

## 部署
首先
```sh 
npm run build
```
切换到dist目录，然后
```sh 
node iptv-checker-server.js
```
打开 http://localhost:2000

mpeg1muxer.js 参考 https://github.com/kyriesent/node-rtsp-stream/blob/master/mpeg1muxer.js