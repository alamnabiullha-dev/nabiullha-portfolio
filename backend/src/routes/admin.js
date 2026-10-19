import { Router } from 'express';
import multer from 'multer';
import { Readable } from 'node:stream';
import cloudinary from '../config/cloudinary.js';
import { requireAdmin } from '../middleware/auth.js';
import { Profile, Education, Skill, Project, Achievement, Experience, ContactMessage, WebsiteSettings } from '../models/index.js';
const router = Router();
router.use(requireAdmin);
const resources = { education: Education, skills: Skill, projects: Project, achievements: Achievement, experiences: Experience, messages: ContactMessage };
const safeFields = (obj) => { const clean = (value, key = '') => { if (Array.isArray(value)) return value.map(item => clean(item, key)); if (value && typeof value === 'object') { const nested = {}; for (const [k, v] of Object.entries(value)) { if (k.startsWith('$') || k.includes('.') || ['__v', '_id', 'createdAt', 'updatedAt', 'passwordHash', 'refreshHash'].includes(k)) continue; nested[k] = clean(v, k); } return nested; } if (key.toLowerCase().endsWith('url') && typeof value === 'string' && value.trim()) { try { const parsed = new URL(value); if (!['https:', 'http:'].includes(parsed.protocol)) throw new Error(); } catch { const error = new Error(`${key} must be a valid HTTP or HTTPS URL.`); error.status = 400; throw error; } } return value; }; return clean(obj || {}); };
router.get('/overview', async (req, res, next) => { try { const [projects, achievements, education, messages, recent, profile] = await Promise.all([Project.countDocuments({ published: true }), Achievement.countDocuments(), Education.countDocuments(), ContactMessage.countDocuments(), ContactMessage.find({ archived: false }).sort({ createdAt: -1 }).limit(5).lean(), Profile.findOne().lean()]); res.json({ data: { projects, achievements, education, messages, recent, available: profile?.available ?? true } }); } catch (e) { next(e); } });
router.get('/profile', async (req, res, next) => { try { res.json({ data: await Profile.findOne().lean() || {} }); } catch (e) { next(e); } });
router.put('/profile', async (req, res, next) => { try { const record = await Profile.findOneAndUpdate({}, { $set: safeFields(req.body) }, { new: true, upsert: true, runValidators: true }); res.json({ data: record }); } catch (e) { next(e); } });
router.get('/settings', async (req, res, next) => { try { res.json({ data: await WebsiteSettings.findOne().lean() || {} }); } catch (e) { next(e); } });
router.put('/settings', async (req, res, next) => { try { const record = await WebsiteSettings.findOneAndUpdate({}, { $set: safeFields(req.body) }, { new: true, upsert: true, runValidators: true }); res.json({ data: record }); } catch (e) { next(e); } });
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 100 * 1024 * 1024, files: 1 }, fileFilter: (req, file, cb) => { const ok = /^(image\/(jpeg|png|webp|gif)|video\/(mp4|webm|quicktime)|application\/pdf)$/.test(file.mimetype); cb(ok ? null : new Error('Allowed uploads: JPG, PNG, WEBP, GIF, MP4, WEBM, MOV, or PDF.'), ok); } }); 

/*const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 100 * 1024 * 1024, // 100 MB
        files: 1
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = [
            'image/jpeg',
            'image/png',
            'image/webp',
            'image/gif',
            'video/mp4',
            'video/webm',
            'video/quicktime',
            'application/pdf'
        ];

        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(
                new Error(
                    'Allowed uploads: JPG, PNG, WEBP, GIF, MP4, WEBM, MOV, or PDF.'
                ),
                false
            );
        }
    }
});*/

router.post('/media', upload.single('file'), async (req, res, next) => { try { if (!req.file) return res.status(400).json({ message: 'Choose a file to upload.' }); if (!validFileSignature(req.file)) return res.status(400).json({ message: 'The file content does not match its declared type.' }); if (!cloudinary.config().cloud_name) return res.status(503).json({ message: 'Cloudinary is not configured on the server.' }); const resourceType = req.file.mimetype.startsWith('video/') ? 'video' : req.file.mimetype === 'application/pdf' ? 'raw' : 'image'; const folder = String(req.body.folder || 'portfolio').replace(/[^a-z0-9/_-]/gi, '').slice(0, 60) || 'portfolio'; const uploaded = await new Promise((resolve, reject) => { const stream = cloudinary.uploader.upload_stream({ folder, resource_type: resourceType }, (err, result) => err ? reject(err) : resolve(result)); Readable.from(req.file.buffer).pipe(stream); }); res.status(201).json({ data: { url: uploaded.secure_url, publicId: uploaded.public_id, resourceType: uploaded.resource_type, format: uploaded.format, bytes: uploaded.bytes } }); } catch (e) { next(e); } });
const types = 'education|skills|projects|achievements|experiences|messages';
router.get(`/:type(${types})`, async (req, res, next) => { try { const Model = resources[req.params.type]; const page = Math.max(1, Number(req.query.page) || 1), limit = Math.min(100, Math.max(1, Number(req.query.limit) || 100)); const filter = req.params.type === 'messages' && req.query.archived !== 'true' ? { archived: false } : {}; if (req.query.search && req.params.type === 'messages') { const term = String(req.query.search).slice(0, 80); filter.$or = [{ name: new RegExp(escapeRegex(term), 'i') }, { email: new RegExp(escapeRegex(term), 'i') }, { subject: new RegExp(escapeRegex(term), 'i') }]; } const [items, total] = await Promise.all([Model.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(), Model.countDocuments(filter)]); res.json({ data: items, pagination: { page, limit, total, pages: Math.ceil(total / limit) } }); } catch (e) { next(e); } });
router.post(`/:type(${types})`, async (req, res, next) => { try { const Model = resources[req.params.type]; const item = await Model.create(safeFields(req.body)); res.status(201).json({ data: item }); } catch (e) { next(e); } });
router.put(`/:type(${types})/:id`, async (req, res, next) => { try { const Model = resources[req.params.type]; const item = await Model.findByIdAndUpdate(req.params.id, { $set: safeFields(req.body) }, { new: true, runValidators: true }); if (!item) return res.status(404).json({ message: 'Record not found' }); res.json({ data: item }); } catch (e) { next(e); } });
router.delete(`/:type(${types})/:id`, async (req, res, next) => { try { const Model = resources[req.params.type]; const item = await Model.findByIdAndDelete(req.params.id); if (!item) return res.status(404).json({ message: 'Record not found' }); res.json({ data: { deleted: true } }); } catch (e) { next(e); } });
router.delete('/media/:publicId(*)', async (req, res, next) => { try { const publicId = req.params.publicId; if (!publicId || !publicId.startsWith('portfolio/')) return res.status(400).json({ message: 'Invalid media identifier.' }); if (!cloudinary.config().cloud_name) return res.status(503).json({ message: 'Cloudinary is not configured on the server.' }); const result = await cloudinary.uploader.destroy(publicId, { resource_type: req.query.type === 'video' ? 'video' : req.query.type === 'raw' ? 'raw' : 'image' }); res.json({ data: { deleted: result.result === 'ok' || result.result === 'not found' } }); } catch (e) { next(e); } });
router.get('/resume', async (req, res, next) => { try { const profile = await Profile.findOne().lean(); res.json({ data: profile?.resume || null }); } catch (e) { next(e); } });
router.get('/messages/:id', async (req, res, next) => { try { const item = await ContactMessage.findByIdAndUpdate(req.params.id, { $set: { read: true } }, { new: true }); if (!item) return res.status(404).json({ message: 'Message not found' }); res.json({ data: item }); } catch (e) { next(e); } });
function escapeRegex(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
function validFileSignature(file) { const b = file.buffer; if (file.mimetype === 'image/png') return b.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])); if (file.mimetype === 'image/jpeg') return b[0] === 255 && b[1] === 216 && b[b.length - 2] === 255 && b[b.length - 1] === 217; if (file.mimetype === 'image/gif') return b.subarray(0, 3).toString() === 'GIF'; if (file.mimetype === 'image/webp') return b.subarray(0, 4).toString() === 'RIFF' && b.subarray(8, 12).toString() === 'WEBP'; if (file.mimetype === 'application/pdf') return b.subarray(0, 5).toString() === '%PDF-'; if (file.mimetype === 'video/webm') return b.subarray(0, 4).equals(Buffer.from([0x1a, 0x45, 0xdf, 0xa3])); if (['video/mp4', 'video/quicktime'].includes(file.mimetype)) return b.subarray(4, 8).toString() === 'ftyp'; return false; }
export default router;
