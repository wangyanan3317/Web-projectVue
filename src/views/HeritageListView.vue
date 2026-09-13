<script setup>
import { onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getHeritages } from '@/api/heritage'
import { useUserStore } from '@/stores/user'
import { useFavoritesStore } from '@/stores/favorites'
import PageHeader from '@/components/PageHeader.vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const favoritesStore = useFavoritesStore()

const CATEGORIES = ['全部', '传统技艺', '传统戏剧', '传统音乐', '传统美术', '民俗', '传统医药', '传统体育']
const PAGE_SIZE = 9

const keyword = ref('') // 输入框中的关键词
const searchedKeyword = ref('') // 已提交生效的关键词
const category = ref('全部')
const page = ref(1)
const total = ref(0)
const list = ref([])
const loading = ref(false)

async function fetchList() {
  loading.value = true
  try {
    const data = await getHeritages({
      keyword: searchedKeyword.value,
      category: category.value === '全部' ? '' : category.value,
      page: page.value,
      pageSize: PAGE_SIZE
    })
    list.value = data.list
    total.value = data.total
  } finally {
    loading.value = false
  }
}

// 搜索 / 切换门类都回到第一页重新查询
const handleSearch = () => {
  searchedKeyword.value = keyword.value.trim()
  page.value = 1
  fetchList()
}

const handleCategoryChange = () => {
  page.value = 1
  fetchList()
}

const handlePageChange = (p) => {
  page.value = p
  fetchList()
}

const goDetail = (id) => router.push(`/heritages/${id}`)

// 收藏需要登录：未登录时引导到登录页，登录后回到当前页
async function handleToggleFavorite(item) {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('登录后即可收藏心仪的非遗项目')
    router.push({ name: 'login', query: { redirect: route.fullPath } })
    return
  }
  const favorited = await favoritesStore.toggle(userStore.username, item.id)
  ElMessage.success(favorited ? `已将「${item.name}」加入收藏` : `已取消收藏「${item.name}」`)
}

// 从首页门类入口跳转过来时（?category=民俗），同步筛选条件
watch(
  () => route.query.category,
  (val) => {
    if (val && CATEGORIES.includes(val) && val !== category.value) {
      category.value = val
      page.value = 1
      fetchList()
    }
  }
)

onMounted(() => {
  if (route.query.category && CATEGORIES.includes(route.query.category)) {
    category.value = route.query.category
  }
  fetchList()
  // 拉取收藏集合，卡片上的收藏图标才能显示已收藏状态
  if (userStore.isLoggedIn) favoritesStore.fetch(userStore.username)
})

const formatCount = (n) => (n >= 10000 ? (n / 10000).toFixed(1) + 'w' : n)
const excerpt = (text, n = 42) => (text.length > n ? text.slice(0, n) + '…' : text)
</script>

<template>
  <div class="page-container">
    <!-- PageHeader：desc 为默认插槽（带后备内容），搜索框通过具名插槽 extra 放入 -->
    <PageHeader title="非遗图鉴" description="收录各级非物质文化遗产代表性项目，支持按门类筛选与关键词检索">
      <template #extra>
        <el-input
          v-model="keyword"
          placeholder="搜索项目名称 / 地区 / 简介"
          clearable
          class="search-input"
          @keyup.enter="handleSearch"
          @clear="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-button type="primary" @click="handleSearch">搜索</el-button>
      </template>
    </PageHeader>

    <!-- 门类筛选 -->
    <div class="filter-bar">
      <el-radio-group v-model="category" @change="handleCategoryChange">
        <el-radio-button v-for="cat in CATEGORIES" :key="cat" :value="cat">{{ cat }}</el-radio-button>
      </el-radio-group>
    </div>

    <!-- 项目卡片网格 -->
    <div v-loading="loading" class="list-area">
      <el-row :gutter="20" v-if="list.length">
        <el-col v-for="item in list" :key="item.id" :xs="24" :sm="12" :md="8">
          <el-card shadow="hover" class="item-card hover-lift">
            <div class="item-cover" :style="{ background: `url(${item.image})` }" @click="goDetail(item.id)">
              <el-tag size="small" effect="dark" type="danger" class="item-level">{{ item.level }}</el-tag>
              <el-tag size="small" effect="plain" class="item-category">{{ item.category }}</el-tag>
            </div>
            <div class="item-body">
              <h4 class="item-name" @click="goDetail(item.id)">{{ item.name }}</h4>
              <p class="item-region">
                <el-icon><Location /></el-icon>{{ item.region }}
                <span class="item-year">{{ item.year }} 年入选</span>
              </p>
              <p class="item-desc">{{ excerpt(item.description) }}</p>
              <div class="item-footer">
                <span class="item-stats">
                  <el-icon><View /></el-icon>{{ formatCount(item.views) }}
                  <el-divider direction="vertical" />
                  <el-icon><Star /></el-icon>{{ formatCount(item.followers) }}
                </span>
                <el-tooltip :content="favoritesStore.isFavorite(item.id) ? '取消收藏' : '加入收藏'" placement="top">
                  <el-button
                    :type="favoritesStore.isFavorite(item.id) ? 'warning' : 'default'"
                    :icon="favoritesStore.isFavorite(item.id) ? StarFilled : Star"
                    circle
                    size="small"
                    @click="handleToggleFavorite(item)"
                  />
                </el-tooltip>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <el-empty v-else-if="!loading" description="没有找到匹配的非遗项目，换个关键词或门类试试">
        <el-button type="primary" @click="category = '全部'; keyword = ''; handleSearch()">重置筛选</el-button>
      </el-empty>
    </div>

    <!-- 分页 -->
    <div class="pagination-bar" v-if="total > PAGE_SIZE">
      <el-pagination
        background
        layout="prev, pager, next, total"
        :total="total"
        :page-size="PAGE_SIZE"
        :current-page="page"
        @current-change="handlePageChange"
      />
    </div>
  </div>
</template>

<style scoped>
.search-input {
  width: 260px;
}

.filter-bar {
  margin-bottom: 20px;
}

.list-area {
  min-height: 320px;
}

.item-card {
  margin-bottom: 20px;
  cursor: default;
}

.item-card :deep(.el-card__body) {
  padding: 0;
}

.item-cover {
  height: 160px;
  background-size: cover;
  background-position: center;
  position: relative;
  cursor: pointer;
}

.item-level {
  position: absolute;
  top: 10px;
  left: 10px;
}

.item-category {
  position: absolute;
  bottom: 10px;
  right: 10px;
  background: rgba(255, 255, 255, 0.85);
}

.item-body {
  padding: 14px 16px 16px;
}

.item-name {
  font-size: 16px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: color 0.2s ease;
}

.item-name:hover {
  color: #a5382e;
}

.item-region {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: #909399;
  margin-bottom: 8px;
}

.item-year {
  margin-left: auto;
}

.item-desc {
  font-size: 13px;
  line-height: 1.7;
  color: #606266;
  min-height: 44px;
  margin-bottom: 12px;
}

.item-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-top: 1px solid #f0f2f5;
  padding-top: 10px;
}

.item-stats {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: #909399;
}

.pagination-bar {
  display: flex;
  justify-content: center;
  margin-top: 8px;
}

@media (max-width: 768px) {
  .search-input {
    width: 160px;
  }
}
</style>
