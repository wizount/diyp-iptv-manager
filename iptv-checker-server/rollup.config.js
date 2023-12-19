// 导入依赖
const terser  = require('@rollup/plugin-terser')
const json= require( '@rollup/plugin-json')
const commonjs = require('@rollup/plugin-commonjs')
const resolve= require( '@rollup/plugin-node-resolve')


module.exports = {
    // 项目入口
    input: 'src/index.js',
    external: id => /config.js/.test(id),

// 打包后的出口和设置
    output: {
        file: 'dist/iptv-checker-server.js',
        format: 'cjs',
        sourcemap: true,
        exports: 'default',
    },

// 使用的插件
// 注意，这里的插件使用是有顺序的，先把ts编译为js，然后查找依赖，最后压缩
    plugins: [resolve(),commonjs(),json(), terser()],
}
