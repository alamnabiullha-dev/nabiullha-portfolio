import 'dotenv/config';
const required=['MONGODB_URI','JWT_ACCESS_SECRET','JWT_REFRESH_SECRET'];
for(const key of required) if(!process.env[key]) throw new Error(`Missing required environment variable: ${key}`);
if(process.env.NODE_ENV==='production' && (!process.env.CLIENT_ORIGIN || !process.env.ADMIN_INIT_TOKEN)) throw new Error('CLIENT_ORIGIN and ADMIN_INIT_TOKEN are required in production');
export const env=process.env;
