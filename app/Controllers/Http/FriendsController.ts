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
    let friend = null as any

    friend = await Database.from('friends')
      .join('users', 'friends.user_id', '=', 'users.id')
      .join('users as friend', 'friends.friend_id', '=', 'friend.id')
      .select(
        'friend.id as friend_id',
        'friend.username as friend_username',
        'friend.email as friend_email'
      )
      .where('user_id', userId)
      .returning('*')

    if (friend.length === 0) {
      friend = await Database.from('friends')
        .join('users', 'friends.user_id', '=', 'users.id')
        .join('users as friend', 'friends.user_id', '=', 'friend.id')
        .select(
          'friend.id as friend_id',
          'friend.username as friend_username',
          'friend.email as friend_email'
        )
        .where('friend_id', userId)
        .returning('*')
    }

    const friendRequest = await Database.from('friend_requests')
      .join('users', 'friend_requests.sender_id', '=', 'users.id')
      .select('users.id', 'users.username', 'users.email')
      .where('receiver_id', userId)
      .then((friendRequest) => {
        return friendRequest
      })

    const friendSent = await Database.from('friend_requests')
      .join('users', 'friend_requests.sender_id', '=', 'users.id')
      .select('users.id', 'users.username', 'users.email')
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

  public async destroy({ auth, params, response }: HttpContextContract) {
    const userId = auth.use('api').user?.id

    if (userId === Number(params.id)) {
      return response.status(400).send({
        meta: {
          status: 400,
          message: 'You cannot unfriend yourself',
        },
      })
    }

    if (userId) {
      let friend = null as any
      friend = await Database.from('friends')
        .where('user_id', params.id)
        .where('friend_id', userId)
        .delete()

      if (!friend) {
        friend = await Database.from('friends')
          .where('user_id', userId)
          .where('friend_id', params.id)
          .delete()

        if (!friend) {
          return response.status(400).send({
            meta: {
              status: 400,
              message: 'Friend not found',
            },
          })
        }
      }

      return response.status(200).send({
        meta: {
          status: 200,
          message: 'Success',
        },
      })
    }
  }

  public async accept({ auth, params, response }: HttpContextContract) {
    const userId = auth.use('api').user?.id

    if (userId) {
      const friendRequest = await Database.from('friend_requests')
        .where('sender_id', params.id)
        .where('receiver_id', userId)
        .delete()

      if (!friendRequest) {
        return response.status(400).send({
          meta: {
            status: 400,
            message: 'Friend request not found',
          },
        })
      }

      const friend = await Database.table('friends')
        .insert({
          user_id: userId,
          friend_id: params.id,
        })
        .returning('*')
      return response.status(200).send({
        meta: {
          status: 200,
          message: 'Success',
        },
        data: friend,
      })
    }
  }

  public async reject({ auth, params, response }: HttpContextContract) {
    const userId = auth.use('api').user?.id

    if (userId) {
      const friendRequest = await Database.from('friend_requests')
        .where('sender_id', params.id)
        .where('receiver_id', userId)
        .delete()

      if (!friendRequest) {
        return response.status(400).send({
          meta: {
            status: 400,
            message: 'Friend request not found',
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
  }

  public async cancel({ auth, params, response }: HttpContextContract) {
    const userId = auth.use('api').user?.id

    if (userId) {
      const friendRequest = await Database.from('friend_requests')
        .where('sender_id', userId)
        .where('receiver_id', params.id)
        .delete()

      if (!friendRequest) {
        return response.status(400).send({
          meta: {
            status: 400,
            message: 'Friend request not found',
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
  }
}
