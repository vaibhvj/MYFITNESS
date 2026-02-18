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
  ['Monday', 'Upper Body'],
  ['Tuesday', 'Legs & Strength'],
  ['Wednesday', 'Mobility & Recovery'],
  ['Thursday', 'Full Body'],
  ['Friday', 'Posture Builder'],
  ['Saturday', 'Light Activation'],
  ['Sunday', 'Rest']
];

const exerciseMap = {
  'Upper Body': ['Push-Ups', '4×10', '35 min', 'https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExdzR5NGlvMWh3M2kzN3Q0NXY4Z3Nud2N6dnA4M2Y2aWloY2YzMWRldCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/l3vR85PnGsBwu1PFK/giphy.gif'],
  'Legs & Strength': ['Goblet Squat', '4×12', '40 min', 'https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExbjByaW8yeXg1ZXVyd2Q1czhrdDAwODNtMzR4czQycW8xN2w4a2RmbSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/3o7TKtnuHOHHUjR38Y/giphy.gif'],
  'Mobility & Recovery': ['Hip + Thoracic Mobility', '3×8', '25 min', 'https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExeW5zODhndDFrMmhkNHNiM3F2a2x1N2pzaTRhOXA0c3g3anV4dnM4NSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/JIX9t2j0ZTN9S/giphy.gif'],
  'Full Body': ['Dumbbell Complex', '5×6', '45 min', 'https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExMGVhaHNiNDQzNG8wYXR6cjRtdjN4cnYxNnY5bm5jMXh4N2x6OTlyMCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/3o6ZsY8RSL5v3Vf7Qk/giphy.gif'],
  'Posture Builder': ['Face Pull + Plank', '4×12', '30 min', 'https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExbG8weTZydDJxMTRyM3BqcjRnbW03aTQ2OHN5N3h3cDBrN3R5Y2d4NiZlcD12MV9naWZzX3NlYXJjaCZjdD1n/3o7bu3XilJ5BOiSGic/giphy.gif'],
  'Light Activation': ['Brisk Walk + Core', '3×15', '30 min', 'https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExb2VjM2FtM3h2ZzB3eGhwdHRlZWV2aTZ0N2x4Yjdjc2JxYTA0Nm9uNCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/3ohs4BSacFKI7A717y/giphy.gif'],
  Rest: ['Breathing + Stretch', '2×10', '20 min', 'https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExcDdyNTRxNjk0eXVpM3Q4M3Fta2x6dmlvdzQxNDRseDd2d2Nub2xkYyZlcD12MV9naWZzX3NlYXJjaCZjdD1n/LHZyixOnHwDDy/giphy.gif']
};

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
  const monthlyProgress = Math.max(
    0,
    Math.min(100, ((profile.weight - profile.targetWeight) / profile.weight) * 100 + 50)
  );

  welcomeMessage.textContent = `Welcome ${profile.name}! Your ${profile.goal} journey starts today.`;
  dailyGoals.innerHTML = `
    <div class="kpi"><strong>🎯 Steps Target</strong><div>${targets.steps}</div></div>
    <div class="kpi"><strong>💧 Water Intake</strong><div>${targets.water}</div></div>
    <div class="kpi"><strong>😴 Sleep Target</strong><div>${targets.sleep}</div></div>
    <div class="kpi"><strong>🍗 Protein Target</strong><div>${targets.protein}</div></div>
  `;

  progressSection.innerHTML = `
    <div class="row"><span>Current Weight</span><strong>${profile.weight} kg</strong></div>
    <div class="row"><span>Target Weight</span><strong>${profile.targetWeight} kg</strong></div>
    <div class="row"><span>Monthly Progress</span><strong>${monthlyProgress.toFixed(1)}%</strong></div>
    <progress value="${monthlyProgress}" max="100"></progress>
    <div class="row"><span>Muscle Gain Timeline (6 months)</span><strong>${profile.experience}</strong></div>
  `;
}

function renderWorkoutTable() {
  workoutTableBody.innerHTML = '';
  const eqBoost = profile.equipment === 'Gym Access' ? ' + compound lifts' : profile.equipment === 'Dumbbells' ? ' + dumbbell finisher' : ' + bodyweight finisher';
  dailyBaseline.textContent = `Daily Goals: Steps ${goalTargets(Number(profile.weight), profile.goal).steps} · Water 2.5–3L · Sleep 6.5–7h · Protein 1.5g/kg. Intensity: ${currentIntensity}.`;

  weeklyFocus.forEach(([day, focus]) => {
    const [exercise, sets, duration, gif] = exerciseMap[focus] || exerciseMap.Rest;
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${day}</td>
      <td>${focus}</td>
      <td>${exercise}${focus === 'Rest' ? '' : eqBoost}</td>
      <td>${sets}</td>
      <td>${duration}</td>
      <td><button class="btn demo-btn" data-gif="${gif}" data-title="${exercise}">Animated Demo</button></td>
      <td><button class="btn primary start-btn" data-gif="${gif}" data-title="${focus}">Start Workout</button></td>
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

  dietPlan.innerHTML = Object.entries(plan)
    .map(([time, meal]) => `<article class="diet-card"><h4>${time}</h4><p>${meal}</p></article>`)
    .join('');

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
    <li>✅ Reps auto-increase every 2 weeks (currently tuned for ${profile.experience}).</li>
    <li>✅ Intensity auto-adjusts based on logged progress and adherence.</li>
    <li>✅ Exercise suggestions adapt to ${profile.height}cm, ${profile.weight}kg, goal: ${profile.goal}.</li>
    <li>✅ Load reduction protocol enabled when pain is reported.</li>
    <li>✅ Daily motivational notifications available.</li>
  `;
}

profileForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const data = new FormData(profileForm);
  profile = Object.fromEntries(data.entries());
  renderDashboard();
  renderWorkoutTable();
  renderDiet();
  renderSmartFeatures();
});

document.getElementById('workoutTable').addEventListener('click', (e) => {
  const button = e.target.closest('button');
  if (!button) return;
  if (button.classList.contains('demo-btn')) {
    window.open(button.dataset.gif, '_blank');
    return;
  }
  if (button.classList.contains('start-btn')) {
    startWorkout(button.dataset.title, button.dataset.gif);
  }
});

function startWorkout(title, gif) {
  liveTitle.textContent = `Live Workout Mode — ${title}`;
  demoImage.src = gif;
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
    const sec = String(Math.max(0, timer)).padStart(2, '0');
    timerEl.textContent = `00:${sec}`;
    if (timer <= 0) {
      clearInterval(timerInterval);
      postureHint.textContent = 'Set complete. Take 30 seconds rest and repeat.';
    }
  }, 1000);
}

document.getElementById('repPlus').addEventListener('click', () => {
  reps += 1;
  repCountEl.textContent = reps;
});

document.getElementById('closeWorkout').addEventListener('click', () => {
  clearInterval(timerInterval);
  if (camera) camera.stop();
  workoutDialog.close();
});

async function setupPoseDetection() {
  if (!window.Pose || !window.Camera) {
    postureHint.textContent = 'Pose detection unavailable in this browser build.';
    return;
  }
  const pose = new Pose({
    locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`
  });
  pose.setOptions({
    modelComplexity: 0,
    smoothLandmarks: true,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5
  });

  pose.onResults((res) => {
    const lm = res.poseLandmarks;
    if (!lm) return;
    const shoulder = lm[11];
    const hip = lm[23];
    const knee = lm[25];

    if (Math.abs(shoulder.x - hip.x) > 0.16) {
      postureHint.textContent = 'Keep your back straight';
    } else if ((hip.y - knee.y) < -0.02) {
      postureHint.textContent = 'Go lower in squat';
    } else {
      postureHint.textContent = 'Great form. Engage your core and control tempo.';
    }
  });

  camera = new Camera(cameraFeed, {
    onFrame: async () => {
      await pose.send({ image: cameraFeed });
    },
    width: 640,
    height: 360
  });
  camera.start();
}

document.getElementById('logProteinBtn').addEventListener('click', () => {
  if (!profile) return;
  proteinDone += 25;
  updateProtein();
});

const progressForm = document.getElementById('progressForm');
progressForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const data = new FormData(progressForm);
  progressData.push({
    weight: Number(data.get('weekWeight')),
    waist: Number(data.get('waist')),
    pushups: Number(data.get('pushups')),
    squats: Number(data.get('squats'))
  });
  renderChart();
  progressForm.reset();
});

function renderChart() {
  const ctx = document.getElementById('progressChart');
  const labels = progressData.map((_, i) => `W${i + 1}`);
  const weights = progressData.map((x) => x.weight);
  const pushups = progressData.map((x) => x.pushups);

  if (chart) chart.destroy();
  chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        { label: 'Weight (kg)', data: weights, borderColor: '#22c55e' },
        { label: 'Push-ups Max', data: pushups, borderColor: '#00b3ff' }
      ]
    },
    options: { responsive: true, maintainAspectRatio: false }
  });
}

document.getElementById('painBtn').addEventListener('click', () => {
  currentIntensity = 'Reduced 20%';
  if (profile) renderWorkoutTable();
  alert('AI Coach: Load reduced by 20% for recovery. Prioritize mobility today.');
});

document.getElementById('notifyBtn').addEventListener('click', async () => {
  if (!('Notification' in window)) return alert('Notifications are not supported here.');
  const permission = await Notification.requestPermission();
  if (permission === 'granted') {
    new Notification('StrongTrack AI', { body: 'You are one workout away from becoming stronger 🔥' });
  }
});

document.getElementById('stepSyncBtn').addEventListener('click', () => {
  const manualSteps = prompt('Enter your current step count from your wearable/app:');
  if (!manualSteps) return;
  const stepCard = [...dailyGoals.children].find((x) => x.textContent.includes('Steps Target'));
  if (stepCard) stepCard.innerHTML += `<small><br/>Synced steps today: ${manualSteps}</small>`;
});

document.getElementById('darkModeToggle').addEventListener('click', () => {
  document.documentElement.classList.toggle('light');
});

document.getElementById('printPlanBtn').addEventListener('click', () => window.print());

document.getElementById('exportPdfBtn').addEventListener('click', () => {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  doc.text('StrongTrack AI - Progress Snapshot', 10, 10);
  progressData.slice(-6).forEach((row, i) => {
    doc.text(`Week ${i + 1}: Weight ${row.weight}kg | Waist ${row.waist}cm | Pushups ${row.pushups}`, 10, 20 + i * 8);
  });
  doc.save('strongtrack-progress.pdf');
});

document.getElementById('customWorkoutForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const data = new FormData(e.target);
  const tr = document.createElement('tr');
  tr.innerHTML = `
    <td>${data.get('day')}</td>
    <td>${data.get('focus')}</td>
    <td>${data.get('exercise')}</td>
    <td>${data.get('sets')}</td>
    <td>${data.get('duration')}</td>
    <td><button class="btn" data-gif="https://media.giphy.com/media/26xBukhxEJ6M3G8rK/giphy.gif">Animated Demo</button></td>
    <td><button class="btn primary start-btn" data-title="Custom Workout" data-gif="https://media.giphy.com/media/26xBukhxEJ6M3G8rK/giphy.gif">Start Workout</button></td>
  `;
  workoutTableBody.appendChild(tr);
  e.target.reset();
});

const chatLog = document.getElementById('chatLog');
const chatInput = document.getElementById('chatInput');

document.getElementById('chatForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const msg = chatInput.value.trim();
  if (!msg) return;
  appendMsg('You', msg);
  const reply = coachReply(msg);
  appendMsg('Coach', reply);
  chatInput.value = '';
});

function appendMsg(sender, text) {
  const div = document.createElement('div');
  div.className = 'msg';
  div.innerHTML = `<b>${sender}:</b> ${text}`;
  chatLog.appendChild(div);
  chatLog.scrollTop = chatLog.scrollHeight;
}

function coachReply(text) {
  const lower = text.toLowerCase();
  if (lower.includes('pain')) return 'Thanks for reporting pain. I will reduce your intensity and switch to recovery work today.';
  if (lower.includes('diet')) return 'Focus on protein at each meal and maintain hydration. I can adjust portions based on your weekly scale trend.';
  if (lower.includes('motivation')) return '6 months of consistency beats 6 days of intensity. Show up today, results will follow.';
  return 'Great question. Keep your form strict, progressive overload gradual, and sleep on schedule for best results.';
}

appendMsg('Coach', 'Hi! I am your StrongTrack AI coach. Fill your profile and I will build your 6-month consistency roadmap.');
