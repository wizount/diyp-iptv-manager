# Applicable for DIYP program source editing and import, online testing of source bitrate (bitrate)

[GitHub deom url](https://wizount.github.io/diyp-iptv-manager/)

## How to run

### Preconditions
Run iptv checker server
The bitrate of the source cannot be detected online without running it
### Development

```sh
npm run dev
```

Open http://localhost:8080

### Publish

First

```Sh
npm run build
```

Switch to ./iptv-checker-server/dist directory, then

```sh
node iptv checker server.js
```



## Next step

### Integrated online playback function

