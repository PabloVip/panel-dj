# Copias de seguridad

Aquí se guarda `copia.sql.gpg`: un volcado completo de la base de datos
—estructura y datos— cifrado con contraseña. Se genera solo todos los lunes
de madrugada.

**No hace falta rotar copias ni guardar versiones numeradas**: cada copia
semanal es un commit, así que el historial de Git ya guarda todas las
anteriores. Para ver las que hay:

```bash
git log --oneline -- copias/copia.sql.gpg
```

## Cómo mirar una copia

Necesitas la contraseña que guardaste en el secreto `CLAVE_COPIA`.

```bash
gpg --output copia.sql --decrypt copias/copia.sql.gpg
```

Te pedirá la contraseña y te deja un `copia.sql` legible con todo dentro.

## Cómo recuperar una copia antigua

Busca el commit que quieras en el historial de arriba y sácalo:

```bash
git show <commit>:copias/copia.sql.gpg > copia-antigua.sql.gpg
gpg --output copia-antigua.sql --decrypt copia-antigua.sql.gpg
```

## Cómo restaurar la base de datos

1. Crea un proyecto nuevo en Supabase (o vacía el actual).
2. Consigue su cadena de conexión: botón **Connect** del panel.
3. Vuelca el fichero descifrado:

```bash
psql "LA-CADENA-DE-CONEXION" -f copia.sql
```

4. Crea tu usuario otra vez en **Authentication → Users**. Los usuarios no
   van en esta copia: viven en el sistema de acceso de Supabase, no en tus
   tablas.
5. Actualiza las dos variables de entorno en Vercel si el proyecto es nuevo.

## Si algún día falla

GitHub te manda un correo cuando un flujo programado falla. Si dejas de
recibir el commit semanal y tampoco te llega el aviso, entra en la pestaña
**Actions** del repositorio y lánzalo a mano con **Run workflow** para ver
qué dice.

## Qué NO entra en esta copia

- Tu usuario y tu contraseña de acceso (están en el sistema de Supabase).
- La configuración del proyecto de Supabase.
- El código, que ya está en este mismo repositorio.
