// === 1. FONDO MESH CONSTELLATION CON INTERACCIÓN DE CURSOR ===
const canvas = document.getElementById('corporate-bg');
const ctx = canvas.getContext('2d');

let mouse = { x: null, y: null, radius: 160 };

window.addEventListener('mousemove', (e) => {
  mouse.x = e.x;
  mouse.y = e.y;
});

window.addEventListener('mouseleave', () => {
  mouse.x = null;
  mouse.y = null;
});

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

const particles = Array.from({ length: 55 }, () => ({
  x: Math.random() * window.innerWidth,
  y: Math.random() * window.innerHeight,
  vx: (Math.random() - 0.5) * 1.2,
  vy: (Math.random() - 0.5) * 1.2,
  radius: Math.random() * 2 + 1.2,
  baseAlpha: Math.random() * 0.5 + 0.3
}));

function animateMesh() {
  const isLight = document.body.classList.contains('light-mode');
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const particleColor = isLight ? '#0284c7' : '#38bdf8';
  const lineColorRGB = isLight ? '2, 132, 199' : '56, 189, 248';

  particles.forEach((p, i) => {
    p.x += p.vx;
    p.y += p.vy;

    if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
    if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

    // Conexión con el Mouse
    if (mouse.x !== null && mouse.y !== null) {
      let dx = mouse.x - p.x;
      let dy = mouse.y - p.y;
      let dist = Math.hypot(dx, dy);

      if (dist < mouse.radius) {
        let opacity = (1 - dist / mouse.radius);
        ctx.strokeStyle = `rgba(129, 140, 248, ${opacity * 0.6})`;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(mouse.x, mouse.y);
        ctx.stroke();
      }
    }

    // Dibujar Partícula
    ctx.fillStyle = particleColor;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
    ctx.fill();

    // Conectar entre partículas
    for (let j = i + 1; j < particles.length; j++) {
      let p2 = particles[j];
      let dist = Math.hypot(p.x - p2.x, p.y - p2.y);
      if (dist < 130) {
        let opacity = (1 - dist / 130) * 0.25;
        ctx.strokeStyle = `rgba(${lineColorRGB}, ${opacity})`;
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
      }
    }
  });

  requestAnimationFrame(animateMesh);
}
animateMesh();

// === 2. DASHBOARD DE GRÁFICOS CON ONDULACIÓN EN TIEMPO REAL ===
let chartInstance = null;
let currentChartType = 'bar';
let isPulseActive = true;
let animationStep = 0;

const baseScores = [85, 80, 75, 70, 80, 85];
const labelsData = [
  'PHP / Laravel Framework',
  'Bases de Datos & SQL',
  'Java POO / Swing / JDBC',
  'Python / IA & Algoritmos',
  'Control de Versiones (Git)',
  'Entornos & Postman'
];

function createChart(type) {
  const chartCanvas = document.getElementById('interactiveSkillsChart');
  if (!chartCanvas) return;
  const ctxChart = chartCanvas.getContext('2d');

  if (chartInstance) {
    chartInstance.destroy();
  }

  const isRadar = type === 'radar';
  const isDoughnut = type === 'doughnut';

  chartInstance = new Chart(ctxChart, {
    type: type,
    data: {
      labels: labelsData,
      datasets: [{
        label: 'Competencia Práctica (%)',
        data: [...baseScores],
        backgroundColor: isDoughnut 
          ? ['#0284c7', '#38bdf8', '#818cf8', '#34d399', '#f87171', '#fbbf24']
          : (isRadar ? 'rgba(56, 189, 248, 0.25)' : 'rgba(56, 189, 248, 0.85)'),
        borderColor: isRadar ? '#38bdf8' : 'transparent',
        borderWidth: isRadar ? 2 : 0,
        borderRadius: type === 'bar' ? 6 : 0,
        barThickness: 16
      }]
    },
    options: {
      indexAxis: type === 'bar' ? 'y' : 'x',
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 800, easing: 'easeOutQuart' },
      plugins: {
        legend: { display: isDoughnut || isRadar, position: 'bottom', labels: { color: '#f8fafc', font: { family: 'Inter', size: 11 } } },
        tooltip: {
          backgroundColor: '#0f172a',
          titleColor: '#38bdf8',
          bodyColor: '#ffffff',
          borderColor: '#0284c7',
          borderWidth: 1,
          padding: 10
        }
      },
      scales: isDoughnut ? {} : (isRadar ? {
        r: {
          angleLines: { color: 'rgba(255,255,255,0.1)' },
          grid: { color: 'rgba(255,255,255,0.1)' },
          pointLabels: { color: '#f8fafc', font: { family: 'Inter', size: 11 } },
          ticks: { backdropColor: 'transparent', color: '#64748b' },
          suggestedMin: 0,
          suggestedMax: 100
        }
      } : {
        x: {
          min: 0, max: 100,
          grid: { color: 'rgba(255, 255, 255, 0.05)' },
          ticks: { color: '#64748b', font: { family: 'Fira Code', size: 11 }, callback: v => v + '%' }
        },
        y: {
          grid: { display: false },
          ticks: { color: '#f8fafc', font: { family: 'Inter', size: 12, weight: '600' } }
        }
      })
    }
  });
}

// ONDULACIÓN DINÁMICA CONTINUA EN VIVO
setInterval(() => {
  if (!chartInstance || !isPulseActive) return;

  animationStep += 0.15;
  const dynamicScores = baseScores.map((score, index) => {
    const wave = Math.sin(animationStep + index) * 3.5;
    return Math.min(100, Math.max(10, Math.round(score + wave)));
  });

  chartInstance.data.datasets[0].data = dynamicScores;
  chartInstance.update('none'); // Update sin parpadeo
}, 120);

function setChartType(type, evt) {
  currentChartType = type;
  document.querySelectorAll('.btn-chart-style').forEach(b => {
    if (!b.classList.contains('btn-pulse-toggle')) b.classList.remove('active');
  });
  if (evt) evt.currentTarget.classList.add('active');

  createChart(type);
}

function togglePulse() {
  isPulseActive = !isPulseActive;
  const btn = document.getElementById('btn-toggle-pulse');
  btn.innerHTML = isPulseActive 
    ? '<i class="fa-solid fa-wave-square"></i> Animación Ondulante: ON'
    : '<i class="fa-solid fa-pause"></i> Animación Ondulante: OFF';
}

document.addEventListener('DOMContentLoaded', () => {
  createChart('bar');
});

// === 3. CAMBIO DE IDIOMA DINÁMICO (ES / EN) ===
let isEnglish = false;
function toggleLanguage() {
  isEnglish = !isEnglish;
  document.getElementById('lang-text').innerText = isEnglish ? 'ES' : 'EN';

  document.querySelectorAll('[data-es]').forEach(el => {
    el.innerText = isEnglish ? el.getAttribute('data-en') : el.getAttribute('data-es');
  });
}

// === 4. CAMBIO MODO CLARO / OSCURO ===
function toggleTheme() {
  const body = document.body;
  const icon = document.getElementById('theme-icon');
  const text = document.getElementById('theme-text');

  if (body.classList.contains('dark-mode')) {
    body.classList.remove('dark-mode');
    body.classList.add('light-mode');
    icon.className = 'fa-solid fa-moon';
    text.innerText = 'Modo Oscuro';
  } else {
    body.classList.remove('light-mode');
    body.classList.add('dark-mode');
    icon.className = 'fa-solid fa-sun';
    text.innerText = 'Modo Claro';
  }
}

// === 5. COPIAR EMAIL ===
function copyContact() {
  const email = "omarperezcueva809@gmail.com";
  navigator.clipboard.writeText(email).then(() => {
    showToast("¡Dirección de correo copiada!");
  });
}

function showToast(message) {
  const toast = document.getElementById("toast");
  toast.innerText = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 3000);
}

// === 6. SCROLL PROGRESS ===
window.addEventListener('scroll', () => {
  const winScroll = document.documentElement.scrollTop || document.body.scrollTop;
  const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
  const scrolled = (winScroll / height) * 100;
  document.getElementById('scroll-progress').style.width = scrolled + '%';
});

// === 7. FILTRADO DE PROYECTOS ===
function filterProjects(category, e) {
  document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
  e.target.classList.add('active');

  document.querySelectorAll('.project-card').forEach(card => {
    if (category === 'all' || card.getAttribute('data-category') === category) {
      card.style.display = 'flex';
    } else {
      card.style.display = 'none';
    }
  });
}

// === 8. MODALES ===
const projectData = {
  matricula: {
    title: 'Sistema de Matrícula en Laravel',
    tech: 'PHP / Laravel / MySQL',
    desc: 'Sistema empresarial integral desarrollado bajo la arquitectura MVC para la gestión automatizada de matrículas estudiantiles, asignación de asignaturas y control transaccional de cupos en MySQL.'
  },
  login: {
    title: 'Sistema de Login y Registro',
    tech: 'Backend / PHP / CSRF Security',
    desc: 'Módulo de autenticación corporativa robusto, enfocado en sanitización rigurosa de datos, encriptación mediante bcrypt y control estricto de sesiones.'
  },
  java: {
    title: 'Aplicaciones y Lógica en Java',
    tech: 'Java / POO / JDBC',
    desc: 'Desarrollo de módulos de escritorio desacoplados aplicando patrones de diseño, Programación Orientada a Objetos y conectividad eficiente JDBC.'
  }
};

function openProjectModal(key) {
  const data = projectData[key];
  if (!data) return;
  document.getElementById('modal-title').innerText = data.title;
  document.getElementById('modal-tech').innerText = data.tech;
  document.getElementById('modal-desc').innerText = data.desc;
  document.getElementById('project-modal').classList.add('active');
}

function closeProjectModal(e) {
  if (!e || e.target.id === 'project-modal' || e.target.classList.contains('modal-close')) {
    document.getElementById('project-modal').classList.remove('active');
  }
}

function openCertModal(title, issuer) {
  document.getElementById('cert-title').innerText = title;
  document.getElementById('cert-issuer').innerText = issuer;
  document.getElementById('cert-modal').classList.add('active');
}

function closeCertModal(e) {
  if (!e || e.target.id === 'cert-modal' || e.target.classList.contains('modal-close')) {
    document.getElementById('cert-modal').classList.remove('active');
  }
}