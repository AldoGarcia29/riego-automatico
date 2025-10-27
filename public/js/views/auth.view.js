window.AuthView = {
  template(){
    return `
    <section class="view active">
  <div class="card" style="max-width:520px;margin-inline:auto">
    <div class="tabs">
      <button class="active" data-tab="login">Login</button>
      <button data-tab="registro">Registro</button>
    </div>

    <!-- LOGIN -->
    <div id="auth-login" style="margin-top:14px" class="grid">
      <label class="field">
        <span>Email</span>
        <input id="login-email" type="email" placeholder="tu@correo.com">
      </label>
      <label class="field">
        <span>Contraseña</span>
        <input id="login-pass" type="password" placeholder="••••••••">
      </label>

      <button class="btn primary" id="btn-login">Continuar</button>

      <!-- Texto abajo con enlace -->
      <small class="muted terminos" style="text-align:center">
        Al continuar aceptas los 
        <a href="#" id="toggle-terminos">Términos y la Política de Privacidad</a>.
      </small>

      <!-- Texto desplegable -->
      <div id="texto-terminos" class="oculto">
        <p>
          Al usar esta aplicación aceptas el uso responsable de tus datos personales.
          La información que proporciones será utilizada únicamente para la gestión
          de tu cuenta y los servicios ofrecidos por GreenDrop.
        </p>
        <p>
          Puedes consultar más detalles sobre cómo protegemos tu privacidad,
          cómo tratamos tus datos y tus derechos de acceso, corrección o eliminación.
        </p>
        <p>
          Si tienes dudas, puedes escribirnos a:
          <a href="mailto:soporte@greendrop.mx">soporte@greendrop.mx</a>
        </p>
      </div>
    </div>

    <!-- REGISTRO -->
    <div id="auth-registro" class="hidden grid" style="margin-top:14px">
      <div class="grid" style="grid-template-columns:1fr 1fr;gap:10px">
        <label class="field"><span>Nombre</span><input id="reg-nombre" type="text" placeholder="Tu nombre"></label>
        <label class="field"><span>Teléfono</span><input id="reg-tel" type="tel" placeholder="55 1234 5678"></label>
      </div>
      <label class="field"><span>Email</span><input id="reg-email" type="email" placeholder="tu@correo.com"></label>
      <label class="field"><span>Contraseña</span><input id="reg-pass" type="password" placeholder="••••••••"></label>
      <button class="btn primary" id="btn-register">Crear cuenta</button>
    </div>
  </div>
</section>
`;
  },
  bind({ goTo, state }){
    const tabs = document.querySelectorAll(".tabs button");
    const login = document.getElementById("auth-login");
    const reg = document.getElementById("auth-registro");
    tabs.forEach(b=> b.addEventListener("click", ()=>{
      tabs.forEach(x=>x.classList.remove("active"));
      b.classList.add("active");
      const t = b.dataset.tab;
      login.classList.toggle("hidden", t!=="login");
      reg.classList.toggle("hidden", t!=="registro");
    }));

    document.getElementById("btn-login").addEventListener("click", async ()=>{
      const email = document.getElementById("login-email").value.trim();
      const pass = document.getElementById("login-pass").value.trim();
      if(!email || !pass) return alert("Completa email y contraseña");
      try{
        state.user = await API.login({ email, pass });
        goTo("scan");
      }catch(e){ alert(e.message || "Error de login"); }
    });

    document.getElementById("btn-register").addEventListener("click", async ()=>{
      const payload = {
        nombre: document.getElementById("reg-nombre").value.trim(),
        tel: document.getElementById("reg-tel").value.trim(),
        email: document.getElementById("reg-email").value.trim(),
        pass: document.getElementById("reg-pass").value.trim()
      };
      if(!payload.email || !payload.pass) return alert("Email y contraseña requeridos");
      try{
        await API.register(payload);
        alert("Cuenta creada. Inicia sesión.");
        goTo("scan");
      }catch(e){ alert(e.message || "Error al registrar"); }
    });

    const linkTerminos  = document.getElementById('toggle-terminos');
const textoTerminos = document.getElementById('texto-terminos');

if (linkTerminos && textoTerminos) {
  linkTerminos.addEventListener('click', e => {
    e.preventDefault();
    const oculto = textoTerminos.classList.contains('oculto');
    textoTerminos.classList.toggle('oculto');
    linkTerminos.textContent = oculto
      ? 'Ocultar Términos y Política'
      : 'Términos y la Política de Privacidad';
  });
}

  }
};
