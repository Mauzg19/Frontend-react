# Módulo de minería para la sustentación

Ruta `/admin/restaurant/demand`, opción «Minería de demanda» del menú del restaurante. Usa los endpoints autenticados `/api/admin/demand/report` y `/predict` del backend actualizado. El módulo de categorías existente permanece separado.

Muestra origen sintético, particiones temporales, métricas, comparación de modelos, curva de aprendizaje y observado/predicho. Permite probar cinco productos del conjunto académico con fecha y tres valores históricos. No toma los pedidos del restaurante como entrenamiento. No presenta R² como exactitud ni la predicción como confianza.

Compilar con el mismo `REACT_APP_API_URL` del backend correspondiente. Validado localmente con `http://127.0.0.1:15454`. La configuración para un teléfono requiere una URL accesible por ese dispositivo; localhost del teléfono no apunta al PC.

Se verificaron cliente/gerente rechazados, administrador/propietario autorizados, cinco resultados contra pesos de Keras, valores inválidos, recuperación tras 503 y anchos 1440, 768 y 390. Un mutante de predicción +10 falló en el oráculo esperado. El build normal pasa con advertencias de lint preexistentes; el build con CI estricto sigue rechazando esas advertencias y no se presenta como limpio.

Evidencia local: `../mineria-video-20261114/evidence/`. Metodología y reproducción del entrenamiento: `../backend-spring-boot/mineria/README.md`. No se verificaron Stripe Test Mode ni teléfono físico en esta entrega.
