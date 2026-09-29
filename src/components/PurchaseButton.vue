<script setup lang="ts">
import { computed } from 'vue'
import type { PackageStatus } from '../types/package'

const props = defineProps<{
  status: PackageStatus
  price: number
}>()

const emit = defineEmits<{
  purchase: []
}>()

const isClaimed = computed(() => props.status === 'claimed')
</script>

<template>
  <button
    class="purchase-button"
    :class="`is-${status}`"
    type="button"
    :disabled="status !== 'available'"
    :aria-label="isClaimed ? '已领取' : `花费 ${price} 购买`"
    @click="emit('purchase')"
  >
    <span class="purchase-button__icon">
      <svg v-if="isClaimed" viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M5 12.6 9.4 17 19 7.4"
          fill="none"
          stroke="currentColor"
          stroke-width="3"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
      <svg v-else viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M12 3.4 14.6 9l6.1.8-4.5 4.2 1.2 6-5.4-3-5.4 3 1.2-6L3.3 9.8 9.4 9z"
          fill="currentColor"
        />
      </svg>
    </span>

    <span class="purchase-button__label">{{ isClaimed ? '已领取' : price }}</span>
  </button>
</template>

<style scoped>
.purchase-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: clamp(0.6rem, 1.1vw, 1.1rem);
  width: min(21vw, 420px);
  min-width: 200px;
  height: clamp(3.2rem, 8.4vh, 4.6rem);
  border: none;
  border-radius: 999px;
  font-size: clamp(1.4rem, 2.6vw, 2.4rem);
  font-weight: 900;
  letter-spacing: 0.02em;
  cursor: pointer;
  transition:
    transform 120ms ease,
    filter 120ms ease,
    background-color 180ms ease,
    color 180ms ease;
}

.purchase-button__icon {
  display: grid;
  place-items: center;
  width: 1.75em;
  height: 1.75em;
  border: 3px solid currentColor;
  border-radius: 50%;
}

.purchase-button__icon svg {
  width: 66%;
  height: 66%;
}

.purchase-button.is-available {
  background: #f6d75c;
  color: #5a3c00;
  box-shadow:
    0 14px 26px rgba(60, 34, 0, 0.35),
    inset 0 2px 0 rgba(255, 255, 255, 0.55);
}

.purchase-button.is-available:hover {
  transform: scale(1.03);
  filter: brightness(1.05);
}

.purchase-button.is-available:active {
  transform: scale(0.97);
}

.purchase-button.is-claimed {
  background: #2b2c31;
  color: #e9eaee;
  box-shadow: 0 14px 26px rgba(0, 0, 0, 0.35);
  cursor: default;
}

.purchase-button.is-locked {
  background: #b9bcc4;
  color: rgba(80, 81, 88, 0.85);
  box-shadow: 0 12px 22px rgba(0, 0, 0, 0.22);
  cursor: default;
}
</style>
