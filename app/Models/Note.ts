import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, HasOne, belongsTo, column, hasOne } from '@ioc:Adonis/Lucid/Orm'
import User from './User'
import Folder from './Folder'

export default class Note extends BaseModel {
  // auto incrementing id column
  @column({ isPrimary: true })
  public id: number

  @column()
  public title: string

  @column()
  public content: string

  @column()
  public slug: string

  @column()
  public tags: string[]

  @hasOne(() => User)
  public ownerId: HasOne<typeof User>

  @belongsTo(() => Folder)
  public folderId: BelongsTo<typeof Folder>

  @column()
  public isFriendOnly: boolean

  @column()
  public isPublic: boolean

  @column()
  public isPrivate: boolean

  @column()
  public isDeleted: boolean

  @column()
  public deletedAt: DateTime | null

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
