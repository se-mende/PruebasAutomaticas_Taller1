# MISO-4208 (2020-1)
## Taller 1

Realizado por: Juan Sebastián Méndez Rubiano
Correo: se-mende@uniandes...

![Ir a la página publicada en Glitch](https://se-mende-pruebasautomaticas-taller1.glitch.me)

## Decisiones y justificación

El proyecto hace uso de *workbox* para el manejo del *service-worker*, el precaching de archivos estáticos, y el routing (caching) de cualquier petición POST que empiece por https://api-ratp.pierre-grimaud.fr/v3/schedules/. Es decir, guarda la información de los tiempos para cada una de las estaciones. La estrategia utilizada es la de *staleWhileRevalidate* que básicamente hace el llamado al recurso (petición POST) al tiempo, y en paralelo, a la caché y luego a la red. Si la red no está disponible, la información vista es la última guardada en la caché. Esto se puede encontrar en el archivo service-worker.js.

<img src="https://developers.google.com/web/tools/workbox/images/modules/workbox-strategies/stale-while-revalidate.png" alt="Stale while revalidate" width="200">

Las estaciones agregadas son guardadas utilizando *IndexedDB*. Para esto se utilizó la implementación nativa al iniciar la aplicación, y con dos funciones llamadas _app.initSchedules_ y _app.updateSelectedTimeTableIndexedDB_. Pueden encontrar estas funciones en el archivo scripts/app.js.

