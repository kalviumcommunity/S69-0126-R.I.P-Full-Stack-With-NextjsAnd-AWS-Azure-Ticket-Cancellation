// Set DATABASE_URL environment variable
process.env.DATABASE_URL = 'postgresql://ticketdb_prod_szra_user:Ttans3m5jD4WEF6lVQCmCcgtZ3GrfFmw@dpg-d5ssbm718n1s73fr67a0-a.singapore-postgres.render.com/ticketdb_prod_szra?sslmode=require';

const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function runMigration() {
  try {
    console.log('Adding source and destination columns to Cancellation table...');
    
    // Add columns if they don't exist
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "Cancellation" 
      ADD COLUMN IF NOT EXISTS source TEXT,
      ADD COLUMN IF NOT EXISTS destination TEXT;
    `);
    
    console.log('✓ Migration completed successfully!');
  } catch (error) {
    console.error('Migration error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

runMigration();
