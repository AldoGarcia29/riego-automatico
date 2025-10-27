window.ScanView = {
  template(){
    return `
    <section class="view active">
      <div class="card">
        <h3 style="margin:0 0 6px 0">Encontrar electroválvulas disponibles</h3>
        <p class="muted">Activa tu Bluetooth y presiona <b>Buscar</b> para listar dispositivos cercanos.</p>
        <div style="display:flex;gap:10px;margin-top:10px;flex-wrap:wrap">
          <button class="btn primary" id="btn-scan">Buscar</button>
          <button class="btn" id="btn-help">Ayuda</button>
        </div>
        <div id="scan-list" class="grid" style="margin-top:14px"></div>
        <div id="scan-empty" class="card muted" style="text-align:center;margin-top:10px">
          Aún no hay dispositivos. Presiona “Buscar” para comenzar.
        </div>
      </div>
    </section>`;
  },
  bind({ state, goTo }){
    const list = document.getElementById("scan-list");
    const empty = document.getElementById("scan-empty");
    document.getElementById("btn-help").addEventListener("click", ()=> alert("Este es un simulador. En real, escaneas BLE/Wi-Fi y conectas."));

    document.getElementById("btn-scan").addEventListener("click", async ()=>{
      empty.classList.add("hidden");
      list.innerHTML = "";
      const devices = await API.listDevices(); // mock/real
      devices.forEach(d=>{
        const row = document.createElement("div");
        row.className = "card";
        row.style.display = "flex";
        row.style.alignItems = "center";
        row.style.justifyContent = "space-between";
        row.innerHTML = `
          <div>
            <div style="font-weight:700">${d.name}</div>
            <div class="muted" style="font-size:12px">Señal: ${d.rssi} dBm</div>
          </div>
          <button class="btn primary">Conectar</button>
        `;
        row.querySelector("button").addEventListener("click", ()=>{
          state.connected = { id:d.id, name:d.name };
          Utils.setConnectedLabel(d.name);
          goTo("device");
        });
        list.appendChild(row);
      });
    });
  }
};
