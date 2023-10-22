import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Database from '@ioc:Adonis/Lucid/Database'

export default class Friendrequestchecker {
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

    const friendRequest = await Database.from('friend_requests')
      .where('sender_id', params.id)
      .where('receiver_id', userId)
      .first()

    if (friendRequest) {
      response.status(400).send({
        meta: {
          status: 400,
          message: 'You already received a friend request from this user',
        },
      })
      return
    }

    await next()
  }
}
