import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Database from '@ioc:Adonis/Lucid/Database'

export default class Createfoldercategorychecker {
  public async handle({ auth, request, response }: HttpContextContract, next: () => Promise<void>) {
    // code for middleware goes here. ABOVE THE NEXT CALL
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

    const { categoryId } = request.only(['categoryId'])

    const category = await Database.from('categories')
      .select('categories.*')
      .where('id', categoryId)
      .where('owner_id', userId)
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

    await next()
  }
}
