// import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import Database from '@ioc:Adonis/Lucid/Database'

export default class NotesController {
  public async index() {
    const notes = await Database.from('notes').select('*')
    return {
      meta: {
        status: 200,
        message: 'Success',
        total: notes.length,
      },
      data: notes,
    }
  }
}
