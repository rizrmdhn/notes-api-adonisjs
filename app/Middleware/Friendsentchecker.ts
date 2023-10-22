import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Database from '@ioc:Adonis/Lucid/Database'

export default class Friendsentchecker {
  public async handle({ auth, params, response }: HttpContextContract, next: () => Promise<void>) {
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

    if (userId === Number(params.id)) {
      response.status(400).send({
        meta: {
          status: 400,
          message: 'You cannot send friend request to yourself',
        },
      })
      return
    }

    const friendSent = await Database.from('friend_requests')
      .where('sender_id', userId)
      .where('receiver_id', params.id)
      .first()

    if (friendSent) {
      response.status(400).send({
        meta: {
          status: 400,
          message: 'You already sent a friend request to this user',
        },
      })
      return
    }

    await next()
  }
}
