# Mi Amigo Secreto 🎁

"Mi Amigo Secreto" es una aplicación web moderna diseñada para organizar y gestionar intercambios de regalos de amigo secreto (o Secret Santa) de una manera sencilla y divertida. La plataforma permite a los administradores registrar participantes, realizar el sorteo de forma automática y segura, y a los usuarios gestionar sus perfiles, listas de deseos y comunicarse a través de un chat grupal.

## ✨ Características Principales

### Para Usuarios
- **Autenticación Segura**: Inicio de sesión con correo y contraseña.
- **Dashboard Personalizado**: Vista principal con la cuenta regresiva para el intercambio y un acceso directo a tu amigo secreto asignado.
- **Gestión de Perfil**: Actualiza tu nombre y tu foto de perfil.
- **Lista de Deseos (Wishlist)**: Crea, edita y elimina regalos de tu lista de deseos personal. Puedes añadir descripciones, precios aproximados y enlaces de compra.
- **Visualización de Participantes**: Explora la lista de todos los participantes y consulta sus listas de deseos para encontrar el regalo perfecto.
- **Chat Grupal**: Comunícate con todos los miembros del intercambio en un chat en tiempo real.

### Para Administradores
- **Panel de Administración**: Secciones exclusivas accesibles solo para usuarios con rol de administrador.
- **Registro de Usuarios**: Añade nuevos participantes al sistema de forma segura.
- **Sorteo Automatizado**: Realiza el sorteo del amigo secreto con un solo clic, asignando aleatoriamente a quién debe regalar cada participante.
- **Reiniciar Sorteo**: Elimina todas las asignaciones actuales para poder realizar un nuevo sorteo si es necesario.
- **Visualización de Asignaciones**: Accede a una vista completa que muestra quién regala a quién, ideal para la gestión del evento.

## 🚀 Stack Tecnológico

- **Framework**: **Next.js** (con App Router) para renderizado del lado del servidor y del cliente.
- **Lenguaje**: **TypeScript** para un código más robusto y mantenible.
- **Base de Datos y Backend**: **Firebase** (Firestore para la base de datos NoSQL y Firebase Authentication para la gestión de usuarios).
- **Estilos**: **Tailwind CSS** para un diseño rápido y personalizable.
- **Componentes de UI**: **ShadCN UI**, una colección de componentes accesibles y reutilizables.
- **Gestión de Formularios**: **React Hook Form** con **Zod** para validaciones.

## 📁 Estructura de Carpetas

La estructura del proyecto está organizada para mantener una clara separación de responsabilidades.

```
/
├── src/
│   ├── app/                    # Rutas de la aplicación (App Router)
│   │   ├── (app)/              # Rutas protegidas que requieren autenticación
│   │   │   ├── admin/          # Páginas exclusivas para administradores
│   │   │   ├── dashboard/
│   │   │   ├── chat/
│   │   │   └── ...
│   │   ├── (auth)/             # Rutas de autenticación (login, etc.)
│   │   ├── api/                # Rutas de API (ej: para Genkit)
│   │   └── layout.tsx          # Layout principal de la aplicación
│   ├── components/             # Componentes de React reutilizables
│   │   ├── ui/                 # Componentes de ShadCN (Button, Card, etc.)
│   │   ├── wishlist/           # Componentes específicos para la lista de deseos
│   │   └── AppSidebar.tsx      # Menú de navegación lateral
│   ├── firebase/               # Configuración y hooks de Firebase
│   │   ├── config.ts           # Configuración del proyecto de Firebase
│   │   ├── index.ts            # Inicialización de servicios de Firebase
│   │   └── provider.tsx        # Proveedor de contexto para Firebase
│   ├── hooks/                  # Hooks personalizados de React
│   ├── lib/                    # Utilidades, tipos y datos estáticos
│   │   ├── types.ts            # Definiciones de tipos de TypeScript
│   │   └── utils.ts            # Funciones de utilidad (ej: `cn` para clases)
│   └── ...
├── public/                     # Archivos estáticos
├── firestore.rules             # Reglas de seguridad de Firestore
└── ...                         # Otros archivos de configuración
```

## ⚙️ Cómo Empezar

Para ejecutar este proyecto en tu entorno local, sigue estos pasos:

### Prerrequisitos

- **Node.js** (versión 20.x o superior)
- Un proyecto de **Firebase** configurado.

### 1. Configuración de Firebase

1.  **Crea un proyecto en Firebase**: Ve a la [consola de Firebase](https://console.firebase.google.com/) y crea un nuevo proyecto.
2.  **Añade una aplicación web**: Dentro de tu proyecto, añade una nueva aplicación web y copia las credenciales de configuración (el objeto `firebaseConfig`).
3.  **Actualiza la configuración local**: Pega las credenciales que copiaste en el archivo `src/firebase/config.ts`.
4.  **Habilita los servicios**:
    - En la sección **Authentication**, habilita el proveedor de **Correo electrónico/Contraseña**.
    - En la sección **Firestore Database**, crea una base de datos en modo de prueba o producción.
5.  **Crea tu primer usuario (Administrador)**:
    - Ve a la pestaña **Authentication** -> **Users** y añade un nuevo usuario manualmente. Este será tu usuario administrador.
    - Luego, ve a la pestaña **Firestore Database**, crea la colección `users` y añade un documento con el UID del usuario que acabas de crear. Dentro de ese documento, añade un campo `tipo_user` (tipo `number`) y asígnale el valor `2`.

### 2. Instalación y Ejecución

1.  **Clona el repositorio** (si aplica) y navega a la carpeta del proyecto.

2.  **Instala las dependencias**:
    ```bash
    npm install
    ```

3.  **Ejecuta el servidor de desarrollo**:
    ```bash
    npm run dev
    ```

La aplicación estará disponible en `http://localhost:9002`. ¡Ahora puedes iniciar sesión con tu usuario administrador y empezar a usar la plataforma!
