# Boxful Frontend

Aplicación web para gestión de órdenes de envío desarrollada con Next.js 15, Ant Design 5 y TypeScript.

## Stack

- Next.js 15.3 (App Router) + Ant Design 5.29
- TypeScript 5 (strict mode)
- Axios con interceptor JWT
- pnpm 10

## Instalación

```bash
git clone https://github.com/victor0899/boxful-frontend.git
cd boxful-frontend
pnpm install

# Configurar .env.local
NEXT_PUBLIC_API_URL=http://localhost:3001/api

pnpm run dev
```

Requiere el backend corriendo. Ver [boxful-backend](https://github.com/victor0899/boxful-backend).

Credenciales de prueba: `test@boxful.com` / `password123`

## Requerimientos Implementados

**Autenticación**
- Login con email y contraseña
- Registro con 8 campos y verificación por email (código de 6 dígitos)
- JWT en cookie HttpOnly con interceptor Axios

**Crear Orden (Multi-paso)**
- Paso 1: Datos completos del destinatario (dirección recolección, fecha programada, nombres, apellidos, email, teléfono, dirección destino, departamento, municipio)
- Paso 2: Gestión dinámica de paquetes (agregar, editar, eliminar)
- Toggle COD con campo de monto esperado
- Validación por paso

**Historial de Órdenes**
- Tabla con ordenamiento descendente por fecha
- Paginación server-side
- Filtros: búsqueda, estado, rango de fechas, solo COD
- Exportación a CSV
- Tags de colores por estado

**Backend**
- MongoDB para almacenar órdenes
- Filtros en búsquedas de base de datos

## Punto Extra Implementado (Módulo de Liquidación)

**1. COD (Cash on Delivery)**
- Toggle en formulario para habilitar pago contra entrega
- Campo de monto esperado
- Badge morado en tabla con monto
- Soporte para diferencias entre monto esperado y recolectado

**2. Webhook de Entrega**
- Endpoint: `POST /webhooks/delivery-status`
- Botón "Simular entrega" para testing
- Actualiza estado a DELIVERED y recalcula balance
- Recibe monto real recolectado

**3. Configuración de Costos**
- Costos por día de semana en base de datos
- Tarifario: Domingo $5, Lunes-Martes $3, Miércoles-Jueves $3.50, Viernes $4, Sábado $4.50
- Tooltip informativo en fecha programada

**4. Cálculo de Liquidación**
- Columna "Liquidación" con indicadores verde/rojo
- Balance global en header actualizado en tiempo real
- Fórmulas:
  - COD: Monto Recolectado - Costo Envío - Comisión (0.01%, máx $25)
  - No COD: -Costo Envío
- Columna "Costo de envío" con tarifa del día

## Esfuerzos Extra

- Sistema completo de verificación de email con Resend
- Master code `000000` para desarrollo
- Layout split-screen en autenticación
- Ordenamiento bidireccional en columnas (A-Z, Z-A)
- Persistencia de filtros al paginar/ordenar
- Context API para gestión de estado (AuthContext, BalanceContext)
- Sidebar responsive con drawer en mobile
- Paleta de colores Boxful completa
- TypeScript strict mode en todo el proyecto
