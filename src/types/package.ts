export type PackageStatus = 'available' | 'claimed' | 'locked'

/** GIFT.json 中的球员池类型 */
export type PoolType = 'A' | 'B' | 'C'

export interface Player {
  /** 球员编号 1~39，对应 Picture 目录中的素材 */
  id: number
  /** 两位编号，例如 01 */
  code: string
  name: string
  image: string
}

/** 可抽出球员池（GIFT.json 中的 Type / Name / Include） */
export interface PlayerPool {
  type: PoolType
  name: string
  players: Player[]
}

/**
 * 礼包内的一个内容面板（小礼包）。
 * 01~04 只有一个面板；05~07 是「综合礼包」，由两个面板并排组成。
 */
export interface PackageBundle {
  id: string
  /** 球包名字（显示在概率下方） */
  tags: string[]
  /** 该池内每名球员单次抽中的概率（百分比） */
  probability: number
  /** 该面板的抽取次数（01、02 为 2 次，其余为 1 次） */
  draws: number
  /** 右下角小缩略图 */
  thumbnail: string
  /** 该面板使用的球员池 */
  poolType: PoolType
  /** 卡片上预览的可抽出球员 */
  players: Player[]
}

export interface GiftPackage {
  id: number
  /** 卡片左上角的大编号，例如 01 */
  code: string
  status: PackageStatus
  price: number
  bundles: PackageBundle[]
}

/** 单次抽卡结果：一个面板抽出一名球员 */
export interface DrawOutcome {
  bundleId: string
  poolName: string
  player: Player
}

/** 一个礼包的完整抽卡结果 */
export interface DrawResult {
  packageId: number
  code: string
  price: number
  outcomes: DrawOutcome[]
}
