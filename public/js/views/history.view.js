window.HistoryView = {
  template(){
    const rows = (AppState.historial||[]).map(h=>`
      <tr>
        <td>${h.fecha}</td>
        <td>${h.planta}</td>
        <td>${h.dispositivo}</td>
        <td>${h.minutos}</td>
        <td>${h.humedad}%</td>
        <td>${h.pureza}%</td>
      </tr>`).join("");
    return `
    <section class="view active">
      <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap">
        <h3 style="margin:10px 0;font-size:20px">Historial de riego</h3>
        <div style="display:flex;gap:8px">
          <button class="btn" id="btn-export">Exportar CSV</button>
          <button class="btn" id="btn-back-device">Volver</button>
        </div>
      </div>
      <div class="card" style="overflow-x:auto">
        <table id="tbl-history">
          <thead>
            <tr>
              <th>Fecha</th><th>Planta</th><th>Dispositivo</th>
              <th>Minutos</th><th>Humedad inicial</th><th>Pureza</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
        <small class="muted">En móvil, desliza horizontalmente para ver todas las columnas.</small>
      </div>
    </section>`;
  },
  bind({ goTo }){
    document.getElementById("btn-back-device").addEventListener("click", ()=> goTo("device"));
    document.getElementById("btn-export").addEventListener("click", ()=> {
      const rows = [["Fecha","Planta","Dispositivo","Minutos","Humedad inicial","Pureza"]]
        .concat((AppState.historial||[]).map(h=>[h.fecha,h.planta,h.dispositivo,h.minutos,`${h.humedad}%`,`${h.pureza}%`]));
      const csv = rows.map(r=> r.map(v=> `"${String(v).replaceAll('"','""')}"`).join(',')).join('\n');
      const blob = new Blob([csv], {type:'text/csv;charset=utf-8;'});
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = 'historial_greendrop.csv'; a.click();
      URL.revokeObjectURL(url);
    });
  }
};
