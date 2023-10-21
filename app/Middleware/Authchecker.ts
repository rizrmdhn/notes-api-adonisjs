import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class Authchecker {
  public async handle({ auth, response }: HttpContextContract, next: () => Promise<void>) {
    // code for middleware goes here. ABOVE THE NEXT CALL
    if (!auth.use('api').isAuthenticated) {
      return response.unauthorized({
        meta: {
          status: 401,
          message: 'Unauthorized',
        },
      })
    }
    await next()
  }
}
