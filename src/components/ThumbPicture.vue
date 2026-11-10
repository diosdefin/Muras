<script setup>
import { computed, ref, useAttrs, watch } from 'vue'
import { publicImageUrl } from '../data/presentation.js'
import { thumbPaths } from '../data/photo-thumbs.js'

defineOptions({ inheritAttrs: false })
const props = defineProps({ path: { type: String, default: '' } })
const attrs = useAttrs()
// stage 0: AVIF (WebP fallback) thumbnail, 1: WebP thumbnail only, 2: the original file, then the caller's own error handling.
const stage = ref(0)
const thumbs = computed(() => thumbPaths(props.path))
watch(() => props.path, () => { stage.value = 0 })
const original = computed(() => publicImageUrl(props.path))
const src = computed(() => thumbs.value && stage.value < 2 ? publicImageUrl(thumbs.value.webp) : original.value)
function failed(event) {
  if (thumbs.value && stage.value < 2) { stage.value += 1; return }
  attrs.onError?.(event)
}
</script>

<template>
  <picture>
    <source v-if="thumbs && stage === 0" type="image/avif" :srcset="publicImageUrl(thumbs.avif)" />
    <img v-bind="{ ...$attrs, onError: undefined }" :src="src" :data-original-src="path" @error="failed" />
  </picture>
</template>
