// ----- Estado global mínimo -----
window.AppState = {
  route: "splash",
  user: null,
  connected: null, // {id, name}
  sensores: { humedad: 48, pureza: 92, estado: "Analizando" },
  planta: "Pasto (predeterminado)",
  duracion: 10,
  timer: { running:false, total:600, left:600, tick:null },
  historial: [] // se cargará desde Mongo
};

// ----- Router SPA -----
const root = document.getElementById("app-root");
const views = {
  splash: window.SplashView,
  auth: window.AuthView,
  scan: window.ScanView,
  device: window.DeviceView,
  irrigate: window.IrrigateView,
  history: window.HistoryView
};

function render() {
  const View = views[AppState.route];
  if (!View) return;
  root.innerHTML = View.template();
  View.bind && View.bind({ state: AppState, goTo });
  highlightNav();
}

function goTo(route) {
  // regla de acceso: no dejar entrar a device/irrigate sin conexión
  if ((route === "device" || route === "irrigate") && !AppState.connected) {
    alert("Conéctate a una electroválvula primero.");
    route = "scan";
  }
  AppState.route = route;
  render();
}

function highlightNav() {
  document.querySelectorAll(".navbtn").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.route === AppState.route);
  });
}

// ----- Nav superior -----
document.querySelectorAll(".navbtn").forEach(btn => {
  btn.addEventListener("click", () => goTo(btn.dataset.route));
});

// ----- Inicialización (cargar historial de Mongo) -----
(async function bootstrap(){
  try {
    AppState.historial = await API.getHistory(); // Mongo
  } catch(e) {
    console.warn("Historial mock por error de API", e);
    AppState.historial = [
      { fecha:'2025-09-15 07:30', planta:'Pasto', dispositivo:'Válvula Patio Frontal', minutos:12, humedad:41, pureza:90 },
      { fecha:'2025-09-20 19:10', planta:'Hortalizas', dispositivo:'Válvula Huerto', minutos:8, humedad:56, pureza:94 },
    ];
  }
  render();
})();

// ----- Utilidades compartidas -----
window.Utils = {
  clamp(v, lo, hi){ return Math.max(lo, Math.min(hi, v)); },
  randInt(a,b){ return Math.floor(Math.random()*(b-a+1))+a; },
  nowStr(){ return new Date().toLocaleString(); },
  toMMSS(s){ const m=String(Math.floor(s/60)).padStart(2,'0'); const ss=String(s%60).padStart(2,'0'); return `${m}:${ss}`; },
  setConnectedLabel(name){ document.getElementById("connected-label").textContent = name ? `Conectado a: ${name}` : ""; }
};
