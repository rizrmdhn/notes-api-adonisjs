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
      .where('is_deleted', false)
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

    const { name, categoryId, isPublic, isPrivate, isFriendOnly } = request.only([
      'name',
      'categoryId',
      'isPublic',
      'isPrivate',
      'isFriendOnly',
    ])

    const folderSchema = schema.create({
      name: schema.string({ trim: true }, [rules.maxLength(255)]),
      categoryId: schema.number(),
      isPublic: schema.boolean.optional(),
      isPrivate: schema.boolean.optional(),
      isFriendOnly: schema.boolean.optional(),
    })

    const customMessages = {
      'name.required': 'Name is required',
      'name.maxLength': 'Name must not exceed 255 characters',
      'categoryId.required': 'Category is required',
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
        category_id: categoryId,
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

  public async show({ auth, request, response }: HttpContextContract) {
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

    const { id } = request.params()

    if (isNaN(id)) {
      response.badRequest({
        meta: {
          status: 400,
          message: 'Id must be a number',
        },
      })
      return
    }

    const folder = await Database.from('folders')
      .select('folders.*')
      .where('id', id)
      .where('owner_id', userId)
      .first()

    if (!folder) {
      response.notFound({
        meta: {
          status: 404,
          message: 'Folder not found',
        },
      })
      return
    }

    return response.status(200).send({
      meta: {
        status: 200,
        message: 'Success',
      },
      data: folder,
    })
  }

  public async update({ auth, request, response }: HttpContextContract) {
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

    const { id } = request.params()
    const { name, categoryId, isPublic, isPrivate, isFriendOnly } = request.only([
      'name',
      'categoryId',
      'isPublic',
      'isPrivate',
      'isFriendOnly',
    ])

    if (isNaN(id)) {
      response.badRequest({
        meta: {
          status: 400,
          message: 'Id must be a number',
        },
      })
      return
    }

    const folderSchema = schema.create({
      name: schema.string({ trim: true }, [rules.maxLength(255)]),
      categoryId: schema.number(),
      isPublic: schema.boolean.optional(),
      isPrivate: schema.boolean.optional(),
      isFriendOnly: schema.boolean.optional(),
    })

    const customMessages = {
      'name.required': 'Name is required',
      'name.maxLength': 'Name must not exceed 255 characters',
      'categoryId.required': 'Category is required',
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

    const folder = await Database.from('folders')
      .select('folders.*')
      .where('id', id)
      .where('owner_id', userId)
      .first()

    if (!folder) {
      response.notFound({
        meta: {
          status: 404,
          message: 'Folder not found',
        },
      })
      return
    }

    const updatedFolder = await Database.from('folders')
      .where('id', id)
      .where('owner_id', userId)
      .update({
        name,
        category_id: categoryId,
        is_public: isPublic,
        is_private: isPrivate,
        is_friend_only: isFriendOnly,
        updated_at: 'now()',
      })
      .returning('*')

    return response.status(200).send({
      meta: {
        status: 200,
        message: 'Success',
      },
      data: updatedFolder,
    })
  }

  public async destroy({ auth, request, response }: HttpContextContract) {
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

    const { id } = request.params()

    if (isNaN(id)) {
      response.badRequest({
        meta: {
          status: 400,
          message: 'Id must be a number',
        },
      })
      return
    }

    const folder = await Database.from('folders')
      .select('folders.*')
      .where('id', id)
      .where('owner_id', userId)
      .first()

    if (!folder) {
      response.notFound({
        meta: {
          status: 404,
          message: 'Folder not found',
        },
      })
      return
    }

    await Database.from('folders').where('id', id).where('owner_id', userId).update({
      is_deleted: true,
      deleted_at: 'now()',
      updated_at: 'now()',
    })

    return response.status(200).send({
      meta: {
        status: 200,
        message: 'Success',
      },
    })
  }

  public async restore({ auth, request, response }: HttpContextContract) {
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

    const { id } = request.params()

    if (isNaN(id)) {
      response.badRequest({
        meta: {
          status: 400,
          message: 'Id must be a number',
        },
      })
      return
    }

    const folder = await Database.from('folders')
      .select('folders.*')
      .where('id', id)
      .where('owner_id', userId)
      .first()

    if (!folder) {
      response.notFound({
        meta: {
          status: 404,
          message: 'Folder not found',
        },
      })
      return
    }

    await Database.from('folders').where('id', id).where('owner_id', userId).update({
      is_deleted: false,
      deleted_at: null,
      updated_at: 'now()',
    })

    return response.status(200).send({
      meta: {
        status: 200,
        message: 'Success',
      },
    })
  }
}
