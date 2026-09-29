import { createApp } from 'vue'
import App from './App.vue'
import './style.css'

createApp(App).mount('#app')

// TEMP-DEBUG (remove)
if (location.search.includes('measure')) {
  window.setTimeout(() => {
    const pct = (v: number, base: number) => +(100 * v / base).toFixed(2)
    const box = (el: Element | null) => {
      if (!el) return null
      const r = el.getBoundingClientRect()
      return [pct(r.left, innerWidth), pct(r.top, innerHeight), pct(r.width, innerWidth), pct(r.height, innerHeight)]
    }
    const out: Record<string, unknown> = { vw: innerWidth, vh: innerHeight }
    const track = document.querySelector('.package-carousel__track') as HTMLElement | null
    if (track) out.trackTransform = getComputedStyle(track).transform
    out.trackBox = box(track)
    document.querySelectorAll('.package-carousel__item').forEach((el, i) => {
      out['item' + i] = {
        box: box(el),
        frame: box(el.querySelector('.package-unit__frame')),
        panel: box(el.querySelector('.package-bundle')),
        btn: box(el.querySelector('.purchase-button')),
        code: box(el.querySelector('.package-unit__code')),
      }
    })
    out.header = box(document.querySelector('.game-header'))
    out.progress = box(document.querySelector('.package-progress'))
    out.close = box(document.querySelector('.close-button'))
    document.body.setAttribute('data-metrics', JSON.stringify(out))
  }, 2500)
}
