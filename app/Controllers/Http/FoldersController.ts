import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import Database from '@ioc:Adonis/Lucid/Database'

export default class FoldersController {
  public async index({ auth, response }: HttpContextContract) {
    const userId = auth.use('api').user?.id
    if (!userId) {
      response.unauthorized({
        meta: {
          status: 401,
          message: 'Please login first',
        },
      })
      return
    }

    const folders = await Database.from('folders')
      .select('folders.*')
      .where('owner_id', userId)
      .returning('*')

    return response.status(200).send({
      meta: {
        status: 200,
        message: 'Success',
      },
      data: folders,
    })
  }

  public async store({ auth, request, response }: HttpContextContract) {
    const userId = auth.use('api').user?.id
    if (!userId) {
      response.unauthorized({
        meta: {
          status: 401,
          message: 'Please login first',
        },
      })
      return
    }

    const { name, catgoryId, isPublic, isPrivate, isFriendOnly } = request.only([
      'name',
      'catgoryId',
      'isPublic',
      'isPrivate',
      'isFriendOnly',
    ])

    const folderSchema = schema.create({
      name: schema.string({ trim: true }, [rules.maxLength(255)]),
      catgoryId: schema.number(),
      isPublic: schema.boolean.optional(),
      isPrivate: schema.boolean.optional(),
      isFriendOnly: schema.boolean.optional(),
    })

    const customMessages = {
      'name.required': 'Name is required',
      'name.maxLength': 'Name must not exceed 255 characters',
      'catgoryId.required': 'Category is required',
    }

    try {
      await request.validate({
        schema: folderSchema,
        messages: customMessages,
      })
    } catch (error) {
      response.badRequest({
        meta: {
          status: 400,
          message: 'Validation error',
        },
        data: error.messages,
      })
      return
    }

    const folder = await Database.table('folders')
      .insert({
        name,
        category_id: catgoryId,
        is_public: isPublic,
        is_private: isPrivate,
        is_friend_only: isFriendOnly,
        owner_id: userId,
      })
      .returning('*')

    return response.status(201).send({
      meta: {
        status: 201,
        message: 'Success',
      },
      data: folder,
    })
  }
}
