<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import { useLocale } from '../composables/useLocale.js'

const { language } = useLocale()
const current = ref(0)
const paused = ref(false)
const scenes = [
  { key: 'mountain', names: { ky: 'Кыргызстандын тоолору', uz: 'Qirgʻiziston togʻlari', ru: 'Горы Кыргызстана', en: 'Mountains of Kyrgyzstan' } },
  { key: 'argali', names: { ky: 'Аркар', uz: 'Arxar', ru: 'Архар', en: 'Argali' } },
  { key: 'snow-leopard', names: { ky: 'Илбирс', uz: 'Qor barsi', ru: 'Ирбис', en: 'Snow leopard' } },
  { key: 'eagle', names: { ky: 'Бүркүт', uz: 'Burgut', ru: 'Беркут', en: 'Golden eagle' } },
  { key: 'fritillary', names: { ky: 'Эдуарддын чаар гүлү', uz: 'Eduard fritillyariyasi', ru: 'Рябчик Эдуарда', en: "Eduard's fritillary" } },
  { key: 'fungi', names: { ky: 'Козу карындар', uz: 'Qoʻziqorinlar', ru: 'Грибы', en: 'Fungi' } },
]
const sceneName = scene => scene.names[language.value] || scene.names.ru
function change(direction) { current.value = (current.value + direction + scenes.length) % scenes.length }
let rotation
onMounted(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  rotation = window.setInterval(() => {
    if (!paused.value && !document.hidden) change(1)
  }, 6500)
})
onUnmounted(() => window.clearInterval(rotation))
</script>

<template>
  <div class="hero-art" @mouseenter="paused = true" @mouseleave="paused = false" @focusin="paused = true" @focusout="paused = false">
    <div class="hero-art-frame" aria-hidden="true">
      <Transition name="art-dissolve" mode="out-in">
        <!-- Keep the original mountain drawing exactly as it appeared in MURAS. -->
        <svg v-if="scenes[current].key === 'mountain'" key="mountain" viewBox="0 0 520 340" fill="none">
          <circle cx="382" cy="83" r="35" stroke="currentColor" />
          <path d="m12 270 137-139 45 45 103-131 210 231M100 340 149 131m45 45 43 164M297 45l-35 157 41 43 29 95M12 297l94-30 94 30 100-42 113 47 94-12M12 318l100-22 88 22 103-31 105 37 99-15" stroke="currentColor" />
          <path d="m258 94 39-49 63 70-41-17-22 17-20-29-19 8Z" fill="currentColor" opacity=".13" />
          <path d="M12 340h496M12 15v310M508 15v310" stroke="currentColor" opacity=".25" />
        </svg>
        <svg v-else-if="scenes[current].key === 'argali'" key="argali" viewBox="0 0 520 340" fill="none">
          <g stroke="currentColor" stroke-width="1.15" stroke-linecap="round" stroke-linejoin="round">
            <path opacity=".52" d="M13 201 112 94l69 73 88-112 85 99 62-61 93 104M13 252l116-47 76 28 74-44 105 43 125-30" />
            <path opacity=".32" d="m269 55-22 69 26-19 18 23 18-29M13 310l99-48 75 15 79-31 77 19 91-36 75 19" />
            <g class="hero-animal-shift">
              <path d="m109 289 68-32 50 5 30-23 44 13 45-28 36-5 42 15 19 29-15 19-52 2-36-11-43 10-75-10-47 28-57 4Z" fill="currentColor" fill-opacity=".055" />
              <path d="M148 273q-1-37 38-54 41-15 86 5l40 3q13-20 37-25l21 8q15 20-5 38l-31 18-51-5-49 20-54-5-26 13" />
              <path d="m184 274-6 44-18 10m91-53-4 45-17 9m70-62 7 48 19 11m25-68 11 50 18 8" />
              <path d="m175 319 22 1m35 3 18 1m63-3 17 0m36-8 20 3M164 235l-24-18" />
              <path d="M337 211q-16-23-8-43 11-28 44-30 36-1 43 29 2 27-27 34" />
              <path d="M342 208q-20-13-20-36 1-31 30-44 36-15 57 17 11 18 4 37-9 19-32 18" />
              <path d="M352 199q-11-18 4-37 12-15 30-10 16 4 16 22-1 14-20 18" />
              <path d="M366 209q-11 8-9 22l16 18 26-8 10-19-14-17-21-5m25 14 14-9 20 5 8 10-16 14-23 4" />
              <circle cx="410" cy="221" r="2.6" fill="currentColor" stroke="none"/>
              <path d="m432 222 9 0-8 6m-44 13-12 10" />
            </g>
            <path d="M12 339h496M12 15v310M508 15v310" opacity=".24" />
          </g>
        </svg>
        <svg v-else-if="scenes[current].key === 'snow-leopard'" key="snow-leopard" viewBox="0 0 520 340" fill="none">
          <g stroke="currentColor" stroke-width="1.15" stroke-linecap="round" stroke-linejoin="round">
            <path opacity=".48" d="M12 241 132 123l47 49L298 53l78 90 51-47 81 111M12 292l91-25 102 28 101-38 90 22 112-24" />
            <path opacity=".27" d="m280 75 18-22 47 57-42-20-17 15" fill="currentColor" fill-opacity=".16" />
            <g class="hero-animal-shift">
              <path d="M111 238q35-35 82-32l43 10q38-12 82 2l28-19 21-9 31 7 18 15-14 27-32 8-37-5-34 14-59-1-42-13-44 16-21-11Z" fill="currentColor" fill-opacity=".075" />
              <path d="M113 239q19-32 69-31 34-1 65 15 46-10 77-6 16-29 41-33l23 5 19 24-16 28-29 4-26-12-30 22-58-4-33-17-28 9-18 35-21 10-8-14 21-41" />
              <path d="m264 250 9 42-15 25-22-3 6-17-7-47m65-2 19 36-3 26 19 4 9-29-8-50" />
              <path d="M121 224q-39-7-54 22-17 34 16 44 28 8 34-15 3-12-8-18" />
              <path d="m347 198-3-23 18-17 15 17 19-5 7 26m-53 18 15 10 23-1 13-11m-42 27 25 11 11-15" />
              <path d="M364 206h8m21 0h8" stroke-width="2"/>
              <path d="m379 218 6 5-8 5m-4 0-11 6m19-7 13 7" />
              <path d="M165 220q10 14 25 10t19-11m24 4q11 19 25 13m39-12q6 15 19 14m-138 7q9 12 23 3m79 0q11 10 22-1" />
              <g opacity=".7"><circle cx="163" cy="228" r="5"/><circle cx="212" cy="231" r="6"/><circle cx="250" cy="238" r="4"/><circle cx="291" cy="236" r="5"/><circle cx="333" cy="226" r="4"/><circle cx="194" cy="249" r="4"/><circle cx="240" cy="258" r="4"/><circle cx="313" cy="251" r="3"/><circle cx="85" cy="282" r="4"/></g>
            </g>
            <path d="M12 339h496M12 15v310M508 15v310" opacity=".24"/>
          </g>
        </svg>
        <svg v-else-if="scenes[current].key === 'eagle'" key="eagle" viewBox="0 0 520 340" fill="none">
          <g stroke="currentColor" stroke-width="1.15" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="417" cy="74" r="32" opacity=".7"/>
            <path opacity=".4" d="M12 253 114 146l63 74L287 71l66 90 59-47 96 123M12 293l100-34 90 27 92-42 109 36 105-16" />
            <g class="hero-eagle-flight">
              <path d="M241 184q-60-55-109-70-41-12-93-7 33 14 58 31-35-6-56-2 30 11 59 24-24-4-44 0 40 22 81 30 26 27 69 38l29 10 12-13 23 5 42-13q60-20 91-55 33-6 60-27-32 3-54 11 28-16 44-33-35 2-63 17 24-24 30-39-45 14-89 48l-52 35-22-1-12-15-21 8Z" fill="currentColor" fill-opacity=".065" />
              <path d="M241 184q-60-55-109-70-41-12-93-7 33 14 58 31-35-6-56-2 30 11 59 24-24-4-44 0 40 22 81 30 26 27 69 38l29 10 12-13 23 5 42-13q60-20 91-55 33-6 60-27-32 3-54 11 28-16 44-33-35 2-63 17 24-24 30-39-45 14-89 48l-52 35" />
              <path d="M130 116q42 44 103 86m-135-64q52 50 132 75m-131-53q60 55 127 62m158-99q-45 54-112 84m152-68q-47 54-149 80m134-67q-42 49-124 72" opacity=".65" />
              <path d="m229 184 14-27 13-8 18 9 15 37-10 29-26 21-23-22-11-23Z" fill="currentColor" fill-opacity=".11" />
              <path d="m243 160 13-11 17 9 14 37-9 31-25 17-24-23-8-25" />
              <path d="m242 177 6 8 14-1 4-9m-11 16 9 7-7 7m-8-12-9 5" />
              <circle cx="250" cy="177" r="2.5" fill="currentColor" stroke="none" />
              <path d="m233 231 21 38 19-35m-38 17-16 9m37 2 16 9m-19-27 3 28" />
            </g>
            <path d="M12 339h496M12 15v310M508 15v310" opacity=".24"/>
          </g>
        </svg>
        <svg v-else-if="scenes[current].key === 'fritillary'" key="fritillary" viewBox="0 0 520 340" fill="none">
          <g stroke="currentColor" stroke-width="1.15" stroke-linecap="round" stroke-linejoin="round">
            <path opacity=".4" d="M13 221 103 127l45 51 97-117 98 107 63-68 102 101M13 303l99-32 94 23 101-49 97 37 104-30" />
            <g class="hero-flower-sway">
              <path d="M257 323q10-83 8-135t1-107" stroke-width="1.8" />
              <path d="m266 81 6-38m-6 40-18-37m17 28 24-28" />
              <path d="M266 160q-26-24-51-14 20 31 49 28m3 19q38-24 66-10-28 29-67 24m-4 39q-42-23-69-11 30 29 69 26m2-22q25-19 49-6-23 21-50 20" fill="currentColor" fill-opacity=".07" />
              <path d="M265 110q-34 2-55-14-21-17-24-38m80 53q31-4 48-24 16-20 19-42" />
              <!-- Downward-hanging campanulate fritillary flowers, not a bird. -->
              <path d="m185 57-17 8-9 18-1 27q7 30 32 44 25-14 31-44l-3-30-16-17-17-6Z" fill="currentColor" fill-opacity=".08" />
              <path d="m185 57-17 8-9 18-1 27q7 30 32 44 25-14 31-44l-3-30-16-17-17-6Z" />
              <path d="m184 63-6 29 11 62m14-87 4 30-17 57m-28-45 26 10 28-7m-31 41-7 7m12-6 0 9m12-12 6 6" />
              <path d="m327 49-15 12-10 23-1 25q8 25 33 40 21-14 27-41l-5-28-14-21-15-10Z" fill="currentColor" fill-opacity=".07" />
              <path d="m327 49-15 12-10 23-1 25q8 25 33 40 21-14 27-41l-5-28-14-21-15-10Z" />
              <path d="m326 57-7 29 14 63m9-89 7 26-16 63m-26-45 26 10 23-12m-24 47-7 7m10-5 2 7m10-10 6 4" />
              <path d="M265 116q10 2 20-4m-20-11-12-9" opacity=".7" />
              <path opacity=".5" d="M13 332q45-9 81 0t78-2 86 2 89-3 79 2 82-2" />
            </g>
            <path d="M12 339h496M12 15v310M508 15v310" opacity=".24"/>
          </g>
        </svg>
        <svg v-else key="fungi" viewBox="0 0 520 340" fill="none">
          <g stroke="currentColor" stroke-width="1.15" stroke-linecap="round" stroke-linejoin="round">
            <path opacity=".4" d="M12 186 136 81l74 82 87-100 106 101 105-98M12 245l104-35 103 41 86-40 96 33 107-35" />
            <path opacity=".44" d="M14 319q63-21 120-3t114-9 124 7 135-3" />
            <g class="hero-mushroom-rise">
              <path d="M183 285q5-34 3-81l63-3q-5 43 8 87l-11 17-53-4Z" fill="currentColor" fill-opacity=".07" />
              <path d="M185 287q6-35 2-85m62-1q-5 39 8 87l-12 17-52-5-8-13" />
              <path d="M145 199q3-76 61-97 60-19 103 48 11 20 10 44-75 21-174 5Z" fill="currentColor" fill-opacity=".08" />
              <path d="M145 199q3-76 61-97 60-19 103 48 11 20 10 44-75 21-174 5Z" />
              <path d="M146 199q89 25 173-5m-158 9 20 25m-3-23 25 26m1-24 19 26m6-24 13 23m8-27 10 22m14-26 4 19m12-26-1 15" opacity=".65" />
              <path d="M197 121q-15 11-21 27m99-17q13 16 17 35" opacity=".5"/>
              <path d="m103 304 9-49 37-1 9 48-14 15-33-2Z" fill="currentColor" fill-opacity=".05" />
              <path d="m103 304 9-49m37-1 9 48-14 15-33-2" />
              <path d="M79 254q3-43 42-52 41-4 57 52-42 18-99 0Z" fill="currentColor" fill-opacity=".09" />
              <path d="M79 254q3-43 42-52 41-4 57 52-42 18-99 0Z" />
              <path d="m347 302 4-71 40 1 11 74-15 12-30-5Z" fill="currentColor" fill-opacity=".05" />
              <path d="m347 302 4-71m40 1 11 74-15 12-30-5" />
              <path d="M320 231q12-63 51-67 50-1 70 71-60 19-121-4Z" fill="currentColor" fill-opacity=".08" />
              <path d="M320 231q12-63 51-67 50-1 70 71-60 19-121-4Z" />
              <path d="m335 235 17 15m4-14 13 18m4-18 5 18m12-20 0 16m13-17-4 16" opacity=".6" />
              <path d="m21 326 20-20 19 19m21-3 13-13 15 13m180 2 16-19 14 17m112-2 20-15 11 17" opacity=".45" />
            </g>
            <path d="M12 339h496M12 15v310M508 15v310" opacity=".24"/>
          </g>
        </svg>
      </Transition>
    </div>
    <div class="hero-art-footer">
      <span>{{ sceneName(scenes[current]) }}</span>
      <div class="hero-art-navigation" role="group" :aria-label="language === 'ky' ? 'Сүрөттөр' : language === 'uz' ? 'Rasmlar' : language === 'en' ? 'Illustrations' : 'Иллюстрации'">
        <button v-for="(scene, index) in scenes" :key="scene.key" type="button" :aria-label="sceneName(scene)" :aria-current="current === index ? 'true' : undefined" :title="sceneName(scene)" @click="current = index"><span></span></button>
      </div>
      <span>{{ language === 'en' ? 'Observe · learn · protect' : language === 'ky' ? 'Байкоо · үйрөнүү · сактоо' : language === 'uz' ? 'Kuzatish · oʻrganish · asrash' : 'Наблюдать · изучать · сохранять' }}</span>
    </div>
  </div>
</template>

<style scoped>
.hero-art { width: 100%; max-width: 540px; margin-inline: auto; color: var(--green); }
.hero-art-frame { position: relative; width: 100%; aspect-ratio: 520 / 340; }
.hero-art-frame > svg { position: absolute; inset: 0; display: block; width: 100%; height: 100%; }
.art-dissolve-enter-active, .art-dissolve-leave-active { transition: opacity .5s ease, transform .5s ease; }
.art-dissolve-enter-from { opacity: 0; transform: translateY(5px); }
.art-dissolve-leave-to { opacity: 0; transform: translateY(-5px); }
.hero-art-footer { display: flex; align-items: center; flex-wrap: wrap; justify-content: space-between; gap: 6px 8px; margin-top: 11px; color: var(--muted); font-size: 12px; }
.hero-art-footer > span:last-child { text-align: right; }
.hero-art-navigation { display: flex; align-items: center; gap: 1px; }
.hero-art-navigation button { display: grid; place-items: center; width: 23px; height: 30px; border-radius: 8px; }
.hero-art-navigation button:hover { background: #e4ebe1; }
.hero-art-navigation button span { display: block; width: 5px; height: 5px; border-radius: 50%; background: #b8c9b7; transition: width .2s ease, background .2s ease; }
.hero-art-navigation button[aria-current="true"] span { width: 14px; border-radius: 4px; background: var(--ink); }
@media (prefers-reduced-motion: no-preference) {
  .hero-eagle-flight { animation: hero-bird-flight 6s ease-in-out infinite; transform-origin: 260px 210px; }
  .hero-flower-sway { animation: hero-sway 6s ease-in-out infinite; transform-origin: 260px 320px; }
  .hero-animal-shift, .hero-mushroom-rise { animation: hero-breathe 6s ease-in-out infinite; }
  @keyframes hero-bird-flight { 0%, 100% { transform: translateY(1px) rotate(-.3deg); } 50% { transform: translateY(-8px) rotate(.6deg); } }
  @keyframes hero-sway { 0%, 100% { transform: rotate(-.5deg); } 50% { transform: rotate(1.2deg); } }
  @keyframes hero-breathe { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-3px); } }
}
@media (prefers-reduced-motion: reduce) { .art-dissolve-enter-active, .art-dissolve-leave-active, .hero-art-navigation button span { transition: none; } }
</style>
