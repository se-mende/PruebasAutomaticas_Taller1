# MISO-4208 (2020-1)
## Taller 1

* Realizado por: Juan Sebastián Méndez Rubiano
* Correo: se-mende@uniandes...

[Ir a la página publicada en Glitch](https://se-mende-pruebasautomaticas-taller1.glitch.me)

## Decisiones y justificación

El proyecto hace uso de *workbox* para el manejo del *service-worker*, el precaching de archivos estáticos, y el routing (caching) de cualquier petición POST que empiece por https://api-ratp.pierre-grimaud.fr/v3/schedules/. Es decir, guarda la información de los tiempos para cada una de las estaciones. La estrategia utilizada es la de *staleWhileRevalidate* que básicamente hace el llamado al recurso (petición POST) al tiempo, y en paralelo, a la caché y luego a la red. Si la red no está disponible, la información vista es la última guardada en la caché. Esto se puede encontrar en el archivo service-worker.js.

<img src="https://developers.google.com/web/tools/workbox/images/modules/workbox-strategies/stale-while-revalidate.png" alt="Stale while revalidate" width="500">

<img src="https://github.com/se-mende/PruebasAutomaticas_Taller1/blob/master/Screenshots%20Proceso/Workbox.png" alt="Workbox" width="500">

Las estaciones agregadas son guardadas utilizando *IndexedDB*. Para esto se utilizó la implementación nativa al iniciar la aplicación, y con dos funciones llamadas _app.initSchedules_ y _app.updateSelectedTimeTableIndexedDB_. Pueden encontrar estas funciones en el archivo scripts/app.js.

<img src="https://github.com/se-mende/PruebasAutomaticas_Taller1/blob/master/Screenshots%20Proceso/IndexedDB.png" alt="IndexedDB" width="500">

Por último, un archivo manifest.json fue agregado, y se configuró la correspondiente metadata para que la aplicación se integrara nativamente a Android y iOS.

## Screenshots de los resultados:

# Estado inicial de la aplicación

[Estado inicial 1](https://github.com/se-mende/PruebasAutomaticas_Taller1/blob/master/Screenshots%20Proceso/Resultados%20ratp-pwa%20inicial%201.png)

[Estado inicial 2](https://github.com/se-mende/PruebasAutomaticas_Taller1/blob/master/Screenshots%20Proceso/Resultados%20ratp-pwa%20inicial%202.png)

# Estado final de la aplicación

<img src="https://github.com/se-mende/PruebasAutomaticas_Taller1/blob/master/Screenshots%20Proceso/Resultados%20ratp-pwa%20Final%201.png" alt="Final 1" width="500">

<img src="https://github.com/se-mende/PruebasAutomaticas_Taller1/blob/master/Screenshots%20Proceso/Resultados%20ratp-pwa%20Final%202.png" alt="Final 2" width="500">

<img src="https://github.com/se-mende/PruebasAutomaticas_Taller1/blob/master/Screenshots%20Proceso/Resultados%20ratp-pwa%20Final%203.png" alt="Final 3" width="500">