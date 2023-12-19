const TV_SOURCE = 'tv.source'
const TV_SOURCE_VERSION = '0.01'
const TV_SOURCE_VERSION_KEY = 'TV_SOURCE_VERSION'


export function getTvGroup() {
    // 加入缓存版本的概念，保证缓存数据与程序匹配
    const version = localStorage.getItem(TV_SOURCE_VERSION_KEY)
    if (version !== TV_SOURCE_VERSION) {
        localStorage.setItem(TV_SOURCE_VERSION_KEY, TV_SOURCE_VERSION)
        saveTvGroup([])
        return []
    }

    const str = localStorage.getItem(TV_SOURCE)
    if (str) return JSON.parse(str)
    return []
}

export function saveTvGroup(list) {
    localStorage.setItem(TV_SOURCE, JSON.stringify(list))
}


// 深拷贝对象
export function deepClone(obj) {
    const _toString = Object.prototype.toString

    // null, undefined, non-object, function
    if (!obj || typeof obj !== 'object') {
        return obj
    }

    // DOM Node
    if (obj.nodeType && 'cloneNode' in obj) {
        return obj.cloneNode(true)
    }

    // Date
    if (_toString.call(obj) === '[object Date]') {
        return new Date(obj.getTime())
    }

    // RegExp
    if (_toString.call(obj) === '[object RegExp]') {
        const flags = []
        if (obj.global) {
            flags.push('g')
        }
        if (obj.multiline) {
            flags.push('m')
        }
        if (obj.ignoreCase) {
            flags.push('i')
        }

        return new RegExp(obj.source, flags.join(''))
    }

    const result = Array.isArray(obj)
        ? []
        : obj.constructor
            ? new obj.constructor()
            : {}

    for (const key in obj) {
        result[key] = deepClone(obj[key])
    }

    return result
}


export function getScrollTop() {
    var scroll_top = 0;
    if (document.documentElement && document.documentElement.scrollTop) {
        scroll_top = document.documentElement.scrollTop;
    } else if (document.body) {
        scroll_top = document.body.scrollTop;
    }
    return scroll_top;
}