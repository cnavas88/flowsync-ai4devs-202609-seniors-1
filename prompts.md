# Prompts

Aquí van **todos los prompts que lanzaste** para hacer el ejercicio, en el orden en que los
lanzaste, con el modelo y la herramienta de cada uno.

Esto no es papeleo. Lo que se revisa es **cómo pediste las cosas**, no solo lo que salió: un
resultado flojo con un prompt bueno y un resultado flojo con un prompt vago necesitan feedback
distinto, y sin este archivo no se distinguen.

## Cómo rellenarlo

- Un apartado `## Prompt N` por cada prompt.
- **Pega el prompt tal cual lo lanzaste**, dentro del bloque de código, aunque ocupe diez líneas
  y aunque tenga faltas. No lo reescribas para que quede bien: el que arreglaste mentalmente
  después no es el que lanzaste.
- Incluye también los que **no funcionaron**. Suelen ser los más útiles de leer.
- `Modelo` y `Herramienta` en todos. Si cambiaste de una a otra a mitad, se nota aquí.

Borra el ejemplo de abajo cuando escribas el primero.

---

## Prompt 1

**Modelo:** Opus 1M xHigh
**Herramienta:** Claude Code

```
Quiero contrastar sin que hagas ningun cambio los ultimos 15 commits que tienes y el estado actual del proyecto, contra la regla: La rama es por unidad de trabajo, no por petición. Antes de tocar código, mira en qué rama estás: si ya es una rama de trabajo —cualquiera que no sea main ni una sN/*—, sigue en ella en vez de crear otra. Solo desde main o desde una sN/* se crea una nueva (git checkout -b feat/<slug>). Nunca commitear directo en main ni en una sN/*. Dame el comando ejecutado o el archivo consultado, el veredicto (Si se cumple, no se cumple o no se puede comprobar) y la evidencia.
```

**Qué salió:** 

#: 1
Qué se comprueba: Rama actual
Veredicto: Se cumple
Evidencia: git branch --show-current → auditoria-cnb. No es main ni una sN/*.

## Prompt 2

**Modelo:** Opus 1M xHigh
**Herramienta:** Claude Code

```
Quiero contrastar sin que hagas ningun cambio los ultimos 15 commits que tienes y el estado actual del proyecto, contra la regla: El commit sí es por petición: al cerrar cada una, usar la skill /commit. Dame el comando ejecutado o el archivo consultado, el veredicto (Si se cumple, no se cumple o no se puede comprobar) y la evidencia.
```

**Qué salió:** 

La regla no se puede comprobar del todo con git: usar /commit no deja ninguna marca en el commit. Lo único verificable es si el mensaje tiene el formato que produce la skill, tipo(scope): descripción con tipo feat/fix/refactor/docs/test/chore. Con eso como indicio: 14 de los 15 commits lo cumplen, y 4 de tus 5 commits locales no. No he cambiado nada.

## Prompt 3

**Modelo:** Opus 1M xHigh
**Herramienta:** Claude Code

```
Quiero contrastar sin que hagas ningun cambio los ultimos 15 commits que tienes y el
estado actual del proyecto, contra la regla: Un cambio que toque rutas, controladores,
validadores o transformers de una capability se cierra en el mismo commit con el documento
OpenAPI y el README de esa capability al día. El documento se construye en cada petición
y no hay fichero que generar, así que lo que se commitea es el diff regenerado de
`.adonisjs/`; el README es `docs/capabilities/<nombre>/README.md`.. Dame el comando
ejecutado o el archivo consultado, el veredicto (Si se cumple, no se cumple o no se puede
comprobar) y la evidencia.
```

**Qué salió:** 

La regla se cumple en todo lo que le aplica. De los 15 commits, solo 3 tocan rutas, controladores, validadores o transformers. El único posterior a la regla (cbe9617) la cumple. Los otros dos son anteriores y los incluyo solo como referencia. No he cambiado nada en el repo: el único comando que escribe ficheros se ejecutó sobre una copia en el scratchpad.

## Prompt 4

**Modelo:** Opus 1M xHigh
**Herramienta:** Claude Code

```
Quiero contrastar sin que hagas ningun cambio los ultimos 15 commits que tienes y el estado actual del proyecto, contra la regla: gh pr create (con una descripción completa de los cambios en el cuerpo del PR) y el pase del subagente adversarial-reviewer sobre ese PR van una sola vez, al terminar la unidad de trabajo, no al cerrar cada petición. El review adversarial es lo último, antes de dar la unidad por terminada. Dame el comando ejecutado o el archivo consultado, el veredicto (Si se cumple, no se cumple o no se puede comprobar) y la evidencia.
```

**Qué salió:** 

No se cumple en la parte que se puede comprobar. Ninguno de los 15 commits tiene un PR asociado. Tus 4 PRs tienen el cuerpo vacío, así que les falta la descripción completa que pide la regla. El paso del adversarial-reviewer no se puede comprobar en ningún caso: es un subagente local y no deja rastro en git ni en GitHub. No he cambiado nada.
 
## Prompt 5

**Modelo:** Opus 1M xHigh
**Herramienta:** Claude Code

```
Quiero contrastar sin que hagas ningun cambio los ultimos 15 commits que tienes y el estado actual del proyecto, contra la regla: Cuando abras el PR, no repitas ese resumen en el chat: la sesión se va a perder, el PR no. Responde solo con la URL del PR. Dame el comando ejecutado o el archivo consultado, el veredicto (Si se cumple, no se cumple o no se puede comprobar) y la evidencia.
```

**Qué salió:** 

No he encontrado ningún incumplimiento. La regla solo se activa cuando Claude abre un PR, y en las sesiones locales no lo ha hecho nunca: el único intento falló y fue bloqueado. Para los 15 commits no se puede comprobar, porque ni existen PRs ni están las sesiones de sus autores. No he cambiado nada; el único fichero creado es un script de lectura en el scratchpad.
