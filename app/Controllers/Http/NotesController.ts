// import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import Database from '@ioc:Adonis/Lucid/Database'

export default class NotesController {
  public async index({ auth }) {
    await auth.use('api').authenticate()
    const notes = await Database.from('notes').select('*')
    return {
      meta: {
        status: 200,
        message: 'Success',
        total: notes.length,
      },
      data: notes,
      auth: auth.user,
    }
  }

  public async store({ request }) {
    const { title, content } = request.body()
    const note = await Database.table('notes').insert({ title, content })
    return {
      meta: {
        status: 200,
        message: 'Success',
      },
      data: note,
    }
  }
}
