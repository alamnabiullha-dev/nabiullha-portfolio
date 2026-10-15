import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, ArrowUpRight } from 'lucide-react';
const links = [['About', '#about'], ['Skills', '#skills'], ['Projects', '#projects'], ['Achievements', '#achievements'], ['Contact', '#contact']];
export default function SiteNav({ profile }) {
  const [open, setOpen] = useState(false);
  return <header className="container" style={{height:76,display:'flex',alignItems:'center',justifyContent:'space-between'}}><Link to="/" className="mono" style={{fontWeight:500}}>NA<span style={{color:'#b5f36b'}}>.</span></Link><nav className="desktop-nav" style={{display:'flex',gap:27,fontSize:13,color:'#aeb8b0'}}>{links.map(([label,url])=><a key={label} href={url}>{label}</a>)}</nav><div className="desktop-nav" style={{display:'flex',gap:10}}><a className="btn btn-primary" href={`mailto:${profile?.email || 'alamnabiullha@gmail.com'}`}>Let’s talk <ArrowUpRight size={15}/></a></div><button className="mobile-nav btn" aria-label="Toggle menu" onClick={()=>setOpen(!open)}>{open?<X/>:<Menu/>}</button>{open&&<nav className="mobile-menu panel" style={{position:'absolute',zIndex:5,top:68,left:20,right:20,padding:18,display:'grid',gap:16}}>{links.map(([l,u])=><a key={l} href={u} onClick={()=>setOpen(false)}>{l}</a>)}</nav>}</header>;
}
