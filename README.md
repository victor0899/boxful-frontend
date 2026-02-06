# Boxful Frontend

Interfaz web para el sistema de gestión de órdenes de envío de Boxful.

## Stack Tecnológico

| Tecnología | Versión | Justificación |
|-----------|---------|---------------|
| **Next.js** | 15.3.x | App Router estable, caching opt-in, soporte React 19, Turbopack estable para dev |
| **Ant Design** | 5.29.x | Versión madura con documentación extensa y track record probado en producción |
| **TypeScript** | 5.x | Type safety end-to-end, mejor DX con autocompletado |
| **pnpm** | 10.x | Resolución estricta de dependencias, 3x más rápido que npm |

## Estructura del Proyecto

```
src/
  app/
    (auth)/
      login/page.tsx         -> Inicio de sesión
      register/page.tsx      -> Registro
      layout.tsx             -> Layout auth (split imagen + form)
    (dashboard)/
      orders/
        page.tsx             -> Historial de órdenes
        create/page.tsx      -> Crear nueva orden
      layout.tsx             -> Layout dashboard (sidebar + header)
    layout.tsx               -> Root layout (Ant ConfigProvider)
    page.tsx                 -> Redirect según autenticación
  components/
    auth/                    -> Formularios de login y registro
    orders/                  -> Tabla, filtros, formulario de órdenes
    layout/                  -> Sidebar y Header
  lib/
    api.ts                   -> Cliente Axios con interceptor JWT
    auth-context.tsx         -> Context provider de autenticación
  hooks/
    useOrders.ts             -> Hook para gestión de órdenes
  types/
    index.ts                 -> Interfaces TypeScript
```

## Instalación

```bash
# Clonar repositorio
git clone https://github.com/victor0899/boxful-frontend.git
cd boxful-frontend

# Instalar dependencias
pnpm install

# Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con la URL de tu API

# Iniciar en desarrollo
pnpm run dev
```

## Variables de Entorno

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

## Vistas

### 1. Login
- Formulario con email y contraseña
- Validaciones con Ant Design Form rules
- Redirect a /orders tras login exitoso

### 2. Registro
- Formulario con nombre, email, contraseña y confirmación
- Validación de contraseñas coincidentes

### 3-4. Crear Orden (Multi-sección)
- **Sección 1**: Datos del destinatario (nombre, teléfono, dirección, departamento, municipio)
- **Sección 2**: Paquetes dinámicos (agregar/eliminar) + opción COD con monto
- Navegación con Steps de Ant Design
- Validación por sección antes de avanzar

### 5. Historial de Órdenes
- Tabla con paginación server-side
- Filtros: estado, rango de fechas, búsqueda por cliente, solo COD
- Tags de colores para estados (Pendiente=azul, En tránsito=naranja, Entregado=verde, Cancelado=rojo)
- Badges COD con monto esperado
- Columnas de costo de envío y liquidación
- Botón exportar CSV
- Ordenamiento descendente por fecha de creación

## Esfuerzos Extra

- **Pago contra entrega (COD)**: Toggle en formulario con campo condicional de monto
- **Badges COD**: Indicador visual en la tabla de órdenes
- **Liquidación**: Columna con monto de liquidación (verde si positivo, rojo si negativo)
- **Exportación CSV**: Descarga directa desde la tabla
- **Layout responsivo**: Sidebar colapsable, tabla adaptativa

## Scripts Disponibles

```bash
pnpm run dev          # Desarrollo con Turbopack
pnpm run build        # Build de producción
pnpm run start        # Ejecutar build de producción
pnpm run lint         # Linting
```

## Conexión con Backend

Este frontend se conecta al [boxful-backend](https://github.com/victor0899/boxful-backend). Asegúrate de tener el backend corriendo antes de usar la aplicación.

1. Configurar y ejecutar el backend (ver README del backend)
2. Ejecutar los seeders del backend (`pnpm run seed`)
3. Iniciar el frontend (`pnpm run dev`)
4. Acceder a `http://localhost:3000`
5. Usar las credenciales de prueba: `test@boxful.com` / `password123`
