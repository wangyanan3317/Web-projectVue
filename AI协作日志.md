# AI 协作日志

> 说明：本日志参照课程附件《AI协同日志模板》整理，记录本项目开发过程中 AI 工具的使用情况：使用了什么工具、生成了哪些页面的代码、本人对生成代码做了哪些审查与修改。提交前请把【】中的个人信息补充完整，并根据自己实际动手修改的内容增删"学生审查与修正"部分。

## 基本信息

| 字段 | 内容 |
| --- | --- |
| 学生姓名 | 王亚楠 |
| 学号 | 20250371106 |
| 日期 | 2026 年 9 月 10 日 |
| 项目名称 | 遗韵华夏 —— 非物质文化遗产数字博览平台（期末大作业，主题：非遗保护） |
| 使用的 AI 工具 | Claude Code（Anthropic 官方命令行 AI 编程工具） |
| AI 使用场景分类 | ☑ 代码生成　☑ 代码解释　☑ Bug 定位　☑ 重构建议　☐ 其他 |

## 一、AI 生成内容总览

| 序号 | 日期 | 项目模块 | AI 生成的代码 | 我做的审查与修改 |
| --- | --- | --- | --- | --- |
| 1 | 2026-09-10 | 工程脚手架与基础设施 | `vite.config.js`（@ 别名）、`main.js`（注册 Pinia/Router/Element Plus/Mock）、`src/api/request.js`（Axios 拦截器封装）、`src/mock/index.js`（Mock.js 模拟后端 + 种子数据） | 核对拦截顺序；将种子数据中的占位账号（张三/李四）替换为正式感账号；删除注释中的"演示"字样 |
| 2 | 2026-09-10 | 路由与导航守卫 | `src/router/index.js`（嵌套路由、动态路由、`beforeEach` 登录拦截、`afterEach` 动态标题） | 阅读守卫流程，验证未登录访问受保护页面会携带 `redirect` 参数跳转 |
| 3 | 2026-09-10 | 状态管理 | `src/stores/user.js`、`src/stores/favorites.js`（Pinia 仓库，localStorage 持久化） | 新增 `updateProfile` action 用于个人中心修改昵称，并同步 localStorage |
| 4 | 2026-09-10 | 布局与公共组件 | `src/layout/MainLayout.vue`（顶部导航/用户下拉/页脚）、`src/components/PageHeader.vue`（默认插槽 + 具名插槽） | 页脚原文写着"仅用于教学演示"，改为正式文案；调整 PageHeader 注释表述 |
| 5 | 2026-09-10 | 业务页面（9 个） | `HomeView`、`HeritageListView`、`HeritageDetailView`、`InheritorsView`、`FavoritesView`、`ProfileView`、`LoginView`、`RegisterView`、`NotFoundView` | 补充收藏未登录引导、评论登录引导；核对表单校验与分页逻辑；确认每个页面单根节点以适配路由过渡动画 |
| 6 | 2026-09-10 | 接口补充 | 个人中心所需的 `/api/user/update`、`/api/comments/mine` 两个 Mock 接口 | 确认 `/api/comments/mine` 必须注册在 `/api/comments` 之前，否则会被先匹配（详见下文审查记录 1） |
| 7 | 2026-09-10 | 文档 | `README.md`（功能模块、知识点对照、团队成员表）、`AI协作日志.md` | 团队成员与个人信息由本人填写；对生成内容逐条核对后提交 |

## 二、提示词设计（What did you ask?）

**角色设定：**

> 你是一个熟悉 Vue 3 生态的前端工程师，请严格使用组合式 API（`<script setup>`）开发，UI 使用 Element Plus，状态管理用 Pinia，接口用 Axios 并由 Mock.js 模拟，代码注释用中文，面向课程期末大作业评审，代码要像正式产品而不是课堂示例。

**上下文约束：**

> 项目使用 Vite + Vue Router 4 + Pinia + Element Plus + Axios + Mock.js；主题为非遗保护；页面不少于 5 个；需要体现插槽、路由、导航守卫等核心知识点；Mock 约定统一响应结构 `{ code, message, data }`。

**任务描述（页面部分节选）：**

1. 生成非遗图鉴列表页：门类单选按钮组筛选、关键词搜索（回车与按钮均可触发）、9 条/页分页、卡片含封面/级别标签/地区/浏览量，收藏按钮未登录时引导去登录页并携带 `redirect`。
2. 生成非遗详情页：动态路由取 `params.id`，展示项目档案（el-descriptions）、同门类相关推荐、评论列表与发表评论（未登录显示登录引导条）。
3. 生成登录/注册页：左右分栏（品牌区 + 表单区），完整表单校验（用户名 3-16 位字母数字下划线、密码 6-20 位、两次密码一致的自定义 validator），登录成功后回到 `route.query.redirect` 指定的原页面。

**技术约束：**

> 每个页面必须单根节点（配合 `<transition>` 路由动画）；列表请求统一走 `api/heritage.js` 的函数，页面不得直接使用 axios；时间与数字要有格式化处理。

## 三、学生审查与修正

**修正点 1：Mock 接口注册顺序导致接口被抢先匹配**

- 原始代码问题：Mock 用 `RegExp('^/api/heritages')` 匹配列表接口，`^/api/heritages/detail`（详情）如果注册在列表之后，请求详情时会被列表规则抢先命中，返回分页结构导致页面报错。评论模块的 `/api/comments/mine` 与 `/api/comments` 存在同样问题。
- 我的修正：调整两个文件的注册顺序，把更具体的路径（detail、mine）注册在前面，并在代码中加注释说明"注册顺序即匹配优先级"。通过浏览器 Network 面板逐一验证每个接口返回结构正确。
- 修正依据：Mock.js 的 `Mock.mock(RegExp, ...)` 按注册顺序遍历匹配规则，先注册先生效。

**修正点 2：清除生成代码中的"演示"痕迹**

- 原始代码问题：AI 生成的页脚写着"数据由 Mock.js 模拟生成，仅用于教学演示"，种子账号是"张三/李四"，代码注释里有"仅供演示""token 这里仅作演示"等字样，成品观感像课堂示例而不是正式网站。
- 我的修正：页脚改为正式的版权文案；种子账号替换为 `chenyu/linwan` 并同步更新所有种子评论的昵称；逐文件检查并改写含"演示"字样的注释，保留必要的技术说明。

**修正点 3：收藏状态跨页面不一致的风险**

- 原始代码问题：收藏操作发生在图鉴列表、详情、收藏页三个页面，如果各自维护状态，取消收藏后其他页面仍显示已收藏。
- 我的修正：把收藏统一收进 Pinia 仓库 `favorites.js`，用 getter `idSet`（`Set` 结构）做 O(1) 的"是否已收藏"判断，任何页面 toggle 成功后同步更新同一份数据，登录、退出时对应 `fetch`/`clear`。

**修正点 4：路由过渡动画要求页面单根节点**

- 原始代码问题：AI 生成的个别页面模板存在多根节点，在 `<transition mode="out-in">` 包裹的 `<router-view>` 下切换时会触发 Vue 的渲染警告。
- 我的修正：为所有 9 个页面统一包一层根 `div`，本地逐页切换验证无警告。

## 四、原理回溯

**1. 导航守卫的登录拦截是如何工作的？**

`router.beforeEach` 在每次路由切换前执行：读取 `to.meta.requiresAuth` 判断目标页面是否需要登录，再从 Pinia 仓库读取登录态（token 持久化在 localStorage，刷新不丢失）。未登录则返回 `{ name: 'login', query: { redirect: to.fullPath } }`，vue-router 收到一个路由对象时会中止本次导航并改为跳转到该对象；登录成功后组件里读取 `route.query.redirect` 跳回原页面，形成闭环。`afterEach` 则在导航确认后修改 `document.title`，保证浏览器标签页标题与页面一致。

**2. Mock.js 为什么能"假装"成后端服务器？**

`Mock.mock(url, type, handler)` 会替换全局 `XMLHttpRequest` 对象。axios 底层在浏览器端正是通过 XHR 发请求，因此请求 URL 命中注册的规则时，请求根本不会发到网络，而是直接执行 `handler(options)`，用 `options.url/type/body` 解析出参数后返回约定结构 `{ code, message, data }`。因为拦截发生在 XHR 层，页面代码完全感知不到差异——把 Mock 换成真实后端时只需删除 `import './mock'`，这就是接口层与页面解耦的意义。

**3. 为什么收藏用 Pinia 的 getter 返回 Set？**

`idSet` 基于 `state.list` 派生出 `Set<number>`。Pinia getter 本质是 computed：依赖不变时缓存结果，`list` 变化时自动重算。列表页几十张卡片各自调用 `isFavorite(id)`，都是对同一个 Set 做哈希查找，避免了对数组反复 `findIndex` 的 O(n) 扫描，同时保证了"一处收藏、处处同步"。

## 五、反思与疑问

**本次 AI 协同中，我最意外/最困惑的一点是：**

AI 生成的代码功能上是完整的，但默认带有明显的"示例感"：占位用的种子用户（张三/李四）、"仅用于教学演示"的文案、写死在注释里的说明。功能正确和成品合格之间差着一层"产品化"的工作，这部分只能由人来做：逐页检查文案、数据命名与交互细节。这让我体会到 AI 适合快速搭出骨架，而工程化收尾（命名、一致性、边界情况）仍然需要开发者自己把关。

**我仍然不太理解的问题是：**

Pinia 的 state 在组件外（如路由守卫中）直接调用 `useUserStore()` 时，为什么必须保证 `createPinia()` 已经 `app.use()` 过，否则会报 "getActivePinia was called with no active Pinia"；以及 Mock.js 拦截后，axios 响应拦截器里还能拿到 `response.data` 的完整结构，这个数据流在 XHR 被替换后具体是怎么走回来的。我计划阅读 Mock.js 源码中 XHR 替换的实现来弄清楚。
