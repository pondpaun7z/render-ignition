<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { machineStageFor, progressFor, renderTargetFromPath, themeFromSearch } from './wake'

type Phase = 'checking' | 'waking' | 'ready' | 'invalid'

const THEMES = {
  factory: {
    label: 'Factory',
    code: 'R-01',
    name: 'Render wake factory',
    landingEyebrow: 'Quick start',
    landingTitle: ['Wake Render', 'Before You Visit'],
    wakeEyebrow: 'Plant 04',
    wakeMode: 'Automated cold start',
    wakeTitle: ['Starting', 'The Engine'],
    manual: 'Operation manual / 01',
    operation: 'MX-04 / Current operation',
    safety: ['Automatic machinery', 'Keep this window open', 'Automatic machinery'],
    stages: { showcase: 'Auto cycle', ignition: 'Ignition', warmup: 'Warm up', 'full-load': 'Full load', online: 'Online', locked: 'Locked' },
    status: { ready: 'Service is ready', waiting: 'Almost there — checking again', starting: 'Render is starting up', initial: 'Sending wake-up signal' },
  },
  bakery: {
    label: 'Bakery',
    code: 'B-02',
    name: 'Render wake bakery',
    landingEyebrow: 'Fresh batch',
    landingTitle: ['Bake Render', 'Before You Visit'],
    wakeEyebrow: 'Oven 02',
    wakeMode: 'Automated preheat',
    wakeTitle: ['Baking', 'Your App'],
    manual: 'Recipe card / 01',
    operation: 'OV-02 / Current batch',
    safety: ['Fresh build in progress', 'Keep this window open', 'Fresh build in progress'],
    stages: { showcase: 'Bakery loop', ignition: 'Preheat', warmup: 'Mixing', 'full-load': 'Baking', online: 'Fresh', locked: 'Closed' },
    status: { ready: 'Fresh batch is ready', waiting: 'Almost baked — checking again', starting: 'Render is rising nicely', initial: 'Preheating the Render oven' },
  },
  space: {
    label: 'Space Launch',
    code: 'L-03',
    name: 'Render launch complex',
    landingEyebrow: 'Launch window',
    landingTitle: ['Launch Render', 'Into Orbit'],
    wakeEyebrow: 'Pad 03',
    wakeMode: 'Automated launch sequence',
    wakeTitle: ['Preparing', 'For Liftoff'],
    manual: 'Flight plan / 01',
    operation: 'LC-03 / Mission status',
    safety: ['Launch sequence active', 'Keep this window open', 'Launch sequence active'],
    stages: { showcase: 'Orbit loop', ignition: 'Standby', warmup: 'Fueling', 'full-load': 'Countdown', online: 'In orbit', locked: 'Grounded' },
    status: { ready: 'Orbit achieved', waiting: 'Final checks — holding course', starting: 'Fueling the Render rocket', initial: 'Opening the launch window' },
  },
  garden: {
    label: 'Garden',
    code: 'G-04',
    name: 'Render growth garden',
    landingEyebrow: 'Growing season',
    landingTitle: ['Grow Render', 'Before You Visit'],
    wakeEyebrow: 'Plot 04',
    wakeMode: 'Automated growth cycle',
    wakeTitle: ['Growing', 'Your App'],
    manual: 'Garden guide / 01',
    operation: 'GR-04 / Growth status',
    safety: ['Growth cycle active', 'Keep this window open', 'Growth cycle active'],
    stages: { showcase: 'Garden loop', ignition: 'Seeded', warmup: 'Sprouting', 'full-load': 'Growing', online: 'Blooming', locked: 'Dormant' },
    status: { ready: 'Your app is in bloom', waiting: 'Almost grown — checking again', starting: 'Render is starting to sprout', initial: 'Watering the Render seed' },
  },
  coffee: {
    label: 'Coffee Shop',
    code: 'C-05',
    name: 'Render wake café',
    landingEyebrow: 'Freshly brewed',
    landingTitle: ['Brew Render', 'Before You Visit'],
    wakeEyebrow: 'Bar 05',
    wakeMode: 'Automated brew cycle',
    wakeTitle: ['Brewing', 'Your App'],
    manual: 'Brew guide / 01',
    operation: 'CF-05 / Current order',
    safety: ['Fresh brew in progress', 'Keep this window open', 'Fresh brew in progress'],
    stages: { showcase: 'Café loop', ignition: 'Heating', warmup: 'Grinding', 'full-load': 'Extracting', online: 'Served', locked: 'Closed' },
    status: { ready: 'Your Render is served', waiting: 'Almost ready — one more shot', starting: 'Grinding a fresh Render build', initial: 'Heating the espresso machine' },
  },
  arcade: {
    label: 'Arcade',
    code: 'A-06',
    name: 'Render wake arcade',
    landingEyebrow: 'Insert coin',
    landingTitle: ['Load Render', 'Press To Start'],
    wakeEyebrow: 'Cabinet 06',
    wakeMode: 'Automated boot sequence',
    wakeTitle: ['Loading', 'Your Game'],
    manual: 'Player guide / 01',
    operation: 'PX-06 / Game status',
    safety: ['Game loading', 'Keep this window open', 'Game loading'],
    stages: { showcase: 'Attract mode', ignition: 'Booting', warmup: 'Loading', 'full-load': 'Turbo', online: 'Ready!', locked: 'Game over' },
    status: { ready: 'Player one is ready', waiting: 'Final level — checking again', starting: 'Loading the Render stage', initial: 'Inserting wake-up coin' },
  },
  halloween: {
    label: 'Halloween',
    code: 'H-07',
    name: 'Render haunted gateway',
    landingEyebrow: 'Witching hour',
    landingTitle: ['Summon Render', 'From The Crypt'],
    wakeEyebrow: 'Crypt 07',
    wakeMode: 'Automated summoning ritual',
    wakeTitle: ['Raising', 'Your App'],
    manual: 'Spell book / 01',
    operation: 'HX-07 / Ritual status',
    safety: ['Summoning in progress', 'Keep this window open', 'Beware of cold starts'],
    stages: { showcase: 'Haunting loop', ignition: 'Candlelit', warmup: 'Brewing', 'full-load': 'Summoning', online: 'Alive!', locked: 'Entombed' },
    status: { ready: 'Your Render lives', waiting: 'The spirits are close — checking again', starting: 'Stirring the Render cauldron', initial: 'Lighting the summoning candles' },
  },
  christmas: {
    label: 'Christmas',
    code: 'X-08',
    name: 'Render holiday workshop',
    landingEyebrow: 'Season greetings',
    landingTitle: ['Unwrap Render', 'Before You Visit'],
    wakeEyebrow: 'Workshop 08',
    wakeMode: 'Automated gift assembly',
    wakeTitle: ['Wrapping', 'Your App'],
    manual: 'Nice list / 01',
    operation: 'NP-08 / Workshop status',
    safety: ['Elves at work', 'Keep this window open', 'Holiday magic loading'],
    stages: { showcase: 'Snow globe', ignition: 'Lights on', warmup: 'Building', 'full-load': 'Wrapping', online: 'Delivered', locked: 'Snowed in' },
    status: { ready: 'Your Render is delivered', waiting: 'Almost wrapped — checking again', starting: 'The workshop is building your app', initial: 'Switching on the holiday lights' },
  },
} as const

type Theme = keyof typeof THEMES

function isTheme(value: string | null): value is Theme {
  return value !== null && Object.prototype.hasOwnProperty.call(THEMES, value)
}

const phase = ref<Phase>('checking')
const attempts = ref(0)
const elapsedSeconds = ref(0)
const themeNames = Object.keys(THEMES) as Theme[]
const savedTheme = localStorage.getItem('wake-theme')
const queryTheme = themeFromSearch(window.location.search, themeNames)
const theme = ref<Theme>(queryTheme ?? (isTheme(savedTheme) ? savedTheme : 'factory'))
const themeOptions = themeNames.map(value => ({ value, label: THEMES[value].label }))
const isLanding = window.location.pathname === '/'
const targetUrl = renderTargetFromPath(window.location.pathname)
const exampleUrl = computed(() => `${window.location.origin}/your-render-name?${theme.value}`)

let active = true
let retryTimer: number | undefined
let clockTimer: number | undefined
let redirectTimer: number | undefined

const progress = computed(() => phase.value === 'invalid' ? 0 : phase.value === 'ready' ? 100 : progressFor(attempts.value, elapsedSeconds.value))
const machineStage = computed(() => machineStageFor(progress.value, isLanding, phase.value === 'invalid'))
const themeCopy = computed(() => THEMES[theme.value])
const machineStageLabel = computed(() => themeCopy.value.stages[machineStage.value])
const targetHost = targetUrl ? new URL(targetUrl).host : '[name].onrender.com'
const statusText = computed(() => {
  if (phase.value === 'invalid') return 'Invalid Render service name'
  if (phase.value === 'ready') return themeCopy.value.status.ready
  if (elapsedSeconds.value > 45) return themeCopy.value.status.waiting
  if (elapsedSeconds.value > 12) return themeCopy.value.status.starting
  return themeCopy.value.status.initial
})

function setTheme(nextTheme: string): void {
  if (!isTheme(nextTheme)) return
  theme.value = nextTheme
  localStorage.setItem('wake-theme', nextTheme)

  const url = new URL(window.location.href)
  url.search = nextTheme
  window.history.replaceState(null, '', url.toString())
}

function selectTheme(event: Event): void {
  setTheme((event.target as HTMLSelectElement).value)
}

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
  <main class="factory-scene" :class="[`theme-${theme}`, machineStage, { landing: isLanding, ready: phase === 'ready', invalid: !isLanding && phase === 'invalid' }]">
    <div class="noise" aria-hidden="true" />
    <div class="factory-grid" aria-hidden="true" />
    <div class="scene-glow" aria-hidden="true" />

    <div v-if="theme === 'factory'" class="factory-machinery" aria-hidden="true">
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

    <div v-else-if="theme === 'bakery'" class="bakery-machinery" aria-hidden="true">
      <div class="bakery-sign"><span>Wake &amp; Bake</span><i /></div>
      <div class="bakery-shelf"><i /><i /><i /><i /></div>

      <div class="mixer-station">
        <div class="mixer-head"><span /><i /></div>
        <div class="mixing-bowl"><i /></div>
      </div>

      <div class="bakery-oven">
        <div class="oven-top"><i /><i /><i /></div>
        <div class="oven-door">
          <div class="oven-glow" />
          <div class="oven-tray"><i /><i /><i /></div>
        </div>
        <span>02</span>
      </div>

      <div class="flour-cloud"><i /><i /><i /></div>
      <div class="sugar-sprinkles"><i /><i /><i /><i /><i /><i /></div>
      <div class="bakery-counter" />

      <div class="pastry-conveyor">
        <div class="pastry-belt" />
        <span class="pastry pastry-one"><i /></span>
        <span class="pastry pastry-two"><i /></span>
        <span class="pastry pastry-three"><i /></span>
        <span class="pastry pastry-four"><i /></span>
      </div>
    </div>

    <div v-else-if="theme === 'space'" class="space-machinery" aria-hidden="true">
      <div class="star-field"><i /><i /><i /><i /><i /><i /></div>
      <div class="orbit-ring"><i /></div>
      <div class="mission-clock"><span>T–</span><b>03</b><i /></div>
      <div class="satellite"><span /><i /><i /></div>
      <div class="rocket">
        <span class="rocket-window" />
        <span class="rocket-mark">R</span>
        <i class="rocket-fin rocket-fin-left" />
        <i class="rocket-fin rocket-fin-right" />
        <b class="rocket-flame" />
      </div>
      <div class="launch-smoke"><i /><i /><i /><i /></div>
      <div class="launch-pad"><i /><i /><span /><span /><span /><span /></div>
    </div>

    <div v-else-if="theme === 'garden'" class="garden-machinery" aria-hidden="true">
      <div class="garden-sun" />
      <div class="garden-cloud"><i /><i /></div>
      <div class="garden-rain"><i /><i /><i /><i /><i /></div>
      <div class="garden-butterflies"><i /><i /></div>
      <div class="garden-fireflies"><i /><i /><i /><i /><i /><i /></div>
      <div class="garden-plant">
        <i class="plant-stem" />
        <i class="plant-leaf leaf-left" />
        <i class="plant-leaf leaf-right" />
        <span class="plant-flower"><i /><i /><i /><i /><b /></span>
      </div>
      <div class="garden-sprouts"><i /><i /><i /><i /></div>
      <div class="soil-bed"><i /><i /><i /><i /></div>
    </div>

    <div v-else-if="theme === 'coffee'" class="coffee-machinery" aria-hidden="true">
      <div class="coffee-sign">Wake<br><span>Roastery</span></div>
      <div class="cafe-lights"><i /><i /><i /></div>
      <div class="coffee-grinder"><span /><i /></div>
      <div class="espresso-machine">
        <div class="espresso-controls"><i /><i /><i /></div>
        <div class="group-head"><i /></div>
        <div class="coffee-cup"><i /><span /></div>
      </div>
      <div class="coffee-steam"><i /><i /><i /></div>
      <div class="coffee-counter" />
      <div class="bean-stream"><i /><i /><i /><i /><i /></div>
    </div>

    <div v-else-if="theme === 'arcade'" class="arcade-machinery" aria-hidden="true">
      <div class="pixel-field"><i /><i /><i /><i /><i /><i /></div>
      <div class="arcade-cabinet">
        <div class="arcade-marquee">RENDER<br><span>WAKE</span></div>
        <div class="arcade-screen">
          <strong>READY</strong>
          <i class="pixel-player" />
          <i class="pixel-enemy enemy-one" />
          <i class="pixel-enemy enemy-two" />
          <b /><b /><b /><b />
        </div>
        <div class="arcade-controls"><i /><span /><span /></div>
        <div class="coin-slot"><i /></div>
      </div>
      <div class="score-burst"><i>+100</i><i>1UP</i><i>COMBO</i></div>
      <div class="pixel-runner"><i /><i /><i /><i /></div>
      <div class="arcade-floor" />
    </div>

    <div v-else-if="theme === 'halloween'" class="halloween-machinery" aria-hidden="true">
      <div class="halloween-moon"><i /></div>
      <div class="halloween-bats"><i /><i /><i /><i /></div>
      <div class="haunted-house">
        <i class="house-chimney" />
        <div class="house-roof" />
        <div class="house-windows"><i /><i /><i /></div>
        <div class="house-door"><i /></div>
      </div>
      <div class="halloween-ghost"><i /><i /></div>
      <div class="jack-o-lantern"><span /><i /><i /><b /></div>
      <div class="graveyard"><i /><i /><i /><i /></div>
      <div class="halloween-fog"><i /><i /><i /></div>
    </div>

    <div v-else class="christmas-machinery" aria-hidden="true">
      <div class="christmas-lights"><i /><i /><i /><i /><i /><i /></div>
      <div class="christmas-snow"><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /></div>
      <div class="santa-sleigh"><span /><i /><i /></div>
      <div class="christmas-tree">
        <b>★</b>
        <span /><span /><span />
        <div class="tree-ornaments"><i /><i /><i /><i /><i /><i /></div>
      </div>
      <div class="gift-line">
        <span class="gift gift-one"><i /></span>
        <span class="gift gift-two"><i /></span>
        <span class="gift gift-three"><i /></span>
        <span class="gift gift-four"><i /></span>
      </div>
      <div class="snow-bank" />
    </div>

    <header class="factory-header">
      <div class="plant-mark">
        <span class="plant-number">{{ themeCopy.code }}</span>
        <span>{{ themeCopy.name }}</span>
      </div>
      <div class="plant-status">
        <label class="theme-switch">
          <span>Theme</span>
          <select :value="theme" aria-label="Animation theme" @change="selectTheme">
            <option v-for="option in themeOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
          </select>
        </label>
        <span class="status-live"><i class="status-dot" aria-hidden="true" /> Link active</span>
      </div>
    </header>

    <template v-if="isLanding">
      <section class="landing-hero">
        <p class="eyebrow"><span>{{ themeCopy.landingEyebrow }}</span> Render free instance</p>
        <h1 class="landing-title">{{ themeCopy.landingTitle[0] }}<br><span>{{ themeCopy.landingTitle[1] }}</span></h1>
        <p class="landing-copy">
          Use this page as a gateway to your Render service.<br>
          It wakes the server and redirects you when it is ready.
        </p>
      </section>

      <aside class="usage-deck">
        <div class="usage-head">
          <span>{{ themeCopy.manual }}</span>
          <h2>How it works</h2>
        </div>

        <ol class="usage-steps">
          <li>
            <span>01</span>
            <div><strong>Find your Render service name</strong><p>For example, <code>my-app</code> from my-app.onrender.com</p></div>
          </li>
          <li>
            <span>02</span>
            <div><strong>Build your gateway URL</strong><p>Replace <code>your-render-name</code> with the service name</p></div>
          </li>
          <li>
            <span>03</span>
            <div><strong>Pick an animation theme</strong><p>Add <code>?coffee</code>, <code>?space</code>, or use the Theme menu above</p></div>
          </li>
          <li>
            <span>04</span>
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
        <p class="eyebrow"><span>{{ themeCopy.wakeEyebrow }}</span> {{ themeCopy.wakeMode }}</p>
        <h1 class="factory-title">{{ themeCopy.wakeTitle[0] }}<br><span>{{ themeCopy.wakeTitle[1] }}</span></h1>
        <p class="factory-copy">
          Warming up <strong>{{ targetHost }}</strong><br>
          You will be redirected automatically when it is ready.
        </p>
      </section>

      <aside class="status-deck" aria-live="polite">
        <div class="deck-head">
          <div>
            <span>{{ themeCopy.operation }}</span>
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

    <div class="safety-rail" aria-hidden="true"><span v-for="(message, index) in themeCopy.safety" :key="index">{{ message }}</span></div>
  </main>
</template>
