# Programa de la reunión Vida y Ministerio Cristianos

Esta aplicación es una herramienta para uso de las congregaciones
de testigos de Jehová. Tiene la finalidad de organizar la reunión
de entre semana. 

## Utilidades

En esta aplicación se pueden organizar las reuniones de entre semana,
se pueden exportar los programas en formato PDF, y se puede llevar
control de los asignados, los nombrados y las asignaciones. Así
mismo, se puede consultar en línea cada programa finalizado con su
enlace correspondiente.


## Disclaimer

En la aplicación no se utiliza ningún elemento que sea propiedad del
sitio de internet oficial de los testigos de Jehová, ni tampoco se
distribuyen publicaciones. Si desea conseguir alguna, puede ingresar
directamente al sitio.

Como desarrollador de esta aplicación no me hago responsable del uso
que se le dé, solo de su correcto funcionamiento.

## Desarrollo y distribución

La versión web y la versión para Windows comparten el mismo código:

```bash
# Servidor web de desarrollo
npm run dev

# Build web para Vercel u otro hosting
npm run build

# Aplicación de escritorio en modo desarrollo
npm run desktop:dev

# Probar localmente el build de escritorio
npm run desktop:preview

# Crear el instalador de Windows en release/
npm run desktop:build
```

## Publicar una versión de Windows

El instalador y las actualizaciones se publican automáticamente en
GitHub Releases. Antes de publicar, confirma que todos los cambios
estén guardados en un commit y que la rama esté actualizada en GitHub.

Para una corrección o cambio pequeño:

```bash
npm run release:patch
```

Para una versión con funciones nuevas:

```bash
npm run release:minor
```

Para una versión con cambios incompatibles:

```bash
npm run release:major
```

Estos comandos actualizan la versión, crean la etiqueta de Git y la
envían a GitHub. El workflow `Publicar aplicación de Windows` compila
y publica automáticamente:

- `Programa-VMC-Setup.exe`
- `Programa-VMC-Setup.exe.blockmap`
- `latest.yml`

La aplicación instalada comprueba actualizaciones al iniciarse y cada
seis horas. Cuando termina la descarga, permite reiniciar para instalar
la nueva versión; si se elige hacerlo después, se instala al cerrar.

`VITE_PUBLIC_WEB_URL` debe contener la dirección de la versión web.
La aplicación de escritorio usa esa dirección cuando genera enlaces
públicos de los programas.
