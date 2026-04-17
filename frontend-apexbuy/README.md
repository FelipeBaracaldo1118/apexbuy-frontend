# ApexBuy Frontend App

Cliente frontend de ApexBuy construido con React + Vite.

> Este proyecto depende de un backend que se encuentra en otro repositorio.

## Requisitos

- Node.js 20+
- npm 10+

## Variables de entorno

Crea/edita el archivo `.env` en esta carpeta:

```env
VITE_API_URL=http://localhost:3000
VITE_APP_NAME=ApexBuy
VITE_APP_VERSION=1.0.0
VITE_ENABLE_DARK_MODE=true
VITE_ENABLE_NOTIFICATIONS=true
VITE_ENABLE_EXPORT=true
VITE_ENABLE_ALERTS=true
VITE_DEBUG=true
```

## Scripts

- `npm run dev`: desarrollo
- `npm run build`: build de produccion
- `npm run preview`: preview local de build
- `npm run lint`: linting

## App y rutas

- Publicas:
  - `/`
  - `/login`
  - `/register`
- Protegidas:
  - `/dashboard`
  - `/products`
  - `/history`
  - `/settings`

## Lo que ya esta implementado

- Contextos:
  - `AuthContext`
  - `ThemeContext`
  - `NotificationContext`
- Cliente API con Axios + interceptores en `src/services/api.js`.
- Auth service con modo mock y modo real en `src/services/auth.js`.
- Catalogo de productos con filtros, modal y export a Excel.
- Historial de productos con resumen, filtros, modal y export.
- Configuracion de usuario, notificaciones, fuentes y apariencia.
- Modo oscuro persistente.

## Auth mock para desarrollo

En `src/services/auth.js`:

- `USE_MOCK = true` usa autenticacion simulada.
- `USE_MOCK = false` usa backend real.

Credenciales demo:

- `admin@apexbuy.com`
- `admin123`

## Endpoints backend usados

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

Update:

- `GET /api/update/all-providers`
- `GET /api/update/bose`
- `GET /api/update/samsung`
- `GET /api/update/ktronix`
- `GET /api/update/mansion`
- `GET /api/update/falabella`

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

## Ejecucion local

```bash
npm install
npm run dev
```

App disponible en `http://localhost:5173`.
