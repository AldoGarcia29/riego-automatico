const BASE = ""; // ej. "http://localhost:4000"
const headers = { "Content-Type": "application/json" };

async function http(path, opts={}){
  const res = await fetch(BASE + path, opts);
  if(!res.ok) throw new Error((await res.json().catch(()=>({message:res.statusText}))).message || "HTTP "+res.status);
  return res.json();
}

window.API = {
  // --- Auth ---
  async login({ email, pass }){
    // POST /api/auth/login -> { user, token }
    // return await http("/api/auth/login", { method:"POST", headers, body: JSON.stringify({ email, pass })});
    // MOCK:
    return { _id:"u1", email, nombre:"Usuario Demo", token:"demo" };
  },
  async register(payload){
    // POST /api/auth/register -> { ok:true }
    // return await http("/api/auth/register",{ method:"POST", headers, body: JSON.stringify(payload)});
    return { ok:true };
  },

  // --- Dispositivos (escaneo simulado o desde tu backend) ---
  async listDevices(){
    // GET /api/devices/scan
    // return await http("/api/devices/scan");
    return [
      { id:"d1", name:"Válvula Patio Frontal", rssi:-42 },
      { id:"d2", name:"Válvula Huerto", rssi:-58 },
      { id:"d3", name:"Válvula Trasera", rssi:-67 }
    ];
  },

  // --- Lecturas/sensores (Mongo llenado por Arduino) ---
  async getLatestStats(deviceId){
    // GET /api/devices/:id/latest -> { humedad, pureza, estado }
    // return await http(`/api/devices/${deviceId}/latest`);
    // MOCK "vivo":
    const { clamp, randInt } = window.Utils;
    const s = window.AppState.sensores;
    s.humedad = clamp(s.humedad + randInt(-2,2), 20, 95);
    s.pureza  = clamp(s.pureza  + randInt(-1,1), 70, 99);
    const seq = ['Analizando','Ajustando válvula','Óptimo','Listo'];
    s.estado = seq[(seq.indexOf(s.estado)+1) % seq.length];
    return s;
  },

  // --- Riego (iniciar/detener) ---
  async startIrrigation({ deviceId, minutos, planta }){
    // POST /api/irrigations/start -> { ok:true }
    // body: { deviceId, minutos, planta }
    // return await http("/api/irrigations/start",{ method:"POST", headers, body: JSON.stringify({ deviceId, minutos, planta })});
    return { ok:true };
  },
  async stopIrrigation({ deviceId, manual }){
    // POST /api/irrigations/stop -> { ok:true }
    // return await http("/api/irrigations/stop",{ method:"POST", headers, body: JSON.stringify({ deviceId, manual })});
    return { ok:true };
  },

  // --- Historial (Mongo) ---
  async getHistory(){
    // GET /api/irrigations/history -> [{fecha,planta,dispositivo,minutos,humedad,pureza}]
    // return await http("/api/irrigations/history");
    // MOCK:
    return [
      { fecha:'2025-09-15 07:30', planta:'Pasto', dispositivo:'Válvula Patio Frontal', minutos:12, humedad:41, pureza:90 },
      { fecha:'2025-09-20 19:10', planta:'Hortalizas', dispositivo:'Válvula Huerto', minutos:8, humedad:56, pureza:94 }
    ];
  }
};
