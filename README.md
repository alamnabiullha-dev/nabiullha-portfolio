# Nabiullha Alam — Portfolio

A JavaScript full-stack portfolio with a React/Vite public site, an Express REST API, MongoDB persistence, protected admin tools, Cloudinary media storage, and a private contact inbox.

## Architecture

```text
client/  React 18 + Vite + React Router + Tailwind + Framer Motion + Axios
server/  Express + Mongoose + JWT cookies + Cloudinary + optional Nodemailer
```

Public pages read content from `GET /api/public/portfolio`. Admin writes require a valid short-lived access cookie and a CSRF token. Media bytes stream from memory to Cloudinary; they are never stored in MongoDB or the Render filesystem. The MongoDB models cover admin users, profile, education, skills, projects, achievements, experience/activities, contact messages, and site settings.

## Local development (macOS / zsh)

Requirements: Node.js 20 or newer and npm.

```zsh
cp server/.env.example server/.env
# Edit server/.env with MongoDB Atlas, two random JWT secrets, and a one-time admin setup token.
cp client/.env.example client/.env.local
npm install
npm --prefix server install
npm --prefix client install
npm run dev
```

The public site runs at `http://localhost:5173`; the API runs at `http://localhost:5000`. Configure Atlas Network Access for the development machine and paste the Atlas connection string into `MONGODB_URI`. The API creates the initial profile, SRMIST education entry, known skills, and three provided project entries on the first connection. It does not seed invented marks, dates, certificate details, employment, or project statistics.

## Create the first administrator

Set `ADMIN_INIT_TOKEN` to a long random value in `server/.env`, restart the API, open `/admin/login`, choose **Initialize first admin**, and provide the exact token, an email, and a password of at least 12 characters. The setup endpoint works only while the admin collection is empty. There is no public registration route. Store the initial token safely and rotate it after setup if desired.

## Configure uploads and notifications

In Cloudinary, create an account and add its cloud name, API key, and API secret to the server environment. Admin uploads accept image, video, and PDF content, check the file signature, enforce a 40 MB size limit, and store the resulting URL and asset ID in MongoDB. Resume upload currently accepts PDF. Uploaded assets use a `portfolio/` folder prefix.

To enable contact notification emails, configure SMTP host, port, username, password, sender, and recipient with `MAIL_*` variables. If mail is not configured, messages still save to MongoDB and are available in Admin → Messages. The contact endpoint validates fields and is limited to five submissions per IP per 15 minutes.

## Deployment

### MongoDB Atlas

Create a database and database user, allow network access from the backend host, and copy the `mongodb+srv` URI. Keep the URI only in the backend environment.

### Backend on Render

Create a Render Web Service from this repository using the root `render.yaml` blueprint (or configure manually): root directory `server`, build command `npm install`, start command `npm start`, health check `/health`. Add `MONGODB_URI`, `CLIENT_ORIGIN` (the exact Vercel origin, no trailing slash), `ADMIN_INIT_TOKEN`, Cloudinary credentials, and optional SMTP values. Generate fresh long random `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` values. Render terminates TLS; the API sets secure cross-site cookies in production and allows credentials only from the configured origin. Do not use wildcard CORS origins.

### Frontend on Vercel

Import the repository in Vercel and set the project root to `client`. Vercel detects Vite; use `npm install` and `npm run build`, with output directory `dist`. Set `VITE_API_URL` to `https://YOUR-RENDER-SERVICE.onrender.com/api`. Deploy, then set that exact frontend origin as the backend `CLIENT_ORIGIN` and redeploy/restart the API. `client/vercel.json` provides SPA route fallback for `/projects/:slug` and `/admin/*`.

### GitHub

From the repository root, initialize and push with:

```zsh
git init
git add .
git commit -m "Build full-stack developer portfolio"
git branch -M main
git remote add origin https://github.com/alamnabiullha-dev/portfolio
git push -u origin main
```

Use the actual repository URL if you choose a different repository name. Never commit `.env` files.

## API overview

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| GET | `/health` | Public | Render health check |
| GET | `/api/auth/csrf` | Public | Issue CSRF cookie/token |
| GET | `/api/auth/status` | Public | Check whether initial admin exists |
| POST | `/api/auth/setup` | One-time setup token | Create first admin |
| POST | `/api/auth/login` | Public, rate limited | Admin sign in |
| POST | `/api/auth/refresh` | Refresh cookie | Rotate session cookies |
| POST | `/api/auth/logout` | Signed-in browser | Revoke refresh session |
| GET | `/api/public/portfolio` | Public | Public profile and published content |
| GET | `/api/public/projects` | Public | Paginated published projects; optional `page`, `limit`, `search`, `category` |
| POST | `/api/contact` | Public, rate limited | Save a contact message and optionally email notification |
| GET/PUT | `/api/admin/profile` | Admin | Read/update profile |
| GET/PUT | `/api/admin/settings` | Admin | Read/update website settings |
| GET | `/api/admin/overview` | Admin | Counts and recent messages |
| GET/POST | `/api/admin/{education,skills,projects,achievements,experiences,messages}` | Admin | List/create content |
| PUT/DELETE | `/api/admin/:type/:id` | Admin | Update/delete content |
| POST | `/api/admin/media` | Admin | Multipart Cloudinary upload (`file`, optional `folder`) |
| DELETE | `/api/admin/media/:publicId` | Admin | Delete a portfolio media asset |

Every modifying request requires the CSRF token supplied by `/api/auth/csrf`; the bundled Axios client handles this automatically. Contact messages are never exposed by public endpoints. Project and media links are opened with safe `rel="noreferrer"` attributes.

## Admin editing

Visit `/admin/login`. Manage public profile and availability, education, skills, projects (including publication and featured flags), achievements, experience and activities, contact messages, resume, and website title/description. For image/video/document fields, upload through the field’s upload control; the media metadata is saved in the corresponding MongoDB record. Public content refreshes from the API after a successful save.

Unknown school history, awards, experience, phone number, and GeoMiner AI details remain unset until verified. The initial portfolio copy does not claim employment or invented proficiency percentages.

## Production security notes

- Keep MongoDB, JWT, Cloudinary, mail, and bootstrap secrets in backend environment variables only.
- Use different, high-entropy access and refresh signing secrets. Production cookies are `HttpOnly`, `Secure`, and `SameSite=None`; API mutations also require a CSRF token.
- CORS permits only the configured frontend origin and credentials.
- Helmet, request size limits, authentication/contact rate limits, input bounds, safe Mongo update keys, and upload content-signature checks are enabled.
- No admin registration is exposed after the one-time setup.
- Configure HTTPS on the frontend and backend. Keep Atlas and Cloudinary access restricted to the deployed services where possible.

## Troubleshooting

- **Portfolio shows service unavailable:** check Render logs, `/health`, `MONGODB_URI`, Atlas network access, and that `VITE_API_URL` ends in `/api`.
- **Login loops or CSRF errors:** use the exact Vercel origin in `CLIENT_ORIGIN`, use HTTPS for both deployed services, and clear stale cookies after changing domains.
- **Uploads say Cloudinary is not configured:** populate all three Cloudinary variables and restart the API.
- **Contact email is not sent:** messages still save; check SMTP credentials, provider app-password requirements, and Render logs.
- **Admin setup reports already completed:** setup is intentionally one-time. Sign in with the configured admin account; recover access by securely updating the admin record through a controlled database operation.

## Current implementation scope

This repository includes the complete application structure and an operational portfolio/API baseline. Configure external accounts and deploy before production use. No real admin password, third-party credential, resume, profile photo, or certificate is included in the repository.
