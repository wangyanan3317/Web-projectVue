<script setup>
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getMyComments } from '@/api/heritage'
import { useUserStore } from '@/stores/user'
import { useFavoritesStore } from '@/stores/favorites'
import PageHeader from '@/components/PageHeader.vue'

const router = useRouter()
const userStore = useUserStore()
const favoritesStore = useFavoritesStore()

/* ===== 基本资料修改 ===== */
const formRef = ref()
const saving = ref(false)
const form = reactive({ nickname: '' })

const rules = {
  nickname: [
    { required: true, message: '请输入昵称', trigger: 'blur' },
    { min: 2, max: 12, message: '昵称长度为 2-12 个字符', trigger: 'blur' }
  ]
}

async function handleSave() {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  saving.value = true
  try {
    await userStore.updateProfile({ username: userStore.username, nickname: form.nickname })
    ElMessage.success('资料已更新')
  } finally {
    saving.value = false
  }
}

/* ===== 我的评论 ===== */
const myComments = ref([])
const commentsLoading = ref(false)

async function fetchMyComments() {
  commentsLoading.value = true
  try {
    myComments.value = await getMyComments(userStore.username)
  } finally {
    commentsLoading.value = false
  }
}

const goHeritage = (heritageId) => router.push(`/heritages/${heritageId}`)
const goFavorites = () => router.push('/favorites')

// 退出登录：与顶部导航行为一致，二次确认后清空状态
async function handleLogout() {
  await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
    confirmButtonText: '退出',
    cancelButtonText: '取消',
    type: 'warning'
  })
  userStore.logout()
  favoritesStore.clear()
  ElMessage.success('已退出登录')
  router.push('/')
}

onMounted(() => {
  form.nickname = userStore.nickname
  favoritesStore.fetch(userStore.username)
  fetchMyComments()
})
</script>

<template>
  <div class="page-container">
    <PageHeader title="个人中心" description="管理账号资料，查看收藏与评论记录" />

    <el-row :gutter="20">
      <!-- ===== 左侧：用户卡片 ===== -->
      <el-col :xs="24" :md="8">
        <el-card shadow="never" class="user-card">
          <div class="user-top">
            <el-avatar :size="72" class="user-avatar">{{ userStore.nickname[0] }}</el-avatar>
            <h3 class="user-nickname">{{ userStore.nickname }}</h3>
            <el-tag size="small" effect="plain">{{ userStore.userInfo?.role || '普通用户' }}</el-tag>
          </div>
          <el-descriptions :column="1" class="user-desc">
            <el-descriptions-item label="用户名">{{ userStore.username }}</el-descriptions-item>
            <el-descriptions-item label="注册时间">{{ userStore.userInfo?.createdAt || '-' }}</el-descriptions-item>
          </el-descriptions>
          <div class="user-stats">
            <div class="stat-item" @click="goFavorites">
              <p class="stat-num">{{ favoritesStore.count }}</p>
              <p class="stat-label">收藏项目</p>
            </div>
            <el-divider direction="vertical" />
            <div class="stat-item">
              <p class="stat-num">{{ myComments.length }}</p>
              <p class="stat-label">发表评论</p>
            </div>
          </div>
          <el-button type="danger" plain round class="logout-btn" @click="handleLogout">
            <el-icon class="btn-icon"><SwitchButton /></el-icon>退出登录
          </el-button>
        </el-card>
      </el-col>

      <!-- ===== 右侧：资料修改 + 我的评论 ===== -->
      <el-col :xs="24" :md="16">
        <el-card shadow="never" class="panel-card">
          <template #header><span class="panel-title">基本资料</span></template>
          <el-form ref="formRef" :model="form" :rules="rules" label-width="80px" class="profile-form">
            <el-form-item label="用户名">
              <el-input :model-value="userStore.username" disabled />
            </el-form-item>
            <el-form-item label="昵称" prop="nickname">
              <el-input v-model="form.nickname" placeholder="2-12 个字符" maxlength="12" show-word-limit />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" :loading="saving" @click="handleSave">保存修改</el-button>
            </el-form-item>
          </el-form>
        </el-card>

        <el-card shadow="never" class="panel-card">
          <template #header><span class="panel-title">我的评论</span></template>
          <div v-loading="commentsLoading">
            <div v-if="myComments.length" class="mine-list">
              <div v-for="c in myComments" :key="c.id" class="mine-item">
                <div class="mine-main">
                  <el-link type="primary" :underline="false" @click="goHeritage(c.heritageId)">
                    {{ c.heritageName }}
                  </el-link>
                  <span class="mine-time">{{ c.createdAt }}</span>
                </div>
                <p class="mine-content">{{ c.content }}</p>
              </div>
            </div>
            <el-empty v-else-if="!commentsLoading" description="还没有发表过评论" :image-size="80">
              <el-button type="primary" round @click="router.push('/heritages')">去项目详情页逛逛</el-button>
            </el-empty>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<style scoped>
.btn-icon {
  margin-right: 4px;
}

.user-card {
  margin-bottom: 20px;
}

.user-top {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 10px 0 20px;
}

.user-avatar {
  background: linear-gradient(135deg, #a5382e, #c8a45d);
  font-size: 30px;
  font-weight: bold;
}

.user-nickname {
  font-size: 20px;
}

.user-desc {
  margin-bottom: 16px;
}

.user-stats {
  display: flex;
  align-items: center;
  justify-content: space-around;
  background: #faf8f4;
  border-radius: 8px;
  padding: 14px 0;
  margin-bottom: 20px;
}

.stat-item {
  text-align: center;
  cursor: pointer;
}

.stat-num {
  font-size: 22px;
  font-weight: 700;
  color: #a5382e;
}

.stat-label {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

.logout-btn {
  width: 100%;
}

.panel-card {
  margin-bottom: 20px;
}

.panel-title {
  font-size: 16px;
  font-weight: 600;
}

.profile-form {
  max-width: 420px;
}

.mine-list {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.mine-item {
  border-bottom: 1px solid #f0f2f5;
  padding-bottom: 14px;
}

.mine-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.mine-main {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
}

.mine-time {
  font-size: 12px;
  color: #c0c4cc;
}

.mine-content {
  font-size: 14px;
  line-height: 1.7;
  color: #303133;
}
</style>
