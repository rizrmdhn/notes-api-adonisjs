// import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import Database from '@ioc:Adonis/Lucid/Database'
import { schema, rules } from '@ioc:Adonis/Core/Validator'

export default class NotesController {
  public async index({ auth, request }) {
    const { page } = request.qs()
    const notes = await Database.from('notes')
      .select('notes.*', Database.raw('tags::text[] as tags'))
      .where('owner_id', auth.use('api').user?.id)
      .andWhere('is_deleted', false)
      .paginate(page || 1, 10)

    return {
      meta: {
        status: 200,
        message: 'Success',
      },
      data: notes,
    }
  }

  public async store({ request, auth }) {
    const { title, content, tags, folderId, isFriendOnly, isPrivate, isPublic } = request.body()

    const createNoteSchema = schema.create({
      title: schema.string([rules.minLength(3), rules.maxLength(100)]),
      content: schema.string([rules.minLength(3)]),
      tags: schema.array().members(schema.string()),
      folderId: schema.number.optional(),
      isFriendOnly: schema.boolean.optional(),
      isPrivate: schema.boolean.optional(),
      isPublic: schema.boolean.optional(),
    })

    const customMessage = {
      'required': 'The {{ field }} is required to create a note.',
      'title.minLength': 'The title must be at least 3 characters.',
      'title.maxLength': 'The title must be less than 100 characters.',
      'content.minLength': 'The content must be at least 3 characters.',
    }

    await request.validate({ schema: createNoteSchema, messages: customMessage })

    const slug = title
      .toLowerCase()
      .replace(/ /g, '-')
      .replace(/[^\w-]+/g, '')
      .concat('-', Math.floor(Math.random() * 1000000))

    const note = await Database.table('notes')
      .insert({
        title,
        content,
        tags,
        slug,
        folder_id: folderId,
        owner_id: auth.use('api').user?.id,
        is_friend_only: isFriendOnly,
        is_private: isPrivate,
        is_public: isPublic,
      })
      .returning([
        'id',
        'title',
        'content',
        'slug',
        'tags',
        'folder_id',
        'owner_id',
        'is_friend_only',
        'is_private',
        'is_public',
        'created_at',
        'updated_at',
      ])
      .then((note) => {
        return note.map((note) => {
          note.tags = note.tags.replace(/"/g, '').replace('{', '').replace('}', '').split(',')
          return note
        })
      })

    return {
      meta: {
        status: 200,
        message: 'Success',
      },
      data: note[0],
    }
  }
}
