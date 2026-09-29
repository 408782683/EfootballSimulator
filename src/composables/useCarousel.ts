import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import type { GiftPackage } from '../types/package'

/** 位移动画时长，需要与 CSS transition 保持一致 */
const ANIMATION_DURATION = 450
/** 过滤触控板/滚轮的微小抖动 */
const MIN_WHEEL_DELTA = 8
/** 超过该位移才判定为拖拽（否则视为点击，交给卡片上的按钮处理） */
const CLICK_TOLERANCE = 6

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max)

interface CarouselOptions {
  initialIndex?: number
  /** 当前卡片中心在 viewport 中的横向比例 */
  focalRatio?: number
  onIndexChange?: (index: number) => void
}

/**
 * 真实横向 Carousel（自由平滑滚动）：
 * - 所有卡片始终留在轨道里，通过 translate3d 连续位移，不做 DOM 增删
 * - 轨道位移基于「测量到的卡片中心点」，因此 05~07 这种更宽的双礼包卡片同样能精确定位
 * - 拖拽松手后停留在当前位置，不吸附、不回中
 * - 只有位移超过 CLICK_TOLERANCE 才接管指针，保证金币/购买等按钮的 click 依然有效
 */
export const useCarousel = (items: GiftPackage[], options: CarouselOptions = {}) => {
  const { initialIndex = 0, focalRatio = 0.5, onIndexChange } = options

  const currentIndex = ref(clamp(initialIndex, 0, Math.max(items.length - 1, 0)))
  /** 当前落在 focalX 上的轨道坐标（连续量，单位为 px） */
  const position = ref(0)
  const isDragging = ref(false)
  const isAnimating = ref(false)
  const transitionEnabled = ref(true)
  const suppressClick = ref(false)
  /** 首次测量完成前先隐藏轨道，避免定位闪烁 */
  const isReady = ref(false)

  const viewportRef = ref<HTMLElement | null>(null)
  /** 每张卡片中心点在轨道坐标系中的位置 */
  const offsets = ref<number[]>([])
  /** 当前卡片中心的落点 */
  const focalX = ref(0)

  const itemEls: (HTMLElement | null)[] = []
  let activePointerId: number | null = null
  let hasCaptured = false
  let pointerStartX = 0
  let startPosition = 0
  let animationTimer: number | undefined
  let resizeObserver: ResizeObserver | undefined

  const setViewportRef = (el: unknown) => {
    viewportRef.value = (el as HTMLElement | null) ?? null
  }

  const setItemRef = (el: unknown, index: number) => {
    itemEls[index] = (el as HTMLElement | null) ?? null
  }

  const minPosition = computed(() => offsets.value[0] ?? 0)
  const maxPosition = computed(() => {
    const list = offsets.value
    return list.length > 0 ? list[list.length - 1] : 0
  })

  /** 重新测量卡片中心点，双礼包卡片更宽，必须依赖真实布局 */
  const measure = () => {
    const viewport = viewportRef.value
    if (!viewport) {
      return
    }

    focalX.value = viewport.clientWidth * focalRatio

    const next: number[] = []
    for (let index = 0; index < items.length; index += 1) {
      const el = itemEls[index]
      next.push(el ? el.offsetLeft + el.offsetWidth / 2 : (next[index - 1] ?? 0) + 600)
    }

    offsets.value = next
    isReady.value = next.length > 0

    // 拖拽过程中不要打断当前位移；其余情况按当前卡片重新落位
    if (next.length > 0 && !isDragging.value) {
      position.value = next[clamp(currentIndex.value, 0, next.length - 1)]
    }
  }

  /** 相邻卡片的中心间距：缩放插值依赖它 */
  const step = computed(() => {
    const list = offsets.value
    const index = clamp(currentIndex.value, 0, Math.max(list.length - 1, 0))
    if (list.length < 2) {
      return 1
    }

    const right = list[index + 1]
    if (right !== undefined) {
      return Math.max(Math.abs(right - list[index]), 1)
    }

    return Math.max(Math.abs(list[index] - list[index - 1]), 1)
  })

  /** 距离某个轨道坐标最近的卡片下标 */
  const nearestIndex = (x: number) => {
    const list = offsets.value
    if (list.length === 0) {
      return 0
    }

    let bestIndex = 0
    let bestDistance = Number.POSITIVE_INFINITY
    for (let index = 0; index < list.length; index += 1) {
      const distance = Math.abs(list[index] - x)
      if (distance < bestDistance) {
        bestDistance = distance
        bestIndex = index
      }
    }

    return bestIndex
  }

  const startAnimation = () => {
    window.clearTimeout(animationTimer)
    isAnimating.value = true
    animationTimer = window.setTimeout(() => {
      isAnimating.value = false
    }, ANIMATION_DURATION)
  }

  /** 平滑位移到指定卡片（幂等：已经在该卡片时不做任何位移，避免拖拽后被拉回中心） */
  const goTo = (index: number) => {
    const nextIndex = clamp(index, 0, Math.max(items.length - 1, 0))
    if (nextIndex === currentIndex.value) {
      return
    }

    transitionEnabled.value = true
    currentIndex.value = nextIndex
    position.value = offsets.value[nextIndex] ?? 0
    startAnimation()
    onIndexChange?.(nextIndex)
  }

  const goNext = () => {
    if (isAnimating.value || isDragging.value) {
      return
    }

    goTo(currentIndex.value + 1)
  }

  const goPrev = () => {
    if (isAnimating.value || isDragging.value) {
      return
    }

    goTo(currentIndex.value - 1)
  }

  const onPointerDown = (event: PointerEvent) => {
    if (event.pointerType === 'mouse' && event.button !== 0) {
      return
    }

    if (isAnimating.value) {
      return
    }

    // 此处刻意不调用 setPointerCapture：否则 click 会被重定向到 viewport，
    // 导致金币 / 购买等按钮失效。只有确认是拖拽后才接管指针。
    activePointerId = event.pointerId
    hasCaptured = false
    isDragging.value = true
    suppressClick.value = false
    pointerStartX = event.clientX
    startPosition = position.value
    transitionEnabled.value = false
  }

  const onPointerMove = (event: PointerEvent) => {
    if (!isDragging.value || event.pointerId !== activePointerId) {
      return
    }

    const delta = event.clientX - pointerStartX

    if (!hasCaptured) {
      if (Math.abs(delta) <= CLICK_TOLERANCE) {
        return
      }

      viewportRef.value?.setPointerCapture?.(event.pointerId)
      hasCaptured = true
      suppressClick.value = true
    }

    // 自由滚动：直接跟随指针，松手后停在这里（不做吸附）
    position.value = clamp(startPosition - delta, minPosition.value, maxPosition.value)
  }

  const releaseCapture = (event: PointerEvent) => {
    const viewport = viewportRef.value
    if (
      hasCaptured &&
      activePointerId !== null &&
      viewport?.hasPointerCapture?.(event.pointerId)
    ) {
      viewport.releasePointerCapture(event.pointerId)
    }
    hasCaptured = false
    activePointerId = null
  }

  const onPointerUp = (event: PointerEvent) => {
    if (!isDragging.value || event.pointerId !== activePointerId) {
      releaseCapture(event)
      return
    }

    releaseCapture(event)
    isDragging.value = false
    transitionEnabled.value = true

    // 保持当前滚动位置：只更新「当前卡片」的归属，不改变轨道位移
    const nextIndex = nearestIndex(position.value)
    if (nextIndex !== currentIndex.value) {
      currentIndex.value = nextIndex
      onIndexChange?.(nextIndex)
    }

    window.setTimeout(() => {
      suppressClick.value = false
    }, 0)
  }

  const onWheel = (deltaY: number) => {
    if (isAnimating.value || isDragging.value || Math.abs(deltaY) < MIN_WHEEL_DELTA) {
      return
    }

    if (deltaY > 0) {
      goNext()
      return
    }

    goPrev()
  }

  /** 轨道整体位移：让 position 对应的轨道坐标落在 focalX 上 */
  const trackStyle = computed(() => {
    const x = focalX.value - position.value
    return { transform: `translate3d(${x}px, 0, 0)` }
  })

  /** 单卡片的透明度 / 亮度：按卡片与落点的距离插值；尺寸保持不变（传送带效果） */
  const getItemStyle = (index: number) => {
    const center = offsets.value[index] ?? 0
    const distance = (center - position.value) / step.value
    const absoluteDistance = Math.abs(distance)

    let opacity = 0.58
    let brightness = 0.74

    if (absoluteDistance < 1) {
      opacity = 1 - absoluteDistance * 0.12
      brightness = 1 - absoluteDistance * 0.08
    } else if (absoluteDistance < 2) {
      opacity = 0.88 - (absoluteDistance - 1) * 0.2
      brightness = 0.92 - (absoluteDistance - 1) * 0.18
    }

    return {
      opacity: opacity.toFixed(3),
      filter: `brightness(${brightness.toFixed(3)})`,
      zIndex: `${200 - Math.round(absoluteDistance * 40)}`,
    }
  }

  const canGoPrev = computed(() => currentIndex.value > 0)
  const canGoNext = computed(() => currentIndex.value < items.length - 1)

  onMounted(() => {
    measure()
    window.addEventListener('resize', measure)

    if (typeof ResizeObserver !== 'undefined' && viewportRef.value) {
      resizeObserver = new ResizeObserver(measure)
      resizeObserver.observe(viewportRef.value)
    }
  })

  onBeforeUnmount(() => {
    window.clearTimeout(animationTimer)
    window.removeEventListener('resize', measure)
    resizeObserver?.disconnect()
  })

  return {
    viewportRef,
    setViewportRef,
    setItemRef,
    currentIndex,
    transitionEnabled,
    isAnimating,
    isDragging,
    suppressClick,
    isReady,
    canGoPrev,
    canGoNext,
    goNext,
    goPrev,
    goTo,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onWheel,
    trackStyle,
    getItemStyle,
  }
}
