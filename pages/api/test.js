
import { sql } from '@vercel/postgres'

export default async function handler(req, res) {
  try {
    // Test database connection
    const { rows } = await sql`SELECT NOW() as time`
    
    // List all tables
    const { rows: tables } = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `
    
    res.status(200).json({ 
      success: true, 
      message: '✅ Database connected!',
      serverTime: rows[0].time,
      tables: tables.map(t => t.table_name),
      environment: 'Vercel + Neon Postgres'
    })
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    })
  }
}
