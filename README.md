# 遗韵华夏 —— 非物质文化遗产数字博览平台

课程期末大作业。网站主题为**非遗保护**：围绕中国各级非物质文化遗产代表性项目，提供数字档案浏览、传承人名录展示、收藏互动与评论交流等功能，让千年非遗在指尖传承。

## 一、网站主题

**非遗保护**。平台收录传统技艺、传统戏剧、传统音乐、传统美术、民俗、传统医药、传统体育等门类的非物质文化遗产代表性项目，图文档案、项目详情、传承人故事一应俱全，并支持用户注册登录、收藏与评论互动。

## 二、技术栈

| 技术 | 说明 |
| --- | --- |
| Vue 3（组合式 API） | 全部页面采用 `<script setup>` 组合式风格编写 |
| Vite | 开发构建工具 |
| Vue Router 4 | 路由 + 全局导航守卫（登录拦截、动态标题） |
| Pinia | 用户状态与收藏状态管理（localStorage 持久化） |
| Element Plus | UI 组件库（中文 locale + 全量图标注册） |
| Axios | 统一封装请求/响应拦截器 |
| Mock.js | 拦截 XHR 模拟后端接口，localStorage 充当数据库 |

## 三、主要功能模块

| 模块 | 页面 | 主要功能 |
| --- | --- | --- |
| 首页 | `HomeView.vue` | 主题横幅、数据看板（项目/门类/传承人统计）、非遗门类导航、精选项目推荐、平台板块介绍 |
| 非遗图鉴 | `HeritageListView.vue` | 全部项目列表，支持门类筛选、关键词搜索、分页浏览，卡片可直接收藏 |
| 非遗详情 | `HeritageDetailView.vue` | 动态路由 `/heritages/:id`，项目档案、相关推荐、收藏、评论列表与发表评论 |
| 传承人名录 | `InheritorsView.vue` | 各级代表性传承人卡片（擅长领域、所在地区、从艺年限、简介） |
| 我的收藏 | `FavoritesView.vue` | 当前账号的收藏列表，支持取消收藏、跳转详情（需登录） |
| 个人中心 | `ProfileView.vue` | 资料修改（昵称）、我的评论记录、收藏/评论统计、退出登录（需登录） |
| 登录 / 注册 | `LoginView.vue` / `RegisterView.vue` | 表单校验、登录签发 token、注册后引导登录 |
| 兜底页面 | `NotFoundView.vue` | 404 页面 |

## 四、核心知识点运用

| 知识点 | 项目中的体现 |
| --- | --- |
| 插槽 | `PageHeader.vue`：默认插槽（带后备内容）+ 具名插槽 `extra`（图鉴页搜索框、传承人页统计标签等）；登录页 `#prefix`、详情页 `#header` 等组件插槽 |
| 路由 | 嵌套路由（MainLayout 子路由）、动态路由 `/heritages/:id`、懒加载、`scrollBehavior`、路由元信息 `meta` |
| 导航守卫 | `router/index.js`：`beforeEach` 登录拦截（未登录访问受保护页面 → 重定向登录页并携带 `redirect` 参数）、已登录访问登录/注册页回首页；`afterEach` 动态设置页面标题 |
| Element Plus | 布局容器、菜单、表单、卡片、分页、描述列表、消息提示、确认框等全站使用，中文 locale |
| Pinia | `stores/user.js`（token/用户信息，localStorage 持久化）、`stores/favorites.js`（收藏集合跨页面共享，`idSet` O(1) 判断收藏状态） |
| Axios | `api/request.js` 统一实例：请求拦截器自动携带 token，响应拦截器统一剥壳、校验业务 code、错误提示；`api/heritage.js` 按模块拆分接口函数 |
| Mock.js | `mock/index.js` 模拟后端接口（用户、统计、项目、传承人、评论、收藏六大模块），localStorage 模拟数据库实现注册/评论/收藏的持久化 |

## 五、团队成员

| 姓名 | 学号 | 分工 |
| --- | --- | --- |
| 【填写姓名】 | 【填写学号】 | 【填写分工，如：项目搭建 / 页面开发 / 数据与接口设计 / 文档整理】 |
| 【填写姓名】 | 【填写学号】 | 【填写分工】 |
| 【填写姓名】 | 【填写学号】 | 【填写分工】 |

## 六、运行方式

```bash
# 安装依赖
npm install

# 启动开发服务器（http://localhost:5173）
npm run dev

# 生产构建 / 预览
npm run build
npm run preview
```

## 七、测试账号

Mock 数据库内置了两个账号（也可以在注册页自行注册）：

| 用户名 | 密码 |
| --- | --- |
| chenyu | 123456 |
| linwan | 123456 |

## 八、目录结构

```
├── index.html                  # 入口 HTML
├── vite.config.js              # Vite 配置（@ 别名指向 src）
└── src
    ├── main.js                 # 应用入口：注册 Pinia / Router / Element Plus / Mock
    ├── App.vue                 # 根组件
    ├── api
    │   ├── request.js          # Axios 实例与拦截器封装
    │   └── heritage.js         # 按模块拆分的接口函数
    ├── mock
    │   └── index.js            # Mock.js 模拟后端接口与种子数据
    ├── router
    │   └── index.js            # 路由表与全局导航守卫
    ├── stores
    │   ├── user.js             # 用户状态（Pinia）
    │   └── favorites.js        # 收藏状态（Pinia）
    ├── layout
    │   └── MainLayout.vue      # 顶部导航 + 内容区 + 页脚
    ├── components
    │   └── PageHeader.vue      # 页面标题栏公共组件（插槽）
    ├── views                   # 9 个页面组件
    └── styles
        └── main.css            # 全局公共样式
```

## 九、AI 协作说明

本项目在开发过程中使用了 AI 工具辅助编码，工具选择、生成内容范围与人工修改记录见 [`AI协作日志.md`](./AI协作日志.md)。
