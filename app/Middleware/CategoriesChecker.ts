import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Database from '@ioc:Adonis/Lucid/Database'

export default class CategoriesChecker {
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

    const { name } = request.only(['name'])

    const categoriesInDatabase = await Database.from('categories')
      .select('categories.*')
      .where('owner_id', userId)
      .where('name', name)
      .returning('*')

    if (categoriesInDatabase.length > 0) {
      response.badRequest({
        meta: {
          status: 400,
          message: 'Category already exists',
        },
      })
      return
    }

    await next()
  }
}
