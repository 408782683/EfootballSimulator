/**
 * 交互音效：点击音效与重置音效。
 * 音频位于 public/sound 下，生产构建（Electron file://）通过 BASE_URL 解析为相对路径。
 */
type SoundName = 'click' | 'reset'

const SOURCES: Record<SoundName, string> = {
  click: 'sound/click.mp3',
  reset: 'sound/reset.mp3',
}

const cache = new Map<SoundName, HTMLAudioElement>()

const getAudio = (name: SoundName) => {
  let audio = cache.get(name)
  if (!audio) {
    audio = new Audio(`${import.meta.env.BASE_URL}${SOURCES[name]}`)
    audio.preload = 'auto'
    cache.set(name, audio)
  }
  return audio
}

const play = (name: SoundName) => {
  const audio = getAudio(name)
  audio.currentTime = 0
  // 浏览器可能因策略拒绝播放，静默忽略即可，不影响交互
  void audio.play().catch(() => {})
}

/** 点击音效：购买、查看详情等所有点击操作 */
export const playClickSound = () => play('click')

/** 重置音效：重置礼包状态、关闭详情弹窗等操作 */
export const playResetSound = () => play('reset')
