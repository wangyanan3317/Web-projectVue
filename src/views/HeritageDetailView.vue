<script setup>
import { onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getHeritageDetail, getComments, addComment } from '@/api/heritage'
import { useUserStore } from '@/stores/user'
import { useFavoritesStore } from '@/stores/favorites'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const favoritesStore = useFavoritesStore()

const detail = ref(null)
const loading = ref(true)

const comments = ref([])
const commentsLoading = ref(false)
const commentInput = ref('')
const submitting = ref(false)

async function fetchDetail() {
  loading.value = true
  try {
    detail.value = await getHeritageDetail(route.params.id)
  } finally {
    loading.value = false
  }
}

async function fetchComments() {
  commentsLoading.value = true
  try {
    comments.value = await getComments(route.params.id)
  } finally {
    commentsLoading.value = false
  }
}

async function submitComment() {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('登录后即可发表评论')
    router.push({ name: 'login', query: { redirect: route.fullPath } })
    return
  }
  const content = commentInput.value.trim()
  if (!content) {
    ElMessage.warning('请输入评论内容')
    return
  }
  submitting.value = true
  try {
    await addComment({
      heritageId: Number(route.params.id),
      username: userStore.username,
      nickname: userStore.nickname,
      content
    })
    commentInput.value = ''
    ElMessage.success('评论发表成功')
    fetchComments()
  } finally {
    submitting.value = false
  }
}

// 未登录时引导去登录页；已登录则切换收藏状态
async function handleFavorite() {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('登录后即可收藏心仪的非遗项目')
    router.push({ name: 'login', query: { redirect: route.fullPath } })
    return
  }
  const favorited = await favoritesStore.toggle(userStore.username, detail.value.id)
  ElMessage.success(favorited ? '已加入收藏' : '已取消收藏')
}

const goDetail = (id) => router.push(`/heritages/${id}`)

const formatCount = (n) => (n >= 10000 ? (n / 10000).toFixed(1) + 'w' : n)

// 详情页之间互相跳转（相关推荐）时路由复用组件，监听 params 重新加载
watch(
  () => route.params.id,
  (id) => {
    if (id && route.name === 'heritage-detail') {
      fetchDetail()
      fetchComments()
    }
  }
)

onMounted(() => {
  fetchDetail()
  fetchComments()
  if (userStore.isLoggedIn) favoritesStore.fetch(userStore.username)
})
</script>

<template>
  <div class="page-container">
    <!-- 面包屑导航 -->
    <el-breadcrumb separator="/" class="breadcrumb">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item :to="{ path: '/heritages' }">非遗图鉴</el-breadcrumb-item>
      <el-breadcrumb-item>{{ detail?.name || '详情' }}</el-breadcrumb-item>
    </el-breadcrumb>

    <div v-loading="loading" class="detail-area">
      <template v-if="detail">
        <!-- ===== 项目主体 ===== -->
        <el-card shadow="never" class="main-card">
          <div class="main-flex">
            <div class="cover" :style="{ background: `url(${detail.image})` }"></div>
            <div class="info">
              <div class="title-row">
                <h2 class="name">{{ detail.name }}</h2>
                <el-tag effect="dark" type="danger">{{ detail.level }}</el-tag>
                <el-tag effect="plain">{{ detail.category }}</el-tag>
              </div>
              <p class="hot-info">
                <span><el-icon><View /></el-icon>浏览 {{ formatCount(detail.views) }}</span>
                <el-divider direction="vertical" />
                <span><el-icon><Star /></el-icon>{{ formatCount(detail.followers) }} 人关注</span>
              </p>
              <p class="desc">{{ detail.description }}</p>
              <div class="actions">
                <el-button
                  :type="favoritesStore.isFavorite(detail.id) ? 'warning' : 'primary'"
                  :icon="favoritesStore.isFavorite(detail.id) ? StarFilled : Star"
                  round
                  @click="handleFavorite"
                >
                  {{ favoritesStore.isFavorite(detail.id) ? '已收藏' : '收藏项目' }}
                </el-button>
                <el-button round @click="router.push('/heritages')">返回图鉴</el-button>
              </div>
            </div>
          </div>
        </el-card>

        <!-- ===== 项目档案 ===== -->
        <el-card shadow="never" class="block-card">
          <template #header><span class="block-title">项目档案</span></template>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="项目名称">{{ detail.name }}</el-descriptions-item>
            <el-descriptions-item label="所属门类">{{ detail.category }}</el-descriptions-item>
            <el-descriptions-item label="申报地区">{{ detail.region }}</el-descriptions-item>
            <el-descriptions-item label="保护级别">{{ detail.level }}</el-descriptions-item>
            <el-descriptions-item label="入选年份">{{ detail.year }} 年</el-descriptions-item>
            <el-descriptions-item label="收录编号">{{ String(detail.id).padStart(4, '0') }}</el-descriptions-item>
          </el-descriptions>
        </el-card>

        <!-- ===== 相关推荐：同门类其他项目（接口返回最多 3 个） ===== -->
        <section v-if="detail.related.length" class="block-section">
          <h3 class="block-title same-title">相关推荐</h3>
          <el-row :gutter="20">
            <el-col v-for="item in detail.related" :key="item.id" :xs="24" :sm="8">
              <div class="related-card hover-lift" @click="goDetail(item.id)">
                <div class="related-cover" :style="{ background: `url(${item.image})` }"></div>
                <div class="related-info">
                  <h4>{{ item.name }}</h4>
                  <p>{{ item.region }}</p>
                </div>
              </div>
            </el-col>
          </el-row>
        </section>

        <!-- ===== 评论区 ===== -->
        <el-card shadow="never" class="block-card">
          <template #header>
            <span class="block-title">互动评论 <span class="comment-count">共 {{ comments.length }} 条</span></span>
          </template>

          <!-- 已登录：输入并发表 -->
          <div v-if="userStore.isLoggedIn" class="comment-editor">
            <el-avatar :size="36" class="comment-avatar">{{ userStore.nickname[0] }}</el-avatar>
            <el-input
              v-model="commentInput"
              type="textarea"
              :rows="3"
              maxlength="200"
              show-word-limit
              placeholder="分享你与这项非遗的故事…"
            />
          </div>
          <div class="comment-submit" v-if="userStore.isLoggedIn">
            <el-button type="primary" round :loading="submitting" @click="submitComment">发表评论</el-button>
          </div>
          <!-- 未登录：引导登录 -->
          <div v-else class="comment-login">
            <el-icon><ChatDotRound /></el-icon>
            <span>登录后可以发表评论，与更多非遗爱好者交流</span>
            <el-button type="primary" size="small" round @click="router.push({ name: 'login', query: { redirect: route.fullPath } })">
              立即登录
            </el-button>
          </div>

          <el-divider />

          <div v-loading="commentsLoading">
            <div v-if="comments.length" class="comment-list">
              <div v-for="c in comments" :key="c.id" class="comment-item">
                <el-avatar :size="36" class="comment-avatar">{{ c.nickname[0] }}</el-avatar>
                <div class="comment-body">
                  <p class="comment-head">
                    <span class="comment-nickname">{{ c.nickname }}</span>
                    <span class="comment-time"><el-icon><Timer /></el-icon>{{ c.createdAt }}</span>
                  </p>
                  <p class="comment-content">{{ c.content }}</p>
                </div>
              </div>
            </div>
            <el-empty v-else-if="!commentsLoading" description="还没有评论，快来抢沙发" :image-size="80" />
          </div>
        </el-card>
      </template>
    </div>
  </div>
</template>

<style scoped>
.breadcrumb {
  margin-bottom: 16px;
}

.detail-area {
  min-height: 320px;
}

.main-card {
  margin-bottom: 20px;
}

.main-flex {
  display: flex;
  gap: 28px;
}

.cover {
  width: 420px;
  height: 280px;
  border-radius: 8px;
  background-size: cover;
  background-position: center;
  flex-shrink: 0;
}

.info {
  flex: 1;
  min-width: 0;
}

.title-row {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 12px;
}

.name {
  font-size: 26px;
  font-family: 'STZhongsong', 'SimSun', serif;
}

.hot-info {
  display: flex;
  align-items: center;
  font-size: 13px;
  color: #909399;
  margin-bottom: 16px;
}

.hot-info span {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.desc {
  font-size: 15px;
  line-height: 2;
  color: #303133;
  text-indent: 2em;
  margin-bottom: 24px;
}

.actions {
  display: flex;
  gap: 8px;
}

/* ===== 通用块 ===== */
.block-card {
  margin-bottom: 20px;
}

.block-title {
  font-size: 16px;
  font-weight: 600;
}

.same-title {
  margin-bottom: 16px;
}

.comment-count {
  font-size: 13px;
  font-weight: normal;
  color: #909399;
  margin-left: 6px;
}

/* ===== 相关推荐 ===== */
.related-card {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #fff;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  padding: 10px;
  margin-bottom: 20px;
  cursor: pointer;
}

.related-card:hover {
  border-color: #c8a45d;
}

.related-cover {
  width: 110px;
  height: 72px;
  border-radius: 6px;
  background-size: cover;
  background-position: center;
  flex-shrink: 0;
}

.related-info h4 {
  font-size: 14px;
  margin-bottom: 6px;
}

.related-info p {
  font-size: 12px;
  color: #909399;
}

/* ===== 评论区 ===== */
.comment-editor {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.comment-submit {
  display: flex;
  justify-content: flex-end;
  margin-top: 10px;
}

.comment-login {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #faf3ec;
  border: 1px dashed #d9b98c;
  border-radius: 8px;
  padding: 14px 16px;
  color: #8a6a3a;
  font-size: 14px;
}

.comment-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.comment-item {
  display: flex;
  gap: 12px;
}

.comment-avatar {
  background: linear-gradient(135deg, #a5382e, #c8a45d);
  font-weight: bold;
  flex-shrink: 0;
}

.comment-head {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 6px;
}

.comment-nickname {
  font-size: 14px;
  font-weight: 600;
}

.comment-time {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-size: 12px;
  color: #c0c4cc;
}

.comment-content {
  font-size: 14px;
  line-height: 1.8;
  color: #303133;
}

@media (max-width: 900px) {
  .main-flex {
    flex-direction: column;
  }

  .cover {
    width: 100%;
  }
}
</style>
