<script setup>
import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const formRef = ref()
const loading = ref(false)
const form = reactive({ username: '', password: '' })

const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}

async function handleLogin() {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  loading.value = true
  try {
    await userStore.login({ ...form })
    ElMessage.success(`欢迎回来，${userStore.nickname}`)
    // 登录成功后回到守卫拦截时的原页面（redirect 参数），否则回首页
    router.push(route.query.redirect || '/')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="auth-page">
    <div class="auth-card">
      <!-- 左侧品牌区 -->
      <div class="auth-brand">
        <div class="brand-seal">遗</div>
        <h2 class="brand-name">遗韵华夏</h2>
        <p class="brand-slogan">非物质文化遗产数字博览平台</p>
        <p class="brand-line">触摸千年文脉 · 聆听非遗之声</p>
      </div>

      <!-- 右侧表单区 -->
      <div class="auth-form-area">
        <h3 class="form-title">账号登录</h3>
        <el-form ref="formRef" :model="form" :rules="rules" size="large">
          <el-form-item prop="username">
            <el-input v-model="form.username" placeholder="用户名" :prefix-icon="'User'" @keyup.enter="handleLogin" />
          </el-form-item>
          <el-form-item prop="password">
            <el-input
              v-model="form.password"
              type="password"
              placeholder="密码"
              show-password
              :prefix-icon="'Lock'"
              @keyup.enter="handleLogin"
            />
          </el-form-item>
          <el-button type="primary" size="large" class="submit-btn" :loading="loading" @click="handleLogin">
            登 录
          </el-button>
        </el-form>
        <p class="form-footer">
          还没有账号？
          <el-link type="primary" :underline="false" @click="router.push({ path: '/register', query: route.query })">
            立即注册
          </el-link>
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #7c2a24 0%, #a5382e 50%, #b3502f 100%);
  padding: 24px;
}

.auth-card {
  width: 860px;
  max-width: 100%;
  min-height: 480px;
  background: #fff;
  border-radius: 14px;
  overflow: hidden;
  display: flex;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.auth-brand {
  width: 42%;
  background: linear-gradient(160deg, #8f2d25, #a5382e 60%, #c8a45d 140%);
  color: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 40px 24px;
}

.brand-seal {
  width: 68px;
  height: 68px;
  display: grid;
  place-items: center;
  background: rgba(255, 255, 255, 0.16);
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 14px;
  font-size: 34px;
  font-weight: bold;
  font-family: 'STZhongsong', 'SimSun', serif;
}

.brand-name {
  font-size: 28px;
  letter-spacing: 6px;
  font-family: 'STZhongsong', 'SimSun', serif;
}

.brand-slogan {
  font-size: 13px;
  opacity: 0.85;
  letter-spacing: 2px;
}

.brand-line {
  font-size: 12px;
  opacity: 0.7;
  margin-top: 18px;
  letter-spacing: 3px;
}

.auth-form-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 48px 52px;
}

.form-title {
  font-size: 22px;
  margin-bottom: 28px;
}

.submit-btn {
  width: 100%;
  margin-top: 6px;
  letter-spacing: 8px;
}

.form-footer {
  margin-top: 18px;
  text-align: center;
  font-size: 14px;
  color: #909399;
}

@media (max-width: 768px) {
  .auth-brand {
    display: none;
  }
}
</style>
