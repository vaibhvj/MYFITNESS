const profileForm = document.getElementById('profileForm');
const dailyGoals = document.getElementById('dailyGoals');
const progressSection = document.getElementById('progressSection');
const workoutTableBody = document.querySelector('#workoutTable tbody');
const dailyBaseline = document.getElementById('dailyBaseline');
const dietPlan = document.getElementById('dietPlan');
const welcomeMessage = document.getElementById('welcomeMessage');
const proteinProgress = document.getElementById('proteinProgress');
const proteinText = document.getElementById('proteinText');
const smartList = document.getElementById('smartList');

const demoDialog = document.getElementById('demoDialog');
const demoTitle = document.getElementById('demoTitle');
const demoPreview = document.getElementById('demoPreview');

const workoutDialog = document.getElementById('workoutDialog');
const liveTitle = document.getElementById('liveTitle');
const demoImage = document.getElementById('demoImage');
const timerEl = document.getElementById('timer');
const repCountEl = document.getElementById('repCount');
const postureHint = document.getElementById('postureHint');
const cameraFeed = document.getElementById('cameraFeed');

let profile = null;
let timer = 30;
let reps = 0;
let timerInterval = null;
let camera = null;
let proteinDone = 0;
let chart = null;
let currentIntensity = 'Normal';
const progressData = [];

const weeklyFocus = [
  ['Monday', 'Upper Body', 'pushups.svg'],
  ['Tuesday', 'Legs & Strength', 'squats.svg'],
  ['Wednesday', 'Mobility & Recovery', 'mobility.svg'],
  ['Thursday', 'Full Body', 'fullbody.svg'],
  ['Friday', 'Posture Builder', 'posture.svg'],
  ['Saturday', 'Light Activation', 'activation.svg'],
  ['Sunday', 'Rest', 'rest.svg']
];

const exerciseMap = {
  'Upper Body': ['Push-Ups', '4×10', '35 min'],
  'Legs & Strength': ['Goblet Squat', '4×12', '40 min'],
  'Mobility & Recovery': ['Hip + Thoracic Mobility', '3×8', '25 min'],
  'Full Body': ['Dumbbell Complex', '5×6', '45 min'],
  'Posture Builder': ['Face Pull + Plank', '4×12', '30 min'],
  'Light Activation': ['Brisk Walk + Core', '3×15', '30 min'],
  Rest: ['Breathing + Stretch', '2×10', '20 min']
};

const quotes = [
  'Discipline is choosing what you want most over what you want now.',
  'Small progress daily creates massive results in 6 months.',
  'Train with intent, recover with purpose, repeat with consistency.',
  'Your future body is built by today’s workout, meal, and sleep.',
  'Strength is earned rep by rep, not wished into existence.'
];

function goalTargets(weight, goal) {
  const protein = Math.round(weight * 1.5);
  const base = {
    steps: '6,500 – 8,000',
    water: '2.5 – 3 Litres',
    sleep: '6.5 – 7 Hours',
    protein: `${protein}g`
  };
  if (goal === 'Fat Loss') base.steps = '8,000 – 10,000';
  if (goal === 'Strength') base.sleep = '7 – 8 Hours';
  return base;
}

function renderDashboard() {
  const targets = goalTargets(Number(profile.weight), profile.goal);
  const monthlyProgress = Math.max(0, Math.min(100, ((profile.weight - profile.targetWeight) / profile.weight) * 100 + 50));
  welcomeMessage.textContent = `Welcome ${profile.name}! Goal: ${profile.goal}`;
  dailyGoals.innerHTML = `
    <article class="rounded-xl bg-slate-100 p-3 dark:bg-slate-800"><h4 class="font-semibold">🎯 Steps Target</h4><p>${targets.steps}</p></article>
    <article class="rounded-xl bg-slate-100 p-3 dark:bg-slate-800"><h4 class="font-semibold">💧 Water Intake</h4><p>${targets.water}</p></article>
    <article class="rounded-xl bg-slate-100 p-3 dark:bg-slate-800"><h4 class="font-semibold">😴 Sleep Target</h4><p>${targets.sleep}</p></article>
    <article class="rounded-xl bg-slate-100 p-3 dark:bg-slate-800"><h4 class="font-semibold">🍗 Protein Target</h4><p>${targets.protein}</p></article>
  `;
  progressSection.innerHTML = `
    <div class="flex justify-between"><span>Current Weight</span><b>${profile.weight} kg</b></div>
    <div class="flex justify-between"><span>Target Weight</span><b>${profile.targetWeight} kg</b></div>
    <div class="flex justify-between"><span>Monthly Progress</span><b>${monthlyProgress.toFixed(1)}%</b></div>
    <progress value="${monthlyProgress}" max="100" class="w-full"></progress>
    <div class="flex justify-between"><span>Muscle Gain Timeline</span><b>${profile.experience} (6 months)</b></div>
  `;
}

function renderWorkoutTable() {
  workoutTableBody.innerHTML = '';
  const eqBoost = profile.equipment === 'Gym Access' ? ' + compound lifts' : profile.equipment === 'Dumbbells' ? ' + dumbbell finisher' : ' + bodyweight finisher';
  dailyBaseline.textContent = `Steps ${goalTargets(Number(profile.weight), profile.goal).steps} · Water 2.5–3L · Sleep 6.5–7h · Protein 1.5g/kg · Intensity: ${currentIntensity}`;

  weeklyFocus.forEach(([day, focus, gif]) => {
    const [exercise, sets, duration] = exerciseMap[focus] || exerciseMap.Rest;
    const gifPath = `exercisegif/${gif}`;
    const tr = document.createElement('tr');
    tr.className = 'border-b border-slate-300 dark:border-slate-700';
    tr.innerHTML = `
      <td class="p-2">${day}</td>
      <td>${focus}</td>
      <td>${exercise}${focus === 'Rest' ? '' : eqBoost}</td>
      <td>${sets}</td>
      <td>${duration}</td>
      <td><button class="demo-btn rounded-lg border border-slate-400 px-2 py-1" data-gif="${gifPath}" data-title="${exercise}">Animated Demo</button></td>
      <td><button class="start-btn rounded-lg bg-emerald-500 px-2 py-1 text-white" data-gif="${gifPath}" data-title="${focus}">Start Workout</button></td>
    `;
    workoutTableBody.appendChild(tr);
  });
}

function renderDiet() {
  const plan = {
    Morning: 'Milk + Banana + Nuts',
    Lunch: 'Roti + Dal + Sabzi + Curd',
    'Pre-Workout': 'Banana / Peanut Butter Sandwich',
    'Post-Workout': 'Milk + Paneer / Eggs',
    Dinner: 'Roti + Sabzi + Dal'
  };
  if (profile.goal === 'Fat Loss') plan.Dinner = 'Salad + Dal + Paneer';
  if (profile.goal === 'Muscle Gain') plan['Post-Workout'] = 'Milk + Paneer + Oats shake';
  dietPlan.innerHTML = Object.entries(plan).map(([k, v]) => `<div class="rounded-xl bg-slate-100 p-3 dark:bg-slate-800"><h4 class="font-semibold">${k}</h4><p>${v}</p></div>`).join('');
  proteinDone = 0;
  updateProtein();
}

function updateProtein() {
  const targetProtein = Math.round(Number(profile.weight) * 1.5);
  const value = Math.min(100, Math.round((proteinDone / targetProtein) * 100));
  proteinProgress.value = value;
  proteinText.textContent = `${proteinDone}g / ${targetProtein}g`;
}

function renderSmartFeatures() {
  smartList.innerHTML = `
    <li>Reps auto-increase every 2 weeks for ${profile.experience} level.</li>
    <li>Workout intensity changes from your logs and consistency.</li>
    <li>Exercise choices adapt to ${profile.height}cm, ${profile.weight}kg, ${profile.goal}.</li>
    <li>Load auto-reduction when pain is reported.</li>
    <li>Daily motivational reminder support.</li>
  `;
}

function showAnimatedDemo(title, gifPath) {
  demoTitle.textContent = `Animated Demo — ${title}`;
  demoPreview.src = gifPath;
  demoDialog.showModal();
}

function startWorkout(title, gifPath) {
  liveTitle.textContent = `Live Workout Mode — ${title}`;
  demoImage.src = gifPath;
  workoutDialog.showModal();
  timer = 30;
  reps = 0;
  repCountEl.textContent = reps;
  runTimer();
  setupPoseDetection();
}

function runTimer() {
  clearInterval(timerInterval);
  timerEl.textContent = '00:30';
  timerInterval = setInterval(() => {
    timer -= 1;
    timerEl.textContent = `00:${String(Math.max(0, timer)).padStart(2, '0')}`;
    if (timer <= 0) {
      clearInterval(timerInterval);
      postureHint.textContent = 'Set complete. Rest 30 seconds and repeat.';
    }
  }, 1000);
}

async function setupPoseDetection() {
  if (!window.Pose || !window.Camera) {
    postureHint.textContent = 'Pose detection unavailable.';
    return;
  }
  const pose = new Pose({ locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}` });
  pose.setOptions({ modelComplexity: 0, smoothLandmarks: true, minDetectionConfidence: 0.5, minTrackingConfidence: 0.5 });
  pose.onResults((res) => {
    const lm = res.poseLandmarks;
    if (!lm) return;
    const shoulder = lm[11];
    const hip = lm[23];
    const knee = lm[25];
    if (Math.abs(shoulder.x - hip.x) > 0.16) postureHint.textContent = 'Keep your back straight';
    else if ((hip.y - knee.y) < -0.02) postureHint.textContent = 'Go lower in squat';
    else postureHint.textContent = 'Great form. Engage your core.';
  });
  camera = new Camera(cameraFeed, { onFrame: async () => pose.send({ image: cameraFeed }), width: 640, height: 360 });
  camera.start();
}

function renderQuote() {
  const random = quotes[Math.floor(Math.random() * quotes.length)];
  document.getElementById('quoteBox').textContent = random;
}

profileForm.addEventListener('submit', (e) => {
  e.preventDefault();
  profile = Object.fromEntries(new FormData(profileForm).entries());
  renderDashboard();
  renderWorkoutTable();
  renderDiet();
  renderSmartFeatures();
  renderQuote();
});

document.getElementById('workoutTable').addEventListener('click', (e) => {
  const btn = e.target.closest('button');
  if (!btn) return;
  if (btn.classList.contains('demo-btn')) {
    showAnimatedDemo(btn.dataset.title, btn.dataset.gif);
    return;
  }
  if (btn.classList.contains('start-btn')) {
    startWorkout(btn.dataset.title, btn.dataset.gif);
  }
});

document.getElementById('repPlus').addEventListener('click', () => {
  reps += 1;
  repCountEl.textContent = reps;
});

document.getElementById('closeDemo').addEventListener('click', () => {
  demoDialog.close();
});

document.getElementById('closeWorkout').addEventListener('click', () => {
  clearInterval(timerInterval);
  if (camera) camera.stop();
  workoutDialog.close();
});

document.getElementById('logProteinBtn').addEventListener('click', () => {
  if (!profile) return;
  proteinDone += 25;
  updateProtein();
});

document.getElementById('progressForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const data = new FormData(e.target);
  progressData.push({ weight: Number(data.get('weekWeight')), waist: Number(data.get('waist')), pushups: Number(data.get('pushups')), squats: Number(data.get('squats')) });
  const labels = progressData.map((_, i) => `W${i + 1}`);
  if (chart) chart.destroy();
  chart = new Chart(document.getElementById('progressChart'), {
    type: 'line',
    data: {
      labels,
      datasets: [
        { label: 'Weight (kg)', data: progressData.map((x) => x.weight), borderColor: '#10b981' },
        { label: 'Push-ups Max', data: progressData.map((x) => x.pushups), borderColor: '#3b82f6' }
      ]
    },
    options: { responsive: true, maintainAspectRatio: false }
  });
  e.target.reset();
});

document.getElementById('painBtn').addEventListener('click', () => {
  currentIntensity = 'Reduced 20%';
  if (profile) renderWorkoutTable();
  alert('AI Coach: Load reduced by 20% for recovery.');
});

document.getElementById('notifyBtn').addEventListener('click', async () => {
  if (!('Notification' in window)) return alert('Notifications not supported.');
  const permission = await Notification.requestPermission();
  if (permission === 'granted') new Notification('StrongTrack AI', { body: 'You are one workout away from becoming stronger 🔥' });
});

document.getElementById('stepSyncBtn').addEventListener('click', () => {
  const manualSteps = prompt('Enter current step count:');
  if (!manualSteps) return;
  const stepCard = [...dailyGoals.children][0];
  if (stepCard) stepCard.innerHTML += `<p class="mt-1 text-xs">Synced steps: ${manualSteps}</p>`;
});

document.getElementById('darkModeToggle').addEventListener('click', () => {
  document.documentElement.classList.toggle('dark');
});

document.getElementById('printPlanBtn').addEventListener('click', () => window.print());

document.getElementById('exportPdfBtn').addEventListener('click', () => {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  doc.text('StrongTrack AI - Progress Snapshot', 10, 12);
  progressData.slice(-6).forEach((row, i) => doc.text(`Week ${i + 1}: Weight ${row.weight}kg | Waist ${row.waist}cm | Pushups ${row.pushups} | Squats ${row.squats}`, 10, 24 + i * 8));
  doc.save('strongtrack-progress.pdf');
});

document.getElementById('customWorkoutForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const data = new FormData(e.target);
  const tr = document.createElement('tr');
  tr.className = 'border-b border-slate-300 dark:border-slate-700';
  tr.innerHTML = `
    <td class="p-2">${data.get('day')}</td><td>${data.get('focus')}</td><td>${data.get('exercise')}</td><td>${data.get('sets')}</td><td>${data.get('duration')}</td>
    <td><button class="demo-btn rounded-lg border border-slate-400 px-2 py-1" data-gif="exercisegif/fullbody.svg" data-title="${data.get('exercise')}">Animated Demo</button></td>
    <td><button class="start-btn rounded-lg bg-emerald-500 px-2 py-1 text-white" data-gif="exercisegif/fullbody.svg" data-title="Custom Workout">Start Workout</button></td>
  `;
  workoutTableBody.appendChild(tr);
  e.target.reset();
});

document.getElementById('newQuoteBtn').addEventListener('click', renderQuote);
renderQuote();
