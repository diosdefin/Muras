<script setup>
defineProps({ label: { type: String, default: '' }, caption: { type: String, default: '' } })
</script>

<template>
  <div class="area-placeholder" role="img" :aria-label="`${label}. ${caption}`">
    <svg class="area-placeholder-mountains" viewBox="0 0 400 200" preserveAspectRatio="xMidYMax slice" aria-hidden="true" focusable="false">
      <path d="M0 200V132l46-52 34 36 58-82 52 74 38-30 70 76 40-34 62 46v34z" fill="#68816e" opacity=".28" />
      <path d="M0 200v-44l62-48 40 30 70-70 62 82 46-38 54 52 66-34v68z" fill="#2c4439" opacity=".34" />
      <circle cx="318" cy="48" r="16" fill="#fff" opacity=".55" />
    </svg>
    <span class="area-placeholder-type">{{ label }}</span>
    <span class="area-placeholder-note">{{ caption }}</span>
  </div>
</template>

<style scoped>
.area-placeholder { position: relative; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; width: 100%; height: 100%; min-height: 140px; padding: 16px; overflow: hidden; text-align: center; color: #2c4439; background: linear-gradient(165deg, #f1f4ec 0%, #dbe5d9 58%, #c3d3c5 100%); }
.area-placeholder-mountains { position: absolute; inset: auto 0 0 0; width: 100%; height: 68%; pointer-events: none; }
.area-placeholder-type, .area-placeholder-note { position: relative; z-index: 1; overflow-wrap: anywhere; }
.area-placeholder-type { font: 400 clamp(15px, 2.6vw, 20px)/1.25 Georgia, 'Times New Roman', serif; }
.area-placeholder-note { font-size: 12px; letter-spacing: .06em; text-transform: uppercase; opacity: .7; }
@media (max-width: 767px) { .area-placeholder { min-height: 110px; padding: 10px; } .area-placeholder-type { font-size: 14px; } .area-placeholder-note { font-size: 10px; } }
</style>
