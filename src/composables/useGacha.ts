import { reactive, ref } from 'vue'
import type { DrawOutcome, DrawResult, GiftPackage, PackageBundle } from '../types/package'
import { pools } from '../data/packages'

const pickRandom = <T>(list: T[]): T => list[Math.floor(Math.random() * list.length)]

/**
 * 连锁礼包抽卡：礼包按顺序购买，领取后解锁下一个。
 * 每个面板按礼包概率决定是否出球员：01=10%、02=30%（可能不出），03~07=100%（必出其中随机1名）。
 * 01、02 每个面板抽取两次（各自独立判定），因此一次购买可能抽到 0~2 名球员。
 */
export function useGacha(definitions: GiftPackage[]) {
  const packages = reactive(
    definitions.map((giftPackage) => ({ ...giftPackage, bundles: [...giftPackage.bundles] })),
  )

  const lastResult = ref<DrawResult | null>(null)

  /** 按面板的抽取次数逐次判定，命中的次数即为抽到的球员 */
  const drawBundle = (bundle: PackageBundle): DrawOutcome[] => {
    const pool = pools[bundle.poolType]
    const outcomes: DrawOutcome[] = []

    for (let draw = 0; draw < bundle.draws; draw += 1) {
      if (Math.random() * 100 >= bundle.probability) {
        continue
      }
      outcomes.push({ bundleId: bundle.id, poolName: pool.name, player: pickRandom(pool.players) })
    }

    return outcomes
  }

  /** 购买礼包：标记为已领取、解锁下一个，并返回抽卡结果 */
  const purchase = (packageId: number): DrawResult | null => {
    const index = packages.findIndex((giftPackage) => giftPackage.id === packageId)
    const giftPackage = packages[index]

    if (!giftPackage || giftPackage.status !== 'available') {
      return null
    }

    giftPackage.status = 'claimed'

    const nextPackage = packages[index + 1]
    if (nextPackage && nextPackage.status === 'locked') {
      nextPackage.status = 'available'
    }

    const result: DrawResult = {
      packageId: giftPackage.id,
      code: giftPackage.code,
      price: giftPackage.price,
      outcomes: giftPackage.bundles.flatMap(drawBundle),
    }

    lastResult.value = result
    return result
  }

  /** 重置礼包状态：回到初始状态（仅 01 可购买），并清空上一次抽卡结果 */
  const reset = () => {
    packages.forEach((giftPackage, index) => {
      giftPackage.status = index === 0 ? 'available' : 'locked'
    })
    lastResult.value = null
  }

  return { packages, lastResult, purchase, reset }
}
