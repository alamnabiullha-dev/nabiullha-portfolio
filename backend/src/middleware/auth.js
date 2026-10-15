import jwt from 'jsonwebtoken';
import {env} from '../config/env.js';
import {AdminUser} from '../models/index.js';
export async function requireAdmin(req,res,next){try{const token=req.cookies?.access;if(!token)return res.status(401).json({message:'Authentication required'});const decoded=jwt.verify(token,env.JWT_ACCESS_SECRET);const user=await AdminUser.findById(decoded.sub).select('_id email');if(!user)return res.status(401).json({message:'Authentication required'});req.admin=user;next();}catch{return res.status(401).json({message:'Session expired. Please sign in again.'});}}
