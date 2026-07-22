# Open Date

Open Date es una aplicación Next.js para crear invitaciones y eventos interactivos. Cada usuario puede preparar un enlace personalizado para una persona, combinar textos, preguntas, fechas, fotos y regalos, y configurar respuestas “inevitables” con botones que huyen, desaparecen, se intercambian o hacen crecer la opción deseada.

## Funciones incluidas

- Registro e inicio de sesión con cookies seguras y contraseñas cifradas.
- Eventos privados por usuario con enlace público y `slug` personalizable.
- Bloques configurables: texto, pregunta abierta, Sí/No, opciones, fecha, foto y regalo.
- Cinco comportamientos de respuesta: normal, botón que huye, desaparece, hace crecer la respuesta correcta o intercambia posiciones.
- Subida y almacenamiento persistente de imágenes.
- Notificaciones al creador cuando la invitación se abre y cuando se responde.
- Panel de actividad con aperturas, respuestas, edición, enlace compartible y eliminación.
- Administración protegida en servidor para correos del dominio configurado, por defecto `@ismola.dev`.
- Gestión administrativa de usuarios y eventos, incluida activación, moderación y eliminación.
- Diseño responsive Neo-brutal Pop y controles utilizables con teclado y pantalla táctil.

## Arranque con Docker Compose

El proyecto incluye valores locales por defecto, así que puede arrancar directamente:

```bash
docker compose up --build
```

Después abre `http://localhost:3000`. MongoDB usa un volumen persistente y las imágenes se guardan en un almacenamiento compatible con S3.

Para detenerlo:

```bash
docker compose down
```

Para eliminar también todos los datos locales:

```bash
docker compose down -v
```

## Variables de entorno

Los mismos valores por defecto existen en el código, en `docker-compose.yml` y en `.env.example`. Antes de publicar, cambia especialmente `AUTH_SECRET` y la contraseña de MongoDB.

| Variable | Valor local por defecto | Uso |
| --- | --- | --- |
| `MONGODB_URI` | Mongo del Compose | Conexión a MongoDB |
| `MONGODB_DATABASE` | `open_date` | Base de datos |
| `AUTH_SECRET` | secreto local indicado | Firma de sesiones; cambiar en producción |
| `SESSION_COOKIE_NAME` | `open_date_session` | Cookie de autenticación |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` | URL pública de la aplicación |
| `ADMIN_EMAIL_DOMAIN` | `ismola.dev` | Dominio que concede administración |
| `MAX_UPLOAD_MB` | `8` | Tamaño máximo por imagen |
| `S3_ENDPOINT` | — | Endpoint compatible con S3, sin incluir el bucket |
| `S3_REGION` | `auto` | Región S3 (`auto` para Cloudflare R2) |
| `S3_BUCKET` | — | Nombre del bucket |
| `S3_ACCESS_KEY_ID` | — | Access Key ID (solo servidor) |
| `S3_SECRET_ACCESS_KEY` | — | Secret Access Key (solo servidor) |
| `S3_PUBLIC_URL` | — | Dominio público desde el que se sirven las imágenes |
| `PORT` | `3000` | Puerto publicado |

## Administración

Registra una cuenta cuyo correo termine en `@ismola.dev` (o en el dominio definido por `ADMIN_EMAIL_DOMAIN`). Esa cuenta verá la pestaña **Administración**. La API comprueba el dominio de nuevo en el servidor; ocultar o modificar la interfaz no permite saltarse la autorización.

## Desarrollo sin contenedores

Requiere Node.js 22 y una instancia de MongoDB accesible. Ajusta `MONGODB_URI` y ejecuta:

```bash
npm install
npm run dev:next
```

La aplicación estará en `http://localhost:3000`.
