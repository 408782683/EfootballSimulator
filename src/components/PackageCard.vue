<script setup lang="ts">
import { computed } from 'vue'
import type { GiftPackage, PackageBundle } from '../types/package'
import PurchaseButton from './PurchaseButton.vue'

const props = defineProps<{
  giftPackage: GiftPackage
  active: boolean
}>()

const emit = defineEmits<{
  purchase: []
  showPlayers: [bundle: PackageBundle]
}>()

const bundleCount = computed(() => props.giftPackage.bundles.length)
</script>

<template>
  <article
    class="package-unit"
    :class="[
      `is-${giftPackage.status}`,
      `is-${bundleCount}-bundles`,
      { 'is-active': active },
    ]"
  >
    <div class="package-unit__frame">
      <span class="package-unit__code">{{ giftPackage.code }}</span>

      <p v-if="giftPackage.status === 'locked'" class="package-unit__hint">
        购买前置礼包以解锁
      </p>

      <div class="package-unit__bundles">
        <section
          v-for="bundle in giftPackage.bundles"
          :key="bundle.id"
          class="package-bundle"
          role="button"
          tabindex="0"
          title="查看可抽出球员"
          @click="emit('showPlayers', bundle)"
          @keydown.enter.prevent="emit('showPlayers', bundle)"
          @keydown.space.prevent="emit('showPlayers', bundle)"
        >
          <!-- 此处为球员特殊技巧，暂时留空，后续补充 -->
          <div class="package-bundle__skills"></div>

          <div class="package-bundle__players">
            <img
              v-for="player in bundle.players"
              :key="player.id"
              :src="player.image"
              :alt="player.name"
              draggable="false"
            />
          </div>

          <div class="package-bundle__footer">
            <div class="package-bundle__reward">
              <strong>{{ bundle.probability }}%</strong>
              <p>{{ bundle.tags.join('') }}</p>
            </div>

            <div class="package-bundle__thumb">
              <img :src="bundle.thumbnail" alt="" draggable="false" />
            </div>
          </div>
        </section>
      </div>

      <div class="package-unit__action">
        <PurchaseButton
          :status="giftPackage.status"
          :price="giftPackage.price"
          @purchase="emit('purchase')"
        />
      </div>
    </div>
  </article>
</template>

<style scoped>
.package-unit {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: min(39.9vw, 702px);
  user-select: none;
}

/* 05~07 是两个小礼包的综合，卡片更宽，左右两个面板并列 */
.package-unit.is-2-bundles {
  width: min(62.8vw, 1145px);
}

.package-unit__frame {
  position: relative;
  width: 100%;
  padding: 9.4vh 2vw 1.5rem;
  border-radius: 1.8rem;
  background: rgba(28, 23, 21, 0.8);
  box-shadow: 0 26px 60px rgba(0, 0, 0, 0.35);
  transition: background-color 200ms ease;
}

.package-unit.is-claimed .package-unit__frame {
  background: rgba(24, 21, 20, 0.84);
}

.package-unit.is-locked .package-unit__frame {
  background: rgba(20, 17, 16, 0.74);
}

.package-unit__code {
  position: absolute;
  top: 0.15rem;
  left: 1.5rem;
  z-index: 3;
  font-size: min(5.6vw, 108px);
  font-weight: 900;
  line-height: 1;
  letter-spacing: 0.02em;
  color: #f5c518;
  text-shadow: 0 8px 20px rgba(0, 0, 0, 0.45);
}

.package-unit.is-locked .package-unit__code {
  color: rgba(245, 197, 24, 0.62);
}

.package-unit__hint {
  position: absolute;
  top: 1.4rem;
  right: 1.8rem;
  z-index: 3;
  margin: 0;
  font-size: min(1.5vw, 26px);
  font-weight: 800;
  color: rgba(255, 255, 255, 0.94);
  text-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
}

.package-unit__bundles {
  display: flex;
  gap: 1.6vw;
}

.package-bundle {
  flex: 1 1 0;
  min-width: 0;
  display: flex;
  flex-direction: column;
  height: min(50vh, 540px);
  padding: 1.1rem 1.3rem 1.2rem;
  border-radius: 1.1rem;
  background: #f3dc8d;
  box-shadow: 0 14px 30px rgba(0, 0, 0, 0.22);
  cursor: pointer;
}

.package-unit.is-active .package-bundle {
  box-shadow:
    0 0 0 3px rgba(255, 122, 26, 0.75),
    0 16px 34px rgba(0, 0, 0, 0.26);
}

/* 球员特殊技巧区（暂时留空），保留原有标签行的高度以免整体布局位移 */
.package-bundle__skills {
  min-height: min(1.6vw, 24px);
}

.package-bundle__players {
  flex: 1 1 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: min(2vw, 36px);
  min-height: 0;
  padding: 0.6rem 0;
}

.package-bundle__players img {
  height: min(27vh, 300px);
  width: auto;
  filter: drop-shadow(0 12px 20px rgba(0, 0, 0, 0.3));
}

.package-unit.is-2-bundles .package-bundle__players img {
  height: min(21vh, 235px);
}

.package-bundle__footer {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1rem;
}

.package-bundle__reward strong {
  display: block;
  font-size: min(3.2vw, 60px);
  font-weight: 900;
  line-height: 1;
  color: #c2a418;
  text-shadow: 0 2px 0 rgba(255, 255, 255, 0.35);
}

.package-bundle__reward p {
  margin: 0.25rem 0 0;
  font-size: min(1.45vw, 26px);
  font-weight: 800;
  color: #c2a418;
}

.package-bundle__thumb {
  flex: 0 0 auto;
  width: min(4.8vw, 84px);
}

.package-bundle__thumb img {
  display: block;
  width: 100%;
  height: auto;
}

/* 购买按钮与礼包卡属于同一个控件：按钮位于卡片半透明黑色背景内部 */
.package-unit__action {
  display: flex;
  justify-content: center;
  margin-top: 1.6vh;
}

.package-unit__action :deep(.purchase-button) {
  width: min(26vw, 480px);
}

@media (max-width: 900px) {
  .package-unit,
  .package-unit.is-2-bundles {
    width: min(68vw, 575px);
  }
}

/* 移动端（竖屏手机）：卡片接近满宽、双面板纵向堆叠，并压缩纵向尺寸
   确保底部「购买金币」按钮完整落在可视区内（vw 在竖屏下过小，需换成固定/rem 尺寸） */
@media (max-width: 820px) {
  .package-unit,
  .package-unit.is-2-bundles {
    width: min(88vw, 520px);
  }

  .package-unit__frame {
    padding: min(14vw, 3.4rem) 4vw 1.1rem;
    border-radius: 1.3rem;
  }

  .package-unit__code {
    top: 0.1rem;
    left: 1.1rem;
    font-size: min(12.5vw, 3.1rem);
  }

  .package-unit__hint {
    top: 0.9rem;
    right: 1.1rem;
    font-size: clamp(0.68rem, 3vw, 0.9rem);
  }

  .package-unit__bundles {
    flex-direction: column;
    gap: 1.2vh;
  }

  .package-bundle {
    height: min(50vh, 420px);
    padding: 0.8rem 0.9rem 0.9rem;
    border-radius: 0.9rem;
  }

  /* 双面板礼包在窄屏上纵向排列，每块更矮 */
  .package-unit.is-2-bundles .package-bundle {
    height: min(26vh, 225px);
  }

  .package-bundle__skills {
    min-height: 0.7rem;
  }

  .package-bundle__players {
    gap: 4vw;
    padding: 0.4rem 0;
  }

  .package-bundle__players img {
    height: min(26vh, 230px);
    max-width: 45%;
    object-fit: contain;
  }

  .package-unit.is-2-bundles .package-bundle__players img {
    height: min(13vh, 115px);
    max-width: 42%;
  }

  .package-bundle__reward strong {
    font-size: clamp(1.3rem, 6.4vw, 2rem);
  }

  .package-bundle__reward p {
    font-size: clamp(0.7rem, 3.4vw, 0.95rem);
  }

  .package-bundle__thumb {
    width: clamp(2.2rem, 12vw, 3.4rem);
  }

  .package-unit__action {
    margin-top: 1.2vh;
  }

  .package-unit__action :deep(.purchase-button) {
    width: 100%;
    height: clamp(2.9rem, 7vh, 3.6rem);
    font-size: clamp(1.1rem, 4.6vw, 1.5rem);
  }
}
</style>
