<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { getStats, getHotHeritages } from '@/api/heritage'

const router = useRouter()

const stats = ref(null)
const hotList = ref([])
const loading = ref(true)

onMounted(async () => {
  try {
    // 统计看板与精选项目两个接口并行请求
    const [statsData, hotData] = await Promise.all([getStats(), getHotHeritages()])
    stats.value = statsData
    hotList.value = hotData
  } finally {
    loading.value = false
  }
})

const goHeritages = () => router.push('/heritages')
const goInheritors = () => router.push('/inheritors')
const goCategory = (name) => router.push({ path: '/heritages', query: { category: name } })
const goDetail = (id) => router.push(`/heritages/${id}`)

// 数字展示：超过一万转为"万"单位
const formatCount = (n) => (n >= 10000 ? (n / 10000).toFixed(1) + 'w' : n)
</script>

<template>
  <div class="home">
    <!-- ===== 主题横幅 ===== -->
    <section class="hero">
      <div class="hero-inner">
        <p class="hero-eyebrow">非物质文化遗产数字博览平台</p>
        <h1 class="hero-title">触摸千年文脉 · 聆听非遗之声</h1>
        <p class="hero-desc">
          收录全国各级非物质文化遗产代表性项目，讲述技艺、戏曲、民俗与传承人背后的故事，让古老的文化记忆在数字时代焕发新生。
        </p>
        <div class="hero-actions">
          <el-button type="primary" size="large" round @click="goHeritages">
            进入非遗图鉴<el-icon class="btn-icon"><ArrowRight /></el-icon>
          </el-button>
          <el-button size="large" round class="hero-ghost" @click="goInheritors">走近传承人</el-button>
        </div>
      </div>
    </section>

    <div class="page-container">
      <!-- ===== 数据看板 ===== -->
      <el-row :gutter="20" class="stat-row" v-loading="loading">
        <el-col v-for="stat in [
          { label: '收录非遗项目', value: stats?.heritageCount, unit: '项' },
          { label: '覆盖非遗门类', value: stats?.categoryCount, unit: '类' },
          { label: '在册传承人', value: stats?.inheritorCount, unit: '位' },
          { label: '国家级项目', value: stats?.nationalCount, unit: '项' }
        ]" :key="stat.label" :xs="12" :sm="6">
          <div class="stat-card">
            <p class="stat-value">
              <span class="stat-num">{{ stat.value ?? '-' }}</span>
              <span class="stat-unit">{{ stat.unit }}</span>
            </p>
            <p class="stat-label">{{ stat.label }}</p>
          </div>
        </el-col>
      </el-row>

      <!-- ===== 门类导航：点击携带 query 跳转到图鉴页并自动筛选 ===== -->
      <section class="section">
        <div class="section-head">
          <h3 class="section-title">非遗门类</h3>
          <el-link type="primary" :underline="false" @click="goHeritages">
            查看全部<el-icon><ArrowRight /></el-icon>
          </el-link>
        </div>
        <div class="category-grid" v-loading="loading">
          <div
            v-for="cat in stats?.categories || []"
            :key="cat.name"
            class="category-card hover-lift"
            @click="goCategory(cat.name)"
          >
            <span class="category-name">{{ cat.name }}</span>
            <span class="category-count">{{ cat.count }} 项</span>
          </div>
        </div>
      </section>

      <!-- ===== 精选项目（按关注人数排序，接口返回前 6 个） ===== -->
      <section class="section">
        <div class="section-head">
          <h3 class="section-title">精选项目</h3>
          <el-link type="primary" :underline="false" @click="goHeritages">
            更多项目<el-icon><ArrowRight /></el-icon>
          </el-link>
        </div>
        <el-row :gutter="20" v-loading="loading">
          <el-col v-for="item in hotList" :key="item.id" :xs="24" :sm="12" :md="8">
            <el-card shadow="hover" class="hot-card hover-lift" @click="goDetail(item.id)">
              <div class="hot-cover" :style="{ background: `url(${item.image})` }">
                <el-tag size="small" effect="dark" type="danger" class="hot-level">{{ item.level }}</el-tag>
              </div>
              <div class="hot-body">
                <h4 class="hot-name">{{ item.name }}</h4>
                <p class="hot-meta">
                  <el-icon><Location /></el-icon>{{ item.region }}
                  <el-divider direction="vertical" />
                  <el-icon><View /></el-icon>{{ formatCount(item.views) }}
                </p>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </section>

      <!-- ===== 平台板块介绍 ===== -->
      <section class="section">
        <div class="section-head">
          <h3 class="section-title">平台板块</h3>
        </div>
        <el-row :gutter="20">
          <el-col :xs="24" :md="8" v-for="feat in [
            { icon: 'CollectionTag', title: '非遗数字档案', desc: '按门类归档全国代表性项目，图文档案持续更新，支持关键词检索与分类浏览。' },
            { icon: 'User', title: '传承人名录', desc: '记录各级代表性传承人的从艺经历与代表作品，致敬数十年如一日的坚守。' },
            { icon: 'ChatDotRound', title: '互动交流社区', desc: '收藏心仪的项目、发表观展感想，与更多非遗爱好者交流身边的传统文化。' }
          ]" :key="feat.title">
            <div class="feature-card hover-lift">
              <el-icon :size="30" class="feature-icon"><component :is="feat.icon" /></el-icon>
              <h4 class="feature-title">{{ feat.title }}</h4>
              <p class="feature-desc">{{ feat.desc }}</p>
            </div>
          </el-col>
        </el-row>
      </section>
    </div>
  </div>
</template>

<style scoped>
/* ===== 主题横幅 ===== */
.hero {
  background: linear-gradient(135deg, #8f2d25 0%, #a5382e 45%, #b3502f 75%, #c8a45d 130%);
  color: #fff;
  padding: 84px 0 92px;
  text-align: center;
}

.hero-eyebrow {
  font-size: 14px;
  letter-spacing: 6px;
  opacity: 0.85;
  margin-bottom: 14px;
}

.hero-title {
  font-size: 42px;
  letter-spacing: 4px;
  font-family: 'STZhongsong', 'SimSun', serif;
  margin-bottom: 18px;
}

.hero-desc {
  max-width: 640px;
  margin: 0 auto 32px;
  font-size: 15px;
  line-height: 1.9;
  opacity: 0.9;
}

.hero-actions {
  display: flex;
  justify-content: center;
  gap: 8px;
}

.btn-icon {
  margin-left: 4px;
}

.hero-ghost {
  background: rgba(255, 255, 255, 0.14);
  border-color: rgba(255, 255, 255, 0.6);
  color: #fff;
}

.hero-ghost:hover {
  background: rgba(255, 255, 255, 0.28);
  color: #fff;
}

/* ===== 数据看板 ===== */
.stat-row {
  margin-top: -36px;
  position: relative;
  z-index: 2;
}

.stat-card {
  background: #fff;
  border-radius: 10px;
  padding: 22px 16px;
  text-align: center;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.08);
}

.stat-value {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 4px;
}

.stat-num {
  font-size: 32px;
  font-weight: 700;
  color: #a5382e;
  font-family: 'STZhongsong', 'SimSun', serif;
}

.stat-unit {
  font-size: 13px;
  color: #909399;
}

.stat-label {
  margin-top: 6px;
  font-size: 13px;
  color: #606266;
}

/* ===== 通用 section ===== */
.section {
  margin-top: 44px;
}

.section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 18px;
}

.section-title {
  font-size: 20px;
  font-weight: 600;
  position: relative;
  padding-left: 12px;
}

.section-title::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 18px;
  border-radius: 2px;
  background: linear-gradient(#a5382e, #c8a45d);
}

/* ===== 门类导航 ===== */
.category-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 14px;
}

.category-card {
  background: #fff;
  border: 1px solid #ebeef5;
  border-radius: 10px;
  padding: 20px 16px;
  text-align: center;
  cursor: pointer;
  transition: border-color 0.2s ease;
}

.category-card:hover {
  border-color: #a5382e;
}

.category-name {
  display: block;
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 6px;
}

.category-count {
  font-size: 12px;
  color: #909399;
}

/* ===== 精选项目卡片 ===== */
.hot-card {
  margin-bottom: 20px;
  cursor: pointer;
  padding: 0;
}

.hot-card :deep(.el-card__body) {
  padding: 0;
}

.hot-cover {
  height: 168px;
  background-size: cover;
  background-position: center;
  position: relative;
}

.hot-level {
  position: absolute;
  top: 10px;
  left: 10px;
}

.hot-body {
  padding: 14px 16px 16px;
}

.hot-name {
  font-size: 16px;
  margin-bottom: 8px;
}

.hot-meta {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: #909399;
}

/* ===== 平台板块 ===== */
.feature-card {
  background: #fff;
  border-radius: 10px;
  padding: 28px 24px;
  text-align: center;
  margin-bottom: 20px;
}

.feature-icon {
  color: #a5382e;
  margin-bottom: 12px;
}

.feature-title {
  font-size: 16px;
  margin-bottom: 10px;
}

.feature-desc {
  font-size: 13px;
  line-height: 1.8;
  color: #909399;
}

@media (max-width: 768px) {
  .hero-title {
    font-size: 30px;
  }
}
</style>
