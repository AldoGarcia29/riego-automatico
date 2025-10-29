window.ScanView = {
  template() {
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

  bind({ state, goTo }) {
    const list = document.getElementById("scan-list");
    const empty = document.getElementById("scan-empty");

    // Botón de ayuda
    document.getElementById("btn-help").addEventListener("click", () => {
      alert("Activa Bluetooth. El navegador buscará ESP32 cercanos y luego podrás conectar.");
    });

    // Botón Buscar (scan BLE)
    document.getElementById("btn-scan").addEventListener("click", async () => {
      // limpiar vista
      empty.classList.add("hidden");
      list.innerHTML = "";

      let devices = [];

      try {
        // Pedir al navegador que busque un dispositivo BLE
        const device = await navigator.bluetooth.requestDevice({
          filters: [
            { namePrefix: "ESP32" } // Cambia si tu ESP32 anuncia otro nombre
          ],
          optionalServices: ["12345678-1234-1234-1234-1234567890ab"] // SERVICE_UUID de tu ESP32
        });

        // Guardamos un objeto con la info que nos importa
        devices.push({
          id: device.id,
          name: device.name || "Dispositivo sin nombre",
          // Simulamos RSSI porque Web Bluetooth en navegador no siempre da RSSI directo
          rssi: Math.floor(Math.random() * (-40 - (-90) + 1) + (-90))
        });

      } catch (err) {
        alert("No se pudo buscar dispositivos o se canceló la búsqueda.");
        console.error(err);
      }

      // Si no se detectó nada, mostramos el aviso vacío otra vez
      if (devices.length === 0) {
        empty.classList.remove("hidden");
        return;
      }

      // Pintar cada dispositivo encontrado en la UI
      devices.forEach(d => {
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

       row.querySelector("button").addEventListener("click", async () => {
  state.connected = { id: d.id, name: d.name };
  Utils.setConnectedLabel(d.name);

  // Registrar en backend -> Mongo
  try {
    await fetch("http://localhost:3000/device", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ deviceId: d.id, name: d.name, rssi: d.rssi })
    });
  } catch (e) {
    console.warn("No se pudo registrar el device:", e);
  }

  goTo("device");
});

        list.appendChild(row);
      });
    });
  }
};
