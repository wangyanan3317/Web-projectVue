import { defineStore } from 'pinia'
import { getFavorites, toggleFavorite } from '@/api/heritage'

/**
 * 收藏状态仓库（Pinia）
 * 图鉴列表页、详情页、收藏页三处共享同一份收藏数据，避免状态不一致
 */
export const useFavoritesStore = defineStore('favorites', {
  state: () => ({
    list: [], // 收藏的非遗项目对象数组
    loading: false
  }),

  getters: {
    count: (state) => state.list.length,
    // 收藏 id 集合，供列表/详情页判断是否已收藏（O(1) 查找）
    idSet: (state) => new Set(state.list.map((item) => item.id))
  },

  actions: {
    isFavorite(id) {
      return this.idSet.has(Number(id))
    },

    /** 拉取当前用户的收藏列表（进入需要登录的页面时调用） */
    async fetch(username) {
      this.loading = true
      try {
        this.list = await getFavorites(username)
      } finally {
        this.loading = false
      }
    },

    /** 收藏 / 取消收藏，成功后本地同步，界面即时响应 */
    async toggle(username, heritageId) {
      const { favorited } = await toggleFavorite(username, heritageId)
      const id = Number(heritageId)
      if (favorited) {
        // 本地只有 id，先展示状态，完整数据下次 fetch 时补全
        this.list.unshift({ id, favoritedAt: new Date().toLocaleString() })
      } else {
        this.list = this.list.filter((item) => item.id !== id)
      }
      return favorited
    },

    clear() {
      this.list = []
    }
  }
})
