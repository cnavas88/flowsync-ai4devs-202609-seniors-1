import User from '#models/user'
import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'

/**
 * Lo que una tarea enseña de su responsable. Cubre los tres scenarios del
 * requisito «Lo que cada tarea muestra de su responsable» de
 * `openspec/specs/tasks/spec.md`: nombre e iniciales para identificarlo, ningún
 * dato de cuenta más, y la cuenta sin nombre que sigue teniendo iniciales.
 *
 * La tarea se crea por la API y no con el modelo a propósito: así nace a nombre
 * de quien tiene la sesión, que es el único camino real por el que una cuenta
 * acaba siendo responsable de algo.
 */
test.group('Tasks | responsable', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  // La tarea suelta exige el día de quien mira; aquí da igual cuál sea.
  const hoy = '2026-10-06'

  async function sesion(client: any, fullName: string | null, email = 'ada@example.com') {
    await User.create({ fullName, email, password: 'secreto123' })

    const response = await client.post('/api/v1/auth/login').json({ email, password: 'secreto123' })

    return response.body().data.token as string
  }

  async function crearTarea(client: any, token: string) {
    const response = await client
      .post('/api/v1/tasks')
      .header('Authorization', `Bearer ${token}`)
      .json({ title: 'Revisar el informe' })

    return response.body().data.id as number
  }

  test('el responsable llega con su nombre y sus iniciales', async ({ client, assert }) => {
    const token = await sesion(client, 'Ada Lovelace')
    const id = await crearTarea(client, token)

    const response = await client
      .get(`/api/v1/tasks/${id}`)
      .header('Authorization', `Bearer ${token}`)
      .qs({ today: hoy })

    response.assertStatus(200)

    const { assignee } = response.body().data
    assert.equal(assignee.fullName, 'Ada Lovelace')
    assert.equal(assignee.initials, 'AL')
  })

  test('el responsable no trae el email ni otros datos de la cuenta', async ({
    client,
    assert,
  }) => {
    const token = await sesion(client, 'Ada Lovelace')
    const id = await crearTarea(client, token)

    // El scenario dice «suelta o dentro de la lista»: se comprueban las dos.
    const suelta = await client
      .get(`/api/v1/tasks/${id}`)
      .header('Authorization', `Bearer ${token}`)
      .qs({ today: hoy })
    const lista = await client.get('/api/v1/tasks').header('Authorization', `Bearer ${token}`)

    suelta.assertStatus(200)
    lista.assertStatus(200)

    // El registro tipa el `data` de la lista como «una tarea o varias»; aquí es
    // siempre la lista.
    const tareas = lista.body().data as Array<{ id: number; assignee?: object }>
    const enLista = tareas.find((task) => task.id === id)

    for (const assignee of [suelta.body().data.assignee, enLista?.assignee]) {
      assert.notProperty(assignee, 'email')
      assert.notProperty(assignee, 'password')
      assert.notInclude(JSON.stringify(assignee), 'ada@example.com')
    }
  })

  test('un responsable sin nombre llega con nombre nulo y sus iniciales', async ({
    client,
    assert,
  }) => {
    const token = await sesion(client, null)
    const id = await crearTarea(client, token)

    const response = await client
      .get(`/api/v1/tasks/${id}`)
      .header('Authorization', `Bearer ${token}`)
      .qs({ today: hoy })

    response.assertStatus(200)

    const { assignee } = response.body().data
    assert.isNull(assignee.fullName)
    assert.equal(assignee.initials, 'AE')
  })
})
