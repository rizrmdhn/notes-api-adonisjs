import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'notes'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()

      /**
       * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.string('title').notNullable()
      table.text('content').notNullable()
      table.string('slug').notNullable().unique()
      table.text('tags', 'text[]').nullable()
      table.integer('owner_id').unsigned().references('id').inTable('users').onDelete('CASCADE')
      table.integer('folder_id').unsigned().references('id').inTable('folders').onDelete('CASCADE')
      table.boolean('is_friend_only').defaultTo(false).notNullable()
      table.boolean('is_public').defaultTo(false).notNullable()
      table.boolean('is_private').defaultTo(true).notNullable()
      table.timestamp('created_at', { useTz: true }).defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true })
      table.timestamp('deleted_at', { useTz: true }).nullable()
      table.boolean('is_deleted').defaultTo(false).notNullable()
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
