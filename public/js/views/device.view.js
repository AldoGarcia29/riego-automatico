window.DeviceView = {
  template(){
    const st = window.AppState;
    return `
    <section class="view active">
      <style>
        .stat-emoji {
          font-size: 20px;
          margin-right: 6px;
          vertical-align: -2px;
        }
      </style>

      <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap">
        <h3 id="device-title" style="margin:10px 0;font-size:20px">${st.connected?.name||""}</h3>
        <div style="display:flex;gap:8px">
          <button class="btn" id="btn-history">📜 Historial</button>
        </div>
      </div>

      <div class="grid grid-2" style="margin-top:10px">
        <div class="grid" style="grid-template-columns:1fr 1fr;gap:12px">

          <div class="card">
            <div class="muted"><span class="stat-emoji">🌿</span>Humedad del suelo</div>
            <div style="font-size:26px;font-weight:800" id="stat-humedad">--%</div>
            <small class="muted">Óptimo: 45–60%</small>
          </div>

          <div class="card">
            <div class="muted"><span class="stat-emoji">💧</span>Pureza del agua</div>
            <div style="font-size:26px;font-weight:800" id="stat-pureza">--%</div>
            <small class="muted">&gt;85% recomendado</small>
          </div>

          <div class="card" id="status-card">
            <div class="muted"><span class="stat-emoji">📟</span>Estado</div>
            <div style="font-size:18px;font-weight:700" id="stat-estado">Analizando</div>
            <small class="muted">Calibrando flujo para evitar sobre/infra riego.</small>
          </div>

          <div class="card">
            <div class="muted"><span class="stat-emoji">🪴</span>Elegir planta</div>
            <select id="sel-planta">
              <option>Pasto (predeterminado)</option>
              <option>Suculenta</option>
              <option>Hortalizas</option>
              <option>Orquídea</option>
              <option>Cítricos</option>
              <option>Rosas</option>
            </select>
            <small class="muted">Se sugiere tiempo automático por planta.</small>
          </div>
        </div>

        <div class="card">
          <strong><span class="stat-emoji">⏱️</span>Temporizador de riego</strong>
          <p class="muted">Define cuánto tiempo regará esta electroválvula.</p>
          <div style="display:flex;align-items:center;justify-content:space-between;margin-top:8px">
            <span class="muted">Duración</span>
            <span style="font-weight:700" id="dur-label">10 min</span>
          </div>
          <input id="range-duracion" class="range" type="range" min="1" max="30" value="10">
          <label style="display:flex;gap:8px;align-items:center;margin-top:10px;font-size:14px">
            <input id="chk-auto" type="checkbox" checked> Ajuste automático por planta
          </label>
          <button class="btn primary" id="btn-start" style="margin-top:12px;width:100%">🌱 Comenzar riego</button>
          <small class="muted">“Pasto” es el valor predeterminado.</small>
        </div>
      </div>
    </section>`;
  },

  bind({ state, goTo }){

    // --- 1. Inicializamos valores por si no existen aún ---
    if (!state.sensores) {
      state.sensores = {
        humedad: 50,
        pureza: 90,
        estado: "OK"
      };
    }

    if (state.duracion === undefined) {
      state.duracion = 10; // minutos default
    }

    if (!state.planta) {
      state.planta = "Pasto (predeterminado)";
    }

    if (!state.timer) {
      state.timer = { total: 0, left: 0, running: false };
    }

    // --- 2. Helpers seguros (no revientan si falta algo en DOM) ---
    function safeSet(id, value){
      const el = document.getElementById(id);
      if (el) el.textContent = value;
    }

    function renderStats(){
      safeSet("stat-humedad", state.sensores.humedad + "%");
      safeSet("stat-pureza",  state.sensores.pureza  + "%");
      safeSet("stat-estado",  state.sensores.estado  || "—");
    }

    // --- 3. Simulación de pullSensors mientras no hay backend ---
    async function pullSensors(){
      if(!state.connected) return;

      // si tuviéramos backend real:
      // try {
      //   const stats = await API.getLatestStats(state.connected.id);
      //   state.sensores = stats;
      // } catch(e) {}

      // por ahora: simular cambios suaves (para que veas movimiento en UI)
      state.sensores.humedad = clamp(randAround(state.sensores.humedad, 1), 30, 80);
      state.sensores.pureza  = clamp(randAround(state.sensores.pureza, 1), 80, 100);
      state.sensores.estado  = "OK";

      renderStats();
    }

    // utilidades para fake fluctuar valores
    function randAround(base, delta){
      const min = base - delta;
      const max = base + delta;
      return Math.round(min + Math.random()*(max-min));
    }
    function clamp(v, lo, hi){
      return v < lo ? lo : (v > hi ? hi : v);
    }

    // primer render y luego interval
    renderStats();
    pullSensors();
    const interval = setInterval(pullSensors, 2000);


    // --- 4. Lógica planta / duración automática ---
    const baseDur = {
      'Pasto (predeterminado)':12,
      'Suculenta':3,
      'Hortalizas':9,
      'Orquídea':5,
      'Cítricos':10,
      'Rosas':7
    };

    const sel   = document.getElementById("sel-planta");
    const range = document.getElementById("range-duracion");
    const chk   = document.getElementById("chk-auto");
    const label = document.getElementById("dur-label");

    function applyAuto(){
      state.duracion = baseDur[state.planta] ?? 8;
      range.value = state.duracion;
      label.textContent = state.duracion + " min";
    }

    function renderDur(){
      label.textContent = state.duracion + " min";
    }

    // set defaults en UI
    sel.value = state.planta;
    range.value = state.duracion;
    renderDur();

    sel.addEventListener("change", ()=>{
      state.planta = sel.value;
      if (chk.checked) applyAuto();
      renderDur();
    });

    chk.addEventListener("change", ()=>{
      if(chk.checked) applyAuto();
      renderDur();
    });

    range.addEventListener("input", ()=>{
      state.duracion = parseInt(range.value,10);
      renderDur();
    });


    // --- 5. Botones de acción ---
    document.getElementById("btn-start").addEventListener("click", async ()=>{
      try{
        // aquí en el futuro: await API.startIrrigation(...)
        state.timer.total   = state.duracion*60;
        state.timer.left    = state.timer.total;
        state.timer.running = true;
        goTo("irrigate"); // pantalla de riego en curso
      }catch(e){
        alert(e.message || "No se pudo iniciar riego");
      }
    });

    document.getElementById("btn-history").addEventListener("click", async ()=>{
      try {
        // futuro: state.historial = await API.getHistory();
        state.historial = state.historial || [];
      } catch(e) {}
      goTo("history");
    });


    // --- 6. limpiar el interval al salir de esta vista ---
    window.addEventListener("app:navigate", ()=>{
      clearInterval(interval);
    }, { once:true });
  }
};
