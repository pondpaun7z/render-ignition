<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { progressFor, renderTargetFromPath } from './wake'

type Phase = 'checking' | 'waking' | 'ready' | 'invalid'
const phase = ref<Phase>('checking')
const attempts = ref(0)
const elapsedSeconds = ref(0)
const targetUrl = renderTargetFromPath(window.location.pathname)

let active = true
let retryTimer: number | undefined
let clockTimer: number | undefined
let redirectTimer: number | undefined

const progress = computed(() => phase.value === 'invalid' ? 0 : phase.value === 'ready' ? 100 : progressFor(attempts.value, elapsedSeconds.value))
const targetHost = targetUrl ? new URL(targetUrl).host : '[name].onrender.com'
const statusText = computed(() => {
  if (phase.value === 'invalid') return 'ชื่อ Render ไม่ถูกต้อง'
  if (phase.value === 'ready') return 'ระบบพร้อมแล้ว'
  if (elapsedSeconds.value > 45) return 'ใกล้แล้ว กำลังเช็กอีกครั้ง'
  if (elapsedSeconds.value > 12) return 'Render กำลังเริ่มระบบ'
  return 'กำลังส่งสัญญาณปลุก'
})

async function probe(): Promise<void> {
  if (!targetUrl) return

  attempts.value += 1
  phase.value = 'checking'

  try {
    const wakeUrl = new URL(targetUrl)
    wakeUrl.searchParams.set('_wake', Date.now().toString())
    await fetch(wakeUrl, { cache: 'no-store', mode: 'no-cors' })

    phase.value = 'ready'
    redirectTimer = window.setTimeout(() => window.location.replace(targetUrl), 700)
    return
  } catch {
    // Network failures retry until Render accepts a request.
  }

  phase.value = 'waking'
  if (active) retryTimer = window.setTimeout(probe, 2500)
}

onMounted(() => {
  if (!targetUrl) {
    phase.value = 'invalid'
    return
  }

  document.title = `กำลังปลุก ${targetHost}`
  clockTimer = window.setInterval(() => elapsedSeconds.value += 1, 1000)
  void probe()
})

onBeforeUnmount(() => {
  active = false
  window.clearInterval(clockTimer)
  window.clearTimeout(retryTimer)
  window.clearTimeout(redirectTimer)
})
</script>

<template>
  <main class="min-h-dvh overflow-hidden px-5 py-6 sm:px-8 sm:py-8">
    <div class="noise" aria-hidden="true" />

    <header class="relative z-10 mx-auto flex max-w-6xl items-center justify-between border-b border-white/10 pb-4 text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-white/50">
      <span>Wake relay / 01</span>
      <span class="flex items-center gap-2 text-lime-300">
        <i class="status-dot" aria-hidden="true" />
        Cloudflare edge
      </span>
    </header>

    <section class="relative z-10 mx-auto grid min-h-[calc(100dvh-6.5rem)] max-w-6xl items-center gap-12 py-12 lg:grid-cols-[1.08fr_0.92fr]">
      <div class="max-w-2xl">
        <p class="mb-5 text-xs font-semibold uppercase tracking-[0.28em] text-lime-300">Render free instance</p>
        <h1 class="text-balance text-[clamp(3.25rem,9vw,7.8rem)] font-bold leading-[0.82] tracking-[-0.065em] text-stone-100">
          ปลุกก่อน<br><span class="outline-text">แล้วค่อยไป</span>
        </h1>
        <p class="mt-8 max-w-lg text-base leading-7 text-white/55 sm:text-lg">
          กำลังเปิด <strong class="font-medium text-white/85">{{ targetHost }}</strong>
          ให้พร้อมใช้งาน แล้วจะพาคุณไปต่อโดยอัตโนมัติ
        </p>
      </div>

      <div class="wake-panel" :class="{ ready: phase === 'ready' }">
        <div class="panel-corner corner-tl" />
        <div class="panel-corner corner-br" />

        <div class="wake-core" aria-hidden="true">
          <div class="orbit orbit-one" />
          <div class="orbit orbit-two" />
          <div class="core-disc">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M12 2v9" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
              <path d="M7.2 5.7a8 8 0 1 0 9.6 0" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
            </svg>
          </div>
        </div>

        <div class="mt-9" aria-live="polite">
          <div class="flex items-end justify-between gap-4">
            <div>
              <p class="text-[0.66rem] font-semibold uppercase tracking-[0.22em] text-white/35">Current status</p>
              <h2 class="mt-2 text-xl font-semibold text-stone-100">{{ statusText }}</h2>
            </div>
            <span class="font-mono text-3xl font-light text-lime-300">{{ progress }}%</span>
          </div>

          <div class="progress-track mt-5" role="progressbar" :aria-valuenow="progress" aria-valuemin="0" aria-valuemax="100">
            <div class="progress-fill" :style="{ width: `${progress}%` }" />
          </div>

          <div class="mt-5 flex justify-between text-[0.7rem] font-medium uppercase tracking-[0.16em] text-white/35">
            <span>Probe {{ String(attempts).padStart(2, '0') }}</span>
            <span>{{ String(Math.floor(elapsedSeconds / 60)).padStart(2, '0') }}:{{ String(elapsedSeconds % 60).padStart(2, '0') }}</span>
          </div>
        </div>

        <p class="mt-8 border-t border-white/10 pt-5 text-sm leading-6 text-white/40">
          {{ phase === 'invalid' ? 'ใช้ URL รูปแบบ /ชื่อ เช่น /rails-starter-kit' : 'Render Free ปกติใช้เวลาตื่นประมาณ 1 นาที กรุณาเปิดหน้านี้ไว้' }}
        </p>
      </div>
    </section>
  </main>
</template>
