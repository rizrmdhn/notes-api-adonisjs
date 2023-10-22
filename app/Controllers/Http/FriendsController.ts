import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import Database from '@ioc:Adonis/Lucid/Database'

export default class FriendsController {
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

    const friend = await Database.from('friends')
      .select('friends.*')
      .where('user_id', userId)
      .then((friend) => {
        return friend
      })

    const friendRequest = await Database.from('friend_requests')
      .select('friend_requests.*')
      .where('receiver_id', userId)
      .then((friendRequest) => {
        return friendRequest
      })

    const friendSent = await Database.from('friend_requests')
      .select('friend_requests.*')
      .where('sender_id', userId)
      .then((friendSent) => {
        return friendSent
      })

    return response.status(200).send({
      meta: {
        status: 200,
        message: 'Success',
      },
      data: {
        friendList: friend,
        friendRequestList: friendRequest,
        friendSentList: friendSent,
      },
    })
  }

  public async store({ auth, params, response }: HttpContextContract) {
    const userId = auth.use('api').user?.id

    if (userId) {
      const friendRequest = await Database.table('friend_requests')
        .insert({
          sender_id: userId,
          receiver_id: params.id,
        })
        .returning('*')
      return response.status(200).send({
        meta: {
          status: 200,
          message: 'Success',
        },
        data: friendRequest,
      })
    }
  }
}
