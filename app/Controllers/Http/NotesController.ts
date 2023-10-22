import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import Database from '@ioc:Adonis/Lucid/Database'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import Env from '@ioc:Adonis/Core/Env'

export default class NotesController {
  public async index({ auth, response }: HttpContextContract) {
    const userId = auth.use('api').user?.id
    if (!userId) {
      return response.unauthorized({
        meta: {
          status: 401,
          message: 'Please login first',
        },
      })
    }

    const notes = await Database.from('notes')
      .select('notes.*', Database.raw('tags::text[] as tags'))
      .where('owner_id', userId)
      .andWhere('is_deleted', false)
      .then((notes) => {
        return notes.map((note) => {
          note.slug = Env.get('APP_URL') + '/notes/' + note.slug
          return note
        })
      })

    return response.status(200).send({
      meta: {
        status: 200,
        message: 'Success',
      },
      data: notes,
    })
  }

  public async store({ request, auth, response }: HttpContextContract) {
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

    try {
      await request.validate({ schema: createNoteSchema, messages: customMessage })
    } catch (error) {
      return response.status(400).send({
        meta: {
          status: 400,
          message: 'Validation error',
        },
        data: error.messages,
      })
    }

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

    return response.status(200).send({
      meta: {
        status: 200,
        message: 'Success',
      },
      data: note[0],
    })
  }

  public async show({ request, auth, response }: HttpContextContract) {
    const userId = auth.use('api').user?.id
    if (!userId) {
      return response.unauthorized({
        meta: {
          status: 401,
          message: 'Please login first',
        },
      })
    }

    const { id, slug } = request.qs()
    let note = null as any
    if (id) {
      note = await Database.from('notes')
        .select('notes.*', Database.raw('tags::text[] as tags'))
        .where('id', id)
        .andWhere('is_deleted', false)
        .first()

      note.slug = Env.get('APP_URL') + '/notes/' + note.slug

      if (note) {
        if (note.is_private && note.owner_id !== auth.use('api').user?.id) {
          return {
            meta: {
              status: 403,
              message: 'Forbidden access or note is private please ask the owner for access',
            },
          }
        }

        if (note.is_friend_only && note.owner_id !== auth.use('api').user?.id) {
          const isFriend = await Database.from('friends')
            .where('user_id', userId)
            .andWhere('friend_id', note.owner_id)
            .first()

          if (!isFriend) {
            return {
              meta: {
                status: 403,
                message: 'Forbidden access or note is friend only please ask the owner for access',
              },
            }
          }
        }

        if (note.is_public) {
          note.slug = Env.get('APP_URL') + '/notes/' + note.slug
          return {
            meta: {
              status: 200,
              message: 'Success',
            },
            data: note,
          }
        }
      }
    }

    if (slug) {
      note = await Database.from('notes')
        .select('notes.*', Database.raw('tags::text[] as tags'))
        .where('slug', slug)
        .andWhere('owner_id', userId)
        .andWhere('is_deleted', false)
        .first()
    }

    if (!note) {
      return response.status(404).send({
        meta: {
          status: 404,
          message: 'Note not found',
        },
      })
    }

    return response.status(200).send({
      meta: {
        status: 200,
        message: 'Success',
      },
      data: note,
    })
  }

  public async showBySlug({ params, auth, response }: HttpContextContract) {
    const userId = auth.use('api').user?.id
    if (!userId) {
      return response.unauthorized({
        meta: {
          status: 401,
          message: 'Please login first',
        },
      })
    }

    const note = await Database.from('notes')
      .select('notes.*', Database.raw('tags::text[] as tags'))
      .where('slug', params.slug)
      .andWhere('owner_id', userId)
      .andWhere('is_deleted', false)
      .first()

    if (!note) {
      return response.status(404).send({
        meta: {
          status: 404,
          message: 'Note not found',
        },
      })
    }

    return response.status(200).send({
      meta: {
        status: 200,
        message: 'Success',
      },
      data: note,
    })
  }

  public async update({ request, params, auth, response }: HttpContextContract) {
    const userId = auth.use('api').user?.id
    if (!userId) {
      return response.unauthorized({
        meta: {
          status: 401,
          message: 'Please login first',
        },
      })
    }

    let { title, content, tags, folderId, isFriendOnly, isPrivate, isPublic } = request.body()

    const updateNoteSchema = schema.create({
      title: schema.string.optional([rules.minLength(3), rules.maxLength(100)]),
      content: schema.string.optional([rules.minLength(3)]),
      tags: schema.array.optional().members(schema.string()),
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

    try {
      await request.validate({ schema: updateNoteSchema, messages: customMessage })
    } catch (error) {
      return response.status(400).send({
        meta: {
          status: 400,
          message: 'Validation error',
        },
        data: error.messages,
      })
    }

    if (isPrivate && isPublic) {
      return {
        meta: {
          status: 400,
          message: 'Note cannot be private and public at the same time',
        },
      }
    }

    if (isPrivate) {
      isPublic = false
    } else if (isPublic) {
      isPrivate = false
    }

    const note = await Database.from('notes')
      .where('id', params.id)
      .andWhere('owner_id', userId)
      .andWhere('is_deleted', false)
      .update({
        title,
        content,
        tags,
        folder_id: folderId,
        is_friend_only: isFriendOnly,
        is_private: isPrivate,
        is_public: isPublic,
        updated_at: 'now()',
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
        'deleted_at',
        'is_deleted',
      ])
      .then((note) => {
        return note.map((note) => {
          note.tags = note.tags.replace(/"/g, '').replace('{', '').replace('}', '').split(',')
          return note
        })
      })

    return response.status(200).send({
      meta: {
        status: 200,
        message: 'Success',
      },
      data: note[0],
    })
  }

  public async destroy({ params, auth, response }: HttpContextContract) {
    const userId = auth.use('api').user?.id
    if (!userId) {
      return response.unauthorized({
        meta: {
          status: 401,
          message: 'Please login first',
        },
      })
    }
    const note = await Database.from('notes')
      .where('id', params.id)
      .andWhere('owner_id', userId)
      .andWhere('is_deleted', false)
      .update({
        is_deleted: true,
        deleted_at: 'now()',
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
        'deleted_at',
        'is_deleted',
      ])
      .then((note) => {
        return note.map((note) => {
          note.tags = note.tags.replace(/"/g, '').replace('{', '').replace('}', '').split(',')
          return note
        })
      })

    return response.status(200).send({
      meta: {
        status: 200,
        message: 'Success',
      },
      data: note[0],
    })
  }

  public async restore({ params, auth, response }: HttpContextContract) {
    const userId = auth.use('api').user?.id
    if (!userId) {
      return response.unauthorized({
        meta: {
          status: 401,
          message: 'Please login first',
        },
      })
    }
    const note = await Database.from('notes')
      .where('id', params.id)
      .andWhere('owner_id', userId)
      .andWhere('is_deleted', true)
      .update({
        is_deleted: false,
        deleted_at: null,
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
        'deleted_at',
        'is_deleted',
      ])
      .then((note) => {
        return note.map((note) => {
          note.tags = note.tags.replace(/"/g, '').replace('{', '').replace('}', '').split(',')
          return note
        })
      })

    return response.status(200).send({
      meta: {
        status: 200,
        message: 'Success',
      },
      data: note[0],
    })
  }
}
