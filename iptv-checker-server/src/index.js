const express = require('express');
const app = express();
const ws = require("express-ws")
ws(app)


let bitrateReg = /size=\s*(\d*)kB\s*time=\d+:\d+:(\d+\.\d+)\s*bitrate=(\d+\.\d+)kbits\/s\s*speed=(\d+\.\d+)x/;


//console.info("size=    1256kB time=00:00:01.27 bitrate=8037.7kbits/s speed=2.45x".match(bitrateReg))

let mpeg1muxer = require('./mpeg1muxer')
app.ws("/ws", (ws, req) => {
    let mpeg;
    ws.on("close", () => {
        mpeg&&mpeg.stream.kill();
        global.process.stderr.write("本次连接已关闭")
    })
    ws.on("message", (msg) => {
        try {
            let msgArray = JSON.parse(msg);
            if (Array.isArray(msgArray) && msgArray.length >= 2) {
                switch (msgArray[0]) {
                    case "url":
                        let t = new Date().getTime();
                         mpeg = new mpeg1muxer({
                            url: msgArray[1],
                            ffmpegPath: 'ffmpeg',
                            ffmpegOptions: { // options ffmpeg flags
                                '-stats': '', // an option with no neccessary value uses a blank string
                                '-vcodec': 'copy',
                                '-acodec': 'copy'
                            }
                        })
                        mpeg.on("mpeg1data", (data) => {
                            if (!recv) {
                                ws.send(JSON.stringify(["connectedTime", new Date().getTime() - t]))
                                recv = true;
                            }
                        });
                        let recv = false;
                        mpeg.on("ffmpegStderr", (data) => {
                            const s = data.toString();
                            global.process.stderr.write(s)
                            const a = s.match(bitrateReg);

                            if (Array.isArray(a)) {
                                ws.send(JSON.stringify(["bitRate", a[1], a[2], a[3],a[4]]))
                            }

                        })
                        mpeg.on("exit", (data) => {
                            ws.send(JSON.stringify(["exit", data]))
                        })
                        let sec = 10;
                        try {
                            sec = parseInt(msgArray[2])
                            if (sec < 10) {
                                sec = 10;
                            }
                            if (sec > 60) {
                                sec = 60;
                            }
                        } catch (e) {

                        }

                        setTimeout(() => {
                            mpeg.stream.kill();
                            ws.send(JSON.stringify(["exit", "1"]))
                        }, sec * 1000)
                        break;
                }
            }
        } catch (e) {

        }


    })
})
app.use(express.static('client'));


app.listen(2000);