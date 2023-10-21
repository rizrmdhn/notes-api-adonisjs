import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import User from './User'

export default class Category extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public name: string

  @belongsTo(() => User)
  public ownerId: BelongsTo<typeof User>

  @column()
  public isPublic: boolean

  @column()
  public isPrivate: boolean

  @column()
  public isFriendOnly: boolean

  @column()
  public isDeleted: boolean

  @column()
  public deletedAt: DateTime | null

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
