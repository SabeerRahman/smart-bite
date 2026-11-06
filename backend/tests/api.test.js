import { beforeAll, afterAll, afterEach, describe, expect, it } from 'vitest'
import request from 'supertest'
import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'
let mongo; let app
beforeAll(async () => { process.env.JWT_SECRET = 'test-secret-which-is-long-enough'; process.env.CLIENT_URL = 'http://localhost:5173'; mongo = await MongoMemoryServer.create(); process.env.MONGODB_URI = mongo.getUri(); const { connectDatabase } = await import('../src/config/db.js'); await connectDatabase(process.env.MONGODB_URI); app = (await import('../src/app.js')).default }, 180000)
afterEach(async () => { await mongoose.connection.db.dropDatabase() })
afterAll(async () => { await mongoose.disconnect(); if (mongo) await mongo.stop() }, 30000)
const donor = { name: 'Test Donor', email: 'donor@test.com', password: 'Password@1', role: 'DONOR' }
describe('authentication', () => { it('registers a donor and returns a token', async () => { const res = await request(app).post('/api/auth/register').send(donor); expect(res.status).toBe(201); expect(res.body.data.token).toBeTruthy() }); it('rejects duplicate email', async () => { await request(app).post('/api/auth/register').send(donor); expect((await request(app).post('/api/auth/register').send(donor)).status).toBe(409) }); it('rejects invalid login', async () => { await request(app).post('/api/auth/register').send(donor); expect((await request(app).post('/api/auth/login').send({ email: donor.email, password: 'wrong' })).status).toBe(401) }) })
describe('donations', () => { it('creates a donation for authenticated donor', async () => { const auth = await request(app).post('/api/auth/register').send(donor); const res = await request(app).post('/api/donations').set('Authorization', `Bearer ${auth.body.data.token}`).send({ foodName: 'Rice meals', category: 'COOKED_MEAL', description: 'Fresh vegetarian meal boxes.', quantity: 10, quantityUnit: 'SERVINGS', foodType: 'VEGETARIAN', expiresAt: new Date(Date.now() + 3600000).toISOString(), pickupAddress: '10 Main Street, Bengaluru', pickupWindow: '5–6 PM' }); expect(res.status).toBe(201); expect(res.body.data.status).toBe('AVAILABLE') }) })
