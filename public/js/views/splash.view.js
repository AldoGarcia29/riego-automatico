window.SplashView = {
  template(){
    return `
    <section id="view-splash" class="grid splash-view" style="min-height:100vh; place-content:center;">
  <div class="splash-card" style="text-align:center; background:rgba(255,255,255,0.85);">
    <div class="title">Riego automatizado, preciso y simple</div>
    <p class="subtitle">
      Encuentra tus electroválvulas vía Bluetooth, ajusta por planta y monitorea sensores en tiempo real.
    </p>
    <div style="display:flex; justify-content:center; margin-top:16px;">
      <button class="btn primary" id="cta-start">Entrar / Registrarme</button>
    </div>
    <div class="grid grid-3" style="margin-top:24px;">
      <div class="mini-card">
        <strong>Escaneo fácil</strong>
        <p class="muted">Lista tus electroválvulas cercanas y conéctate en segundos.</p>
      </div>
      <div class="card mini-card">
        <strong>Riego inteligente</strong>
        <p class="muted">Elige la planta adecuada y deja que el sistema sugiera el tiempo óptimo.</p>
      </div>
      <div class="card mini-card">
        <strong>Sensores en vivo</strong>
        <p class="muted">Monitorea humedad del suelo, pureza del agua y estado general.</p>
      </div>
    </div>
  </div>
</section>
`;
  },
  bind({ goTo }){
    document.getElementById("cta-start").addEventListener("click", ()=> goTo("auth"));
  }
};
