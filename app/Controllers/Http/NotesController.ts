// import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import Database from '@ioc:Adonis/Lucid/Database'

export default class NotesController {
  public async index({ auth }) {
    await auth.use('api').authenticate()

    const notes = await Database.from('notes')
      .select('*')
      .where('owner_id', auth.use('api').user?.id)
    return {
      meta: {
        status: 200,
        message: 'Success',
      },
      data: notes,
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
