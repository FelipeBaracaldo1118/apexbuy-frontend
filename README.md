# ApexBuy Frontend

Aplicacion frontend de ApexBuy construida con React + Vite.

> Este repositorio contiene **solo el frontend**.  
> El backend/API vive en otro repositorio y debe estar corriendo para probar los flujos completos.

## Stack

- React 19
- Vite 8
- React Router
- MUI (Material UI)
- Axios
- React Hook Form
- Chart.js
- React Hot Toast
- XLSX + File Saver (exportaciones)

## Estructura del repo

El codigo de la aplicacion esta en:

`frontend-apexbuy/`

## Funcionalidades implementadas

- Landing page publica (`/`).
- Autenticacion con login y registro (`/login`, `/register`).
- Rutas protegidas con `ProtectedRoute`.
- Dashboard con componentes de metricas y graficas.
- Catalogo de productos (`/products`) con:
  - busqueda
  - filtros por fuente y margen
  - modal de detalle
  - exportacion a Excel
- Historial (`/history`) con:
  - cards por producto
  - historial simulado de cambios
  - modal con detalle
  - exportacion de reporte
- Configuracion (`/settings`) con:
  - perfil
  - preferencias de notificaciones
  - fuentes
  - apariencia (dark mode)

## Arquitectura frontend

- `src/context/AuthContext.jsx`: estado de sesion, login/register/logout, usuario actual y first-time flags.
- `src/context/ThemeContext.jsx`: tema light/dark persistido en `localStorage`.
- `src/context/NotificationContext.jsx`: toasts centralizados (`success`, `error`, `info`, `warning`, etc.).
- `src/services/api.js`: cliente Axios centralizado con:
  - `baseURL` desde `VITE_API_URL`
  - interceptor para token JWT (`Authorization: Bearer ...`)
  - manejo global de `401` (limpia sesion y redirige a `/login`)
- `src/services/auth.js`: soporte de auth real y mock.

## Requisitos

- Node.js 20+ (recomendado LTS)
- npm 10+

## Configuracion local

1. Clona este repositorio.
2. Entra a la carpeta del frontend:

```bash
cd frontend-apexbuy
```

3. Crea el archivo `.env` (o completa el que ya existe) con las variables necesarias:

```env
# URL de la API del backend (repositorio separado)
VITE_API_URL=http://localhost:3000

# Configuracion de app
VITE_APP_NAME=ApexBuy
VITE_APP_VERSION=1.0.0

# Feature flags
VITE_ENABLE_DARK_MODE=true
VITE_ENABLE_NOTIFICATIONS=true
VITE_ENABLE_EXPORT=true
VITE_ENABLE_ALERTS=true

# Debug
VITE_DEBUG=true
```

4. Instala dependencias:

```bash
npm install
```

5. Ejecuta en desarrollo:

```bash
npm run dev
```

Por defecto Vite levanta en `http://localhost:5173`.

## Variables y modo de autenticacion

En `src/services/auth.js` existe un switch:

- `USE_MOCK = true`: usa credenciales demo sin backend real de auth.
- `USE_MOCK = false`: usa endpoints reales del backend.

Credenciales demo actuales:

- `admin@apexbuy.com`
- `admin123`

## Scripts disponibles

Desde `frontend-apexbuy/`:

- `npm run dev`: inicia servidor de desarrollo
- `npm run build`: genera build de produccion
- `npm run preview`: previsualiza build local
- `npm run lint`: ejecuta ESLint

## Integracion con backend

- Asegurate de tener el backend corriendo en la URL configurada en `VITE_API_URL`.
- Si cambias el puerto o dominio del backend, actualiza el `.env`.
- Revisa CORS en el backend para permitir requests desde el host del frontend.

### Endpoints consumidos actualmente

Auth:

- `POST /api/auth/login`
- `POST /api/auth/register`

Analisis:

- `GET /api/analysis/opportunities`
- `GET /api/analysis/opportunities/filtered`
- `GET /api/analysis/stats`
- `GET /api/analysis/product/:productId/history`
- `GET /api/analysis/product/:productId/changes`
- `GET /api/analysis/group/:groupId`

Actualizacion:

- `GET /api/update/all-providers`
- `GET /api/update/bose`
- `GET /api/update/samsung`
- `GET /api/update/ktronix`
- `GET /api/update/mansion`
- `GET /api/update/falabella`

Productos y grupos (preparado en frontend):

- `GET /api/products`
- `GET /api/products/:id`
- `GET /api/products/search?q=...`
- `GET /api/groups`
- `GET /api/groups/:id`

Respuesta esperada para auth:

```json
{
  "token": "jwt-token",
  "user": {
    "id": "string",
    "name": "string",
    "email": "string",
    "role": "string"
  }
}
```

## Estado actual

- Frontend funcional con rutas principales y layout completo.
- Integracion de datos activa en `Products` e `History` via `analysisAPI`.
- Modulo de auth con modo mock activo para facilitar desarrollo local.
- Persistencia local de sesion, tema y preferencias basicas.

## Build de produccion

```bash
cd frontend-apexbuy
npm run build
```

El resultado queda en `frontend-apexbuy/dist/`.