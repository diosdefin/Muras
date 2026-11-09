<script setup>
import { computed } from 'vue'
import { useLocale } from '../../composables/useLocale.js'

// Shown on every screen size instead of the support page until that page is
// finished. The full SupportView component stays in the codebase.
const emit = defineEmits(['catalog'])
const { t, language } = useLocale()
const copy = {
  ky: { title: 'Бул бөлүм иштелип жатат', text: 'Барак азыр даярдалып жатат жана жакында ачылат. Ага чейин түрлөр жөнүндө каталогдон биле аласыз.' },
  uz: { title: 'Boʻlim ishlab chiqilmoqda', text: 'Sahifa hozir tayyorlanmoqda va tez orada ochiladi. Hozircha turlar haqida katalogdan bilib olishingiz mumkin.' },
  ru: { title: 'Раздел в разработке', text: 'Страница сейчас готовится и скоро откроется. Пока о видах можно узнать в каталоге.' },
  en: { title: 'This section is in development', text: 'The page is being prepared and will open soon. Meanwhile, you can learn about the species in the catalogue.' },
}
const text = computed(() => copy[language.value] || copy.ru)
</script>

<template>
  <section id="support" class="support-stub page-container" tabindex="-1" aria-labelledby="support-stub-title">
    <p class="eyebrow"><span class="red-rule" aria-hidden="true"></span> {{ t('ui.m013') }}</p>
    <div class="support-stub-card">
      <svg class="support-stub-mark" viewBox="0 0 48 48" aria-hidden="true">
        <circle cx="24" cy="24" r="22" fill="none" stroke="currentColor" stroke-width="1.5" stroke-dasharray="4 5" />
        <path d="M15 31 21 21l4 6 3-4 5 8z" fill="currentColor" opacity=".85" />
      </svg>
      <h1 id="support-stub-title">{{ text.title }}</h1>
      <p>{{ text.text }}</p>
      <button class="quiz-secondary" type="button" @click="emit('catalog')">{{ t('ui.m104') }}</button>
    </div>
  </section>
</template>

<style scoped>
.support-stub { min-height: calc(100svh - 260px); padding-block: 48px 80px; }
.support-stub-card {
  display: grid;
  justify-items: center;
  gap: 14px;
  max-width: 640px;
  margin: 24px auto 0;
  padding: 56px 32px 44px;
  text-align: center;
  background: white;
  border: 1px solid var(--line);
  border-radius: 12px;
}
.support-stub-mark { width: 60px; height: 60px; color: var(--green); }
.support-stub-card h1 { margin-top: 6px; font-family: Georgia, "Times New Roman", serif; font-size: clamp(24px, 3vw, 34px); font-weight: 400; line-height: 1.2; }
.support-stub-card p { max-width: 40ch; color: var(--muted); font-size: 16px; line-height: 1.65; }
.support-stub-card button { margin-top: 10px; }
@media (max-width: 767px) {
  .support-stub { min-height: calc(100svh - 230px); padding-block: 24px 56px; }
  .support-stub-card { gap: 12px; margin-top: 18px; padding: 36px 22px 28px; }
  .support-stub-mark { width: 52px; height: 52px; }
  .support-stub-card p { max-width: 34ch; font-size: 14px; line-height: 1.6; }
}
</style>
