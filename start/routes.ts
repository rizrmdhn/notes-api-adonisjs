/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| This file is dedicated for defining HTTP routes. A single file is enough
| for majority of projects, however you can define routes in different
| files and just make sure to import them inside this file. For example
|
| Define routes in following two files
| ├── start/routes/cart.ts
| ├── start/routes/customer.ts
|
| and then import them inside `start/routes.ts` as follows
|
| import './routes/cart'
| import './routes/customer'
|
*/

import Route from '@ioc:Adonis/Core/Route'

Route.post('/login', `AuthController.login`)
Route.post('/logout', `AuthController.logout`)
Route.post('/register', `UsersController.store`)

Route.group(() => {
  Route.get('/users', `UsersController.index`)
  Route.get('/users/me', `UsersController.show`)

  Route.get('/notes/all', `NotesController.index`)
  Route.post('/notes', `NotesController.store`)
  Route.get('/notes', `NotesController.show`)
  Route.get('/notes/:slug', `NotesController.showBySlug`)
  Route.put('/notes/:id', `NotesController.update`)
  Route.delete('/notes/:id', `NotesController.destroy`)
  Route.post('/notes/:id/restore', `NotesController.restore`)

  Route.get('/categories', `CategoriesController.index`)
  Route.get('/categories/deleted', `CategoriesController.indexDeleted`)
  Route.post('/categories', `CategoriesController.store`).middleware(['categoriesChecker'])
  Route.get('/categories/:id', `CategoriesController.show`)
  Route.put('/categories/:id', `CategoriesController.update`)
  Route.delete('/categories/:id', `CategoriesController.destroy`)
  Route.post('/categories/:id/restore', `CategoriesController.restore`)
  Route.delete('/categories/:id/permanent-delete', `CategoriesController.permanentDelete`)
  Route.delete('/bulk-delete/categories', `CategoriesController.bulkDelete`)

  Route.get('/folders', `FoldersController.index`)
  Route.post('/folders', `FoldersController.store`).middleware(['createFolderCategoryChecker'])
  Route.get('/folders/:id', `FoldersController.show`)
  Route.put('/folders/:id', `FoldersController.update`)
  Route.delete('/folders/:id', `FoldersController.destroy`)
  Route.post('/folders/:id/restore', `FoldersController.restore`)

  Route.get('/friends', `FriendsController.index`)
  Route.post('/friends/:id', `FriendsController.store`).middleware([
    'friendRequestChecker',
    'friendSentChecker',
  ])
  Route.delete('/friends/:id', `FriendsController.destroy`)
  Route.post('/friends/:id/accept', `FriendsController.accept`)
  Route.post('/friends/:id/reject', `FriendsController.reject`)
  Route.post('/friends/:id/cancel', `FriendsController.cancel`)
}).middleware('auth')
