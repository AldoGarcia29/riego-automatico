window.IrrigateView = {
  template(){
    return `
    <section class="view active">
      <div class="card" style="max-width:560px;margin-inline:auto;text-align:center">
        <p class="muted">Regando: <b id="irrigate-device">${AppState.connected?.name||"Válvula"}</b></p>
        <div class="progress" style="margin-top:8px"><i id="prog"></i></div>
        <div id="clock" style="margin-top:8px;font-size:40px;font-weight:800;font-variant-numeric:tabular-nums">00:00</div>
        <div style="display:flex;gap:10px;justify-content:center;margin-top:14px">
          <button class="btn" id="btn-hide">Ocultar</button>
          <button class="btn danger" id="btn-stop">Detener</button>
        </div>
      </div>
    </section>`;
  },
  bind({ state, goTo }){
    const clock = document.getElementById("clock");
    const bar = document.getElementById("prog");

    function renderTimer(){
      clock.textContent = Utils.toMMSS(state.timer.left);
      const pct = Math.max(0, Math.min(100, 100 - Math.round((state.timer.left/state.timer.total)*100)));
      bar.style.width = pct + "%";
    }
    renderTimer();
    if(state.timer.tick) clearInterval(state.timer.tick);
    state.timer.tick = setInterval(async ()=>{
      if(!state.timer.running) return;
      state.timer.left--;
      renderTimer();
      if(state.timer.left<=0){
        await stop(false);
      }
    }, 1000);

    async function stop(manual=true){
      state.timer.running=false;
      clearInterval(state.timer.tick);
      state.timer.tick=null;
      try{
        await API.stopIrrigation({ deviceId: state.connected.id, manual });
        // al terminar, backend debe guardar registro; recargamos historial
        AppState.historial = await API.getHistory();
      }catch{}
      window.dispatchEvent(new Event("app:navigate"));
      goTo("device");
    }

    document.getElementById("btn-stop").addEventListener("click", ()=> stop(true));
    document.getElementById("btn-hide").addEventListener("click", ()=> goTo("device"));
  }
};
