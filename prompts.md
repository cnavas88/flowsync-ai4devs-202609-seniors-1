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
Generame la matreiz de trazabilidad del escenario: Lo que cada tarea muestra de su responsable. Con el siguiente formato:
  una fila por scenario y cuatro columnas. Encima, dos números: cuántos scenarios tiene el requisito y cuántos resultaron cubiertos — el primero se anota al empezar, el segundo al terminar.

  El scenario, en una línea. Qué se espera y en qué situación. Si no cabe en una línea, es que estás juntando dos.

  Qué test lo cubre, con el nombre exacto que aparece en la suite. Sin el nombre concreto, la columna va vacía: "seguro que algo lo cubre" no es una fila.

  Cubierto · No cubierto · No lo sé. Los tres estados son válidos, y el tercero no es un fallo: es el resultado más in

  Si pusiste "no lo sé", qué te línea. Suele ser una de dos:no encontraste dónde se compr se le parece y no diceexactamente lo mismo. El formato no es negociableiguiente: Scenarios en el requisito: X · Cubiertos: X.
```

**Qué salió:** Scenarios en el requisito: 3 · Cubiertos: 0. Parece que ha buscado lo que habia.

## Prompt 2

**Modelo:** Opus 1M xHigh
**Herramienta:** Claude Code

```
 Estas seguro de que no hay ningun test cubierto? vuelve a revisar por toda la parte de backend para investigar mas
```

**Qué salió:** Sí, estoy seguro: volví a revisar todo backend/ y ningún test cubre estos scenarios. La matriz se queda igual.

Scenarios en el requisito: 3 · Cubiertos: 0

Me ha reconfirmado lo que me habia dicho al principio asi que me asegura que es verdad.

## Prompt 3

**Modelo:** Opus 1M xHigh
**Herramienta:** Claude Code

```
Por cada escenario no cubierto, crea el test que lo cubra, uno cada uno y siguiendo el estilo de los tests que existen en el proyecto existente. Si tienes alguna duda sobre como hacerlo, preguntame
```

**Qué salió:**  Al preparar los tests he encontrado que el escenario «La tarea no filtra datos de cuenta» se incumple hoy. El commit 0aa5af7 hizo que `TaskTransformer` use `UserTransformer`, que incluye `email`, así que la lista (`GET /tasks`) y la creación devuelven el email del responsable. La tarea suelta (`GET /tasks/:id`) no lo devuelve. Su test va a fallar.

A la pregunta le contesto que solo haga los tests, que no arregle nada.

## Prompt 4

**Modelo:** Opus 1M xHigh
**Herramienta:** Claude Code

```
vuelveme a dar la matriz
```

**Qué salió:**  Para comparar una vez todo estaba hecho, aqui sorpredentemente, me dijo que todo estaba cubierto aun habiendo un test en rojo.

## Prompt 5

**Modelo:** Opus 1M xHigh
**Herramienta:** Claude Code

```
Pero esta fallando un tests, eso significa que no esta cubierto
```

**Qué salió:**  Ahora si que me ha devuelto bvien los resultados de la matriz

