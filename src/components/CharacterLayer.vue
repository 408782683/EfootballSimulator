<script setup lang="ts">
/** 人物贴图地址：生产构建（Electron file://）下 BASE_URL 为 './'，开发环境为 '/' */
const peopleSrc = `${import.meta.env.BASE_URL}assets/characters/people.png`
</script>

<template>
  <div class="character-layer" aria-hidden="true">
    <img :src="peopleSrc" alt="" draggable="false" />
  </div>
</template>

<style scoped>
.character-layer {
  position: absolute;
  left: -16vw;
  bottom: -6vh;
  z-index: 2;
  height: min(91vh, 1142px);
  pointer-events: none;
}

.character-layer img {
  display: block;
  height: 100%;
  width: auto;
  user-select: none;
  filter: drop-shadow(0 14px 28px rgba(0, 0, 0, 0.35));
}

@media (max-width: 1200px) {
  .character-layer {
    left: -22vw;
    height: min(88vh, 900px);
    opacity: 0.94;
  }
}

/* 移动端（竖屏手机）：人物改为底部居中低透明度装饰，避免遮挡礼包卡片 */
@media (max-width: 820px) {
  .character-layer {
    left: 50%;
    height: min(40vh, 340px);
    bottom: -2vh;
    opacity: 0.26;
    transform: translateX(-50%);
  }
}
</style>
