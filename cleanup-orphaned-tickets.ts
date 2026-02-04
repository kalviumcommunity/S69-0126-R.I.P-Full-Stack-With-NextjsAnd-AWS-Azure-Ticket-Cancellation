import { Pool } from 'pg';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env' });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function cleanupOrphanedTickets() {
    const client = await pool.connect();

    try {
        console.log('Starting cleanup of orphaned tickets...');

        // Find and cancel tickets where the seat is no longer allocated
        const result = await client.query(`
      UPDATE "Ticket"
      SET status = 'CANCELLED'
      WHERE status = 'ACTIVE'
      AND NOT EXISTS (
        SELECT 1 FROM "Seat"
        WHERE "Seat"."allocatedUserId" = "Ticket"."userId"
        AND "Seat".status = 'BOOKED'
        AND "Seat"."seatNumber" = "Ticket"."seatNumber"
      );
    `);

        console.log(`✓ Cancelled ${result.rowCount} orphaned tickets`);

        console.log('\n✅ Cleanup completed successfully!');
    } catch (error) {
        console.error('❌ Cleanup failed:', error);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

cleanupOrphanedTickets()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
