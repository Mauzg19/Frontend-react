# Delivery
## Current state
2026-11-22: API y build React servidos por https://restaurantfast.40.233.20.55.sslip.io con base nueva de demostraciÃ³n. CatÃ¡logo anÃ³nimo corregido. Rama de trabajo fix/sustentacion-restaurant-fast; ver sesiÃ³n y validaciÃ³n para commits/artefactos/evidencia, no inferir fusiÃ³n de main.
## Risks and gates
Datos sintÃ©ticos; no migraciÃ³n de Railway. Las pruebas de telÃ©fono fÃ­sico y Stripe real siguen aplazadas. Secretos Stripe/SMTP vacÃ­os en el despliegue: checkout real y recuperaciÃ³n por correo no se acreditan; asistente conversacional Ollama no habilitado. El DNS pÃºblico depende de la IP de la VM; cambiar IP exige nueva URL/configuraciÃ³n del APK. La aceptaciÃ³n de sustentaciÃ³n no se deduce de un deploy saludable.
## Roadmap
La versión web r5 distingue carga, error recuperable y ausencia confirmada antes de mostrar el formulario del propietario. La pantalla de minería abre el ejemplo Hamburguesa, igual que Flutter. La prueba en Edge retuvo la respuesta del restaurante, reprodujo el formulario transitorio en r4 y verificó en r5 el indicador de carga, el reintento tras HTTP 503 y la respuesta vacía. El despliegue recreó únicamente el contenedor web de Oracle.
Conservar clave de firma APK, credenciales privadas y copias de BD/uploads. Retomar integraciÃ³n Stripe/SMTP y ensayo fÃ­sico cuando el usuario lo solicite. No se crea otra VM ni se contrata un servicio adicional.
## Open questions
Ninguna elecciÃ³n de proveedor/datos bloquea el despliegue autorizado. Quedan aceptaciÃ³n del equipo y las integraciones expresamente aplazadas, fuera de esta certificaciÃ³n.
