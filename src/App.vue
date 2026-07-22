<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { machineStageFor, progressFor, renderTargetFromPath } from './wake'

type Phase = 'checking' | 'waking' | 'ready' | 'invalid'
const phase = ref<Phase>('checking')
const attempts = ref(0)
const elapsedSeconds = ref(0)
const isLanding = window.location.pathname === '/'
const targetUrl = renderTargetFromPath(window.location.pathname)
const exampleUrl = `${window.location.origin}/your-render-name`

let active = true
let retryTimer: number | undefined
let clockTimer: number | undefined
let redirectTimer: number | undefined

const progress = computed(() => phase.value === 'invalid' ? 0 : phase.value === 'ready' ? 100 : progressFor(attempts.value, elapsedSeconds.value))
const machineStage = computed(() => machineStageFor(progress.value, isLanding, phase.value === 'invalid'))
const machineStageLabel = computed(() => ({
  showcase: 'Auto cycle',
  ignition: 'Ignition',
  warmup: 'Warm up',
  'full-load': 'Full load',
  online: 'Online',
  locked: 'Locked',
})[machineStage.value])
const targetHost = targetUrl ? new URL(targetUrl).host : '[name].onrender.com'
const statusText = computed(() => {
  if (phase.value === 'invalid') return 'Invalid Render service name'
  if (phase.value === 'ready') return 'Service is ready'
  if (elapsedSeconds.value > 45) return 'Almost there — checking again'
  if (elapsedSeconds.value > 12) return 'Render is starting up'
  return 'Sending wake-up signal'
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
  if (isLanding) {
    document.title = 'Render Ignition — Quick Start'
    return
  }

  if (!targetUrl) {
    phase.value = 'invalid'
    return
  }

  document.title = `Waking ${targetHost}`
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
  <main class="factory-scene" :class="[machineStage, { landing: isLanding, ready: phase === 'ready', invalid: !isLanding && phase === 'invalid' }]">
    <div class="noise" aria-hidden="true" />
    <div class="factory-grid" aria-hidden="true" />
    <div class="scene-glow" aria-hidden="true" />

    <div class="factory-machinery" aria-hidden="true">
      <div class="ceiling-rail">
        <div class="trolley"><i /><span /></div>
      </div>

      <div class="pipe-run pipe-one"><i /></div>
      <div class="pipe-run pipe-two"><i /></div>

      <div class="machine-cluster">
        <div class="steam-stack"><i /><i /><i /></div>

        <div class="boiler">
          <div class="boiler-gauge"><i /></div>
          <span>04</span>
        </div>

        <div class="piston-bank">
          <div class="piston"><i /><span /></div>
          <div class="piston"><i /><span /></div>
          <div class="piston"><i /><span /></div>
          <div class="piston"><i /><span /></div>
        </div>

        <div class="gear gear-xl" />
        <div class="gear gear-mid" />
        <div class="gear gear-small" />
        <div class="spark-field"><i /><i /><i /><i /></div>
      </div>

      <div class="factory-floor" />

      <div class="conveyor">
        <div class="conveyor-belt" />
        <span class="crate crate-one">R</span>
        <span class="crate crate-two">R</span>
        <span class="crate crate-three">R</span>
        <span class="crate crate-four">R</span>
      </div>
    </div>

    <header class="factory-header">
      <div class="plant-mark">
        <span class="plant-number">R-01</span>
        <span>Render wake factory</span>
      </div>
      <div class="plant-status">
        <span class="status-live"><i class="status-dot" aria-hidden="true" /> Link active</span>
      </div>
    </header>

    <template v-if="isLanding">
      <section class="landing-hero">
        <p class="eyebrow"><span>Quick start</span> Render free instance</p>
        <h1 class="landing-title">Wake Render<br><span>Before You Visit</span></h1>
        <p class="landing-copy">
          Use this page as a gateway to your Render service.<br>
          It wakes the server and redirects you when it is ready.
        </p>
      </section>

      <aside class="usage-deck">
        <div class="usage-head">
          <span>Operation manual / 01</span>
          <h2>How it works</h2>
        </div>

        <ol class="usage-steps">
          <li>
            <span>01</span>
            <div><strong>Find your Render service name</strong><p>For example, <code>my-app</code> from my-app.onrender.com</p></div>
          </li>
          <li>
            <span>02</span>
            <div><strong>Append it to this URL</strong><p>Replace <code>your-render-name</code> with the service name</p></div>
          </li>
          <li>
            <span>03</span>
            <div><strong>Open the URL and wait</strong><p>The gateway wakes Render and redirects you automatically</p></div>
          </li>
        </ol>

        <div class="usage-example">
          <span>URL format</span>
          <code>{{ exampleUrl }}</code>
        </div>
      </aside>
    </template>

    <template v-else>
      <section class="factory-hero">
        <p class="eyebrow"><span>Plant 04</span> Automated cold start</p>
        <h1 class="factory-title">Starting<br><span>The Engine</span></h1>
        <p class="factory-copy">
          Warming up <strong>{{ targetHost }}</strong><br>
          You will be redirected automatically when it is ready.
        </p>
      </section>

      <aside class="status-deck" aria-live="polite">
        <div class="deck-head">
          <div>
            <span>MX-04 / Current operation</span>
            <h2>{{ statusText }}</h2>
          </div>
          <span class="cycle-state"><i aria-hidden="true" />{{ machineStageLabel }}</span>
        </div>

        <div class="progress-row">
          <div class="progress-track" role="progressbar" :aria-valuenow="progress" aria-valuemin="0" aria-valuemax="100">
            <div class="progress-fill" :style="{ width: `${progress}%` }" />
          </div>
          <span class="progress-number">{{ progress }}<small>%</small></span>
        </div>

        <div class="telemetry">
          <div><span>Probe</span><strong>{{ String(attempts).padStart(2, '0') }}</strong></div>
          <div><span>Cycle time</span><strong>{{ String(Math.floor(elapsedSeconds / 60)).padStart(2, '0') }}:{{ String(elapsedSeconds % 60).padStart(2, '0') }}</strong></div>
          <div><span>Stage</span><strong>{{ machineStageLabel }}</strong></div>
          <p>{{ phase === 'invalid' ? 'Use /service-name, for example /rails-starter-kit' : 'Keep this page open while the service starts' }}</p>
        </div>
      </aside>
    </template>

    <div class="safety-rail" aria-hidden="true"><span>Automatic machinery</span><span>Keep this window open</span><span>Automatic machinery</span></div>
  </main>
</template>
