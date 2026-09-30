# Spec viva: cuentas y acceso

## Purpose

Permite que una persona cree una cuenta, inicie y cierre sesión, conserve la sesión entre recargas y consulte su perfil, y que sin sesión no pueda ver las pantallas ni los recursos privados.

## Requirements

### Requirement: Registro de una cuenta por la API

El sistema SHALL crear una cuenta cuando recibe `POST /api/v1/auth/signup` con `fullName`, `email`, `password` y `passwordConfirmation` válidos, y SHALL devolver en esa misma respuesta la cuenta creada y un token de acceso ya utilizable.

#### Scenario: Registro correcto

- **WHEN** se envía `POST /api/v1/auth/signup` con `fullName` de texto o `null`, un `email` con formato válido de 254 caracteres como máximo que no está registrado, un `password` de entre 8 y 32 caracteres y un `passwordConfirmation` idéntico
- **THEN** la respuesta es un 200 con el cuerpo `{ "data": { "user": { ... }, "token": "..." } }`, y ese token sirve desde ese momento para las peticiones autenticadas

#### Scenario: Falta la clave del nombre

- **WHEN** se envía el registro sin la clave `fullName` (y no con `null`)
- **THEN** la respuesta es un 422 con un error de la regla `required` sobre el campo `fullName`, y no se crea la cuenta

#### Scenario: Email ya registrado

- **WHEN** se envía el registro con un `email` idéntico, carácter a carácter, al de una cuenta existente
- **THEN** la respuesta es un 422 con un error de la regla `database.unique` sobre el campo `email`, y no se crea la cuenta

#### Scenario: Email que solo cambia en mayúsculas

- **WHEN** se envía el registro con un `email` que coincide con uno registrado salvo en mayúsculas y minúsculas
- **THEN** el sistema lo trata como un email distinto y crea otra cuenta

#### Scenario: Email con formato inválido o demasiado largo

- **WHEN** se envía el registro con un `email` sin formato de email o de más de 254 caracteres
- **THEN** la respuesta es un 422 con un error sobre el campo `email`, y no se crea la cuenta

#### Scenario: Contraseña fuera de longitud

- **WHEN** se envía el registro con un `password` de menos de 8 caracteres o de más de 32
- **THEN** la respuesta es un 422 con un error de la regla `minLength` o `maxLength` sobre el campo `password`

#### Scenario: Confirmación distinta

- **WHEN** se envía el registro con un `passwordConfirmation` distinto de `password`
- **THEN** la respuesta es un 422 con un error de la regla `sameAs` sobre el campo `passwordConfirmation`

### Requirement: Forma de los errores de validación

Cuando una petición de cuentas y acceso no pasa la validación, el sistema SHALL responder un 422 con un cuerpo `{ "errors": [ ... ] }` en el que cada error lleva `message`, `rule` y `field`.

#### Scenario: Varios campos inválidos

- **WHEN** se envía un registro con el email mal formado y la contraseña demasiado corta
- **THEN** la respuesta es un 422 cuya lista `errors` tiene una entrada por cada campo que falla, y cada una indica el campo y la regla que ha fallado

### Requirement: Representación pública de la cuenta

Siempre que la API devuelve una cuenta, SHALL incluir exactamente `id`, `fullName`, `email`, `createdAt`, `updatedAt` e `initials`, y SHALL NOT incluir la contraseña ni nada derivado de ella.

#### Scenario: Cuenta devuelta tras registrarse, entrar o pedir el perfil

- **WHEN** la API devuelve una cuenta en el registro, en el inicio de sesión o en el perfil
- **THEN** el objeto trae esos seis campos, y `fullName` vale `null` si la cuenta se creó sin nombre

#### Scenario: Iniciales de un nombre de dos palabras o más

- **WHEN** la cuenta tiene un nombre con dos palabras o más separadas por un espacio, como `Ada Lovelace`
- **THEN** `initials` son la primera letra de cada una de las dos primeras palabras, en mayúsculas (`AL`)

#### Scenario: Iniciales de un nombre de una sola palabra

- **WHEN** la cuenta tiene un nombre de una sola palabra, como `Ada`
- **THEN** `initials` son sus dos primeras letras, en mayúsculas (`AD`)

#### Scenario: Iniciales sin nombre

- **WHEN** la cuenta no tiene nombre y su email es `ada@example.com`
- **THEN** `initials` son la primera letra de lo que va antes de la arroba y la primera de lo que va después, en mayúsculas (`AE`)

### Requirement: Inicio de sesión por la API

El sistema SHALL emitir un token de acceso nuevo cuando recibe `POST /api/v1/auth/login` con el `email` y el `password` de una cuenta existente.

#### Scenario: Credenciales correctas

- **WHEN** se envía `POST /api/v1/auth/login` con el email exacto de una cuenta y su contraseña
- **THEN** la respuesta es un 200 con el cuerpo `{ "data": { "user": { ... }, "token": "..." } }`

#### Scenario: Cada inicio de sesión da un token distinto y los anteriores siguen valiendo

- **WHEN** la misma cuenta inicia sesión dos veces
- **THEN** recibe dos tokens distintos, y los dos sirven a la vez para las peticiones autenticadas

#### Scenario: Credenciales incorrectas

- **WHEN** se envía un email que no corresponde a ninguna cuenta, o una contraseña que no es la de esa cuenta
- **THEN** la respuesta es un 400 (no un 401) con el cuerpo `{ "errors": [{ "message": "Invalid user credentials" }] }`, igual en los dos casos, y sin indicar ningún campo

#### Scenario: Email en otras mayúsculas

- **WHEN** se envía el email de una cuenta existente cambiando mayúsculas o minúsculas
- **THEN** se responde como a unas credenciales incorrectas

#### Scenario: Contraseña vacía

- **WHEN** se envía un email con formato válido y `password` como cadena vacía
- **THEN** la respuesta es el mismo 400 de credenciales incorrectas, no un error de validación

#### Scenario: Email con formato inválido

- **WHEN** se envía un `email` sin formato de email o de más de 254 caracteres
- **THEN** la respuesta es un 422 de validación sobre el campo `email`

### Requirement: Acceso autenticado por token

Las peticiones a `/api/v1/account/*` SHALL exigir un token de acceso válido en la cabecera `Authorization: Bearer <token>`, y el sistema SHALL rechazar las que no lo traen.

#### Scenario: Sin token, o con un token inválido o revocado

- **WHEN** se pide `GET /api/v1/account/profile` o `POST /api/v1/account/logout` sin cabecera `Authorization`, con un token que no existe o con uno ya revocado
- **THEN** la respuesta es un 401 con el cuerpo `{ "errors": [{ "message": "Unauthorized access" }] }`

#### Scenario: El token no caduca por tiempo

- **WHEN** se usa un token emitido hace cualquier tiempo que no se ha revocado
- **THEN** sigue siendo aceptado, porque los tokens se emiten sin fecha de caducidad

### Requirement: Consulta del perfil propio

El sistema SHALL devolver la cuenta a la que pertenece el token cuando recibe `GET /api/v1/account/profile` autenticado.

#### Scenario: Perfil con token válido

- **WHEN** se pide `GET /api/v1/account/profile` con un token válido
- **THEN** la respuesta es un 200 con el cuerpo `{ "data": { ... } }`, que contiene la cuenta dueña del token

### Requirement: Cierre de sesión por la API

El sistema SHALL revocar el token con el que se hace la petición cuando recibe `POST /api/v1/account/logout` autenticado.

#### Scenario: Cierre de sesión correcto

- **WHEN** se envía `POST /api/v1/account/logout` con un token válido
- **THEN** la respuesta es un 200 con el cuerpo `{ "message": "Logged out successfully" }`, sin envoltorio `data`, y ese token deja de valer

#### Scenario: Otros tokens de la misma cuenta

- **WHEN** la cuenta tiene otros tokens emitidos en otros inicios de sesión y cierra sesión con uno
- **THEN** solo se revoca el token de esa petición y los demás siguen valiendo

### Requirement: Respuestas siempre en JSON

Las respuestas de la API de cuentas y acceso SHALL ser JSON, incluidas las de error, pida lo que pida el cliente en la cabecera `Accept`.

#### Scenario: Cliente que pide HTML

- **WHEN** se hace una petición sin token a `GET /api/v1/account/profile` con `Accept: text/html`
- **THEN** la respuesta sigue siendo el 401 en JSON, no una redirección ni una página

### Requirement: Pantalla de registro

La aplicación SHALL ofrecer en `/register` un formulario con nombre completo (marcado como opcional), email, contraseña y repetición de la contraseña, y SHALL dejar a la persona con la sesión iniciada al registrarse.

#### Scenario: Registro correcto desde la pantalla

- **WHEN** una persona sin sesión rellena el formulario con datos válidos y pulsa «Crear cuenta»
- **THEN** mientras se envía el botón dice «Creando cuenta…» y está deshabilitado, y al terminar la persona queda con la sesión iniciada y ve su perfil sin ningún paso más

#### Scenario: Nombre vacío o solo con espacios

- **WHEN** la persona deja el nombre vacío o escribe solo espacios
- **THEN** la cuenta se crea sin nombre

#### Scenario: Contraseñas que no coinciden

- **WHEN** la contraseña y su repetición son distintas y la persona envía el formulario
- **THEN** bajo la repetición aparece «Las contraseñas no coinciden.» y no se hace ninguna petición al servidor

#### Scenario: Pista de longitud de la contraseña

- **WHEN** el campo de contraseña no tiene ningún error
- **THEN** debajo aparece la pista «Entre 8 y 32 caracteres.», y cuando tiene un error, el error la sustituye

#### Scenario: Errores del servidor en campos del formulario

- **WHEN** el servidor rechaza el registro con errores de validación sobre campos que están en el formulario
- **THEN** cada error aparece, traducido al castellano, bajo su campo (por ejemplo «Ese email ya está registrado. Inicia sesión en su lugar.»), y no aparece ningún aviso general

#### Scenario: Ir al inicio de sesión

- **WHEN** la persona pulsa «Inicia sesión» bajo el formulario
- **THEN** va a `/login`

### Requirement: Pantalla de inicio de sesión

La aplicación SHALL ofrecer en `/login` un formulario de email y contraseña que, con credenciales correctas, deja a la persona con la sesión iniciada en su perfil.

#### Scenario: Inicio de sesión correcto desde la pantalla

- **WHEN** una persona sin sesión introduce su email y su contraseña y pulsa «Entrar»
- **THEN** mientras se envía el botón dice «Entrando…» y está deshabilitado, y al terminar ve su perfil

#### Scenario: Credenciales incorrectas en pantalla

- **WHEN** el email o la contraseña no son correctos
- **THEN** aparece arriba del formulario el aviso «El email o la contraseña no son correctos.» y la persona sigue sin sesión

#### Scenario: Email con formato inválido en pantalla

- **WHEN** la persona envía un email sin formato válido
- **THEN** aparece bajo el campo de email «Introduce una dirección de email válida.»

#### Scenario: Servidor inaccesible

- **WHEN** la persona envía el formulario y el servidor no responde
- **THEN** aparece arriba del formulario «No se pudo conectar con el servidor. Comprueba que el backend está arrancado.»

#### Scenario: Ir al registro

- **WHEN** la persona pulsa «Crea una» bajo el formulario
- **THEN** va a `/register`

### Requirement: Pantalla de perfil

La aplicación SHALL mostrar en `/profile`, a quien tiene sesión, sus iniciales, su nombre, su email, la fecha en la que creó la cuenta y un botón para cerrar sesión.

#### Scenario: Perfil de una cuenta con nombre

- **WHEN** una persona con sesión y con nombre abre `/profile`
- **THEN** ve sus iniciales en un círculo, su nombre, su email y «Miembro desde» seguido de la fecha de alta en formato largo en castellano (por ejemplo «30 de septiembre de 2026»)

#### Scenario: Perfil de una cuenta sin nombre

- **WHEN** la cuenta se creó sin nombre
- **THEN** en lugar del nombre aparece «Sin nombre»

### Requirement: Cierre de sesión desde la pantalla

La aplicación SHALL cerrar la sesión en ese navegador al pulsar «Cerrar sesión», aunque el servidor no llegue a confirmarlo, y SHALL llevar a la persona al inicio de sesión.

#### Scenario: Cerrar sesión

- **WHEN** una persona con sesión pulsa «Cerrar sesión» en su perfil
- **THEN** pasa a `/login` sin sesión, y el token con el que estaba queda revocado en el servidor

#### Scenario: Cerrar sesión con el servidor caído

- **WHEN** la persona pulsa «Cerrar sesión» y el servidor no responde
- **THEN** pasa igualmente a `/login` sin sesión en ese navegador, sin ningún aviso de error

#### Scenario: Volver atrás tras cerrar sesión

- **WHEN** tras cerrar sesión la persona pulsa «atrás» en el navegador
- **THEN** no vuelve a ver su perfil, sino el inicio de sesión

### Requirement: Persistencia de la sesión en el navegador

La aplicación SHALL conservar la sesión al recargar la página y al cerrar y volver a abrir la pestaña, hasta que la persona la cierre o el servidor deje de aceptar el token.

#### Scenario: Recargar con sesión

- **WHEN** una persona con sesión recarga la página o vuelve a abrir la aplicación en otra pestaña
- **THEN** ve primero un indicador de carga y después su perfil, sin volver a introducir credenciales

#### Scenario: El servidor ya no acepta el token guardado

- **WHEN** la aplicación arranca con una sesión guardada que el servidor rechaza
- **THEN** la sesión guardada se descarta y la persona ve el inicio de sesión con el aviso «Tu sesión ha caducado. Vuelve a iniciar sesión.»

#### Scenario: El servidor no responde al restaurar la sesión

- **WHEN** la aplicación arranca con una sesión guardada y el servidor no responde o devuelve un error que no es de autenticación
- **THEN** la persona ve el inicio de sesión con un aviso que explica el fallo, y la sesión guardada se conserva, de modo que al recargar con el servidor ya disponible vuelve a entrar sin credenciales

### Requirement: Protección de las pantallas

La aplicación SHALL impedir el acceso a las pantallas privadas sin sesión, y SHALL impedir el acceso a las de inicio de sesión y registro con ella.

#### Scenario: Pantalla privada sin sesión

- **WHEN** una persona sin sesión abre `/profile`
- **THEN** va a `/login`, sin que la pantalla privada quede en el historial

#### Scenario: Inicio de sesión o registro con sesión

- **WHEN** una persona con sesión abre `/login` o `/register`
- **THEN** va a `/profile`

#### Scenario: Cualquier otra dirección

- **WHEN** alguien abre una dirección de la aplicación que no es `/login`, `/register` ni `/profile`
- **THEN** va a `/profile`, y de ahí a `/login` si no tiene sesión

#### Scenario: Mientras se comprueba la sesión guardada

- **WHEN** la aplicación todavía está comprobando con el servidor una sesión guardada
- **THEN** en cualquiera de las pantallas anteriores se ve solo un indicador de carga, sin redirigir todavía


1. Cuántos requisitos escribió el agente, y cuántos comprobaste tú abriendo el código. 

El agente escribio: 14
Comprobe: 2

2. Las incoherencias que aparecieron al escribirla. 
- Confirmación de contraseña: primero se verifica la confirmacion de la password y luego la longitud.
- Tope del email: el validador limita el email a 254 caracteres, pero ese límite nunca llega a aplicarse.
- Email duplicado: da 422 en peticiones de una en una, pero 500 en cuanto llegan a la vez.
- Unicidad del email: es exacta en las mayúsculas pero no en los espacios. ADA@example.com crea otra cuenta, mientras que " ada@example.com" choca con ada@example.com.
- Longitud de la contraseña: los «8 a 32 caracteres» se cuentan en unidades UTF-16, no en caracteres.
- Campo meta: unos errores lo traen y otros no. Lo traen el 422 de contraseña corta (meta.min) y el de sameAs (meta.otherField). No lo traen required, email ni database.unique.

3. Lo que no supiste decidir si era un bug o el contrato.
- Email que distingue mayúsculas: o es un bug, porque ADA@example.com y ada@example.com son la misma persona con dos cuentas. O es el contrato de guardar el email tal cual con unicidad exacta. La regla admite la opción de no distinguir mayúsculas y no está puesta, pero no se puede saber si es un olvido o una decisión.
- Nombre obligatorio como clave pero opcional como valor: o es el contrato, porque el cliente tiene que declarar explícitament un bug, porque se quería un campoopcional y omitir la clave deberás, el PRD dice que elnombre es obligatorio, lo que da una tercera lectura.
- Recorte de la contraseña: o es eión normaliza toda la entrada porigual y es coherente. O es un bun secreto, "  abc…" no es "abc…", y el recorte llega como efecto colateral de la configuración por defecto de la librería.
- 500 cuando se registran dos a lacaso es «email ya registrado» ydebería dar el mismo 422. O es aatos ya impide el duplicado y elcódigo de respuesta en una carrera es circunstancial.
- 422 sin errors para un JSON mal rque { errors } solo se prometepara los errores de validación. e espera una única forma de errorpara todo 422, y el frontend acaico.