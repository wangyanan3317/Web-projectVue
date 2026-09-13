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
const form = reactive({
  username: '',
  nickname: '',
  password: '',
  confirmPassword: ''
})

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { pattern: /^[a-zA-Z0-9_]{3,16}$/, message: '用户名为 3-16 位字母、数字或下划线', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度为 6-20 位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== form.password) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

async function handleRegister() {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  loading.value = true
  try {
    await userStore.register({
      username: form.username,
      password: form.password,
      nickname: form.nickname
    })
    ElMessage.success('注册成功，请登录')
    // 注册完成后去登录页；若此前被守卫拦截，则带上 redirect 继续回到原页面
    router.push({ path: '/login', query: route.query.redirect ? { redirect: route.query.redirect } : {} })
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
        <h3 class="form-title">注册账号</h3>
        <el-form ref="formRef" :model="form" :rules="rules" size="large">
          <el-form-item prop="username">
            <el-input v-model="form.username" placeholder="用户名（3-16 位字母、数字或下划线）" :prefix-icon="'User'" />
          </el-form-item>
          <el-form-item prop="nickname">
            <el-input v-model="form.nickname" placeholder="昵称（选填，默认与用户名相同）" :prefix-icon="'Postcard'" />
          </el-form-item>
          <el-form-item prop="password">
            <el-input v-model="form.password" type="password" placeholder="密码（6-20 位）" show-password :prefix-icon="'Lock'" />
          </el-form-item>
          <el-form-item prop="confirmPassword">
            <el-input v-model="form.confirmPassword" type="password" placeholder="确认密码" show-password :prefix-icon="'Lock'" @keyup.enter="handleRegister" />
          </el-form-item>
          <el-button type="primary" size="large" class="submit-btn" :loading="loading" @click="handleRegister">
            注 册
          </el-button>
        </el-form>
        <p class="form-footer">
          已有账号？
          <el-link type="primary" :underline="false" @click="router.push({ path: '/login', query: route.query })">
            直接登录
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
  min-height: 540px;
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
  padding: 40px 52px;
}

.form-title {
  font-size: 22px;
  margin-bottom: 24px;
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
