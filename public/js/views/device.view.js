window.DeviceView = {
  template(){
    const st = window.AppState;
    return `
    <section class="view active">
      <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap">
        <h3 id="device-title" style="margin:10px 0;font-size:20px">${st.connected?.name||""}</h3>
        <div style="display:flex;gap:8px">
          <button class="btn" id="btn-history">Historial</button>
          <button class="btn" id="btn-config">Configurar</button>
        </div>
      </div>

      <div class="grid grid-2" style="margin-top:10px">
        <div class="grid" style="grid-template-columns:1fr 1fr;gap:12px">
          <div class="card">
            <div class="muted">Humedad del suelo</div>
            <div style="font-size:26px;font-weight:800" id="stat-humedad">--%</div>
            <small class="muted">Óptimo: 45–60%</small>
          </div>
          <div class="card">
            <div class="muted">Pureza del agua</div>
            <div style="font-size:26px;font-weight:800" id="stat-pureza">--%</div>
            <small class="muted">&gt;85% recomendado</small>
          </div>
          <div class="card" id="status-card">
            <div class="muted">Estado</div>
            <div style="font-size:18px;font-weight:700" id="stat-estado">Analizando</div>
            <small class="muted">Calibrando flujo para evitar sobre/infra riego.</small>
          </div>
          <div class="card">
            <div class="muted">Elegir planta</div>
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
          <strong>Temporizador de riego</strong>
          <p class="muted">Define cuánto tiempo regará esta electroválvula.</p>
          <div style="display:flex;align-items:center;justify-content:space-between;margin-top:8px">
            <span class="muted">Duración</span>
            <span style="font-weight:700" id="dur-label">10 min</span>
          </div>
          <input id="range-duracion" class="range" type="range" min="1" max="30" value="10">
          <label style="display:flex;gap:8px;align-items:center;margin-top:10px;font-size:14px">
            <input id="chk-auto" type="checkbox" checked> Ajuste automático por planta
          </label>
          <button class="btn primary" id="btn-start" style="margin-top:12px;width:100%">Comenzar riego</button>
          <small class="muted">“Pasto” es el valor predeterminado.</small>
        </div>
      </div>
    </section>`;
  },
  bind({ state, goTo }){
    // cargar stats desde backend cada X seg (o websockets si quieres luego)
    async function pullSensors(){
      if(!state.connected) return;
      try{
        const stats = await API.getLatestStats(state.connected.id);
        state.sensores = stats;
      }catch{}
      renderStats();
    }
    function renderStats(){
      document.getElementById("stat-humedad").textContent = state.sensores.humedad + "%";
      document.getElementById("stat-pureza").textContent  = state.sensores.pureza  + "%";
      document.getElementById("stat-estado").textContent  = state.sensores.estado;
    }
    pullSensors();
    const interval = setInterval(pullSensors, 2000);

    // planta → duración automática
    const baseDur = {'Pasto (predeterminado)':12,'Suculenta':3,'Hortalizas':9,'Orquídea':5,'Cítricos':10,'Rosas':7};
    const sel = document.getElementById("sel-planta");
    const range = document.getElementById("range-duracion");
    const chk = document.getElementById("chk-auto");
    const label = document.getElementById("dur-label");

    function applyAuto(){ state.duracion = baseDur[state.planta] ?? 8; range.value = state.duracion; label.textContent = state.duracion+" min"; }
    function renderDur(){ label.textContent = state.duracion+" min"; }

    sel.addEventListener("change", ()=>{
      state.planta = sel.value;
      if (chk.checked) applyAuto();
      renderDur();
    });
    chk.addEventListener("change", ()=> { if(chk.checked) applyAuto(); renderDur(); });
    range.addEventListener("input", ()=> { state.duracion = parseInt(range.value,10); renderDur(); });

    // inicio riego
    document.getElementById("btn-start").addEventListener("click", async ()=>{
      try{
        await API.startIrrigation({ deviceId: state.connected.id, minutos: state.duracion, planta: state.planta });
        state.timer.total = state.duracion*60; state.timer.left = state.timer.total; state.timer.running=true;
        goTo("irrigate");
      }catch(e){ alert(e.message || "No se pudo iniciar riego"); }
    });

    document.getElementById("btn-history").addEventListener("click", async ()=>{
      try { state.historial = await API.getHistory(); } catch {}
      goTo("history");
    });

    // limpiar interval al salir
    window.addEventListener("app:navigate", ()=> clearInterval(interval), { once:true });
  }
};
