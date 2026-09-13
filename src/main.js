import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

import App from './App.vue'
import router from './router'
import './mock' // 引入 Mock.js：在 main.js 最早阶段拦截 axios 的 XHR 请求，模拟后端接口
import './styles/main.css'

const app = createApp(App)

// 全局注册 Element Plus 全部图标组件，模板中可直接使用 <el-icon><User /></el-icon>
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

// Pinia 状态管理（注意：必须先注册 Pinia，路由守卫里才能 useUserStore()）
app.use(createPinia())
app.use(router)
app.use(ElementPlus, { locale: zhCn }) // 组件库内部文案（分页、日期等）使用中文

app.mount('#app')
