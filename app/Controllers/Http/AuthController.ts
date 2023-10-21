// import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import { schema, rules } from '@ioc:Adonis/Core/Validator'

export default class AuthController {
  public async login({ auth, request, response }) {
    const { email, password } = request.body()

    const loginWithEmailSchema = schema.create({
      email: schema.string([rules.email()]),
      password: schema.string([rules.minLength(8)]),
    })

    const customMessage = {
      'required': 'The {{ field }} is required to login.',
      'email.email': 'The email must be a valid email address.',
      'password.minLength': 'The password must be at least 8 characters.',
    }

    await request.validate({ schema: loginWithEmailSchema, messages: customMessage })

    try {
      const token = await auth.use('api').attempt(email, password)

      return {
        meta: {
          status: 200,
          message: 'Success',
        },
        data: token,
      }
    } catch (e) {
      return response.badRequest({
        meta: {
          status: 400,
          message: 'Bad Request',
        },
        data: e.message,
      })
    }
  }

  public async logout({ auth }) {
    await auth.use('api').revoke()
    return {
      meta: {
        status: 200,
        message: 'Success',
      },
    }
  }
}
