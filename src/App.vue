<script setup>
// 根组件：只负责挂载路由出口，布局由各路由层级自己决定
// 登录/注册/404 是独立页面，首页等业务页面统一包裹在 MainLayout 中（见 router/index.js）
</script>

<template>
  <router-view />
</template>

<style>
/* 全局基础样式（只保留最必要的） */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html,
body,
#app {
  height: 100%;
}

body {
  font-family: 'PingFang SC', 'Microsoft YaHei', 'Helvetica Neue', Arial, sans-serif;
  color: #303133;
  background-color: #f6f7f9;
  -webkit-font-smoothing: antialiased;
}

a {
  text-decoration: none;
  color: inherit;
}
</style>
