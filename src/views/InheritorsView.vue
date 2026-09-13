<script setup>
import { onMounted, ref } from 'vue'
import { getInheritors } from '@/api/heritage'
import PageHeader from '@/components/PageHeader.vue'

const list = ref([])
const loading = ref(true)

onMounted(async () => {
  try {
    list.value = await getInheritors()
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="page-container">
    <PageHeader title="传承人名录" description="记录各级非物质文化遗产代表性传承人，致敬数十年如一日的坚守与热爱">
      <template #extra>
        <el-tag type="danger" effect="plain" size="large">共 {{ list.length }} 位传承人</el-tag>
      </template>
    </PageHeader>

    <div v-loading="loading" class="inheritor-area">
      <el-row :gutter="20" v-if="list.length">
        <el-col v-for="p in list" :key="p.id" :xs="24" :sm="12" :md="8">
          <el-card shadow="hover" class="person-card hover-lift">
            <div class="person-head">
              <el-avatar :size="64" :src="p.avatar" />
              <div class="person-basic">
                <h4 class="person-name">{{ p.name }}</h4>
                <el-tag :type="p.title.startsWith('国家级') ? 'danger' : 'warning'" size="small" effect="plain">
                  {{ p.title }}
                </el-tag>
              </div>
            </div>
            <el-divider class="person-divider" />
            <ul class="person-attrs">
              <li>
                <span class="attr-label"><el-icon><CollectionTag /></el-icon>擅长领域</span>
                <span>{{ p.craft }}</span>
              </li>
              <li>
                <span class="attr-label"><el-icon><Location /></el-icon>所在地区</span>
                <span>{{ p.region }}</span>
              </li>
              <li>
                <span class="attr-label"><el-icon><Timer /></el-icon>从艺年限</span>
                <span>{{ p.years }} 年</span>
              </li>
            </ul>
            <p class="person-bio">{{ p.bio }}</p>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<style scoped>
.inheritor-area {
  min-height: 320px;
}

.person-card {
  margin-bottom: 20px;
}

.person-head {
  display: flex;
  align-items: center;
  gap: 14px;
}

.person-name {
  font-size: 18px;
  margin-bottom: 8px;
}

.person-divider {
  margin: 16px 0;
}

.person-attrs {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
}

.person-attrs li {
  display: flex;
  align-items: center;
  font-size: 13px;
}

.attr-label {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  width: 88px;
  color: #909399;
  flex-shrink: 0;
}

.person-bio {
  font-size: 13px;
  line-height: 1.8;
  color: #606266;
  background: #faf8f4;
  border-radius: 6px;
  padding: 10px 12px;
}
</style>
