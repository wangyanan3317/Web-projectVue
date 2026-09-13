<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<template>
  <div class="not-found">
    <p class="code gradient-text">404</p>
    <h2 class="title">页面走丢了</h2>
    <p class="desc">你访问的页面不存在或已被移除，去看看非遗项目吧</p>
    <div class="actions">
      <el-button type="primary" round @click="router.push('/')">返回首页</el-button>
      <el-button round @click="router.back()">返回上一页</el-button>
    </div>
  </div>
</template>

<style scoped>
.not-found {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
  text-align: center;
}

.code {
  font-size: 110px;
  font-weight: 700;
  line-height: 1;
  font-family: 'STZhongsong', 'SimSun', serif;
}

.title {
  font-size: 22px;
  margin: 18px 0 10px;
}

.desc {
  font-size: 14px;
  color: #909399;
  margin-bottom: 28px;
}

.actions {
  display: flex;
  gap: 8px;
}
</style>
