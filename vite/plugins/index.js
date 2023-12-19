import vue from '@vitejs/plugin-vue'

import createAutoImport from './auto-import'
import createCompression from './compression'

export default function createVitePlugins(viteEnv, env) {
    const vitePlugins = [vue()]

    vitePlugins.push(createAutoImport())
    env==='build'&& vitePlugins.push(...createCompression(viteEnv))
    return vitePlugins
}
