<script setup lang="ts">
import { packages, pools } from '../data/packages'
import { playResetSound } from '../composables/useSound'

defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  close: []
}>()

/** 礼包介绍表格数据：编号、球员池、价格、单次抽中概率、抽取次数 */
const rows = packages.map((giftPackage) => ({
  code: giftPackage.code,
  poolText: giftPackage.bundles.map((bundle) => pools[bundle.poolType].name).join(' + '),
  price: giftPackage.price,
  probability: giftPackage.bundles[0].probability,
  draws: giftPackage.bundles[0].draws,
}))

/** 关闭说明弹窗：播放重置音效 */
const handleClose = () => {
  playResetSound()
  emit('close')
}
</script>

<template>
  <Transition name="modal">
    <div v-if="open" class="info-modal">
      <button class="info-modal__backdrop" type="button" aria-label="关闭介绍" @click="handleClose"></button>

      <div class="info-modal__panel" role="dialog" aria-modal="true" aria-label="礼包介绍">
        <button class="info-modal__close" type="button" aria-label="关闭礼包介绍" @click="handleClose">
          ×
        </button>

        <h2>礼包介绍</h2>

        <p class="info-modal__lead">
          「球王传承」连锁礼包共 7 个阶段，需按顺序解锁：购买当前礼包后会立即解锁下一个礼包。
          每次购买都会从该礼包对应的球员池中抽取球员。
        </p>

        <table class="info-modal__table">
          <thead>
            <tr>
              <th>礼包</th>
              <th>球员池</th>
              <th>价格</th>
              <th>抽中概率</th>
              <th>抽取次数</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in rows" :key="row.code">
              <td class="info-modal__code">{{ row.code }}</td>
              <td>{{ row.poolText }}</td>
              <td>{{ row.price }}</td>
              <td class="info-modal__rate">{{ row.probability }}%</td>
              <td>{{ row.draws }} 次</td>
            </tr>
          </tbody>
        </table>

        <p class="info-modal__note">
          01、02 每个面板抽取 2 次，可能出现未抽中的情况；03~07 必定从包内球员中抽中 1 名。
          点击卡片右下角的小礼包，可以查看该池内每名球员的具体概率。
        </p>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.info-modal {
  position: absolute;
  inset: 0;
  z-index: 100;
}

.info-modal__backdrop {
  position: absolute;
  inset: 0;
  border: none;
  background: rgba(0, 0, 0, 0.56);
  z-index: 99;
}

.info-modal__panel {
  position: absolute;
  left: 50%;
  top: 50%;
  z-index: 100;
  width: min(680px, 86vw);
  max-height: 82vh;
  overflow-y: auto;
  padding: 2rem 2rem 1.6rem;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 1.4rem;
  background: linear-gradient(180deg, rgba(29, 17, 14, 0.96), rgba(18, 11, 9, 0.96));
  color: #f7f0df;
  box-shadow: 0 28px 60px rgba(0, 0, 0, 0.3);
  transform: translate(-50%, -50%);
}

.info-modal__panel h2 {
  margin: 0 0 1rem;
  font-size: 1.7rem;
}

.info-modal__lead {
  margin: 0 0 1.1rem;
  line-height: 1.75;
  color: rgba(247, 240, 223, 0.82);
}

.info-modal__table {
  width: 100%;
  border-collapse: collapse;
  font-size: 1rem;
}

.info-modal__table th,
.info-modal__table td {
  padding: 0.6rem 0.5rem;
  text-align: left;
  white-space: nowrap;
}

.info-modal__table th {
  font-weight: 800;
  color: rgba(247, 240, 223, 0.62);
  border-bottom: 1px solid rgba(255, 255, 255, 0.14);
}

.info-modal__table tbody tr:nth-child(odd) {
  background: rgba(255, 255, 255, 0.04);
}

.info-modal__code {
  font-weight: 900;
  color: #f5c518;
}

.info-modal__rate {
  font-weight: 800;
  color: #f3d85a;
}

.info-modal__note {
  margin: 1.1rem 0 0;
  line-height: 1.7;
  font-size: 0.95rem;
  color: rgba(247, 240, 223, 0.72);
}

.info-modal__close {
  position: absolute;
  top: 0.8rem;
  right: 0.9rem;
  border: none;
  background: transparent;
  color: rgba(255, 255, 255, 0.92);
  font-size: 2rem;
  cursor: pointer;
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 220ms ease;
}

.modal-enter-active .info-modal__panel,
.modal-leave-active .info-modal__panel {
  transition:
    transform 220ms ease,
    opacity 220ms ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .info-modal__panel,
.modal-leave-to .info-modal__panel {
  opacity: 0;
  transform: translate(-50%, -50%) scale(0.94);
}
</style>
