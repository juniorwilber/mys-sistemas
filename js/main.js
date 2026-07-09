/* ============================================================
   MYS SISTEMAS — Lógica del sitio (JavaScript)
   ------------------------------------------------------------
   Todo el código está comentado para que puedas editarlo.
   Funciones incluidas:
     1. Íconos Lucide
     2. Menú hamburguesa (abrir/cerrar en celular)
     3. Header con sombra al hacer scroll
     4. Resaltar el enlace de la sección visible (scrollspy)
     5. Animación de aparición al hacer scroll
     6. Formulario de contacto: validación + envío por WhatsApp
   ============================================================ */

// Espera a que el HTML esté cargado antes de tocar nada.
document.addEventListener('DOMContentLoaded', function () {

  /* ---------- 1. ÍCONOS LUCIDE ----------
     Convierte las etiquetas <i data-lucide="..."> en íconos SVG. */
  if (window.lucide) {
    window.lucide.createIcons();
  }

  /* ---------- 2. MENÚ HAMBURGUESA ---------- */
  const toggle = document.getElementById('navToggle');
  const menu   = document.getElementById('navMenu');

  if (toggle && menu) {
    // Función para abrir/cerrar el menú
    function setMenu(abierto) {
      menu.classList.toggle('is-open', abierto);
      toggle.setAttribute('aria-expanded', abierto);          // accesibilidad
      toggle.setAttribute('aria-label', abierto ? 'Cerrar menú' : 'Abrir menú');
      document.body.classList.toggle('no-scroll', abierto);   // bloquea el scroll del fondo
    }

    // Al tocar la hamburguesa, alterna el estado
    toggle.addEventListener('click', function () {
      const estaAbierto = menu.classList.contains('is-open');
      setMenu(!estaAbierto);
    });

    // Al tocar un enlace del menú, se cierra (para que no tape la sección)
    menu.querySelectorAll('a').forEach(function (enlace) {
      enlace.addEventListener('click', function () { setMenu(false); });
    });

    // Cerrar con la tecla Escape
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') setMenu(false);
    });
  }

  /* ---------- 3. HEADER CON SOMBRA AL HACER SCROLL ----------
     Añade una sombra sutil al header apenas se baja un poco. */
  const header = document.querySelector('.hero');
  // (Opcional) puedes usar esto para cambiar estilos; aquí solo marcamos una clase.
  window.addEventListener('scroll', function () {
    if (window.scrollY > 20) {
      document.body.classList.add('scrolled');
    } else {
      document.body.classList.remove('scrolled');
    }
  });

  /* ---------- 4. SCROLLSPY: resaltar el enlace activo ----------
     Detecta qué sección está en pantalla y marca su enlace en el menú. */
  const secciones = document.querySelectorAll('section[id], header[id]');
  const enlacesNav = document.querySelectorAll('.nav__link');

  if ('IntersectionObserver' in window && secciones.length) {
    const spy = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (entrada) {
        if (entrada.isIntersecting) {
          const id = entrada.target.getAttribute('id');
          enlacesNav.forEach(function (a) {
            a.classList.toggle('is-active', a.getAttribute('href') === '#' + id);
          });
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' }); // se activa cuando la sección está a media pantalla

    secciones.forEach(function (s) { spy.observe(s); });
  }

  /* ---------- 5. ANIMACIÓN DE APARICIÓN AL HACER SCROLL ----------
     A los elementos indicados les añadimos la clase .reveal y aparecen
     suavemente cuando entran en pantalla. */
  const aAnimar = document.querySelectorAll(
    '.servicio, .marca, .sucursal, .nosotros__text, .nosotros__img, .contacto, .section__head'
  );
  aAnimar.forEach(function (el) { el.classList.add('reveal'); });

  if ('IntersectionObserver' in window) {
    const observador = new IntersectionObserver(function (entradas, obs) {
      entradas.forEach(function (entrada) {
        if (entrada.isIntersecting) {
          entrada.target.classList.add('is-visible');
          obs.unobserve(entrada.target); // solo se anima una vez
        }
      });
    }, { threshold: 0.15 });

    aAnimar.forEach(function (el) { observador.observe(el); });
  } else {
    // Si el navegador no soporta la API, mostramos todo sin animar.
    aAnimar.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---------- 6. FORMULARIO DE CONTACTO ----------
     Valida los campos y, si todo está bien, arma un mensaje y abre
     WhatsApp con el texto ya escrito (no envía datos a ningún servidor). */
  const form = document.getElementById('contactForm');

  if (form) {
    const NUMERO_WA = '51987547461'; // <-- tu número de WhatsApp (código de país + número)

    // Muestra u oculta el mensaje de error de un campo
    function marcarError(campo, mensaje) {
      const grupo = campo.closest('.form__field');
      const error = form.querySelector('[data-error-for="' + campo.name + '"]');
      if (mensaje) {
        grupo.classList.add('has-error');
        campo.setAttribute('aria-invalid', 'true');
        if (error) error.textContent = mensaje;
      } else {
        grupo.classList.remove('has-error');
        campo.removeAttribute('aria-invalid');
        if (error) error.textContent = '';
      }
    }

    // Valida un campo individual y devuelve true/false
    function validarCampo(campo) {
      const valor = campo.value.trim();

      if (valor === '') {
        marcarError(campo, 'Este campo es obligatorio.');
        return false;
      }
      if (campo.id === 'nombre' && valor.length < 2) {
        marcarError(campo, 'Escribe tu nombre completo.');
        return false;
      }
      if (campo.id === 'telefono' && !/^[0-9()+\s-]{6,15}$/.test(valor)) {
        marcarError(campo, 'Escribe un teléfono válido (solo números).');
        return false;
      }
      if (campo.id === 'mensaje' && valor.length < 5) {
        marcarError(campo, 'Cuéntanos un poco más (mín. 5 caracteres).');
        return false;
      }
      marcarError(campo, ''); // sin error
      return true;
    }

    // Limpia el error mientras el usuario corrige
    form.querySelectorAll('input, textarea').forEach(function (campo) {
      campo.addEventListener('input', function () {
        if (campo.closest('.form__field').classList.contains('has-error')) {
          validarCampo(campo);
        }
      });
    });

    // Al enviar el formulario
    form.addEventListener('submit', function (e) {
      e.preventDefault(); // evita que la página se recargue

      const campos = form.querySelectorAll('input, textarea');
      let todoOk = true;

      campos.forEach(function (campo) {
        if (!validarCampo(campo)) todoOk = false;
      });

      // Si hay errores, enfoca el primer campo con problema y no continúa
      if (!todoOk) {
        const primerError = form.querySelector('.has-error input, .has-error textarea');
        if (primerError) primerError.focus();
        return;
      }

      // Arma el mensaje de WhatsApp con los datos del formulario
      const nombre   = form.nombre.value.trim();
      const telefono = form.telefono.value.trim();
      const mensaje  = form.mensaje.value.trim();

      const texto =
        'Hola MYS SISTEMAS, soy ' + nombre + '.' +
        '\nTeléfono: ' + telefono +
        '\nConsulta: ' + mensaje;

      const url = 'https://wa.me/' + NUMERO_WA + '?text=' + encodeURIComponent(texto);

      // Muestra confirmación y abre WhatsApp en otra pestaña
      const ok = document.getElementById('formOk');
      if (ok) ok.hidden = false;

      window.open(url, '_blank');
      form.reset(); // limpia el formulario

      // Oculta la confirmación después de 4 segundos
      setTimeout(function () { if (ok) ok.hidden = true; }, 4000);
    });
  }

});
