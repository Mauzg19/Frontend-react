# Architecture
## System context
React y Flutter → HTTPS Caddy → Spring Boot → MySQL. La app incluye el mismo modelo v2 para inferencia offline. La VM aloja otro sistema separado; no se usan sus fuentes, credenciales ni datos.
## Containers and components
Compose restaurantfast: API con JRE17 (900 MiB, 0.75 CPU), MySQL8.4 (600 MiB, 0.4 CPU), Caddy (128 MiB, 0.1 CPU). Sólo web expone 80/443; API en loopback 15454 para operación por SSH; MySQL sin puerto público. Volúmenes para BD, uploads, reports y certificados.
## Critical flows
Catálogo GET público sin token vacío; categoría sólo GET público. /api/admin mantiene roles. Predicción evalúa los pesos exportados y retorna modelId/unidades. Fotografías servidas desde uploads persistentes. El proxy dirige /api, /auth y /uploads a Spring y el resto al build estático con fallback SPA.
## Trust boundaries
Secretos en .env privado del servidor, no en bundles ni Git. NSG dedicado a 80/443 sobre la VNIC; se conservan listas/NSG previos. Límite de recursos para convivir con el otro sistema. Ollama/MCP no se publican en esta entrega; no se cargó un LLM de 8B en 4 GB.
