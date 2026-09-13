<script setup>
/**
 * 页面标题栏（公共组件）
 * 插槽设计：
 *  - 默认插槽 desc（带后备内容）：未传入时显示 description 属性
 *  - 具名插槽 extra：由调用方自定义右侧操作区（搜索框、按钮等）
 */
defineProps({
  title: { type: String, required: true },
  description: { type: String, default: '' }
})
</script>

<template>
  <div class="page-header">
    <div class="page-header__main">
      <h2 class="page-header__title">{{ title }}</h2>
      <!-- 默认插槽（带后备内容）：调用方没有传 desc 时显示 description 属性 -->
      <p class="page-header__desc">
        <slot name="desc">{{ description }}</slot>
      </p>
    </div>
    <!-- 具名插槽：调用方通过 <template #extra> 放入按钮、输入框等自定义内容 -->
    <div class="page-header__extra">
      <slot name="extra"></slot>
    </div>
  </div>
</template>

<style scoped>
.page-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 20px;
}

.page-header__title {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  position: relative;
  padding-left: 14px;
}

/* 标题左侧的朱砂色竖线，呼应主题色 */
.page-header__title::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 5px;
  height: 22px;
  border-radius: 3px;
  background: linear-gradient(#a5382e, #c8a45d);
}

.page-header__desc {
  margin-top: 8px;
  font-size: 13px;
  color: #909399;
}

.page-header__extra {
  display: flex;
  align-items: center;
  gap: 12px;
}
</style>
