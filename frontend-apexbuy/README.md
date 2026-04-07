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

## Estado actual

- Base de proyecto con Vite lista.
- Servicio de auth implementado en `src/services/auth.js` (usa JWT y `localStorage`).
- Tema dark/light implementado en `src/context/Themecontext.js`.
- Integracion pendiente en:
  - `src/services/api.js`
  - `src/context/Authcontext.js`
- `src/App.jsx` aun usa la vista inicial de Vite.

## Endpoints de backend esperados

- `POST /api/auth/login`
- `POST /api/auth/register`

Respuesta esperada de ambos:

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

## Scripts

- `npm run dev`: desarrollo
- `npm run build`: build de produccion
- `npm run preview`: preview local de build
- `npm run lint`: linting

## Ejecucion local

```bash
npm install
npm run dev
```

App disponible en `http://localhost:5173`.
