<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { useFavoritesStore } from '@/stores/favorites'
import PageHeader from '@/components/PageHeader.vue'

const router = useRouter()
const userStore = useUserStore()
const favoritesStore = useFavoritesStore()

const list = computed(() => favoritesStore.list)
const loading = computed(() => favoritesStore.loading)

const goDetail = (id) => router.push(`/heritages/${id}`)

// 取消收藏：二次确认后调用接口，Pinia store 内部同步移除
async function handleRemove(item) {
  await ElMessageBox.confirm(`确定取消收藏「${item.name}」吗？`, '提示', {
    confirmButtonText: '取消收藏',
    cancelButtonText: '再想想',
    type: 'warning'
  })
  await favoritesStore.toggle(userStore.username, item.id)
  ElMessage.success(`已取消收藏「${item.name}」`)
}

onMounted(() => {
  favoritesStore.fetch(userStore.username)
})
</script>

<template>
  <div class="page-container">
    <PageHeader title="我的收藏" :description="`收藏的非遗项目会同步保存在账号下，共 ${list.length} 个`">
      <template #extra>
        <el-button round @click="router.push('/heritages')">
          <el-icon class="btn-icon"><Plus /></el-icon>继续逛逛
        </el-button>
      </template>
    </PageHeader>

    <div v-loading="loading" class="fav-area">
      <el-row :gutter="20" v-if="list.length">
        <el-col v-for="item in list" :key="item.id" :xs="24" :sm="12" :md="8">
          <el-card shadow="hover" class="fav-card hover-lift">
            <div class="fav-cover" :style="{ background: `url(${item.image})` }" @click="goDetail(item.id)">
              <el-tag size="small" effect="plain" class="fav-category">{{ item.category }}</el-tag>
            </div>
            <div class="fav-body">
              <h4 class="fav-name" @click="goDetail(item.id)">{{ item.name }}</h4>
              <p class="fav-time">
                <el-icon><Timer /></el-icon>收藏于 {{ item.favoritedAt }}
              </p>
              <div class="fav-actions">
                <el-button size="small" round @click="goDetail(item.id)">查看详情</el-button>
                <el-button size="small" round type="danger" plain @click="handleRemove(item)">取消收藏</el-button>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <el-empty v-else-if="!loading" description="还没有收藏任何非遗项目">
        <el-button type="primary" round @click="router.push('/heritages')">去非遗图鉴看看</el-button>
      </el-empty>
    </div>
  </div>
</template>

<style scoped>
.btn-icon {
  margin-right: 4px;
}

.fav-area {
  min-height: 320px;
}

.fav-card {
  margin-bottom: 20px;
}

.fav-card :deep(.el-card__body) {
  padding: 0;
}

.fav-cover {
  height: 150px;
  background-size: cover;
  background-position: center;
  position: relative;
  cursor: pointer;
}

.fav-category {
  position: absolute;
  bottom: 10px;
  right: 10px;
  background: rgba(255, 255, 255, 0.85);
}

.fav-body {
  padding: 14px 16px 16px;
}

.fav-name {
  font-size: 16px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: color 0.2s ease;
}

.fav-name:hover {
  color: #a5382e;
}

.fav-time {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #909399;
  margin-bottom: 14px;
}

.fav-actions {
  display: flex;
  justify-content: space-between;
}
</style>
