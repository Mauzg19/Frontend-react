# Operations
## Local workflow
Backend: Java17 y mvn package. Web: npm ci, npm run lint, CI=true npm test -- --watch=false --runInBand, CI=true npm run build. Definir REACT_APP_API_URL=https://restaurantfast.40.233.20.55.sslip.io antes del build web.
## Verification
Ver ../validation/2026-11-22-oracle.md. Guardar recibos originales codex-check, informes Surefire/Jest y cotejo operacional pÃºblico. El HTTP profile actual responde 202; no confundirlo con error ni alterar el contrato para el verificador.
## Delivery and rollback
Servidor: /srv/restaurantfast/current apunta a releases/20261122-r4. ConfiguraciÃ³n versionada en backend ops/oracle. Ejecutar sudo docker compose ps/logs desde current. Copia inicial de la BD en /srv/restaurantfast/backups/demo-inicial-20261122.sql. No usar down -v: destruye datos. Para retirar este despliegue, detener exclusivamente el proyecto restaurantfast. Para reversiÃ³n de cÃ³digo elegir release previo y ejecutar su Compose, conservando volÃºmenes; r1 fallÃ³ en semilla y nunca es un rollback vÃ¡lido. El r2 previo carece de la correcciÃ³n de catÃ¡logo anÃ³nimo. No intervenir los servicios del otro proyecto.
## Observability
Verificar reinicios/OOM, memoria y salud de BD, HTTPS, catÃ¡logo y una predicciÃ³n autenticada. En logs no registrar contraseÃ±as ni JWT. Certificados se conservan en volumen. Accesos demo estÃ¡n en archivo privado entregado al dueÃ±o; no en documentaciÃ³n pÃºblica.
