import {defineConfig, loadEnv} from 'vite'
import path from 'path'
import createVitePlugins from './vite/plugins'

// 部署在网站
export default defineConfig(({mode, command}) => {
    const env = loadEnv(mode, process.cwd())
    const {VITE_APP_ENV} = env
    return {
        base: VITE_APP_ENV === 'production' ? '/' : '/',
        plugins: createVitePlugins(env, 'build'),
        build:{
            outDir:'./iptv-checker-server/dist/client'
        },
        // build:{
        //   outDir:"./dist",
        // },
        resolve: {
            // https://cn.vitejs.dev/config/#resolve-alias
            alias: {
                // 设置路径
                '~': path.resolve(__dirname, './'),
                // 设置别名
                '@': path.resolve(__dirname, './src')
            },
            // https://cn.vitejs.dev/config/#resolve-extensions
            extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue']
        },
        // vite 相关配置
        server: {
            port: 8080,
            host: true,
            open: true,
            proxy: {
                // https://cn.vitejs.dev/config/#server-proxy

                '/check': {
                    target: 'http://localhost:2000',
                    changeOrigin: true,
                    rewrite: (p) => p.replace(/^\/check/, '/check')
                },
                '/ws': {
                    target: 'http://127.0.0.1:2000',
                    ws: true,
                    changeOrigin: true,
                    rewrite: (p) => p.replace(/^\/ws/, '/ws')
                },
            }
        },
        css: {
            postcss: {
                plugins: [
                    {
                        postcssPlugin: 'internal:charset-removal',
                        AtRule: {
                            charset: (atRule) => {
                                if (atRule.name === 'charset') {
                                    atRule.remove();
                                }
                            }
                        }
                    }
                ]
            }
        },
        esbuild: {
            jsxFactory: 'h',
            jsxFragment: 'Fragment'
        }
    }
})
