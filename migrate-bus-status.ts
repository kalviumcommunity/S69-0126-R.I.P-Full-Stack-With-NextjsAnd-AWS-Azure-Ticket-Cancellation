import { Pool } from 'pg';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env' });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function migrate() {
    const client = await pool.connect();

    try {
        console.log('Starting migration...');

        // Create BusStatus enum
        await client.query(`
      DO $$ BEGIN
        CREATE TYPE "BusStatus" AS ENUM ('ACTIVE', 'CANCELLED', 'COMPLETED');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);
        console.log('✓ Created BusStatus enum');

        // Add status column to Bus table
        await client.query(`
      ALTER TABLE "Bus" 
      ADD COLUMN IF NOT EXISTS "status" "BusStatus" NOT NULL DEFAULT 'ACTIVE';
    `);
        console.log('✓ Added status column to Bus table');

        // Create index on status
        await client.query(`
      CREATE INDEX IF NOT EXISTS "Bus_status_idx" ON "Bus"("status");
    `);
        console.log('✓ Created index on status column');

        console.log('\n✅ Migration completed successfully!');
    } catch (error) {
        console.error('❌ Migration failed:', error);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

migrate()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
