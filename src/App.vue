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
  <main class="factory-shell">
    <div class="noise" aria-hidden="true" />
    <div class="factory-grid" aria-hidden="true" />

    <header class="factory-header">
      <div class="plant-mark">
        <span class="plant-number">R-01</span>
        <span>Cold start facility</span>
      </div>
      <div class="plant-status">
        <span>Cloudflare edge</span>
        <span class="status-live"><i class="status-dot" aria-hidden="true" /> Link active</span>
      </div>
    </header>

    <section class="factory-layout">
      <div class="factory-brief">
        <p class="eyebrow"><span>Plant 04</span> Render wake sequence</p>
        <h1>
          เดินเครื่อง<br><span class="outline-text">แล้วไปต่อ</span>
        </h1>
        <p class="factory-copy">
          กำลังอุ่นเครื่อง <strong>{{ targetHost }}</strong> ให้พร้อมทำงาน
          เมื่อแรงดันระบบถึงระดับที่กำหนด เราจะส่งคุณไปต่ออัตโนมัติ
        </p>

        <div class="process-line" aria-label="ลำดับการเริ่มระบบ">
          <div class="process-step active"><span>01</span> Signal</div>
          <div class="process-step"><span>02</span> Warm up</div>
          <div class="process-step"><span>03</span> Transfer</div>
        </div>
      </div>

      <article class="machine-console" :class="{ ready: phase === 'ready', invalid: phase === 'invalid' }">
        <div class="panel-corner corner-tl" />
        <div class="panel-corner corner-br" />

        <div class="console-head">
          <div>
            <span class="console-kicker">Wake engine</span>
            <strong>MX-04 / Auto cycle</strong>
          </div>
          <span class="cycle-state"><i aria-hidden="true" />{{ phase === 'ready' ? 'Online' : phase === 'invalid' ? 'Locked' : 'Running' }}</span>
        </div>

        <div class="machine-window" aria-hidden="true">
          <div class="warning-bar" />

          <div class="steam-stack">
            <i /><i /><i />
          </div>

          <div class="piston-bank">
            <div class="piston"><i /><span /></div>
            <div class="piston"><i /><span /></div>
            <div class="piston"><i /><span /></div>
          </div>

          <div class="gear-field">
            <div class="gear gear-main" />
            <div class="gear gear-small" />
            <div class="spark-field"><i /><i /><i /></div>
          </div>

          <div class="conveyor">
            <div class="conveyor-belt" />
            <span class="crate crate-one">R</span>
            <span class="crate crate-two">R</span>
            <span class="crate crate-three">R</span>
          </div>
        </div>

        <div class="console-readout" aria-live="polite">
          <div class="readout-row">
            <div>
              <p>Current operation</p>
              <h2>{{ statusText }}</h2>
            </div>
            <span class="progress-number">{{ progress }}<small>%</small></span>
          </div>

          <div class="progress-track" role="progressbar" :aria-valuenow="progress" aria-valuemin="0" aria-valuemax="100">
            <div class="progress-fill" :style="{ width: `${progress}%` }" />
          </div>

          <div class="telemetry">
            <div><span>Probe</span><strong>{{ String(attempts).padStart(2, '0') }}</strong></div>
            <div><span>Cycle time</span><strong>{{ String(Math.floor(elapsedSeconds / 60)).padStart(2, '0') }}:{{ String(elapsedSeconds % 60).padStart(2, '0') }}</strong></div>
            <div><span>Mode</span><strong>Auto</strong></div>
          </div>
        </div>

        <p class="console-note">
          {{ phase === 'invalid' ? 'ใช้ URL รูปแบบ /ชื่อ เช่น /rails-starter-kit' : 'Render Free ปกติใช้เวลาตื่นประมาณ 1 นาที กรุณาเปิดหน้านี้ไว้' }}
        </p>
      </article>
    </section>

    <div class="safety-rail" aria-hidden="true"><span>Automatic machinery</span><span>Keep this window open</span><span>Automatic machinery</span></div>
  </main>
</template>
