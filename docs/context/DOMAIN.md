# Domain
## Glossary
Cliente: catálogo/carrito/pedidos. Propietario: opera su restaurante. Administrador: operaciones administrativas autorizadas. Gerente: permisos existentes, sin acceso al endpoint administrativo de demanda. Escenario académico: producto, fecha e historia ingresada; no equivale a demanda calculada de ventas del restaurante.
## Invariants
JWT y autorización por objeto en Spring. Nunca sembrar una base existente ajena a demostración; semilla transaccional opt-in y no duplicada. Pagos iniciales marcados DEMO_SYNTHETIC no son cobros Stripe. Modelo entrenado con datos sintéticos, MAE 3.0503864 en su partición congelada, no promesa de precisión real.
## Lifecycles
Primera semilla con perfil demo/flag explícito → verificar relaciones → retirar flag/clave de semilla → operación normal y persistencia en volúmenes. Publicación por HTTPS conserva API y web en el mismo origen.
