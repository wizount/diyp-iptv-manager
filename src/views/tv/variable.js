export const hostReg = /(https|http|rtsp):\/\/(\S*?)\//;
//console.info("rtsp://27.148.240.181/PLTV/88888888/224/3221227241/72237896.smil?rrsip=27.148.240.138&zoneoffset=480&icpid=bestv&accounttype=1&limitflux=-1&limitdur=-1&tenantId=8601&accountinfo=%7E%7EV2.0%7E-URhBZerC1gKSoaA5zOz0Q%7EjGm1nMLk4fAVMkSgAzJBUhzV3FsM_Pwl359x8sMnxSXgVu68DlfTA-ekkvHbrN0qsTFNFNP1nC0XGdLP6Urlgv3Mb4oLsLUCh2Q16OpDKM4%7EExtInfoWNHSPSTb%2B3AG0FnUkYLPMw%3D%3D%2CEND&GuardEncType=2\n".match(hostReg))
//console.info("rtsp://27.148.237.40:554/live/ch20122816292".match(hostReg));

export const NO_RUN = -1;
export const INVALID = -2;
export const SKIP = 2;
export const NORMAL = 2;
export const statusMap = {
    "-1": "未确定",
    "-2": "源可能不能使用",
    "1": "跳过",
    "2": "正常"
}