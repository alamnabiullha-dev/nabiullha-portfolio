
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';

import { env } from './config/env.js';
import connectDB from './config/db.js';
import { notFound, errorHandler } from './middleware/errors.js';
import { issueCsrf, checkCsrf } from './middleware/csrf.js';

import authRoutes from './routes/auth.js';
import publicRoutes from './routes/public.js';
import adminRoutes from './routes/admin.js';
import contactRoutes from './routes/contact.js';

import {
    Profile,
    Education,
    Skill,
    Project,
    WebsiteSettings
} from './models/index.js';

const app = express();

app.set('trust proxy', 1);
app.disable('x-powered-by');

app.use(
    helmet({
        crossOriginResourcePolicy: {
            policy: 'cross-origin'
        }
    })
);

const allowed = [
    env.CLIENT_ORIGIN,
    'https://nabiullha-portfolio.vercel.app',
    'http://localhost:5173',
    'http://127.0.0.1:5180',
]
    .filter(Boolean)
    .flatMap(origin => origin.split(','))
    .map(origin => origin.trim().replace(/\/+$/, ''));

app.use(
    cors({
        origin: (origin, cb) => {
            if (!origin) {
                return cb(null, true);
            }

            const normalizedOrigin = origin.replace(/\/+$/, '');

            if (allowed.includes(normalizedOrigin)) {
                return cb(null, true);
            }

            console.error('Origin not allowed:', origin);
            return cb(new Error('Origin not allowed'));
        },
        credentials: true,
    })
);
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());

app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

app.get('/api/auth/csrf', issueCsrf);

app.use('/api', checkCsrf);

app.use(
    '/api/auth',
    rateLimit({
        windowMs: 15 * 60 * 1000,
        limit: 20,
        standardHeaders: true,
        legacyHeaders: false
    }),
    authRoutes
);

app.use('/api/public', publicRoutes);

app.use(
    '/api/contact',
    rateLimit({
        windowMs: 15 * 60 * 1000,
        limit: 5,
        standardHeaders: true,
        legacyHeaders: false
    }),
    contactRoutes
);

app.use('/api/admin', adminRoutes);

app.use(notFound);
app.use(errorHandler);

// Seed initial portfolio data
async function seed() {
    if (!await Profile.exists({})) {
        await Profile.create({
            name: 'Nabiullha Alam',
            headline: 'Aspiring Software Engineer · MERN Stack Developer',
            heroText: 'I’m a BCA Data Science student building thoughtful web applications and strengthening my foundations in software engineering, data structures, and full-stack development.',
            about: 'I’m an aspiring Software Engineer pursuing a BCA in Data Science at SRM Institute of Science and Technology, Tiruchirappalli. I enjoy solving problems with Java and building useful products with modern web technologies.',
            email: 'alamnabiullha@gmail.com',
            location: 'Tiruchirappalli, Tamil Nadu, India',
            githubUrl: 'https://github.com/alamnabiullha-dev',
            linkedinUrl: 'https://linkedin.com/in/nabiullha-alam-436499390/',
            available: true
        });
    }

    if (!await Education.exists({})) {
        await Education.create({
            institution: 'SRM Institute of Science and Technology (SRMIST)',
            degree: 'BCA',
            field: 'Data Science',
            location: 'Tiruchirappalli, Tamil Nadu',
            score: '8.30 / 10 CGPA',
            period: '',
            order: 0,
            isPublic: true
        });
    }

    if (!await Skill.exists({})) {
        await Skill.insertMany([
            ['Java', 'Programming'],
            ['JavaScript', 'Programming'],
            ['Data Structures and Algorithms', 'Computer Science'],
            ['OOP', 'Computer Science'],
            ['React.js', 'Frontend'],
            ['HTML', 'Frontend'],
            ['CSS', 'Frontend'],
            ['Tailwind CSS', 'Frontend'],
            ['Node.js', 'Backend'],
            ['Express.js', 'Backend'],
            ['REST APIs', 'Backend'],
            ['MongoDB', 'Databases'],
            ['MySQL', 'Databases'],
            ['SQL', 'Databases'],
            ['Git', 'Tools'],
            ['GitHub', 'Tools'],
            ['VS Code', 'Tools']
        ].map(([name, category], order) => ({
            name,
            category,
            order,
            isPublic: true
        })));
    }

    if (!await Project.exists({})) {
        await Project.insertMany([
            {
                name: 'SmartCity AI',
                slug: 'smartcity-ai',
                shortDescription: 'Civic complaint management with AI-assisted workflows and location-aware features.',
                description: 'A civic complaint management application with location-aware features.',
                technologies: [
                    'MERN',
                    'OpenRouter AI',
                    'Socket.IO',
                    'Leaflet'
                ],
                liveUrl: 'https://smartcity-ai-1.onrender.com',
                status: 'live',
                published: true,
                featured: true,
                order: 0
            },
            {
                name: 'GeoMiner AI',
                slug: 'geominer-ai',
                shortDescription: '',
                description: '',
                technologies: [],
                liveUrl: 'https://geominer-ai-2.onrender.com',
                status: 'live',
                published: true,
                order: 1
            },
            {
                name: 'AI Interview Assistant',
                slug: 'ai-interview-assistant',
                shortDescription: 'An AI-assisted interview practice application with resume upload, voice interactions, and interview feedback.',
                description: 'An interview practice application with AI integration, resume upload, voice interactions, and interview feedback.',
                technologies: [
                    'React',
                    'AI integration',
                    'Resume upload',
                    'Voice interactions'
                ],
                githubUrl: 'https://github.com/alamnabiullha-dev/AI-Interview',
                liveUrl: 'https://ai-interview-assistant-1-avm9.onrender.com',
                status: 'live',
                published: true,
                order: 2
            }
        ]);
    }

    if (!await WebsiteSettings.exists({})) {
        await WebsiteSettings.create({
            title: 'Nabiullha Alam — Software Engineer',
            description: 'Aspiring Software Engineer and MERN Stack Developer.',
            theme: 'dark',
            resumeVisible: false
        });
    }

    console.log('✅ Portfolio seed data checked successfully');
}

// Start server
const start = async () => {
    try {
        console.log('🚀 Starting Portfolio API...');

        console.log('⏳ Connecting to MongoDB...');
        await connectDB(env.MONGODB_URI);

        console.log('⏳ Checking portfolio seed data...');
        await seed();

        const port = Number(env.PORT) || 5000;

        const server = app.listen(port, () => {
            console.log('');
            console.log('======================================');
            console.log('✅ PORTFOLIO SERVER RUNNING');
            console.log(`🌐 Local API: http://localhost:${port}`);
            console.log(`❤️ Health: http://localhost:${port}/health`);
            console.log('🗄️ MongoDB: Connected');
            console.log('📦 Portfolio data: Ready');
            console.log('======================================');
            console.log('');
        });

        server.on('error', (error) => {
            console.error('❌ Server error:', error.message);
            process.exit(1);
        });

    } catch (error) {
        console.error('❌ Startup failed:', error.message);
        process.exit(1);
    }
};

start();
