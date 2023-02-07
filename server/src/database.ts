import dotenv from 'dotenv';
import { Sequelize } from 'sequelize';

dotenv.config();

const db = new Sequelize(process.env.DB_DATABASE ?? '', process.env?.DB_USER ?? '', process.env.DB_PASSWORD ?? '', {
    host: process.env.DB_HOST ?? '',
    port: parseInt(process.env.DB_PORT ?? '0'),
    dialect: 'postgres'
});

authDatabase();

async function authDatabase(): Promise<void> {
    try {
        await db.authenticate();
        console.log('Connection has been established successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
}

async function syncDatabase(): Promise<void> {
    await db.sync();
}

export {
    syncDatabase
}
