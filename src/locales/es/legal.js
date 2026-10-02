export default {
  updated: 'Última actualización: {date}',
  contact: 'Dudas o pedidos sobre tus datos:',
  privacy: {
    title: 'Política de privacidad',
    intro: 'eHub es operado por JohnJohn 3D (CNPJ 27.140.814/0001-88), responsable de los datos. En lenguaje sencillo: qué datos usa eHub, para qué, con quién los comparte y cómo ejercer tus derechos según la Ley General de Protección de Datos de Brasil (LGPD, Ley 13.709/2018). Contacto: {contact}.',
    sections: [
      {
        title: 'Qué datos recopilamos',
        items: [
          'Cuenta: nombre, apellido, e-mail, nombre de usuario, contraseña (guardada solo cifrada) y, si quieres, teléfono y foto.',
          'Perfil (opcional): bio, ciudad, fecha de nacimiento, redes sociales, color del perfil y preferencias de avisos.',
          'Inscripciones: los eventos en que te inscribes, tus respuestas al formulario del organizador, el estado del pago y tus resultados.',
          'Equipos y organizaciones de los que formas parte, sigues o pediste entrar.',
          'Uso técnico: dirección IP y registros de acceso que guarda el servidor por seguridad y para cumplir la ley brasileña (Marco Civil da Internet).',
          'No recopilamos datos de tarjeta: el pago se hace directamente en Stripe o Mercado Pago.',
        ],
      },
      {
        title: 'Para qué los usamos',
        items: [
          'Crear y mantener tu cuenta, iniciar sesión y recuperar la contraseña (ejecución del contrato).',
          'Inscribirte en eventos, procesar pagos y mostrar clasificaciones y resultados (ejecución del contrato).',
          'Enviar avisos sobre tus inscripciones, equipos y organizaciones (ejecución del contrato; los eliges en tu perfil).',
          'Prevenir fraude y abuso, como limitar intentos de inicio de sesión (interés legítimo).',
          'Cumplir obligaciones legales y fiscales, como facturas emitidas a organizaciones.',
          'No vendemos tus datos ni usamos herramientas de publicidad o rastreo.',
        ],
      },
      {
        title: 'Qué es público y qué ve el organizador',
        items: [
          'Tu perfil es público por defecto. Puedes cambiarlo a "Seguidores" o "Privado" en Perfil > Privacidad. Los perfiles de personas no aparecen en Google.',
          'En los eventos, otras personas ven tu nombre, usuario y resultados en la lista de participantes y en la clasificación.',
          'El organizador ve tu inscripción, tus respuestas a su formulario, el estado del pago y tu e-mail y teléfono (si lo informaste), para contactarte sobre el evento. Nunca ve tu contraseña.',
          'Las páginas de eventos, organizaciones, equipos y noticias son públicas y pueden aparecer en buscadores.',
        ],
      },
      {
        title: 'Con quién compartimos',
        items: [
          'Stripe y Mercado Pago: para procesar pagos y reembolsos de inscripciones.',
          'Google: solo si eliges entrar con tu cuenta Google (recibimos nombre, e-mail y foto).',
          'Mailtrap: entrega los e-mails de eHub (códigos, avisos e invitaciones).',
          'Umbler: alojamiento de servidores y base de datos, en Brasil.',
          'Bling: facturas de las suscripciones de organizaciones (datos fiscales de la organización).',
          'Algunos de estos servicios pueden tratar datos fuera de Brasil; usamos proveedores con garantías de protección compatibles con la LGPD.',
        ],
      },
      {
        title: 'Cookies y almacenamiento en el navegador',
        items: [
          'Solo usamos cookies necesarias: sesión, protección contra falsificación de peticiones (CSRF) y "recordarme".',
          'Tu navegador guarda el idioma, el tema claro/oscuro y borradores de formularios, por comodidad.',
          'Fuentes y bibliotecas se cargan desde servicios públicos (Google Fonts, jsDelivr y jQuery CDN), que reciben la IP de tu navegador.',
        ],
      },
      {
        title: 'Cuánto tiempo los guardamos',
        items: [
          'Datos de la cuenta: mientras exista. Al eliminarla borramos tu perfil, fotos, respuestas de inscripción, avisos y equipos en los que estabas solo. Tus inscripciones y resultados quedan anónimos ("Participante eliminado") para no cambiar la clasificación de los demás.',
          'Registros de pago y de cobro de organizaciones: el plazo que exige la ley fiscal.',
          'Registros de acceso: 6 meses, como exige el Marco Civil da Internet.',
          'Códigos enviados por e-mail: de 10 a 15 minutos.',
        ],
      },
      {
        title: 'Tus derechos y cómo ejercerlos',
        items: [
          'Ver y descargar tus datos: Perfil > Privacidad > "Descargar mis datos".',
          'Corregir datos: edita tu perfil cuando quieras.',
          'Eliminar la cuenta: Perfil > Cuenta > "Eliminar cuenta". Si eres el único dueño de una organización o el único responsable de un equipo con otros miembros, transfiérelo antes.',
          'Cambiar tus elecciones: visibilidad del perfil y avisos cuando quieras.',
          'Para los demás derechos (información sobre compartición, oposición, revisión), escribe a {contact}. También puedes reclamar ante la ANPD.',
        ],
      },
      {
        title: 'Seguridad',
        items: [
          'Conexión siempre cifrada (HTTPS), contraseñas con hash fuerte, límite de intentos de inicio de sesión y acceso por rol en las organizaciones.',
          'Si ocurre un incidente que pueda ponerte en riesgo, te avisaremos a ti y a la ANPD.',
        ],
      },
      {
        title: 'Menores de edad',
        items: [
          'Los menores de 18 años deben usar eHub con autorización y acompañamiento de su responsable legal. Los menores de 12 solo pueden tener cuenta creada y gestionada por el responsable.',
        ],
      },
    ],
  },
  terms: {
    title: 'Términos de uso',
    intro: 'Estas reglas valen para todos los que usan eHub para organizar o participar en campeonatos. Al crear una cuenta las aceptas. Contacto: {contact}.',
    sections: [
      {
        title: 'Qué es eHub',
        items: [
          'Una plataforma para que organizaciones creen eventos y campeonatos, reciban inscripciones (gratuitas o pagas) y publiquen resultados, y para que los participantes se inscriban y los sigan.',
          'eHub ofrece la herramienta; cada evento es responsabilidad de la organización que lo creó (reglas, premios, realización y atención).',
        ],
      },
      {
        title: 'Tu cuenta',
        items: [
          'Usa datos verdaderos y mantén tu contraseña en secreto. Respondes por lo que se haga con tu cuenta.',
          'Una persona por cuenta. Los menores de 18 años necesitan autorización del responsable.',
          'Podemos suspender cuentas usadas para fraude, acoso, spam o que violen la ley.',
        ],
      },
      {
        title: 'Inscripciones y pagos',
        items: [
          'El valor, el plazo y las reglas de cada inscripción los define el organizador y aparecen antes de que confirmes.',
          'Los pagos los procesa Stripe o Mercado Pago, en la cuenta del organizador.',
          'Cancelación: si el organizador lo permite, puedes cancelar hasta el inicio del evento y el dinero vuelve al mismo medio de pago. Después vale la política del organizador.',
          'Si el organizador cancela el evento, es responsable de devolver lo pagado.',
        ],
      },
      {
        title: 'Para organizaciones',
        items: [
          'Debes estar autorizado a representar a la organización y a realizar los eventos que publiques.',
          'Usa los datos de los participantes solo para realizar el evento. No los copies para otros fines ni los compartas.',
          'Las tarifas y el plan de eHub están en la página de Precios. El cobro mensual se hace en la tarjeta registrada; sin pago, se pueden bloquear nuevas inscripciones.',
          'Eres responsable del contenido que publiques (descripciones, noticias, reglamentos, imágenes).',
        ],
      },
      {
        title: 'Contenido y conducta',
        items: [
          'No publiques contenido ilegal, ofensivo, discriminatorio, engañoso o que viole derechos de otras personas.',
          'Al publicar textos e imágenes permites que eHub los muestre en la plataforma y en vistas previas al compartir.',
          'No intentes burlar la seguridad, acceder a datos de otras personas ni sobrecargar el servicio.',
        ],
      },
      {
        title: 'Responsabilidad y cambios',
        items: [
          'Trabajamos para mantener eHub disponible, pero puede haber interrupciones por mantenimiento o fallas de terceros.',
          'Podemos actualizar estos términos; los cambios importantes se avisarán en el sitio o por e-mail.',
          'Rige la legislación brasileña.',
        ],
      },
    ],
  },
}
