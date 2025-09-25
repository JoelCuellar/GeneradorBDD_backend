# Generador BDD – Backend (NestJS + Prisma)

Este repositorio contiene la API del Generador BDD implementada con NestJS, Prisma y una arquitectura hexagonal básica.

## Requisitos previos

- Node.js 20+
- Base de datos PostgreSQL disponible
- (Opcional) Docker para levantar servicios auxiliares

## Puesta en marcha

```bash
# 1) Instala dependencias
npm install

# 2) Configura las variables de entorno
cp .env.example .env
# edita .env con la cadena de conexión correcta para tu base de datos

# 3) Ejecuta migraciones de Prisma
npx prisma migrate dev --name init

# 4) Inicia el servidor en modo desarrollo
npm run start:dev
```

El servidor se expone en `http://localhost:3001` (puerto configurado en `main.ts`).

## Funcionalidad principal

- `POST /users`: crea un usuario. El campo `name` es opcional; si no se envía, se infiere a partir del email.
- `GET /users/:id`: obtiene un usuario por su identificador.

## Pruebas

Ejecuta las pruebas unitarias con:

```bash
npm test
```
