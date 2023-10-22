import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import Database from '@ioc:Adonis/Lucid/Database'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import Hash from '@ioc:Adonis/Core/Hash'

export default class UsersController {
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

    const users = await Database.from('users')
      .select('id', 'name', 'email', 'username', 'created_at', 'updated_at')
      .whereNot('id', userId)
      .returning('*')

    return response.status(200).send({
      meta: {
        status: 200,
        message: 'Success',
      },
      data: users,
    })
  }

  public async store({ request }: HttpContextContract) {
    const { name, email, username, password } = request.body()

    const registerSchema = schema.create({
      name: schema.string([rules.minLength(3), rules.maxLength(100)]),
      email: schema.string([rules.email(), rules.unique({ table: 'users', column: 'email' })]),
      username: schema.string([
        rules.minLength(3),
        rules.maxLength(50),
        rules.unique({ table: 'users', column: 'username' }),
      ]),
      password: schema.string([rules.minLength(8)]),
    })

    const customMessage = {
      'required': 'The {{ field }} is required to register.',
      'name.minLength': 'The name must be at least 3 characters.',
      'name.maxLength': 'The name must be less than 100 characters.',
      'email.email': 'The email must be a valid email address.',
      'email.unique': 'The email has already been taken.',
      'username.minLength': 'The username must be at least 3 characters.',
      'username.maxLength': 'The username must be less than 50 characters.',
      'username.unique': 'The username has already been taken.',
      'password.minLength': 'The password must be at least 8 characters.',
    }

    await request.validate({ schema: registerSchema, messages: customMessage })

    const encryptedPassword = await Hash.make(password)

    const user = await Database.table('users')
      .insert({ name, email, username, password: encryptedPassword })
      .returning(['id', 'name', 'email', 'username', 'created_at', 'updated_at'])

    return {
      meta: {
        status: 200,
        message: 'Success',
      },
      data: user,
    }
  }

  public async show({ auth, response }: HttpContextContract) {
    const userId = auth.use('api').user?.id

    if (userId) {
      const user = await Database.from('users')
        .select('id', 'name', 'email', 'username', 'created_at', 'updated_at')
        .where('id', userId)
        .first()

      return response.status(200).send({
        meta: {
          status: 200,
          message: 'Success',
        },
        data: user,
      })
    }

    return response.unauthorized({
      meta: {
        status: 401,
        message: 'Please login first',
      },
    })
  }
}
