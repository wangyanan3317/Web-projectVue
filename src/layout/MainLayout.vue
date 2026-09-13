<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { useFavoritesStore } from '@/stores/favorites'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const favoritesStore = useFavoritesStore()

// 顶部菜单高亮：详情页时也让"非遗图鉴"保持选中
const activeMenu = computed(() => {
  if (route.path.startsWith('/heritages')) return '/heritages'
  return route.path
})

// 退出登录：二次确认后清空 Pinia 与 localStorage
const handleLogout = async () => {
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
</script>

<template>
  <el-container class="layout">
    <!-- ===== 顶部导航 ===== -->
    <el-header class="layout-header">
      <div class="header-inner">
        <div class="logo" @click="router.push('/')">
          <span class="logo__seal">遗</span>
          <div class="logo__text">
            <strong>遗韵华夏</strong>
            <small>非物质文化遗产数字博览平台</small>
          </div>
        </div>

        <!-- el-menu 开启 router 模式：菜单项 index 即跳转路径 -->
        <el-menu
          mode="horizontal"
          :default-active="activeMenu"
          router
          :ellipsis="false"
          class="nav-menu"
        >
          <el-menu-item index="/">首页</el-menu-item>
          <el-menu-item index="/heritages">非遗图鉴</el-menu-item>
          <el-menu-item index="/inheritors">传承人名录</el-menu-item>
          <el-menu-item index="/favorites">我的收藏</el-menu-item>
        </el-menu>

        <!-- 用户区：未登录显示登录/注册按钮，已登录显示头像下拉菜单 -->
        <div class="user-area">
          <template v-if="userStore.isLoggedIn">
            <el-dropdown trigger="click">
              <span class="user-chip">
                <el-avatar :size="32" class="user-avatar">{{ userStore.nickname[0] }}</el-avatar>
                <span class="user-name">{{ userStore.nickname }}</span>
                <el-icon><ArrowDown /></el-icon>
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click="router.push('/profile')">
                    <el-icon><User /></el-icon>个人中心
                  </el-dropdown-item>
                  <el-dropdown-item @click="router.push('/favorites')">
                    <el-icon><Star /></el-icon>我的收藏
                  </el-dropdown-item>
                  <el-dropdown-item divided @click="handleLogout">
                    <el-icon><SwitchButton /></el-icon>退出登录
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
          <template v-else>
            <el-button text @click="router.push('/login')">登录</el-button>
            <el-button type="primary" round @click="router.push('/register')">注册</el-button>
          </template>
        </div>
      </div>
    </el-header>

    <!-- ===== 内容区：router-view 渲染子路由页面，包裹过渡动画 ===== -->
    <el-main class="layout-main">
      <router-view v-slot="{ Component }">
        <transition name="fade-slide" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </el-main>

    <!-- ===== 底部页脚 ===== -->
    <el-footer class="layout-footer">
      <p class="footer-title">遗韵华夏 · 让千年非遗在指尖传承</p>
      <p class="footer-sub">数字档案 · 传承人故事 · 互动交流 —— 共同守护中华民族的文化记忆</p>
      <p class="footer-sub">© 2026 遗韵华夏 非物质文化遗产数字博览平台</p>
    </el-footer>
  </el-container>
</template>

<style scoped>
.layout {
  min-height: 100vh;
}

.layout-header {
  position: sticky;
  top: 0;
  z-index: 100;
  height: 64px;
  background: #fff;
  border-bottom: 1px solid #ebeef5;
  padding: 0;
}

.header-inner {
  width: min(1200px, 92vw);
  margin: 0 auto;
  height: 100%;
  display: flex;
  align-items: center;
  gap: 32px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  flex-shrink: 0;
}

.logo__seal {
  width: 42px;
  height: 42px;
  display: grid;
  place-items: center;
  background: linear-gradient(135deg, #a5382e, #c8452f);
  color: #fff;
  font-size: 22px;
  font-weight: bold;
  border-radius: 8px;
  font-family: 'STZhongsong', 'SimSun', serif;
  box-shadow: 0 2px 8px rgba(165, 56, 46, 0.35);
}

.logo__text {
  display: flex;
  flex-direction: column;
  line-height: 1.25;
}

.logo__text strong {
  font-size: 17px;
  letter-spacing: 2px;
}

.logo__text small {
  font-size: 11px;
  color: #909399;
}

.nav-menu {
  flex: 1;
  border-bottom: none;
  font-size: 15px;
}

.user-area {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.user-chip {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  outline: none;
}

.user-avatar {
  background: linear-gradient(135deg, #a5382e, #c8a45d);
  font-weight: bold;
}

.user-name {
  font-size: 14px;
}

.layout-main {
  padding: 0;
  background: #f6f7f9;
}

.layout-footer {
  background: #2b2b2b;
  color: #bbb;
  text-align: center;
  padding: 28px 16px;
  height: auto;
}

.footer-title {
  color: #f0e6d2;
  font-size: 16px;
  letter-spacing: 2px;
  margin-bottom: 10px;
}

.footer-sub {
  font-size: 12px;
  margin: 4px 0;
}
</style>
