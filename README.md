# Applicable for DIYP program source editing and import, online testing of source bitrate (bitrate)

[GitHub deom url](https://wizount.github.io/diyp-iptv-manager/)

## How to run

### Preconditions

If you want to the bitrate of the iptv source, you have to do the things below:
- Install [ffmpeg](https://ffmpeg.org/download.html)



### Development

```sh
npm run dev
```
Switch to ./iptv-checker-server/dist directory, then

```sh
npm run dev
```

Open http://localhost:8080

### Publish

First, in the root directory

```Sh
npm run build
```

Switch to ./iptv-checker-server/dist directory, then
```sh 
npm run build
```
```sh
node iptv-checker-server.js
```



## Next step

### Integrated online playback function

