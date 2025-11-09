import { registerAs } from '@nestjs/config';

export default registerAs(
    'database',
    (): Record<string, any> => ({
        url: process.env?.DATABASE_URL ?? 'mongodb://localhost:27017/blogora',
        debug: process.env.DATABASE_DEBUG === 'true',
        options: {
            // Connection timeout options
            serverSelectionTimeoutMS: 5000, // 5 secs 
            socketTimeoutMS: 45000, // 45 secs
            heartbeatFrequencyMS: 10000, // 10 secs 

            // Connection pool options
            maxPoolSize: 10, 
            minPoolSize: 2, 
            maxIdleTimeMS: 30000, // 30 secs 
            waitQueueTimeoutMS: 5000, // 5 secs 

            // Additional performance options
            bufferCommands: false, // Disable mongoose buffering
            retryWrites: true,
            w: 'majority',
        },
    }),
);
