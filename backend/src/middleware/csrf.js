import crypto from 'node:crypto';
const cookieOptions=(production)=>({httpOnly:false,secure:production,sameSite:production?'none':'lax',path:'/'});
export function issueCsrf(req,res){const token=crypto.randomBytes(24).toString('hex');res.cookie('csrf',token,cookieOptions(process.env.NODE_ENV==='production'));res.json({data:{token}});}
export function checkCsrf(req,res,next){if(['GET','HEAD','OPTIONS'].includes(req.method))return next();const cookie=req.cookies?.csrf;const header=req.get('x-csrf-token');if(!cookie||!header||cookie!==header)return res.status(403).json({message:'Request validation failed. Refresh and try again.'});next();}
