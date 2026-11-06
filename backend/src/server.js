import 'dotenv/config'
import app from './app.js'
import { connectDatabase } from './config/db.js'
const port = process.env.PORT || 5000
if (!process.env.MONGODB_URI || !process.env.JWT_SECRET) { console.error('MONGODB_URI and JWT_SECRET must be set. Copy .env.example to .env.'); process.exit(1) }
connectDatabase(process.env.MONGODB_URI).then(() => app.listen(port, () => console.log(`SmartBite API listening on ${port}`))).catch((error) => { console.error('Database connection failed:', error.message); process.exit(1) })
