import {Router} from 'express';
import {ContactMessage} from '../models/index.js';
import {sendContactNotice} from '../services/mailer.js';
const router=Router();
router.post('/',async(req,res,next)=>{try{if(String(req.body.website||'').trim())return res.status(400).json({message:'Unable to process this message.'});const {name,email,organization,subject,message}=req.body;const clean={name:String(name||'').trim(),email:String(email||'').trim().toLowerCase(),organization:String(organization||'').trim(),subject:String(subject||'').trim(),message:String(message||'').trim()};if(clean.name.length<2||clean.name.length>100||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean.email)||clean.email.length>254||clean.subject.length<2||clean.subject.length>160||clean.message.length<10||clean.message.length>5000)return res.status(400).json({message:'Please check the contact form fields.'});const record=await ContactMessage.create(clean);sendContactNotice(record).catch(e=>console.error('Mail notification failed:',e.message));res.status(201).json({data:{received:true}});}catch(e){next(e);}});
export default router;
