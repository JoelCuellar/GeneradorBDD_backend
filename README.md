# Backend Modules (NestJS Hexagonal + Prisma)

Este paquete contiene **estructura y código** para añadir al proyecto NestJS recién creado con `nest new`.

## Uso rápido

```bash
# 1) Crear proyecto NestJS
nest new backend --strict
cd backend

# 2) Dependencias necesarias
npm i @prisma/client class-validator class-transformer
npm i -D prisma

# 3) Copia estos archivos dentro del proyecto
# (desde donde descargaste el zip)
unzip -o backend-modules.zip -d .

# 4) Variables de entorno
cp -n .env.example .env

# 5) Prisma: crear DB y migraciones
npx prisma migrate dev --name init

# 6) Ejecuta
npm run start:dev
```

## Endpoints de prueba
- POST `http://localhost:3001/users` body: `{ "email": "uno@ejemplo.com", "name": "Uno" }`
- GET  `http://localhost:3001/users/{id}`
