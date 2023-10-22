import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import Database from '@ioc:Adonis/Lucid/Database'

export default class CategoriesController {
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

    const categories = await Database.from('categories')
      .select('categories.*')
      .where('owner_id', userId)
      .where('is_deleted', false)
      .returning('*')

    return response.status(200).send({
      meta: {
        status: 200,
        message: 'Success',
      },
      data: categories,
    })
  }

  public async indexDeleted({ auth, response }: HttpContextContract) {
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

    const categories = await Database.from('categories')
      .select('categories.*')
      .where('owner_id', userId)
      .where('is_deleted', true)
      .returning('*')

    return response.status(200).send({
      meta: {
        status: 200,
        message: 'Success',
      },
      data: categories,
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

    const { name, isPublic, isPrivate, isFriendOnly } = request.only([
      'name',
      'isPublic',
      'isPrivate',
      'isFriendOnly',
    ])

    const categorySchema = schema.create({
      name: schema.string({ trim: true }, [rules.maxLength(255)]),
      isPublic: schema.boolean.optional(),
      isPrivate: schema.boolean.optional(),
      isFriendOnly: schema.boolean.optional(),
    })

    const customMessages = {
      'name.required': 'Name is required',
      'name.maxLength': 'Name must not exceed 255 characters',
    }

    try {
      await request.validate({ schema: categorySchema, messages: customMessages })
    } catch (error) {
      response.badRequest({
        meta: {
          status: 400,
          message: error.messages,
        },
      })
      return
    }

    try {
      const category = await Database.table('categories')
        .insert({
          name,
          owner_id: userId,
          is_public: isPublic,
          is_private: isPrivate,
          is_friend_only: isFriendOnly,
        })
        .returning('*')

      return response.status(201).send({
        meta: {
          status: 201,
          message: 'Success',
        },
        data: category[0],
      })
    } catch (error) {
      response.badRequest({
        meta: {
          status: 400,
          message: error.messages,
        },
      })
    }
  }

  public async show({ auth, params, response }: HttpContextContract) {
    const userId = auth.use('api').user?.id
    const { id } = params
    if (!userId) {
      response.unauthorized({
        meta: {
          status: 401,
          message: 'Please login first',
        },
      })
      return
    }

    if (isNaN(id)) {
      response.badRequest({
        meta: {
          status: 400,
          message: 'Id must be a number',
        },
      })
      return
    }

    const category = await Database.from('categories')
      .select('categories.*')
      .where('owner_id', userId)
      .andWhere('id', id)
      .andWhere('is_deleted', false)
      .first()

    if (!category) {
      response.notFound({
        meta: {
          status: 404,
          message: 'Category not found',
        },
      })
      return
    }

    return response.status(200).send({
      meta: {
        status: 200,
        message: 'Success',
      },
      data: category,
    })
  }

  public async update({ auth, params, request, response }: HttpContextContract) {
    const userId = auth.use('api').user?.id
    const { id } = params
    if (!userId) {
      response.unauthorized({
        meta: {
          status: 401,
          message: 'Please login first',
        },
      })
      return
    }

    if (isNaN(id)) {
      response.badRequest({
        meta: {
          status: 400,
          message: 'Id must be a number',
        },
      })
      return
    }

    const { name, isPublic, isPrivate, isFriendOnly } = request.only([
      'name',
      'isPublic',
      'isPrivate',
      'isFriendOnly',
    ])

    const categorySchema = schema.create({
      name: schema.string({ trim: true }, [rules.maxLength(255)]),
      isPublic: schema.boolean.optional(),
      isPrivate: schema.boolean.optional(),
      isFriendOnly: schema.boolean.optional(),
    })

    const customMessages = {
      'name.required': 'Name is required',
      'name.maxLength': 'Name must not exceed 255 characters',
    }

    try {
      await request.validate({ schema: categorySchema, messages: customMessages })
    } catch (error) {
      response.badRequest({
        meta: {
          status: 400,
          message: error.messages,
        },
      })
      return
    }

    const category = await Database.from('categories')
      .select('categories.*')
      .where('owner_id', userId)
      .andWhere('id', id)
      .first()

    if (!category) {
      response.notFound({
        meta: {
          status: 404,
          message: 'Category not found',
        },
      })
      return
    }

    const updatedCategory = await Database.from('categories')
      .where('id', id)
      .update({
        name,
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
      data: updatedCategory,
    })
  }

  public async destroy({ auth, params, response }: HttpContextContract) {
    const userId = auth.use('api').user?.id
    const { id } = params

    if (!userId) {
      response.unauthorized({
        meta: {
          status: 401,
          message: 'Please login first',
        },
      })
      return
    }

    if (isNaN(id)) {
      response.badRequest({
        meta: {
          status: 400,
          message: 'Id must be a number',
        },
      })
      return
    }

    const category = await Database.from('categories')
      .select('categories.*')
      .where('owner_id', userId)
      .andWhere('id', id)
      .first()

    if (!category) {
      response.notFound({
        meta: {
          status: 404,
          message: 'Category not found',
        },
      })
      return
    }

    try {
      await Database.from('categories').where('id', id).update({
        is_deleted: true,
        updated_at: 'now()',
        deleted_at: 'now()',
      })
    } catch (error) {
      response.badRequest({
        meta: {
          status: 400,
          message: error.messages,
        },
      })
    }

    return response.status(200).send({
      meta: {
        status: 200,
        message: 'Success',
      },
    })
  }

  public async restore({ auth, params, response }: HttpContextContract) {
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

    try {
      await Database.from('categories').where('id', params.id).update({
        is_deleted: false,
        updated_at: 'now()',
        deleted_at: null,
      })
    } catch (error) {
      response.badRequest({
        meta: {
          status: 400,
          message: error.messages,
        },
      })
    }

    return response.status(200).send({
      meta: {
        status: 200,
        message: 'Success',
      },
    })
  }

  public async permanentDelete({ auth, params, response }: HttpContextContract) {
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

    try {
      await Database.from('categories').where('id', params.id).delete()
    } catch (error) {
      response.badRequest({
        meta: {
          status: 400,
          message: error.messages,
        },
      })
    }

    return response.status(200).send({
      meta: {
        status: 200,
        message: 'Success',
      },
    })
  }

  public async bulkDelete({ auth, request, response }: HttpContextContract) {
    const userId = auth.use('api').user?.id
    const { id } = request.only(['id'])

    if (!userId) {
      response.unauthorized({
        meta: {
          status: 401,
          message: 'Please login first',
        },
      })
      return
    }

    const schemaId = schema.create({
      id: schema.array().members(schema.number()),
    })

    const customMessages = {
      'id.required': 'Id is required',
    }

    try {
      await request.validate({ schema: schemaId, messages: customMessages })
    } catch (error) {
      response.badRequest({
        meta: {
          status: 400,
          message: error.messages,
        },
      })
      return
    }

    try {
      id.forEach(async (categoryId: number) => {
        await Database.from('categories')
          .where('id', categoryId)
          .andWhere('owner_id', userId)
          .update({
            is_deleted: true,
            updated_at: 'now()',
            deleted_at: 'now()',
          })
      })
    } catch (error) {
      response.badRequest({
        meta: {
          status: 400,
          message: error.messages,
        },
      })
      return
    }

    return response.status(200).send({
      meta: {
        status: 200,
        message: 'Success',
      },
    })
  }
}
