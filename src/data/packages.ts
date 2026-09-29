import type { GiftPackage, Player, PlayerPool, PoolType } from '../types/package'

/** 拼接静态资源地址：生产构建（Electron file://）下 BASE_URL 为 './'，开发环境为 '/' */
const asset = (path: string) => `${import.meta.env.BASE_URL}assets/${path}`

const cardImage = (code: string) => asset(`cards/${code}.png`)

/** Picture 目录下的 39 名球员，顺序与编号一一对应 */
const playerNames = [
  '梅西', '伊涅斯塔', '亚马尔', '贝利', '里瓦尔多', '图雷', '范布隆克霍斯特', '埃德米尔森',
  '克鲁伊维特', '埃托奥', '厄德高', '居莱尔', '沃尔特梅德', '索尔洛特', '费尔明', '斯托伊科维奇',
  '刘诚宇', '斯科尔斯', '阿尔坎塔拉', '希尔维斯特', '科斯塔', '多纳鲁马', '维蒂尼亚', '伊尔迪兹',
  '戴维拉亚', '梅里诺', '吉塞拉', '杰拉德皮克', '阿圭罗', '赛维奥拉', '费雷尔', '科库',
  '欧文', 'A.戴维斯', '瓜迪奥拉', '奥巴梅杨', '威廉帕乔', '切尔基', '穆勒',
]

/** 编号 -> 球员 */
export const roster: Record<string, Player> = Object.fromEntries(
  playerNames.map((name, index) => {
    const code = String(index + 1).padStart(2, '0')
    return [code, { id: index + 1, code, name, image: cardImage(code) }]
  }),
)

/** GIFT.json 中的三个球员池 */
const poolDefinitions: { type: PoolType; name: string; include: string }[] = [
  {
    type: 'A',
    name: '绿茵明星',
    include: '01,02,03,04,16,05,06,17,07,18,19,09,10,20,21,22,23,24,25,11,12,26,27',
  },
  {
    type: 'B',
    name: '群英荟萃',
    include: '01,02,03,04,28,29,30,31,32,33,34,35,08,36,37,38,13,14,15,39',
  },
  {
    type: 'C',
    name: '名将列传',
    include: '01,02,03,04,05,06,07,08,09,10,11,12,13,14,15',
  },
]

export const pools = Object.fromEntries(
  poolDefinitions.map(({ type, name, include }) => [
    type,
    {
      type,
      name,
      players: include.split(',').map((code) => roster[code]),
    } satisfies PlayerPool,
  ]),
) as Record<PoolType, PlayerPool>

/** 卡片右下角的小礼包缩略图：01 用 A-10%，02 用 A-30%，其余统一 A-100% */
const thumbnailFor = (code: string) => {
  if (code === '01') return asset('packs/a-10.png')
  if (code === '02') return asset('packs/a-30.png')
  return asset('packs/a-100.png')
}

/** 出包概率：01 为 10%，02 为 30%，03~07 为 100% */
const probabilityFor = (code: string) => {
  if (code === '01') return 10
  if (code === '02') return 30
  return 100
}

/** 单次购买内的抽取次数：01、02 各抽两次，03~07 各抽一次 */
const drawCountFor = (code: string) => (code === '01' || code === '02' ? 2 : 1)

/** GIFT.json 中的礼包定义：UseType 按顺序引用球员池，A,B 表示两个面板分别用池 A 与池 B */
const packageDefinitions: { code: string; useType: string; price: number }[] = [
  { code: '01', useType: 'A', price: 1680 },
  { code: '02', useType: 'A', price: 4400 },
  { code: '03', useType: 'A', price: 6800 },
  { code: '04', useType: 'B', price: 6800 },
  { code: '05', useType: 'A,B', price: 11800 },
  { code: '06', useType: 'A,C', price: 9800 },
  { code: '07', useType: 'C,A', price: 8800 },
]

/**
 * 礼包列表：第一个可购买，其余在前置礼包领取后依次解锁。
 * 出包概率由礼包编号决定：01=10%、02=30%、03~07=100%（每次购买内的抽取次数：01、02 各 2 次）。
 */
export const packages: GiftPackage[] = packageDefinitions.map((definition, index) => ({
  id: index + 1,
  code: definition.code,
  status: index === 0 ? 'available' : 'locked',
  price: definition.price,
  bundles: (definition.useType.split(',') as PoolType[]).map((poolType, bundleIndex) => {
    const pool = pools[poolType]
    const draws = drawCountFor(definition.code)
    return {
      id: `${definition.code}-${String.fromCharCode(97 + bundleIndex)}`,
      tags: [draws > 1 ? `${pool.name}x${draws}` : pool.name],
      probability: probabilityFor(definition.code),
      draws,
      thumbnail: thumbnailFor(definition.code),
      poolType,
      players: pool.players.slice(0, 2),
    }
  }),
}))
