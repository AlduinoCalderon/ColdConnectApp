# ColdConnect Web App

Aplicación web responsiva para monitorear almacenes refrigerados.

## Características

- Vista de mapa con ubicación de almacenes
- Lista de almacenes con información detallada
- Diseño responsivo optimizado para móviles
- Monitoreo en tiempo real de temperatura y humedad
- Geolocalización para encontrar almacenes cercanos

## Requisitos

- Node.js >= 18
- npm >= 9

## Instalación

1. Clonar el repositorio:
```bash
git clone https://github.com/yourusername/ColdConnectApp.git
cd ColdConnectApp
```

2. Instalar dependencias:
```bash
npm install
```

3. Crear archivo .env con la configuración necesaria:
```bash
VITE_API_URL=http://localhost:3001/api
```

## Desarrollo

Para iniciar el servidor de desarrollo:

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

## Construcción

Para construir la aplicación para producción:

```bash
npm run build
```

Los archivos de la build estarán en la carpeta `dist/`

## Tecnologías

- React 18
- TypeScript
- Vite
- Axios
- CSS Modules
