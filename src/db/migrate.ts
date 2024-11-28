import db, { sql } from './index';

async function migrate() {
    try {
        await (await db).connect(async (connection) => {
            // Create users table
            await connection.query(
                sql.unsafe`
                    CREATE TABLE IF NOT EXISTS users (
                        passkey_user_id TEXT PRIMARY KEY,
                        username TEXT NOT NULL,
                        project_id TEXT NOT NULL
                    );
                `
            );

            // Create credentials table
            await connection.query(sql.unsafe`
                CREATE TABLE IF NOT EXISTS credentials (
                    credential_id TEXT PRIMARY KEY,
                    passkey_user_id TEXT NOT NULL REFERENCES users(passkey_user_id),
                    public_key TEXT NOT NULL,
                    counter INTEGER NOT NULL,
                    pub_key TEXT NOT NULL
                );
            `);

            // Create passkey_domains table
            await connection.query(sql.unsafe`
                CREATE TABLE IF NOT EXISTS passkey_domains (
                    id SERIAL PRIMARY KEY,
                    passkey_domain TEXT NOT NULL
                );
            `);

            // Verify tables exist
            const tables = await connection.query(sql.unsafe`
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public'
                AND table_name IN ('users', 'credentials', 'passkey_domains');
            `);

            console.log('Created tables:', tables.rows.map(r => r.table_name));
        });

        console.log('Migration completed successfully');
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    } finally {
        await (await db).end();
    }
}

migrate().then(() => {
    console.log("Migration completed successfully")
})
