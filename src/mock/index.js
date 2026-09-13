/**
 * Mock.js 模拟后端服务器
 * ------------------------------------------------------------------
 * 原理：Mock.mock(url, type, handler) 会劫持 XMLHttpRequest，
 * 当 axios 发出的请求 URL 命中注册的规则时，不会真正发往服务器，
 * 而是由 handler(options) 生成响应数据返回（options.url / options.type / options.body）。
 *
 * 约定的响应结构：{ code: 200, message: 'ok', data: ... }
 * code !== 200 时，axios 响应拦截器（src/api/request.js）会统一弹出错误提示。
 */
import Mock from 'mockjs'

Mock.setup({ timeout: '200-500' }) // 模拟真实网络延迟，页面可以正常呈现加载状态

/* ============ 本地持久化工具（用 localStorage 模拟数据库） ============ */

const DB_KEY = 'heritage_db'

function getDB() {
  if (!localStorage.getItem(DB_KEY)) {
    localStorage.setItem(DB_KEY, JSON.stringify({ users: seedUsers, favorites: {}, comments: seedComments }))
  }
  return JSON.parse(localStorage.getItem(DB_KEY))
}

function saveDB(db) {
  localStorage.setItem(DB_KEY, JSON.stringify(db))
}

/* ============ 图片占位图生成器（离线可用的 SVG 渐变图，替代真实图片） ============ */

// 每个类别对应一组主题渐变色
const CATEGORY_COLORS = {
  传统技艺: ['#a5632c', '#d9a05b'],
  传统戏剧: ['#8e3b8e', '#d17bd1'],
  传统音乐: ['#2f6f8f', '#7fc4d9'],
  传统美术: ['#b03a3a', '#e88a6a'],
  民俗: ['#3f7d4e', '#8fce9f'],
  传统医药: ['#5b6e2f', '#a8c66c'],
  传统体育: ['#3b5998', '#8b9dc3']
}

// 生成 data:image/svg+xml 形式的渐变占位图（中文项目名，无需联网）
function svgImage(text, category, w = 640, h = 400) {
  const [c1, c2] = CATEGORY_COLORS[category] || ['#545c77', '#8f9bb3']
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
    <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/>
    </linearGradient></defs>
    <rect width="100%" height="100%" fill="url(#g)"/>
    <text x="50%" y="45%" font-size="46" fill="#ffffff" text-anchor="middle"
      dominant-baseline="middle" font-family="'STZhongsong','SimSun',serif" font-weight="bold">${text}</text>
    <text x="50%" y="62%" font-size="20" fill="rgba(255,255,255,.8)" text-anchor="middle">· ${category} ·</text>
  </svg>`
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg)
}

/* ============ 种子数据：非遗项目 ============ */

const H = (id, name, category, region, level, year, description) => ({
  id,
  name,
  category,
  region,
  level,
  year,
  description,
  image: svgImage(name, category),
  followers: Mock.mock('@integer(1200, 98000)'), // 关注人数
  views: Mock.mock('@integer(5000, 300000)') // 浏览量
})

const heritageList = [
  H(1, '昆曲', '传统戏剧', '江苏昆山', '国家级', 2001,
    '昆曲发源于元末明初的江苏昆山，至今已有六百余年历史，被誉为"百戏之祖"。2001年被联合国教科文组织列入首批"人类口述和非物质遗产代表作"，其曲调婉转细腻，表演载歌载舞，程式严谨。'),
  H(2, '京剧', '传统戏剧', '北京', '国家级', 2006,
    '京剧形成于清代道光年间的北京，融合了徽调、汉调的精华，唱腔以西皮、二黄为主，被誉为中国"国粹"。脸谱、行头、唱念做打自成一派，是中国影响最大的戏曲剧种。'),
  H(3, '中国剪纸', '传统美术', '河北蔚县', '国家级', 2006,
    '剪纸是以剪刀或刻刀在纸上剪刻花纹的民间艺术，广泛用于节庆装点与人生礼仪。蔚县剪纸以"阴刻为主、阳刻为辅"的点彩刻纸独树一帜，2009年入选人类非物质文化遗产代表作名录。'),
  H(4, '苏绣', '传统美术', '江苏苏州', '国家级', 2006,
    '苏绣是中国四大名绣之一，以"精细雅洁"著称，针法多达四十余种，讲究"平、齐、细、密、匀、顺、和、光"八字要诀，双面绣技艺尤见功力。'),
  H(5, '景德镇手工制瓷技艺', '传统技艺', '江西景德镇', '国家级', 2006,
    '景德镇制瓷历经千年窑火，七十二道工序环环相扣，"白如玉、明如镜、薄如纸、声如磬"是对其青花、玲珑、粉彩、颜色釉四大名瓷的最好写照。'),
  H(6, '皮影戏', '传统戏剧', '陕西华县', '国家级', 2006,
    '皮影戏又称"影子戏"，艺人操纵兽皮雕制的人物剪影，借灯光投影于白色幕布演唱故事，集绘画、雕刻、音乐、表演于一体，是流传千年的"电影鼻祖"。'),
  H(7, '古琴艺术', '传统音乐', '北京', '国家级', 2003,
    '古琴是中国最古老的弹拨乐器之一，有三千年以上历史，位列"琴棋书画"四艺之首。其"泛音、走手音、散音"三种音色营造出深远意境，2003年入选人类非物质文化遗产代表作名录。'),
  H(8, '二十四节气', '民俗', '全国', '国家级', 2006,
    '二十四节气是中国人通过观察太阳周年运动而形成的时间知识体系，指导传统农业生产与日常生活，被国际气象界誉为"中国的第五大发明"，2016年入选人类非遗代表作名录。'),
  H(9, '太极拳', '传统体育', '河北永年', '国家级', 2006,
    '太极拳以阴阳循环、刚柔相济为理念，集颐养性情、强身健体、技击对抗于一体。杨氏、陈氏、武氏等流派各具风采，2020年列入人类非物质文化遗产代表作名录。'),
  H(10, '中医针灸', '传统医药', '全国', '国家级', 2006,
    '针灸是源自远古的中医诊疗技术，以"捻转提插"的针法与艾灸调理经络气血，2010年入选人类非物质文化遗产代表作名录，如今已传播到一百八十多个国家和地区。'),
  H(11, '杨柳青木版年画', '传统美术', '天津杨柳青', '国家级', 2006,
    '杨柳青年画始于明代，"半印半绘"的工艺融合版画与彩绘之长，构图丰满、笔法匀整，"家家会点染，户户善丹青"是当年运河两岸的繁华写照。'),
  H(12, '龙泉青瓷烧制技艺', '传统技艺', '浙江龙泉', '国家级', 2006,
    '龙泉青瓷始于三国两晋，以釉色青翠如玉著称，哥窑"金丝铁线"、弟窑"梅子初青"各领风骚，是全球唯一入选人类非遗代表作名录的陶瓷类项目。'),
  H(13, '南京云锦织造技艺', '传统技艺', '江苏南京', '国家级', 2006,
    '云锦因纹样瑰丽如天上云霞而得名，采用"通经断纬"的大花楼木织机，两位织工配合一天仅能织出数厘米，代表了古代丝织工艺的最高成就。'),
  H(14, '川剧', '传统戏剧', '四川成都', '国家级', 2006,
    '川剧流行于川渝云贵地区，以"变脸、吐火、滚灯"等绝技闻名遐迩，高腔曲牌丰富，唱腔诙谐泼辣，充分体现了巴蜀文化的幽默与机趣。'),
  H(15, '泉州提线木偶戏', '传统戏剧', '福建泉州', '国家级', 2006,
    '提线木偶戏古称"悬丝傀儡"，木偶全身布有十余至三十余条提线，艺人操纵丝线使木偶做出开扇、舞剑等细腻动作，是宋元时期"百戏"遗韵的活化石。'),
  H(16, '潍坊风筝制作技艺', '传统技艺', '山东潍坊', '国家级', 2006,
    '潍坊是"世界风筝之都"，风筝扎制讲究"扎、糊、绘、放"四艺，龙头蜈蚣风筝长达百米，造型精美、放飞平稳，是北派风筝的杰出代表。'),
  H(17, '宜兴紫砂陶制作技艺', '传统技艺', '江苏宜兴', '国家级', 2006,
    '紫砂陶以当地独有的紫砂泥为原料，经打泥片、拍身筒等全手工技法成型，"方非一式，圆不一相"，兼具实用性与文人审美，被誉为"茶具之首"。'),
  H(18, '苗族银饰锻制技艺', '传统技艺', '贵州雷山', '国家级', 2006,
    '苗族银饰经铸炼、捶打、拉丝、錾刻等三十多道工序制成，盛装银饰可达十余公斤，"以钱为饰、以美为饰"承载着苗族迁徙历史与图腾信仰。'),
  H(19, '热贡艺术', '传统美术', '青海黄南', '国家级', 2006,
    '热贡艺术是藏传佛教艺术的重要流派，涵盖唐卡、堆绣、雕塑等，笔法细腻、色彩浓艳，同仁县吾屯村"家家作画、人人从艺"，2009年入选人类非遗代表作名录。'),
  H(20, '侗族大歌', '传统音乐', '贵州黎平', '国家级', 2006,
    '侗族大歌是无指挥、无伴奏、多声部的民间合唱，模拟鸟叫虫鸣、高山流水，"饭养身、歌养心"是侗家人的生活信条，2009年入选人类非遗代表作名录。'),
  H(21, '蒙古族长调民歌', '传统音乐', '内蒙古', '国家级', 2006,
    '长调是草原游牧文化的音乐结晶，旋律悠长舒缓、意境开阔，字少腔多、"诺古拉"颤音独具神韵，2005年与蒙古国联合申报入选人类非遗代表作名录。'),
  H(22, '端午节', '民俗', '湖北秭归', '国家级', 2006,
    '端午节是集祈福、饮食、竞渡于一体的传统大节，龙舟竞渡、粽叶飘香、艾草悬门，寄托着人们纪念屈原、驱邪避疫的美好愿望，2009年入选人类非遗代表作名录。'),
  H(23, '徽州三雕', '传统美术', '安徽黄山', '国家级', 2006,
    '徽州三雕指古建筑中的木雕、石雕、砖雕，广泛用于祠堂、牌坊与民居装饰，刀法精巧、层次丰富，是徽派建筑"雅、丽、巧"审美趣味的集中体现。'),
  H(24, '蜀绣', '传统美术', '四川成都', '国家级', 2006,
    '蜀绣又称"川绣"，是中国四大名绣中历史最悠久者，以晕针、铺针等一百余种针法见长，片线光亮、针脚整齐，芙蓉鲤鱼与熊猫是其经典题材。'),
  H(25, '苗族蜡染技艺', '传统技艺', '贵州丹寨', '国家级', 2006,
    '蜡染古称"蜡缬"，以铜刀蘸蜡在土布上描绘花鸟鱼虫，浸染后去蜡现出蓝底白花，冰裂纹天然成趣，被称为"东方第一染"。'),
  H(26, '妈祖祭典', '民俗', '福建莆田', '国家级', 2006,
    '妈祖信俗发源于福建湄洲岛，千年香火绵延，祭典仪程庄重典雅，是全球三亿妈祖信众的精神纽带，2009年成为我国首个信俗类人类非遗代表作。'),
  H(27, '少林功夫', '传统体育', '河南登封', '国家级', 2006,
    '少林功夫以禅入武、武禅一体，套路多达七百余种，讲究"禅武合一"的修行境界，是中国武术流派中体系最完整、影响最广者之一。')
]

/* ============ 种子数据：传承人名录 ============ */

function avatarImage(char) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120">
    <rect width="100%" height="100%" fill="#c8a45d"/>
    <text x="50%" y="54%" font-size="56" fill="#fff" text-anchor="middle" dominant-baseline="middle"
      font-family="'STZhongsong','SimSun',serif" font-weight="bold">${char}</text></svg>`
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg)
}

const inheritorList = [
  { id: 1, name: '沈云岚', craft: '苏绣', region: '江苏苏州', title: '国家级代表性传承人', years: 42, bio: '出身刺绣世家，首创"双面三异绣"，作品多次作为国礼出访。' },
  { id: 2, name: '顾锦年', craft: '南京云锦织造技艺', region: '江苏南京', title: '国家级代表性传承人', years: 38, bio: '四十年坚守大花楼木织机，主持复原失传的"妆花缎"织造工艺。' },
  { id: 3, name: '吴砚秋', craft: '昆曲', region: '江苏昆山', title: '国家级代表性传承人', years: 45, bio: '工闺门旦，师承"传字辈"名家，致力于昆曲进校园推广。' },
  { id: 4, name: '白玛次仁', craft: '热贡艺术', region: '青海黄南', title: '国家级代表性传承人', years: 40, bio: '唐卡勉萨画派画师，矿物颜料调制技艺独步热贡，带徒六十余人。' },
  { id: 5, name: '梁少华', craft: '皮影戏', region: '陕西华县', title: '省级代表性传承人', years: 35, bio: '"五人忙"班社班主，能同时操纵七个皮影并开口演唱。' },
  { id: 6, name: '潘素梅', craft: '侗族大歌', region: '贵州黎平', title: '国家级代表性传承人', years: 30, bio: '侗族歌师，整理侗族大歌曲谱三百余首，组建村寨少儿歌班。' },
  { id: 7, name: '陆阿明', craft: '宜兴紫砂陶制作技艺', region: '江苏宜兴', title: '国家级代表性传承人', years: 48, bio: '全手工方器名家，作品"浑方壶"被多家博物馆收藏。' },
  { id: 8, name: '雷秀英', craft: '苗族蜡染技艺', region: '贵州丹寨', title: '省级代表性传承人', years: 32, bio: '铜刀在手四十年，绘蜡不打底稿，图案行云流水。' },
  { id: 9, name: '郑守义', craft: '潍坊风筝制作技艺', region: '山东潍坊', title: '国家级代表性传承人', years: 50, bio: '扎制龙头蜈蚣风筝的行家，风筝作品屡获国际风筝会金奖。' },
  { id: 10, name: '林婉如', craft: '中国剪纸', region: '河北蔚县', title: '省级代表性传承人', years: 28, bio: '蔚县点彩刻纸新生代传人，将年画戏曲人物融入剪纸创作。' }
].map((p) => ({ ...p, avatar: avatarImage(p.name[0]) }))

/* ============ 种子数据：默认账号与评论 ============ */

const seedUsers = [
  { id: 1, username: 'chenyu', password: '123456', nickname: '陈雨', role: '学生', createdAt: '2026-03-01 10:00:00' },
  { id: 2, username: 'linwan', password: '123456', nickname: '林晚', role: '学生', createdAt: '2026-03-02 14:30:00' }
]

const seedComments = [
  { id: 1, heritageId: 1, username: 'linwan', nickname: '林晚', content: '在苏州看了《牡丹亭》游园惊梦一折，水磨腔真的太美了！', createdAt: '2026-03-10 20:15:00' },
  { id: 2, heritageId: 1, username: 'chenyu', nickname: '陈雨', content: '学校昆曲社每周都有体验课，推荐大家去试试。', createdAt: '2026-03-11 09:40:00' },
  { id: 3, heritageId: 3, username: 'chenyu', nickname: '陈雨', content: '奶奶的窗花手艺就是跟她母亲学的，一剪一世界。', createdAt: '2026-03-12 18:05:00' },
  { id: 4, heritageId: 5, username: 'linwan', nickname: '林晚', content: '去景德镇玩过拉坯，七十二道工序果然名不虚传。', createdAt: '2026-03-13 12:22:00' },
  { id: 5, heritageId: 9, username: 'chenyu', nickname: '陈雨', content: '每天早上公园里都是练太极的爷爷奶奶，精气神十足。', createdAt: '2026-03-14 07:50:00' },
  { id: 6, heritageId: 13, username: 'linwan', nickname: '林晚', content: '云锦研究所的大花楼织机要两个人同时操作，震撼。', createdAt: '2026-03-15 16:30:00' },
  { id: 7, heritageId: 22, username: 'chenyu', nickname: '陈雨', content: '今年端午在家包了粽子，也给孩子讲了屈原的故事。', createdAt: '2026-03-16 21:10:00' }
]

/* ============ 工具函数 ============ */

// 解析 URL 中的查询参数，如 /api/heritages?page=1&keyword=昆曲
function getQuery(url) {
  const query = {}
  const index = url.indexOf('?')
  if (index > -1) {
    url
      .slice(index + 1)
      .split('&')
      .forEach((pair) => {
        const [k, v] = pair.split('=')
        query[decodeURIComponent(k)] = decodeURIComponent(v ?? '')
      })
  }
  return query
}

function parseBody(options) {
  try {
    return options.body ? JSON.parse(options.body) : {}
  } catch {
    return {}
  }
}

const ok = (data, message = 'ok') => ({ code: 200, message, data })
const fail = (message, code = 400) => ({ code, message, data: null })

function findHeritage(id) {
  return heritageList.find((h) => h.id === Number(id))
}

/* ============ 注册接口拦截规则 ============ */
// 注意：注册顺序即匹配优先级，路径更具体的接口要先注册

// ---------- 用户模块 ----------
Mock.mock(RegExp('^/api/user/login'), 'post', (options) => {
  const { username, password } = parseBody(options)
  const db = getDB()
  const user = db.users.find((u) => u.username === username && u.password === password)
  if (!user) return fail('用户名或密码错误')
  const { password: _pwd, ...userInfo } = user
  // token 由服务端签发（本项目由 Mock 生成），前端保存后随请求头 Authorization 携带
  return ok({ token: `mock-token-${user.id}-${Date.now()}`, userInfo }, '登录成功')
})

Mock.mock(RegExp('^/api/user/register'), 'post', (options) => {
  const { username, password, nickname } = parseBody(options)
  if (!username || !password) return fail('用户名和密码不能为空')
  const db = getDB()
  if (db.users.some((u) => u.username === username)) return fail('用户名已存在，请更换')
  const newUser = {
    id: db.users.length + 1,
    username,
    password,
    nickname: nickname || username,
    role: '学生',
    createdAt: Mock.mock('@datetime("yyyy-MM-dd HH:mm:ss")')
  }
  db.users.push(newUser)
  saveDB(db)
  return ok({ id: newUser.id, username, nickname: newUser.nickname }, '注册成功')
})

Mock.mock(RegExp('^/api/user/update'), 'post', (options) => {
  const { username, nickname } = parseBody(options)
  if (!username) return fail('参数缺失')
  if (!nickname || !nickname.trim()) return fail('昵称不能为空')
  const db = getDB()
  const user = db.users.find((u) => u.username === username)
  if (!user) return fail('用户不存在')
  user.nickname = nickname.trim()
  saveDB(db)
  const { password: _pwd, ...userInfo } = user
  return ok(userInfo, '资料更新成功')
})

// ---------- 统计模块（首页数据看板） ----------
Mock.mock(RegExp('^/api/stats'), 'get', () => {
  // 按门类聚合：{ name: 门类名, count: 项目数量 }，首页分类导航使用
  const countMap = heritageList.reduce((acc, h) => {
    acc[h.category] = (acc[h.category] || 0) + 1
    return acc
  }, {})
  const categories = Object.entries(countMap).map(([name, count]) => ({ name, count }))
  return ok({
    heritageCount: heritageList.length,
    categoryCount: categories.length,
    inheritorCount: inheritorList.length,
    nationalCount: heritageList.filter((h) => h.level === '国家级').length,
    categories
  })
})

// ---------- 非遗项目模块 ----------
// 详情（必须先于列表注册，否则会被列表规则抢先匹配）
Mock.mock(RegExp('^/api/heritages/detail'), 'get', (options) => {
  const { id } = getQuery(options.url)
  const item = findHeritage(id)
  if (!item) return fail('非遗项目不存在')
  // 顺带返回"相关推荐"：同类别下的其他项目
  const related = heritageList.filter((h) => h.category === item.category && h.id !== item.id).slice(0, 3)
  return ok({ ...item, related })
})

// 首页精选：按关注人数取前 6 个
Mock.mock(RegExp('^/api/heritages/hot'), 'get', () => {
  const hot = [...heritageList].sort((a, b) => b.followers - a.followers).slice(0, 6)
  return ok(hot)
})

// 列表：支持 关键词 / 类别 / 分页
Mock.mock(RegExp('^/api/heritages'), 'get', (options) => {
  const { keyword = '', category = '', page = 1, pageSize = 9 } = getQuery(options.url)
  let list = heritageList
  if (category) list = list.filter((h) => h.category === category)
  if (keyword) {
    const kw = keyword.toLowerCase()
    list = list.filter(
      (h) =>
        h.name.toLowerCase().includes(kw) ||
        h.region.toLowerCase().includes(kw) ||
        h.description.toLowerCase().includes(kw)
    )
  }
  const total = list.length
  const start = (Number(page) - 1) * Number(pageSize)
  return ok({ list: list.slice(start, start + Number(pageSize)), total, page: Number(page), pageSize: Number(pageSize) })
})

// ---------- 传承人模块 ----------
Mock.mock(RegExp('^/api/inheritors'), 'get', () => ok(inheritorList))

// ---------- 评论模块 ----------
// 当前用户发表的评论（聚合所属非遗项目名称）。注意：必须先于列表接口注册，否则被 ^/api/comments 抢先匹配
Mock.mock(RegExp('^/api/comments/mine'), 'get', (options) => {
  const { username } = getQuery(options.url)
  const db = getDB()
  const list = db.comments
    .filter((c) => c.username === username)
    .map((c) => {
      const heritage = findHeritage(c.heritageId)
      return { ...c, heritageName: heritage ? heritage.name : '项目已移除' }
    })
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
  return ok(list)
})

Mock.mock(RegExp('^/api/comments'), 'get', (options) => {
  const { heritageId } = getQuery(options.url)
  const db = getDB()
  const list = db.comments
    .filter((c) => c.heritageId === Number(heritageId))
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
  return ok(list)
})

Mock.mock(RegExp('^/api/comments'), 'post', (options) => {
  const body = parseBody(options)
  if (!body.content || !body.content.trim()) return fail('评论内容不能为空')
  const db = getDB()
  const comment = {
    id: db.comments.length + 1,
    heritageId: Number(body.heritageId),
    username: body.username,
    nickname: body.nickname || body.username,
    content: body.content.trim(),
    createdAt: Mock.mock('@datetime("yyyy-MM-dd HH:mm:ss")')
  }
  db.comments.push(comment)
  saveDB(db)
  return ok(comment, '评论发表成功')
})

// ---------- 收藏模块 ----------
// 取消/收藏切换
Mock.mock(RegExp('^/api/favorites/toggle'), 'post', (options) => {
  const { username, heritageId } = parseBody(options)
  if (!username || !heritageId) return fail('参数缺失')
  const db = getDB()
  db.favorites[username] = db.favorites[username] || []
  const list = db.favorites[username]
  const index = list.findIndex((f) => f.heritageId === Number(heritageId))
  let favorited
  if (index > -1) {
    list.splice(index, 1) // 已收藏 → 取消
    favorited = false
  } else {
    list.push({ heritageId: Number(heritageId), createdAt: Mock.mock('@datetime("yyyy-MM-dd HH:mm:ss")') })
    favorited = true
  }
  saveDB(db)
  return ok({ favorited, heritageId: Number(heritageId) }, favorited ? '已加入收藏' : '已取消收藏')
})

// 收藏列表：把收藏 id 解析成完整的非遗项目对象
Mock.mock(RegExp('^/api/favorites'), 'get', (options) => {
  const { username } = getQuery(options.url)
  const db = getDB()
  const list = (db.favorites[username] || [])
    .map((f) => {
      const heritage = findHeritage(f.heritageId)
      return heritage ? { ...heritage, favoritedAt: f.createdAt } : null
    })
    .filter(Boolean)
    .sort((a, b) => (a.favoritedAt < b.favoritedAt ? 1 : -1))
  return ok(list)
})

export default Mock
