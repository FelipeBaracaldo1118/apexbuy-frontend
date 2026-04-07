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

## Estado actual del proyecto

El frontend se encuentra en etapa de base + estructura inicial:

- Estructura Vite funcionando (`npm run dev`, `build`, `preview`, `lint`).
- Sistema de autenticacion definido en `src/services/auth.js` (login, register, logout, manejo de token y usuario en `localStorage`).
- Contexto de tema dark/light implementado en `src/context/Themecontext.js`.
- Contexto de autenticacion y cliente API aun en proceso de integracion:
  - `src/context/Authcontext.js` (pendiente de consolidar)
  - `src/services/api.js` (pendiente de configurar instancia de Axios)
- `src/App.jsx` aun contiene la vista inicial de Vite como placeholder.

## Estructura del repo

El codigo de la aplicacion esta en:

`frontend-apexbuy/`

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

### Endpoints esperados (auth)

Actualmente el frontend espera estos endpoints en el backend:

- `POST /api/auth/login`
- `POST /api/auth/register`

Respuestas esperadas:

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

## Proximo paso recomendado

Para tener la integracion completa frontend-backend:

1. Implementar `src/services/api.js` con `axios.create({ baseURL: import.meta.env.VITE_API_URL })`.
2. Consolidar `AuthProvider` en `src/context/Authcontext.js` y envolver `App` desde `src/main.jsx`.
3. Reemplazar el contenido placeholder de `src/App.jsx` por el flujo real (login/register/dashboard).

## Build de produccion

```bash
cd frontend-apexbuy
npm run build
```

El resultado queda en `frontend-apexbuy/dist/`.