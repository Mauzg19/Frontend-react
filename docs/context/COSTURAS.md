# Costuras del despliegue académico
## Parámetros de verificación
Artefactos: JAR y build React exactos del 22-nov, hashes en ../validation/2026-11-22-oracle.md. Entorno: Oracle HTTPS y MySQL demo sintético, autorizado explícitamente. Recorrido: visitante abre restaurante y cinco productos/fotos; propietario entra a predicción; Hamburguesa 2026-09-01 con 38/40/65.71428571428571 produce 49.577291514433696. Oráculo: export Keras v2. Comandos/runbook: OPERATIONS y ops/oracle del backend. Evidencia local: release-20261122/evidence. Controles: encabezado Bearer null hace fallar cuatro pruebas web; retirar permiso GET público de categorías hace fallar el test de catálogo con 403. No se publica un mutante. Autoridad: usuario pide despliegue y selecciona datos demo.
## Inventario
| Límite | Gate / evidencia |
|---|---|
| Visitante → API | Catálogo público corregido, cuatro regresiones web y control Spring 200/403 |
| JPA → semilla DB | Persistencia H2, transacción, idempotencia; error de lista inmutable reproducido antes del arreglo |
| Fuente → JAR/build | mvn package y build React CI, hashes releídos en servidor |
| API → DB demo | cinco productos, un restaurante, cuatro cuentas y órdenes sintéticas persistentes |
| Uploads → HTTPS | cinco fotos originales decodificadas con dimensiones y SHA |
| JWT/rol → demanda | propietario/admin 200, cliente/gerente 403 |
| Pesos Keras → respuesta pública | cinco escenarios y modelId v2 |
| OCI NSG → HTTPS público | certificado válido, 80/443 dedicados, DB sin puerto público |
| Fuente Flutter → APK | Validación propia en repositorio RestaurantApp, no sustituida por pruebas web |
| Stripe/SMTP/Ollama | No acreditados en este despliegue; límites declarados en DELIVERY |
Inventario de alcance acotado, sin porcentaje global de producto ni aceptación académica automática.
