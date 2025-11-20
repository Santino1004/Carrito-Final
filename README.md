# Carrito Obregon

Pequeño proyecto de carrito de compras estático desarrollado en HTML, CSS y JavaScript.

## Descripción

Este proyecto contiene una interfaz sencilla de tienda/carrito donde puedes ver productos, agregarlos al carrito y administrar stock. Está pensado como proyecto final o demostración.

## Estructura

- `inicio.html` - Página principal.
- `css/` - Estilos del proyecto.
- `js/` - Lógica JavaScript (incluye `inicio.js`).
- `img/` - Imágenes usadas en la UI.

## Requisitos

- Navegador moderno (Chrome, Edge, Firefox).
- No requiere servidor ni compilación para usar en local, aunque se recomienda servir por HTTP si algunas funciones de navegador bloquean recursos locales.

## Ejecutar localmente

Opción 1 — Abrir directamente:

1. Abre `inicio.html` en tu navegador (doble clic).

Opción 2 — Servir por HTTP (recomendado para evitar restricciones de archivos locales):

Con Python instalado:

```powershell
cd "F:\Obregon\Carrito Obregon"
python -m http.server 8000
# Luego abre http://localhost:8000/inicio.html
```

O con `npx` (si tienes Node):

```powershell
npx http-server . -p 8000
# Luego abre http://localhost:8000/inicio.html
```

## Contribuir

- Haz fork y pull request.
- Mantén las imágenes en la carpeta `img/` y referencias relativas en `js/inicio.js`.

## Licencia

Este repositorio está bajo la licencia MIT — ajusta según prefieras.

## Contacto

Para dudas o cambios, contacta a Santino (santinodesantis262@gmail.com).
