const db = require('../data/dbConfig')
const server = require('./server')
const request = require('supertest')

beforeAll(async () => {
  await db.migrate.rollback()
  await db.migrate.latest()
})

beforeEach(async () => {
  await db('users').truncate()
  await db('users').insert([
    {username: 'Cameron1', password: '$2a$08$oivKM/RbOt17feGgIS/yoObj6L/X9wdSXPrIj8cly5m4aL61n.GDC'}, // test1
    {username: 'Cameron2', password: '$2a$08$pp7RHDwes8d7jLbNn13hqu1uu.r3tASkULpjNfntIuj695XLQGcKS'}, // test2
    {username: 'Cameron3', password: '$2a$08$AEPVNaMJ/QAEM1QGgVX/XuZ2plZ3tjB1BYAtti1N8wHJkjrqRXGcy'} // test3
  ])
})

afterAll(async () => {
  await db.destroy()
})

describe('Server.js Test', () => {
  describe('[Post] /register', () => {
    test('[1] Creates a new user in the database' , async () => {
      await request(server).post('/api/auth/register').send({username: 'Cameron4', password: 'test4'})
      const user = await db('users').where('id', 4).first()
      expect(user).toMatchObject({username: 'Cameron4', id: 4})
    })
    test('[2] Responds correctly if username already exists', async () => {
      const res = await request(server).post('/api/auth/register').send({username: 'Cameron1', password: 'test1'})
      expect(res.body.message).toMatch('Username Taken')
    })
    test('[3] On new user responds with the user object', async () => {
      let res = await request(server).post('/api/auth/register').send({username: 'Cameron4', password: 'test4'})
      expect(res.body).toMatchObject({username: 'Cameron4', id: 4})
    })
  })
  describe('[Post] /login', () => {
    test('[1] User can log in', async () => {
      const user = {username: 'Cameron5', password: 'test5'}
      const register = await request(server).post('/api/auth/register').send(user)
      const login = await request(server).post('/api/auth/login').send(user)
      expect(login.body.message).toBe(`Welcome ${register.body.username}`)
    })
    test('[2] Responds correctly if password or username are wrong', async () => {
      const user = {username: 'Cameron2', password: 'wrongpass'}
      const login = await request(server).post('/api/auth/login').send(user)
      expect(login.body.message).toBe('Invalid Credentials')
    })
    test('[3] Responds correctly if password or username are missing', async () => {
      const user = {username: '', password: ''}
      const login = await request(server).post('/api/auth/login').send(user)
      expect(login.body.message).toBe('Username and password are required')
    })
  })
}) 