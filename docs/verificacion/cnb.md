1- Cuántos scenarios creías cubiertos antes de mirar, y cuántos lo estaban: Pensaba que estaban todos cubiertos y realmente solo estaban cubiertos 2 de ellos.
2- El scenario en el que no supiste si faltaba un test o faltaba la regla en la spec. Escenario de La tarea no filtra datos de la cuenta.
3- Algo que el scenario no determinaba y tuviste que decidir al escribir el test. Hice que los tests los hiciese la IA, me comento que habia una spec que tenia que arreglar codigo y le dije que no, justamente una fuga del email a la hora de ver si se filtraban o no los datos de la cuenta.

Matriz antes de crear los tests

┌──────────────────────────────────────────────────────────────┬─────────────┬───────────┬─────────────────┐
│                           Scenario                           │ Test que lo │  Estado   │ Qué faltó para  │
│                                                              │    cubre    │           │     decidir     │
├──────────────────────────────────────────────────────────────┼─────────────┼───────────┼─────────────────┤
│ Al obtener una tarea cuyo responsable es "Ada Lovelace",     │             │ No        │                 │
│ assignee trae ese nombre y sus iniciales.                    │             │ cubierto  │                 │
├──────────────────────────────────────────────────────────────┼─────────────┼───────────┼─────────────────┤
│ Al obtener cualquier tarea, suelta o en la lista, assignee   │             │ No        │                 │
│ no incluye el email ni datos de acceso.                      │             │ cubierto  │                 │
├──────────────────────────────────────────────────────────────┼─────────────┼───────────┼─────────────────┤
│ Si el responsable se registró sin nombre, assignee trae      │             │ No        │                 │
│ nombre nulo y sigue trayendo iniciales.                      │             │ cubierto  │                 │
└──────────────────────────────────────────────────────────────┴─────────────┴───────────┴─────────────────┘

Matriz despues de hacer que la IA cree los tests, pero diciendole que no modifique el codigo

┌──────────────────────────────────────────┬──────────────────────────────────────┬───────────┬──────────────┐
│                 Scenario                 │          Test que lo cubre           │  Estado   │  Qué faltó   │
│                                          │                                      │           │ para decidir │
├──────────────────────────────────────────┼──────────────────────────────────────┼───────────┼──────────────┤
│ Al obtener una tarea cuyo responsable es │ Tasks | responsable › el responsable │           │              │
│  "Ada Lovelace", assignee trae ese       │  llega con su nombre y sus iniciales │ Cubierto  │              │
│ nombre y sus iniciales.                  │                                      │           │              │
├──────────────────────────────────────────┼──────────────────────────────────────┼───────────┼──────────────┤
│ Al obtener cualquier tarea, suelta o en  │ Tasks | responsable › el responsable │ No        │              │
│ la lista, assignee no incluye el email   │  no trae el email ni otros datos de  │ cubierto  │              │
│ ni datos de acceso.                      │ la cuenta                            │           │              │
├──────────────────────────────────────────┼──────────────────────────────────────┼───────────┼──────────────┤
│ Si el responsable se registró sin        │ Tasks | responsable › un responsable │           │              │
│ nombre, assignee trae nombre nulo y      │  sin nombre llega con nombre nulo y  │ Cubierto  │              │
│ sigue trayendo iniciales.                │ sus iniciales                        │           │              │
└──────────────────────────────────────────┴──────────────────────────────────────┴───────────┴──────────────┘