import { useState, useEffect, useRef, useCallback } from "react";

const PAGES = ["HOME", "ABOUT", "TECH", "QUESTIONNAIRE", "CONTACT", "RESULTS", "PRESENTATION"];
const EMAIL_TARGET = "alfie.mcmeeking18@imperial.ac.uk";

/* ─── FONT ─── */
(() => {
  const l = document.createElement("link");
  l.rel = "stylesheet";
  l.href = "https://fonts.googleapis.com/css2?family=Oswald:wght@400;700&display=swap";
  document.head.appendChild(l);
})();

const globalCSS = `
  @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@400;700&display=swap');
  *, *::before, *::after { margin:0; padding:0; box-sizing:border-box; }
  html { scroll-behavior:smooth; }
  body {
    background:#000; color:#fff; font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;
    font-weight:300; cursor:none; overflow-x:hidden; -webkit-font-smoothing:antialiased;
  }
  ::selection { background:rgba(255,255,255,0.15); color:#fff; }
  input,textarea,select,button { cursor:none; }
  a { cursor:none; }
  input::placeholder, textarea::placeholder { color:rgba(255,255,255,0.5); opacity:1; }
  .hl { font-family:'Oswald',sans-serif; font-weight:700; text-transform:uppercase; letter-spacing:-0.02em; }
  .bt { font-family:'Helvetica Neue',Helvetica,Arial,sans-serif; font-weight:300; }

  @keyframes grainAnim {
    0%,100%{transform:translate(0,0)}10%{transform:translate(-5%,-10%)}20%{transform:translate(-15%,5%)}
    30%{transform:translate(7%,-25%)}40%{transform:translate(-5%,25%)}50%{transform:translate(-15%,10%)}
    60%{transform:translate(15%,0%)}70%{transform:translate(0%,15%)}80%{transform:translate(3%,35%)}
    90%{transform:translate(-10%,10%)}
  }
  @keyframes fadeIn { from{opacity:0}to{opacity:1} }
  @keyframes breathe { 0%,100%{opacity:0.2}50%{opacity:0.65} }
  @keyframes floatArrow { 0%,100%{transform:translateY(0)}50%{transform:translateY(8px)} }
  @keyframes carouselScroll {
    0% { transform: translateX(0); }
    100% { transform: translateX(-50%); }
  }
`;

/* ─── CURSOR ─── */
function Cursor() {
  const dotRef = useRef(null);
  const [hovering, setHovering] = useState(false);
  useEffect(() => {
    const move = (e) => {
      if (dotRef.current) dotRef.current.style.transform = `translate(${e.clientX - 9}px, ${e.clientY - 9}px)`;
      const el = document.elementFromPoint(e.clientX, e.clientY);
      if (!el) { setHovering(false); return; }
      let cur = el, isClickable = false;
      while (cur && cur !== document.body) {
        const tag = cur.tagName;
        if (tag === "A" || tag === "BUTTON" || tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") { isClickable = true; break; }
        if (cur.getAttribute && (cur.getAttribute("role") === "button" || cur.hasAttribute("data-clickable"))) { isClickable = true; break; }
        const fk = Object.keys(cur).find(k => k.startsWith("__reactProps"));
        if (fk && cur[fk] && cur[fk].onClick) { isClickable = true; break; }
        cur = cur.parentElement;
      }
      setHovering(isClickable);
    };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, []);
  return <div ref={dotRef} style={{
    position:"fixed",top:0,left:0,width:18,height:18,borderRadius:"50%",
    background:hovering?"#d42020":"transparent",border:hovering?"2px solid #d42020":"2px solid #fff",
    zIndex:99999,pointerEvents:"none",willChange:"transform",transition:"background 0.15s, border-color 0.15s",
  }}/>;
}

/* ─── SCROLL PROGRESS ─── */
function ScrollProgress() {
  const [pct, setPct] = useState(0);
  useEffect(() => {
    const s = () => { const h = document.documentElement.scrollHeight - window.innerHeight; setPct(h > 0 ? (window.scrollY / h) * 100 : 0); };
    window.addEventListener("scroll", s); return () => window.removeEventListener("scroll", s);
  }, []);
  return <div style={{position:"fixed",top:0,right:0,width:5,height:"100vh",zIndex:9990,background:"rgba(255,255,255,0.1)"}}>
    <div style={{width:"100%",height:`${pct}%`,background:"#fff",transition:"height 0.15s linear"}}/>
  </div>;
}

/* ─── SCROLL REVEAL ─── */
function ScrollReveal({ children, delay = 0 }) {
  const ref = useRef(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e])=>{if(e.isIntersecting){setTimeout(()=>setVis(true),delay);obs.disconnect();}},{threshold:0.05,rootMargin:"0px 0px -20px 0px"});
    if(ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [delay]);
  return <div ref={ref} style={{opacity:vis?1:0,transform:vis?"translateY(0)":"translateY(16px)",
    transition:`opacity 0.7s ${delay}ms, transform 0.7s ${delay}ms`,transitionTimingFunction:"cubic-bezier(0.16,1,0.3,1)",
  }}>{children}</div>;
}

/* ─── FOOTER ─── */
function Footer() {
  const socials = [{name:"TikTok"},{name:"Instagram"},{name:"LinkedIn"},{name:"X"}];
  const goResults = () => window.dispatchEvent(new CustomEvent("shape:navigate", {detail:"RESULTS"}));
  return <footer style={{padding:"48px 32px 32px",borderTop:"1px solid rgba(255,255,255,0.06)",display:"flex",flexWrap:"wrap",justifyContent:"space-between",alignItems:"center",gap:16}}>
    <span className="bt" style={{fontSize:12,opacity:0.4,letterSpacing:"0.08em"}}>Shape Science © 2026</span>
    <div style={{display:"flex",gap:20}}>
      {socials.map(s=><span key={s.name} className="bt" style={{fontSize:11,opacity:0.35,letterSpacing:"0.1em",cursor:"none",transition:"opacity 0.3s"}}
        onMouseEnter={e=>e.target.style.opacity=0.8} onMouseLeave={e=>e.target.style.opacity=0.35}>{s.name}</span>)}
    </div>
    <span className="bt" onClick={goResults} style={{fontSize:11,opacity:0.3,letterSpacing:"0.1em",cursor:"none",transition:"opacity 0.3s"}}
      onMouseEnter={e=>e.target.style.opacity=0.7} onMouseLeave={e=>e.target.style.opacity=0.3}>shapescience.org</span>
  </footer>;
}

/* ─── NAV ─── */
function Nav({ page, setPage }) {
  const [menuOpen, setMenuOpen] = useState(false);
  return <nav style={{position:"fixed",top:0,left:0,right:0,zIndex:9000,padding:"24px 32px",display:"flex",justifyContent:"space-between",alignItems:"center",background:"linear-gradient(to bottom,rgba(0,0,0,0.85),transparent)"}}>
    <div className="hl" style={{fontSize:18,letterSpacing:"0.08em",cursor:"none"}} onClick={()=>setPage("HOME")}>SHAPE SCIENCE</div>
    <div style={{display:"flex",gap:28}} className="desktop-nav">
      {PAGES.map(p=><div key={p} className="bt" onClick={()=>setPage(p)} style={{fontSize:13,letterSpacing:"0.1em",fontWeight:p===page?400:300,opacity:p===page?1:0.7,transition:"opacity 0.4s",cursor:"none",textTransform:"uppercase"}}>{p}</div>)}
    </div>
    <div className="mobile-nav-btn" onClick={()=>setMenuOpen(!menuOpen)} style={{display:"none",flexDirection:"column",gap:5,cursor:"none",padding:4}}>
      <span style={{width:22,height:1.5,background:"#fff",transition:"0.3s",transform:menuOpen?"rotate(45deg) translateY(4.5px)":"none"}}/>
      <span style={{width:22,height:1.5,background:"#fff",transition:"0.3s",opacity:menuOpen?0:1}}/>
      <span style={{width:22,height:1.5,background:"#fff",transition:"0.3s",transform:menuOpen?"rotate(-45deg) translateY(-4.5px)":"none"}}/>
    </div>
    {menuOpen && <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.97)",zIndex:8999,display:"flex",flexDirection:"column",justifyContent:"center",alignItems:"center",gap:36}}>
      {PAGES.map(p=><div key={p} className="hl" onClick={()=>{setPage(p);setMenuOpen(false);}} style={{fontSize:32,opacity:p===page?1:0.5,cursor:"none"}}>{p}</div>)}
    </div>}
    <style>{`@media(max-width:768px){.desktop-nav{display:none!important}.mobile-nav-btn{display:flex!important}}`}</style>
  </nav>;
}

/* ─── HERO TITLE ─── */
function HeroTitle() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => { const c = () => setIsMobile(window.innerWidth <= 768); c(); window.addEventListener("resize", c); return () => window.removeEventListener("resize", c); }, []);
  if (isMobile) {
    const lines = [{text:"SHAPE",flex:20,vbW:340},{text:"SCIENCE",flex:60,vbW:460},{text:"2026",flex:20,vbW:260}];
    return <div className="hl" style={{width:"100%",flex:"1 1 auto",minHeight:0,display:"flex",flexDirection:"column"}}>
      {lines.map((l,i) => <div key={i} style={{flex:`${l.flex} 1 0`,minHeight:0}}>
        <svg viewBox={`0 8 ${l.vbW} 63`} preserveAspectRatio="none" style={{width:"100%",height:"100%",display:"block"}}>
          <text x="50%" y="68" textAnchor="middle" fontSize="72" fontFamily="'Oswald', sans-serif" fontWeight="700" fill="#fff" textLength={l.vbW*0.96} lengthAdjust="spacingAndGlyphs">{l.text}</text>
        </svg>
      </div>)}
    </div>;
  }
  return <div className="hl" style={{display:"flex",alignItems:"baseline",justifyContent:"center",gap:"clamp(8px,1.6vw,22px)",width:"100%",whiteSpace:"nowrap",lineHeight:0.85,fontWeight:700,letterSpacing:"-0.02em"}}>
    <span style={{fontSize:"clamp(38px,11vw,150px)"}}>SHAPE SCIENCE</span>
    <span style={{fontSize:"clamp(18px,4.5vw,60px)",letterSpacing:"0.02em",opacity:0.85}}>2026</span>
  </div>;
}

/* ─── HOME TILE (hover to darken + reveal caption) ─── */
function HomeTile({ src, label, caption, delay }) {
  const [hover, setHover] = useState(false);
  return <ScrollReveal delay={delay}>
    <div
      onMouseEnter={()=>setHover(true)} onMouseLeave={()=>setHover(false)}
      onClick={()=>setHover(h=>!h)} data-clickable
      style={{aspectRatio:"4/5",background:"#0a0a0a",border:"1px solid rgba(255,255,255,0.04)",position:"relative",overflow:"hidden",cursor:"none"}}>
      <img src={src} alt={label} onError={e=>{e.target.style.display="none"}}
        style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover",
          filter:`grayscale(100%) contrast(1.1) brightness(${hover?0.35:1})`,
          transform:hover?"scale(1.04)":"scale(1)",
          transition:"filter 0.6s cubic-bezier(0.16,1,0.3,1), transform 0.8s cubic-bezier(0.16,1,0.3,1)"}}/>
      <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",padding:"28px",
        opacity:hover?1:0,transform:hover?"translateY(0)":"translateY(10px)",
        transition:"opacity 0.5s cubic-bezier(0.16,1,0.3,1), transform 0.5s cubic-bezier(0.16,1,0.3,1)",pointerEvents:"none"}}>
        <p className="bt" style={{fontSize:"clamp(15px,1.35vw,18px)",fontWeight:700,color:"#fff",textAlign:"center",lineHeight:1.55,letterSpacing:"0.01em",maxWidth:320,textShadow:"0 2px 14px rgba(0,0,0,0.7)"}}>{caption}</p>
      </div>
      <div className="bt" style={{position:"absolute",bottom:16,left:16,fontSize:10,opacity:hover?0:0.45,letterSpacing:"0.2em",mixBlendMode:"difference",transition:"opacity 0.4s"}}>{label}</div>
    </div>
  </ScrollReveal>;
}

/* ─── HOME PAGE ─── */
function HomePage({ setPage }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => { setTimeout(()=>setVisible(true), 200); }, []);
  const phrases = [{t:"We grow structure.",d:0},{t:"Geometry becomes material.",d:200},{t:"Matter is instructed, not manufactured.",d:400}];

  const tiles = [
    { src:"/assets/home-material.png", label:"MATERIAL",
      caption:"We 3D print scaffolds and let bacteria-derived, leather-like cellulose materials engulf and form around them." },
    { src:"/assets/home-sole.jpg", label:"SOLE",
      caption:"The sole is grown from 3D-printed, Balena biomass-derived filament — a design drawn directly from nature." },
    { src:"/assets/home-structure.png", label:"STRUCTURE",
      caption:"The geometry of the scaffold lets the rigidity and flexibility of the material be spatially tuned." },
  ];

  return <div>
    <section style={{height:"100dvh",display:"flex",flexDirection:"column",justifyContent:"center",alignItems:"center",position:"relative",overflow:"hidden"}}>
      <video ref={el=>{if(el){el.setAttribute("muted","");el.setAttribute("playsinline","");el.muted=true;el.play().catch(()=>{});}}} autoPlay loop muted playsInline disablePictureInPicture controlsList="nofullscreen nodownload noremoteplayback" style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover",zIndex:0,filter:"grayscale(100%) contrast(1.1)"}}>
        <source src="/assets/hero-bg.mp4" type="video/mp4" />
      </video>
      <div style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.45)",zIndex:0}}/>
      <div style={{position:"absolute",bottom:0,left:0,right:0,height:"35%",background:"linear-gradient(to bottom, transparent, #000)",zIndex:0,pointerEvents:"none"}}/>
      <div style={{position:"relative",zIndex:1,textAlign:"center",width:"100%",height:"100%",display:"flex",flexDirection:"column",justifyContent:"center",alignItems:"center",paddingTop:72,boxSizing:"border-box",opacity:visible?1:0,transform:visible?"translateY(0)":"translateY(40px)",transition:"all 1.2s cubic-bezier(0.16,1,0.3,1)"}}>
        <HeroTitle />
      </div>
    </section>

    <section style={{minHeight:"100vh",display:"flex",flexDirection:"column",justifyContent:"center",padding:"120px clamp(24px,8vw,160px)"}}>
      {phrases.map((p,i)=><ScrollReveal key={i} delay={p.d}>
        <p className="bt" style={{fontSize:"clamp(24px,4vw,52px)",fontWeight:300,lineHeight:1.3,marginBottom:48,opacity:0.85,maxWidth:800}}>{p.t}</p>
      </ScrollReveal>)}
      <ScrollReveal delay={600}>
        <p className="bt" style={{fontSize:16,lineHeight:2,color:"rgba(255,255,255,0.85)",maxWidth:540,marginTop:40,letterSpacing:"0.04em"}}>
          A new approach to material design — where biology meets computation, and form is grown rather than imposed.
        </p>
      </ScrollReveal>
    </section>

    <section style={{padding:"80px clamp(24px,8vw,160px)",display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:24}}>
      {tiles.map((t,i)=><HomeTile key={i} src={t.src} label={t.label} caption={t.caption} delay={i*150}/>)}
    </section>
    <Footer/>
  </div>;
}

/* ─── ABOUT PAGE ─── */
function AboutPage() {
  const [hovering, setHovering] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => { const c = () => setIsMobile(window.innerWidth <= 768); c(); window.addEventListener("resize", c); return () => window.removeEventListener("resize", c); }, []);

  const icons = {
    dna: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.5"><path d="M7 4h10M7 20h10M12 4v16M9 4c0 4 6 4 6 8s-6 4-6 8"/></svg>,
    grid: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.5"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>,
    leaf: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.5"><path d="M17 8C8 10 5.9 16.17 3.82 21.34M17 8A5 5 0 0120 4M17 8c-4 0-8 2-10 6"/></svg>,
    cube: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.5"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>,
    brain: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.5"><path d="M12 2a7 7 0 00-7 7c0 3 2 5.5 4 7.5L12 22l3-5.5c2-2 4-4.5 4-7.5a7 7 0 00-7-7z"/><circle cx="12" cy="9" r="2"/></svg>,
    flask: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.5"><path d="M9 3h6M10 3v7l-5 8.5a1 1 0 00.86 1.5h12.28a1 1 0 00.86-1.5L14 10V3"/></svg>,
    shoe: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.5"><path d="M4 18h16c1 0 2-1 2-2 0-2-3-3-5-3l-3-6H8l-1 6c-2 0-5 1-5 3 0 1 1 2 2 2z"/></svg>,
    layer: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.5"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 12l10 5 10-5"/><path d="M2 17l10 5 10-5"/></svg>,
  };
  const leftItems = [
    {icon:icons.dna,text:"EXPERIMENTAL DESIGN"},{icon:icons.leaf,text:"LIVING SYSTEMS"},
    {icon:icons.brain,text:"MATERIAL INTELLIGENCE"},{icon:icons.layer,text:"GROWN, NOT MADE"},
  ];
  const rightItems = [
    {icon:icons.grid,text:"COMPUTATIONAL FORM"},{icon:icons.shoe,text:"FUTURE FOOTWEAR"},
    {icon:icons.cube,text:"GROWN STRUCTURE"},{icon:icons.flask,text:"BIOFABRICATION"},
  ];

  const collaborators = [
    {name:"Dr Elena Dieckmann", role:"PhD Supervisor"},
    {name:"Professor Tom Ellis", role:"Bacterial Nanocellulose Expert · Scientific Advisor"},
    {name:"Gregory Hamlet", role:"MSc Researcher · Material Development"},
    {name:"Alina Zhang", role:"MSc Researcher · Technology Development"},
  ];
  const partners = [
    {name:"HNB Cosmetics", role:"Biocellulose experts and project collaborators, supporting development of the material.", logo:null},
    {name:"Decathlon", role:"Provided walking-biomechanics data that parametrically informs the scaffold designs.", logo:"/assets/decathlon.png"},
  ];

  const handleTap = () => { if (isMobile) { setHovering(p => !p); setHasInteracted(true); } };
  const handleEnter = () => { if (!isMobile) { setHovering(true); setHasInteracted(true); } };
  const handleLeave = () => { if (!isMobile) setHovering(false); };

  const labelStyle = (i) => ({
    display:"flex",alignItems:"center",gap:10,
    opacity:hovering?0.8:0,transform:`translateY(${hovering?0:8}px)`,
    transition:`all 0.6s ${i*100+100}ms cubic-bezier(0.16,1,0.3,1)`,pointerEvents:"none",
  });

  return <section style={{minHeight:"100vh",display:"flex",flexDirection:"column",justifyContent:"center",alignItems:"center",position:"relative",padding:"120px 24px"}}>
    <div style={{position:"absolute",top:100,left:"clamp(24px,8vw,80px)",display:"flex",alignItems:"flex-end",gap:12}}>
      <span className="bt" style={{fontSize:12,letterSpacing:"0.2em",opacity:0.5}}>02</span>
      <span className="hl" style={{fontSize:"clamp(28px,5vw,56px)"}}>ABOUT</span>
    </div>

    <div style={{display:"flex",alignItems:"center",gap:isMobile?0:"clamp(20px,3vw,48px)",width:"100%",maxWidth:1100,justifyContent:"center"}}>
      {!isMobile && <div style={{display:"flex",flexDirection:"column",gap:40,alignItems:"flex-end",flex:"0 0 auto",minWidth:180}}>
        {leftItems.map((item,i) => <div key={i} style={labelStyle(i)}>
          <span className="hl" style={{fontSize:12,letterSpacing:"0.15em",whiteSpace:"nowrap"}}>{item.text}</span>
          <span style={{opacity:0.5,flexShrink:0}}>{item.icon}</span>
        </div>)}
      </div>}

      <div onMouseEnter={handleEnter} onMouseLeave={handleLeave} onClick={handleTap} data-clickable style={{
        width:"clamp(260px,35vw,420px)",height:"clamp(380px,55vh,620px)",position:"relative",cursor:"none",
        display:"flex",flexDirection:"column",justifyContent:"center",alignItems:"center",border:"1px solid rgba(255,255,255,0.03)",flexShrink:0,
      }}>
        <img src="/assets/about-dark.png" alt="About" onError={e=>{e.target.style.display="none"}} style={{
          position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"contain",
          opacity:hovering?0:1,transition:"opacity 1.2s cubic-bezier(0.16,1,0.3,1)",zIndex:2,
        }}/>
        <img src="/assets/about-light.png" alt="About — illuminated" onError={e=>{e.target.style.display="none"}} style={{
          position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"contain",
          opacity:hovering?1:0,transition:"opacity 1.2s cubic-bezier(0.16,1,0.3,1)",zIndex:1,
        }}/>
        {!hasInteracted && <div style={{position:"absolute",bottom:28,left:"50%",transform:"translateX(-50%)",zIndex:10,display:"flex",flexDirection:"column",alignItems:"center",gap:10,pointerEvents:"none"}}>
          <div style={{width:36,height:36,borderRadius:"50%",border:"1.5px solid rgba(255,255,255,0.35)",display:"flex",justifyContent:"center",alignItems:"center",animation:"breathe 2.8s ease-in-out infinite"}}>
            <div style={{width:6,height:6,borderRadius:"50%",background:"rgba(255,255,255,0.45)",animation:"breathe 2.8s ease-in-out infinite"}}/>
          </div>
          <p className="bt" style={{fontSize:10,letterSpacing:"0.3em",animation:"breathe 2.8s ease-in-out infinite",textTransform:"uppercase"}}>{isMobile?"tap to illuminate":"hover to illuminate"}</p>
        </div>}
      </div>

      {!isMobile && <div style={{display:"flex",flexDirection:"column",gap:40,alignItems:"flex-start",flex:"0 0 auto",minWidth:180}}>
        {rightItems.map((item,i) => <div key={i} style={labelStyle(i)}>
          <span style={{opacity:0.5,flexShrink:0}}>{item.icon}</span>
          <span className="hl" style={{fontSize:12,letterSpacing:"0.15em",whiteSpace:"nowrap"}}>{item.text}</span>
        </div>)}
      </div>}
    </div>

    {isMobile && <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"16px 24px",marginTop:32,width:"100%",maxWidth:360}}>
      {[...leftItems,...rightItems].map((item,i) => <div key={i} style={{
        display:"flex",alignItems:"center",gap:8,opacity:hovering?0.75:0,
        transform:`translateY(${hovering?0:8}px)`,transition:`all 0.6s ${i*60+100}ms cubic-bezier(0.16,1,0.3,1)`,
      }}>
        <span style={{opacity:0.5,flexShrink:0}}>{item.icon}</span>
        <span className="hl" style={{fontSize:10,letterSpacing:"0.1em"}}>{item.text}</span>
      </div>)}
    </div>}

    <div style={{marginTop:48,maxWidth:560,textAlign:"center",opacity:hovering?0.95:0.65,transition:"opacity 0.8s"}}>
      <p className="bt" style={{fontSize:16,lineHeight:2,letterSpacing:"0.04em",fontWeight:300,color:"#fff",marginBottom:20}}>
        Shape Science was founded by Alfie McMeeking — a PhD student at Imperial College London with a passion for microbiology, design, and engineering.
      </p>
      <p className="bt" style={{fontSize:15,lineHeight:2,letterSpacing:"0.04em",fontWeight:300,color:"rgba(255,255,255,0.85)"}}>
        Structure emerges from instruction. Form follows biology. We set the conditions — the material shapes itself.
      </p>
    </div>

    <ScrollReveal>
      <div style={{marginTop:96,width:"100%",maxWidth:1000,marginLeft:"auto",marginRight:"auto"}}>
        <div style={{textAlign:"center",marginBottom:14}}>
          <span className="hl" style={{fontSize:"clamp(22px,3.4vw,34px)",letterSpacing:"0.02em"}}>COLLABORATORS</span>
        </div>
        <div style={{width:48,height:1,background:"rgba(255,255,255,0.25)",margin:"0 auto 44px"}}/>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(230px,1fr))",gap:16,marginBottom:64}}>
          {collaborators.map((c,i)=><div key={i} style={{border:"1px solid rgba(255,255,255,0.12)",padding:"24px 22px",textAlign:"center"}}>
            <div className="hl" style={{fontSize:17,letterSpacing:"0.01em",marginBottom:10,lineHeight:1.2}}>{c.name}</div>
            <div className="bt" style={{fontSize:13,lineHeight:1.6,color:"rgba(255,255,255,0.7)",letterSpacing:"0.03em"}}>{c.role}</div>
          </div>)}
        </div>
        <div style={{textAlign:"center",marginBottom:30}}>
          <span className="hl" style={{fontSize:"clamp(16px,2.4vw,24px)",opacity:0.9,letterSpacing:"0.04em"}}>PARTNERS</span>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:16}}>
          {partners.map((p,i)=><div key={i} style={{border:"1px solid rgba(255,255,255,0.12)",padding:"28px 26px",display:"flex",flexDirection:"column",alignItems:"center",textAlign:"center",gap:14,minHeight:170,justifyContent:"center"}}>
            {p.logo
              ? <img src={p.logo} alt={p.name} onError={e=>{e.target.style.display="none"}} style={{height:30,width:"auto",maxWidth:200,objectFit:"contain"}}/>
              : <div className="hl" style={{fontSize:20,letterSpacing:"0.04em"}}>{p.name}</div>}
            <div className="bt" style={{fontSize:14,lineHeight:1.7,color:"rgba(255,255,255,0.72)",letterSpacing:"0.03em",maxWidth:360}}>{p.role}</div>
          </div>)}
        </div>
      </div>
    </ScrollReveal>

    <Footer/>
  </section>;
}

/* ─── TECH PAGE — THE VENA PROJECT ─── */
function TechPage() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => { const c = () => setIsMobile(window.innerWidth <= 768); c(); window.addEventListener("resize", c); return () => window.removeEventListener("resize", c); }, []);

  const pillars = [
    { num: "01", title: "BIOLOGICAL GROWTH", desc: "We culture bacterial nanocellulose — a living material that self-assembles at the molecular level into dense, high-performance sheets." },
    { num: "02", title: "COMPUTATIONAL SCAFFOLD", desc: "A proprietary scaffold architecture guides material formation, enabling localised control of density, porosity, and mechanical properties." },
    { num: "03", title: "INTEGRATED STRUCTURE", desc: "The scaffold and biological matrix fuse into a single monomaterial system — eliminating adhesives, lamination, and multi-layer construction." },
    { num: "04", title: "DESIGNED FOR INDUSTRY", desc: "Output is compatible with existing die-cutting and processing equipment. No factory retooling required." },
  ];

  return <section style={{minHeight:"100vh",display:"flex",flexDirection:"column",position:"relative",padding:"140px clamp(24px,8vw,120px) 80px"}}>
    <ScrollReveal>
      <div style={{maxWidth:820,marginBottom:20}}>
        <div style={{display:"flex",alignItems:"flex-end",gap:14,marginBottom:24}}>
          <span className="bt" style={{fontSize:13,letterSpacing:"0.2em",opacity:0.5,paddingBottom:8}}>03</span>
          <span className="hl" style={{fontSize:"clamp(28px,4vw,42px)",opacity:0.4}}>TECH</span>
        </div>
        <div className="hl" style={{fontSize:"clamp(40px,8vw,100px)",lineHeight:0.9,letterSpacing:"-0.02em",marginBottom:20}}>
          THE VENA PROJECT
        </div>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:32,flexWrap:"wrap"}}>
          <div style={{padding:"5px 15px",border:"1px solid rgba(255,255,255,0.35)",display:"inline-block"}}>
            <span className="bt" style={{fontSize:12,letterSpacing:"0.25em",color:"#fff",opacity:0.9}}>PATENT PENDING</span>
          </div>
          <span className="bt" style={{fontSize:13,letterSpacing:"0.2em",color:"rgba(255,255,255,0.8)"}}>IMPERIAL COLLEGE LONDON · VIETNAM</span>
        </div>
        <p className="bt" style={{fontSize:18,lineHeight:2,color:"rgba(255,255,255,0.92)",maxWidth:680,letterSpacing:"0.02em"}}>
          A platform technology that grows structured materials using biological processes guided by computational geometry. The result is a new class of material — one that is instructed, not manufactured.
        </p>
      </div>
    </ScrollReveal>

    <div style={{width:"100%",height:1,background:"linear-gradient(to right,rgba(255,255,255,0.2),transparent)",margin:"40px 0 48px"}}/>

    <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"1fr 1fr",gap:isMobile?32:48,maxWidth:1000}}>
      {pillars.map((p,i) => <ScrollReveal key={i} delay={i*120}>
        <div style={{paddingLeft:22,borderLeft:"2px solid rgba(255,255,255,0.22)"}}>
          <div className="bt" style={{fontSize:12,letterSpacing:"0.3em",color:"rgba(255,255,255,0.6)",marginBottom:12}}>{p.num}</div>
          <div className="hl" style={{fontSize:"clamp(18px,2.2vw,26px)",marginBottom:14,lineHeight:1.2}}>{p.title}</div>
          <p className="bt" style={{fontSize:16,lineHeight:1.85,color:"rgba(255,255,255,0.9)",letterSpacing:"0.02em"}}>{p.desc}</p>
        </div>
      </ScrollReveal>)}
    </div>

    <div style={{marginTop:80}}><Footer/></div>
  </section>;
}

/* ─── QUESTIONNAIRE ─── */
const SECTORS = [
  {
    id:"textile_integrators",label:"Textile Manufacturing Integrator",short:"Textile Integrator",
    description:"2nd-tier company combining materials and components into intermediaries (e.g. M.I.T Vietnam)",
    hypotheses:[
      {id:"h1",statement:"Integration into existing manufacturing processes",questions:[
        {id:"q1",label:"Can you walk us through your current material intake process? Do you need a datasheet?",type:"textarea"},
        {id:"q2",label:"What material formats do your machines currently accept (rolls, sheets, pellets, wet substrate)? What physical tolerances are critical for uninterrupted production?",type:"textarea"},
        {id:"q3",label:"How do you currently evaluate a new material's compatibility with your equipment before committing to a production run?",type:"textarea"},
        {id:"q4",label:"If you were to consider licensing a novel material platform, who in your organisation would be the key decision-makers, and what data or certifications would they need?",type:"textarea"},
      ]},
      {id:"h2",statement:"Monomaterial technology shortens manufacturing timelines",questions:[
        {id:"q5",label:"How many distinct material layers or components typically go into one of your finished intermediary products, and which bonding methods do you use?",type:"textarea"},
        {id:"q6",label:"What proportion of your production time or labour cost is attributable to lamination, adhesive application, or drying/curing stages?",type:"textarea"},
        {id:"q7",label:"Have you experienced quality or consistency issues caused by adhesive failure, delamination, or multi-layer alignment? How significant in terms of reject rates or rework?",type:"textarea"},
        {id:"q8",label:"If a single-material component could replace a bonded multi-layer stack with equivalent or better performance, what would need to be true about its mechanical properties and processability?",type:"textarea"},
        {id:"q9",label:"Are there regulatory or customer requirements around adhesive chemicals or VOC emissions in your production environment that influence your material choices?",type:"textarea"},
      ]},
    ],
  },
  {
    id:"global_brands",label:"Global Footwear / Apparel Brand",short:"Global Brand",
    description:"Brand with focus on design innovation — Nike, Adidas, Zellerfeld, Camper, Puma, etc.",
    hypotheses:[
      {id:"h1",statement:"Localised custom material properties",questions:[
        {id:"q1",label:"When developing a new product line, at what stage do you specify material properties and how often does this happen?",type:"textarea"},
        {id:"q2",label:"Can you describe a project where you wished you could fine-tune a material's stiffness, breathability, or cushioning in specific areas, but couldn't because of supplier limitations?",type:"textarea"},
        {id:"q3",label:"How do you currently communicate customised material specifications to your suppliers? What documentation is required?",type:"textarea"},
        {id:"q4",label:"If you could dial in material density, porosity, or tensile strength at specific locations in a component, what products or applications would that unlock?",type:"textarea"},
        {id:"q5",label:"What is your internal process for approving and testing a new material before it reaches prototype stage — who is involved and what timeline does it require?",type:"textarea"},
      ]},
      {id:"h2",statement:"Biodegradability over recyclability at end-of-life",questions:[
        {id:"q6",label:"How do you conduct testing for EN 13432 or ASTM D6400? Are we supplying this? How often does this need to be updated?",type:"textarea"},
        {id:"q7",label:"Are any of your product lines currently subject to extended producer responsibility (EPR) regulations or incoming legislation that would make end-of-life material behaviour a compliance issue?",type:"textarea"},
        {id:"q8",label:"If a material were fully biodegradable under standard composting conditions but could not be mechanically recycled, how would that affect its appeal in your material selection process?",type:"textarea"},
        {id:"q9",label:"Do you have internal KPIs for biodegradable content of each product?",type:"textarea"},
      ]},
      {id:"h3",statement:"Willingness to pay premium for sustainable alternatives",questions:[
        {id:"q10",label:"What percentage price premium have you historically accepted for a material that offers a demonstrable sustainability advantage?",type:"text"},
        {id:"q11",label:"What material do you use to benchmark against — the current solution or best in class?",type:"textarea"},
        {id:"q12",label:"How do you calculate or communicate the return on investment for a sustainable material? (brand equity, reduced carbon fees, consumer price uplift at retail)",type:"textarea"},
        {id:"q13",label:"Are there specific product tiers — premium lines, limited editions, innovation capsules — where a higher material cost would be more easily absorbed?",type:"textarea"},
      ]},
      {id:"h4",statement:"Paris Agreement / climate commitment alignment",questions:[
        {id:"q14",label:"What carbon or lifecycle assessment data would you require from a material supplier?",type:"textarea"},
        {id:"q15",label:"Is there a price at which a verified low-carbon material becomes commercially justified for you?",type:"textarea"},
      ]},
      {id:"h5",statement:"Aesthetic and quality perception over synthetic competitors",questions:[
        {id:"q16",label:"When you evaluate a new material for the first time, what sensory or visual cues do you use to form an initial quality impression? Do you have KPIs for that?",type:"textarea"},
      ]},
    ],
  },
  {
    id:"cellulose_producer",label:"Cellulose Producer",short:"Cellulose Producer",
    description:"Manufacturer of pure cellulosic materials (e.g. HNB Bio, cosmetic facemask manufacturers)",
    hypotheses:[{id:"h1",statement:"Scaffold-based material can improve cosmetic facemask products",questions:[
      {id:"q1",label:"What are the most common manufacturing defects or performance limitations you encounter with your current cellulose sheet masks?",type:"textarea"},
      {id:"q2",label:"How do you currently control sheet porosity and liquid absorption rate in your production process, and what tolerances are acceptable for your cosmetic brand customers?",type:"textarea"},
      {id:"q3",label:"If a scaffold-structured bacterial cellulose substrate could demonstrably improve mask adherence to facial contours and active ingredient delivery, what would your validation and regulatory approval process look like?",type:"textarea"},
    ]}],
  },
  {
    id:"product_consultants",label:"Product Consultants / CMF Library",short:"Consultant / CMF",
    description:"Material design agencies, capsule collection consultants, CMF libraries (Material Bank, HIIDA Lab)",
    hypotheses:[{id:"h1",statement:"CMF Library and consultant integration",questions:[
      {id:"q1",label:"Is anyone using CMF Libraries? If so, how often and for what types of projects?",type:"textarea"},
      {id:"q2",label:"How many brands are accessing the CMF library currently?",type:"text"},
      {id:"q3",label:"What are your fees for material listing and brand access?",type:"text"},
      {id:"q4",label:"What does the typical onboarding process look like for new materials being added to the library?",type:"textarea"},
    ]}],
  },
];

const STORAGE_KEY = "shape_science_responses_v1";
function saveResponse(sectorId, answers) {
  try { const e = JSON.parse(localStorage.getItem(STORAGE_KEY)||"[]"); e.push({id:Date.now()+"_"+Math.random().toString(36).slice(2,8),sector:sectorId,timestamp:new Date().toISOString(),answers}); localStorage.setItem(STORAGE_KEY,JSON.stringify(e)); return true; } catch(e){return false;}
}
function loadResponses() { try{return JSON.parse(localStorage.getItem(STORAGE_KEY)||"[]");}catch(e){return[];} }

function QuestionnairePage() {
  const [selectedSector, setSelectedSector] = useState(null);
  const [formData, setFormData] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const update = (id,val) => setFormData(prev=>({...prev,[id]:val}));
  const inputStyle = {width:"100%",background:"transparent",border:"none",borderBottom:"1px solid rgba(255,255,255,0.2)",color:"#fff",padding:"12px 0",fontSize:15,fontWeight:300,fontFamily:"'Helvetica Neue',Helvetica,sans-serif",outline:"none",letterSpacing:"0.02em",cursor:"none"};

  const handleSubmit = () => {
    saveResponse(selectedSector.id, formData);
    const lines = [`Sector: ${selectedSector.label}`,`Submitted: ${new Date().toISOString()}`,"",
      ...selectedSector.hypotheses.flatMap(h=>[`--- ${h.statement} ---`,...h.questions.map(q=>`${q.label}\n  ${formData[q.id]||"(no answer)"}`),""])
    ].join("\n");
    window.open(`mailto:${EMAIL_TARGET}?subject=${encodeURIComponent(`Shape Science — ${selectedSector.short} response`)}&body=${encodeURIComponent(lines)}`);
    setSubmitted(true);
  };

  if(submitted) return <section style={{minHeight:"100vh",display:"flex",flexDirection:"column",justifyContent:"center",alignItems:"center",padding:"120px 24px"}}>
    <h2 className="hl" style={{fontSize:"clamp(28px,5vw,56px)",marginBottom:20}}>RECEIVED</h2>
    <p className="bt" style={{fontSize:14,opacity:0.5,letterSpacing:"0.12em",textAlign:"center",maxWidth:480}}>Your response has been logged. Thank you for contributing to the Shape Science research.</p>
    <Footer/>
  </section>;

  if (!selectedSector) return <section style={{minHeight:"100vh",padding:"140px clamp(24px,8vw,160px) 80px"}}>
    <ScrollReveal>
      <div style={{display:"flex",alignItems:"flex-end",gap:16,marginBottom:16}}>
        <span className="bt" style={{fontSize:13,letterSpacing:"0.2em",opacity:0.5,paddingBottom:6}}>04</span>
        <h1 className="hl" style={{fontSize:"clamp(36px,7vw,72px)"}}>QUESTIONNAIRE</h1>
      </div>
      <p className="bt" style={{fontSize:14,letterSpacing:"0.15em",opacity:0.45,marginBottom:60}}>select your sector to begin</p>
    </ScrollReveal>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(320px,1fr))",gap:16,maxWidth:1200}}>
      {SECTORS.map((s,i)=><ScrollReveal key={s.id} delay={i*100}>
        <div onClick={()=>setSelectedSector(s)} style={{padding:"32px 28px",border:"1px solid rgba(255,255,255,0.12)",background:"rgba(255,255,255,0.01)",cursor:"none",transition:"all 0.4s",minHeight:200,display:"flex",flexDirection:"column",justifyContent:"space-between"}}
          onMouseEnter={e=>{e.currentTarget.style.background="rgba(255,255,255,0.04)";e.currentTarget.style.borderColor="rgba(255,255,255,0.4)";}}
          onMouseLeave={e=>{e.currentTarget.style.background="rgba(255,255,255,0.01)";e.currentTarget.style.borderColor="rgba(255,255,255,0.12)";}}>
          <div>
            <div className="bt" style={{fontSize:11,letterSpacing:"0.25em",opacity:0.4,marginBottom:14}}>0{i+1} / SECTOR</div>
            <div className="hl" style={{fontSize:22,lineHeight:1.15,marginBottom:14}}>{s.label}</div>
            <div className="bt" style={{fontSize:14,opacity:0.7,lineHeight:1.5}}>{s.description}</div>
          </div>
          <div className="bt" style={{fontSize:11,letterSpacing:"0.2em",opacity:0.5,marginTop:24,textTransform:"uppercase"}}>{s.hypotheses.reduce((n,h)=>n+h.questions.length,0)} questions →</div>
        </div>
      </ScrollReveal>)}
    </div>
    <div style={{marginTop:80}}><Footer/></div>
  </section>;

  return <section style={{minHeight:"100vh",padding:"140px clamp(24px,8vw,160px) 80px"}}>
    <ScrollReveal>
      <div onClick={()=>{setSelectedSector(null);setFormData({});}} className="bt" style={{fontSize:11,letterSpacing:"0.2em",opacity:0.5,marginBottom:24,cursor:"none",display:"inline-block",textTransform:"uppercase"}}
        onMouseEnter={e=>e.target.style.opacity=0.9} onMouseLeave={e=>e.target.style.opacity=0.5}>← change sector</div>
      <div style={{display:"flex",alignItems:"flex-end",gap:16,marginBottom:16}}>
        <span className="bt" style={{fontSize:13,letterSpacing:"0.2em",opacity:0.5,paddingBottom:6}}>04</span>
        <h1 className="hl" style={{fontSize:"clamp(28px,5vw,56px)"}}>{selectedSector.label.toUpperCase()}</h1>
      </div>
      <p className="bt" style={{fontSize:13,letterSpacing:"0.12em",opacity:0.4,marginBottom:80,maxWidth:600}}>{selectedSector.description}</p>
    </ScrollReveal>
    {selectedSector.hypotheses.map((h,hi)=><ScrollReveal key={h.id} delay={hi*80}>
      <div style={{marginBottom:80}}>
        <div className="bt" style={{fontSize:10,letterSpacing:"0.3em",opacity:0.35,marginBottom:8}}>HYPOTHESIS {String(hi+1).padStart(2,"0")}</div>
        <div className="hl" style={{fontSize:"clamp(18px,2.4vw,26px)",marginBottom:14,maxWidth:780,lineHeight:1.25}}>{h.statement}</div>
        <div style={{width:40,height:1,background:"rgba(255,255,255,0.25)",marginBottom:36}}/>
        {h.questions.map((q,qi)=><div key={q.id} style={{marginBottom:36}}>
          <label className="bt" style={{fontSize:14,opacity:0.85,display:"block",marginBottom:10,lineHeight:1.45,maxWidth:780}}>
            <span style={{opacity:0.4,marginRight:10}}>Q{qi+1}.</span>{q.label}
          </label>
          {q.type==="textarea"
            ? <textarea style={{...inputStyle,resize:"vertical",minHeight:60,maxWidth:780}} value={formData[q.id]||""} onChange={e=>update(q.id,e.target.value)} onFocus={e=>e.target.style.borderBottomColor="rgba(255,255,255,0.6)"} onBlur={e=>e.target.style.borderBottomColor="rgba(255,255,255,0.2)"}/>
            : <input style={{...inputStyle,maxWidth:780}} value={formData[q.id]||""} onChange={e=>update(q.id,e.target.value)} onFocus={e=>e.target.style.borderBottomColor="rgba(255,255,255,0.6)"} onBlur={e=>e.target.style.borderBottomColor="rgba(255,255,255,0.2)"}/>
          }
        </div>)}
      </div>
    </ScrollReveal>)}
    <ScrollReveal delay={400}>
      <div onClick={handleSubmit} className="bt" style={{display:"inline-block",padding:"16px 60px",border:"1px solid rgba(255,255,255,0.4)",fontSize:13,letterSpacing:"0.18em",fontWeight:300,cursor:"none",transition:"all 0.5s",marginTop:20,textTransform:"uppercase"}}
        onMouseEnter={e=>{e.target.style.background="rgba(255,255,255,0.08)";e.target.style.borderColor="#fff";}}
        onMouseLeave={e=>{e.target.style.background="transparent";e.target.style.borderColor="rgba(255,255,255,0.4)";}}>Submit Response</div>
    </ScrollReveal>
    <div style={{marginTop:80}}><Footer/></div>
  </section>;
}

/* ─── RESULTS PAGE ─── */
function ResultsPage() {
  const [unlocked, setUnlocked] = useState(false);
  const [pw, setPw] = useState("");
  const [error, setError] = useState(false);
  const [activeTheme, setActiveTheme] = useState("ALL");

  const tryUnlock = () => { if (pw.toUpperCase()==="SHAPE"){setUnlocked(true);setError(false);} else {setError(true);setTimeout(()=>setError(false),1500);} };

  if (!unlocked) return <section style={{minHeight:"100vh",display:"flex",flexDirection:"column",justifyContent:"center",alignItems:"center",padding:"120px 24px"}}>
    <div className="bt" style={{fontSize:10,letterSpacing:"0.4em",opacity:0.4,marginBottom:24}}>RESTRICTED</div>
    <div className="hl" style={{fontSize:"clamp(40px,8vw,90px)",marginBottom:48,textAlign:"center"}}>RESULTS</div>
    <input type="password" value={pw} onChange={e=>setPw(e.target.value)} onKeyDown={e=>e.key==="Enter"&&tryUnlock()} placeholder="password"
      style={{width:280,background:"transparent",border:"none",borderBottom:error?"1px solid #ff4444":"1px solid rgba(255,255,255,0.3)",color:"#fff",padding:"14px 0",fontSize:18,fontFamily:"'Helvetica Neue',Helvetica,sans-serif",fontWeight:300,textAlign:"center",letterSpacing:"0.4em",outline:"none",cursor:"none",transition:"border-color 0.3s"}}/>
    <div onClick={tryUnlock} className="bt" style={{marginTop:32,padding:"12px 48px",border:"1px solid rgba(255,255,255,0.3)",fontSize:12,letterSpacing:"0.2em",cursor:"none",textTransform:"uppercase",transition:"all 0.4s"}}>Unlock</div>
    {error && <div className="bt" style={{marginTop:16,fontSize:11,color:"#ff6666",letterSpacing:"0.15em"}}>INVALID</div>}
  </section>;

  const FACTORY_PHOTOS = [
    {src:"/assets/factory-01.jpg",label:"Medium Factory HCMC — Assembly Floor"},
    {src:"/assets/factory-02.jpg",label:"Finished Product — Leather Sneakers"},
    {src:"/assets/factory-03.jpg",label:"Material Cutting — Leather Hides"},
    {src:"/assets/factory-04.jpg",label:"Cutting Room — Full View"},
    {src:"/assets/factory-05.jpg",label:"Pattern Layout — Die Cutting"},
    {src:"/assets/factory-06.jpg",label:"Hand Lasting — Sole Assembly"},
    {src:"/assets/factory-07.jpg",label:"XTL — Sample Room & Meeting"},
    {src:"/assets/factory-08.jpg",label:"Sumtop Footwear Vietnam — Exterior"},
    {src:"/assets/factory-09.jpg",label:"APEX — Factory Complex"},
  ];

  const INSIGHT_THEMES = [
    {id:"manufacturing_compatibility",theme:"MANUFACTURING COMPATIBILITY",tagline:"Can the material run on existing production lines, and at what scale?",insights:[
      {text:"3D printing is ideal for prototyping, but injection moulding is essential for economical mass-scale production.",sources:["Zellerfeld"],tag:"RECURRING"},
      {text:"3D printing cost per unit is not competitive at footwear volumes — large factories run minimum orders of several thousand per size.",sources:["Zellerfeld","XTL","Sumtop"],tag:"CONSTRAINT"},
      {text:"The material must be die-cuttable on existing equipment. Any change to the production line meets strong resistance.",sources:["XTL","Sumtop","Medium Factory HCMC","APEX"],tag:"RECURRING"},
      {text:"Flat sheets and rolls are the accepted format. Wet or damp substrates cannot be accommodated by current workflows.",sources:["Medium Factory HCMC"],tag:"CONSTRAINT"},
      {text:"Temperature-controlled processing windows are critical — many failures occur when materials fall outside specification.",sources:["XTL"],tag:"REQUIREMENT"},
      {text:"A monomaterial that replaces a bonded multi-layer upper removes adhesive, drying and lamination — the main complexity and reject drivers.",sources:["Medium Factory HCMC","XTL"],tag:"OPPORTUNITY"},
    ]},
    {id:"supply_chain_scaling",theme:"SUPPLY CHAIN & SCALING",tagline:"Can the raw material be produced reliably and affordably at volume?",insights:[
      {text:"Bacterial cellulose is already grown at scale using methods very close to the lab process — scalability is confirmed.",sources:["Ben Tre Facilities"],tag:"VALIDATED"},
      {text:"Contamination is the biggest production issue, and temperature fluctuation drives thickness inconsistency.",sources:["Ben Tre Facilities"],tag:"CHALLENGE"},
      {text:"A meaningful share of finished sheets is rejected at QC for thickness, holes, or uneven moisture.",sources:["HNB Bio"],tag:"PAIN POINT"},
      {text:"Vietnam is becoming the global footwear hub — materials are sourced from China and manufactured in Vietnam.",sources:["XTL","Sumtop","APEX"],tag:"RECURRING"},
      {text:"Novel materials must ship with datasheets, tolerances, dimensions, processing windows and certifications to be adopted.",sources:["XTL","Sumtop"],tag:"REQUIREMENT"},
      {text:"Wet materials are expensive to move internationally; transport and storage are significant cost drivers.",sources:["HNB Bio"],tag:"CONSTRAINT"},
    ]},
    {id:"adoption_barriers",theme:"MATERIAL ADOPTION BARRIERS",tagline:"What stands between a novel material and a real production run?",insights:[
      {text:"Material decisions at large factories are entirely brand-driven — the factory runs whatever the brand's approved list specifies.",sources:["XTL","Sumtop","APEX"],tag:"RECURRING"},
      {text:"New suppliers face factory audits, full datasheets and physical test reports; approval typically takes several months.",sources:["XTL","Sumtop"],tag:"BARRIER"},
      {text:"Factories rarely drive adoption — brands specify, factories manufacture. Go to market brand-first, manufacturer second.",sources:["Cross-company"],tag:"INSIGHT"},
      {text:"Scalability outranks sustainability: process compatibility, throughput, yield and cost come first.",sources:["Cross-company"],tag:"RECURRING"},
      {text:"A novel material must behave like an existing industrial material before a factory will trial it.",sources:["XTL"],tag:"CONSTRAINT"},
    ]},
    {id:"commercialisation",theme:"COMMERCIALISATION PATHWAYS",tagline:"Where does the material enter the market, and how does it scale?",insights:[
      {text:"Medium-scale factories are the realistic first customer — lower barriers, practical testing, and the owner decides directly.",sources:["Medium Factory HCMC"],tag:"RECURRING"},
      {text:"Limited-edition and innovation capsules are the natural brand entry point — they absorb the highest retail premiums.",sources:["Zellerfeld","XTL","Sumtop"],tag:"OPPORTUNITY"},
      {text:"Brands accept a modest material-cost premium for a demonstrable sustainability advantage, depending on product tier.",sources:["Zellerfeld","XTL","Sumtop"],tag:"DATA POINT"},
      {text:"A phased path emerged: innovation capsules, then premium programmes, then large-scale partnerships, then mass market.",sources:["Cross-company"],tag:"INSIGHT"},
      {text:"The largest manufacturers produce for major global brands and are always sourcing new materials that meet brand specs.",sources:["APEX"],tag:"OPPORTUNITY"},
      {text:"Large factories often co-develop products with brands — they can become innovation partners, not just contractors.",sources:["APEX","Cross-company"],tag:"FUTURE"},
    ]},
    {id:"new_markets",theme:"NEW MARKET OPPORTUNITIES",tagline:"Adjacent markets discovered along the way.",insights:[
      {text:"Cosmetic sheet masks emerged as a realistic secondary market — existing cellulose supply chains and infrastructure already fit.",sources:["HNB Bio"],tag:"OPPORTUNITY"},
      {text:"For cosmetic masks, adherence to facial contours and active-ingredient delivery are the metrics brands care most about.",sources:["HNB Bio"],tag:"INSIGHT"},
      {text:"Technical textiles offer lamination-reduction opportunities for the same monomaterial approach.",sources:["Cross-company"],tag:"OPPORTUNITY"},
      {text:"Apparel benefits from localised material-property tuning — the same capability that differentiates the footwear scaffold.",sources:["Cross-company"],tag:"INSIGHT"},
      {text:"Footwear remains the strongest primary market — the adjacent markets are upside, not a pivot.",sources:["Cross-company"],tag:"RECURRING"},
    ]},
  ];

  const RESPONDENTS = [
    {name:"Zellerfeld",location:"Hamburg, Germany",type:"3D Printing Factory",scale:"World\u2019s largest 3D printed shoe factory"},
    {name:"XTL (Xingtailai)",location:"Hanoi, Vietnam",type:"Large-Scale Footwear",scale:"Adidas, Prada, New Balance, Under Armour, Vans"},
    {name:"Sumtop Footwear Vietnam",location:"Ho Chi Minh City, Vietnam",type:"Large-Scale Footwear",scale:"Skechers, FILA, Gola, DVS, DC"},
    {name:"APEX",location:"Ho Chi Minh City, Vietnam",type:"Large-Scale Footwear",scale:"Skechers, Zara, ECCO, DC"},
    {name:"Medium-Scale Factory",location:"HCMC Region, Vietnam",type:"Medium Footwear",scale:"MOQ ~200 units"},
    {name:"HNB Bio Cellulose",location:"Ho Chi Minh City, Vietnam",type:"Cellulose Processing",scale:"End-product manufacturing from BC sheets"},
    {name:"Ben Tre Growth Facilities",location:"Ben Tre, Vietnam",type:"Cellulose Growth",scale:"Bacterial cellulose growth sites"},
  ];

  const tagColors = {
    "RECURRING":{bg:"rgba(255,255,255,0.12)",border:"rgba(255,255,255,0.45)"},
    "VALIDATED":{bg:"rgba(80,200,120,0.15)",border:"rgba(80,200,120,0.5)"},
    "OPPORTUNITY":{bg:"rgba(100,180,255,0.12)",border:"rgba(100,180,255,0.45)"},
    "DATA POINT":{bg:"rgba(255,200,60,0.12)",border:"rgba(255,200,60,0.45)"},
    "PAIN POINT":{bg:"rgba(255,100,100,0.12)",border:"rgba(255,100,100,0.45)"},
    "CHALLENGE":{bg:"rgba(255,150,50,0.12)",border:"rgba(255,150,50,0.45)"},
    "CONSTRAINT":{bg:"rgba(200,150,255,0.12)",border:"rgba(200,150,255,0.45)"},
    "BARRIER":{bg:"rgba(255,80,80,0.1)",border:"rgba(255,80,80,0.4)"},
    "REQUIREMENT":{bg:"rgba(180,180,255,0.1)",border:"rgba(180,180,255,0.45)"},
    "INSIGHT":{bg:"rgba(255,255,255,0.06)",border:"rgba(255,255,255,0.3)"},
    "FUTURE":{bg:"rgba(100,220,200,0.1)",border:"rgba(100,220,200,0.45)"},
  };

  const filteredThemes = activeTheme === "ALL" ? INSIGHT_THEMES : INSIGHT_THEMES.filter(t => t.id === activeTheme);
  const recurringCount = INSIGHT_THEMES.reduce((s,t) => s + t.insights.filter(i => i.tag === "RECURRING").length, 0);
  const totalInsights = INSIGHT_THEMES.reduce((s,t) => s + t.insights.length, 0);
  const carouselPhotos = [...FACTORY_PHOTOS, ...FACTORY_PHOTOS];

  return <section style={{minHeight:"100vh",padding:"120px 0 60px",maxWidth:"100%",overflow:"hidden"}}>
    <div style={{padding:"0 clamp(24px,6vw,80px)",maxWidth:1100,margin:"0 auto"}}>
      <div style={{display:"flex",alignItems:"flex-end",gap:16,marginBottom:8}}>
        <span className="bt" style={{fontSize:12,letterSpacing:"0.2em",opacity:0.5,paddingBottom:6}}>06</span>
        <h1 className="hl" style={{fontSize:"clamp(32px,6vw,60px)"}}>RESULTS</h1>
      </div>
      <p className="bt" style={{fontSize:16,color:"rgba(255,255,255,0.85)",lineHeight:1.75,marginBottom:40,maxWidth:760,letterSpacing:"0.02em"}}>
        Insights from {RESPONDENTS.length} manufacturer visits across Germany and Vietnam, March\u2013May 2026 — distilled into five headline categories to surface the patterns that matter across the supply chain.
      </p>
    </div>

    <div style={{marginBottom:12,padding:"0 clamp(24px,6vw,80px)"}}>
      <div className="hl" style={{fontSize:"clamp(20px,3vw,32px)",marginBottom:6}}>FACTORIES VISITED</div>
      <p className="bt" style={{fontSize:12,letterSpacing:"0.2em",opacity:0.55,marginBottom:20}}>{RESPONDENTS.length} MANUFACTURERS · GERMANY & VIETNAM</p>
    </div>
    <div style={{width:"100%",overflow:"hidden",marginBottom:16}}>
      <div style={{display:"flex",gap:16,animation:"carouselScroll 40s linear infinite",width:"max-content"}}>
        {carouselPhotos.map((p,i) => <div key={i} style={{flex:"0 0 auto",width:"clamp(280px,30vw,400px)",position:"relative"}}>
          <img src={p.src} alt={p.label} style={{width:"100%",height:220,objectFit:"cover",filter:"grayscale(100%) contrast(1.1)",display:"block"}}
            onError={e=>{e.target.style.display="none"}}/>
          <div className="bt" style={{position:"absolute",bottom:8,left:10,fontSize:10,letterSpacing:"0.15em",opacity:0.6,mixBlendMode:"difference"}}>{p.label}</div>
        </div>)}
      </div>
    </div>

    <div style={{textAlign:"center",marginBottom:48,padding:"16px 0"}}>
      <div className="bt" style={{fontSize:11,letterSpacing:"0.3em",opacity:0.45,textTransform:"uppercase",marginBottom:8}}>scroll for insights</div>
      <div style={{fontSize:18,opacity:0.3,animation:"floatArrow 2s ease-in-out infinite"}}>↓</div>
    </div>

    <div style={{padding:"0 clamp(24px,6vw,80px)",maxWidth:1100,margin:"0 auto"}}>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:16,marginBottom:48}}>
        {[{label:"MANUFACTURERS",value:RESPONDENTS.length},{label:"INSIGHT THEMES",value:INSIGHT_THEMES.length},{label:"TOTAL INSIGHTS",value:totalInsights},{label:"RECURRING",value:recurringCount}].map(s=>
          <div key={s.label} style={{border:"1.5px solid rgba(255,255,255,0.16)",padding:"20px 16px",textAlign:"center"}}>
            <div className="hl" style={{fontSize:34,marginBottom:6}}>{s.value}</div>
            <div className="bt" style={{fontSize:11,letterSpacing:"0.22em",opacity:0.55}}>{s.label}</div>
          </div>
        )}
      </div>

      <div className="bt" style={{fontSize:12,letterSpacing:"0.28em",opacity:0.55,marginBottom:14}}>RESPONDENTS</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:10,marginBottom:48}}>
        {RESPONDENTS.map((r,i) => <div key={i} style={{border:"1.5px solid rgba(255,255,255,0.16)",padding:"16px 18px"}}>
          <div className="bt" style={{fontSize:15,opacity:0.95,marginBottom:5,fontWeight:500}}>{r.name}</div>
          <div className="bt" style={{fontSize:13,opacity:0.7,lineHeight:1.55}}>{r.location} · {r.type}<br/>{r.scale}</div>
        </div>)}
      </div>

      <div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:36,paddingBottom:22,borderBottom:"1.5px solid rgba(255,255,255,0.16)"}}>
        {[{id:"ALL",label:"ALL CATEGORIES"},...INSIGHT_THEMES.map(t=>({id:t.id,label:t.theme}))].map(t=>
          <div key={t.id} onClick={()=>setActiveTheme(t.id)} className="bt" style={{
            padding:"8px 14px",border:activeTheme===t.id?"1.5px solid #fff":"1.5px solid rgba(255,255,255,0.22)",
            fontSize:11,letterSpacing:"0.14em",cursor:"none",background:activeTheme===t.id?"rgba(255,255,255,0.1)":"transparent",
            opacity:activeTheme===t.id?1:0.7,transition:"all 0.3s",
          }}>{t.label}</div>
        )}
      </div>

      {filteredThemes.map((theme,ti) => {
        const distinctSources = [...new Set(theme.insights.flatMap(i=>i.sources))].length;
        return <div key={theme.id} style={{marginBottom:48}}>
          <div style={{marginBottom:18}}>
            <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:8,flexWrap:"wrap"}}>
              <div className="bt" style={{fontSize:13,letterSpacing:"0.2em",opacity:0.4}}>{String(ti+1).padStart(2,"0")}</div>
              <div className="hl" style={{fontSize:"clamp(21px,3.4vw,32px)"}}>{theme.theme}</div>
              <div className="bt" style={{fontSize:11,letterSpacing:"0.15em",opacity:0.55,padding:"4px 10px",border:"1.5px solid rgba(255,255,255,0.2)"}}>{theme.insights.length}</div>
              <div className="bt" style={{fontSize:11,letterSpacing:"0.1em",opacity:0.45,marginLeft:"auto"}}>{distinctSources} sources</div>
            </div>
            <div className="bt" style={{fontSize:14,opacity:0.6,lineHeight:1.6}}>{theme.tagline}</div>
          </div>
          <div style={{display:"flex",flexWrap:"wrap",gap:12}}>
            {theme.insights.map((insight,ii) => {
              const tc = tagColors[insight.tag] || tagColors["INSIGHT"];
              return <div key={ii} style={{background:tc.bg,border:`2px solid ${tc.border}`,borderRadius:20,padding:"16px 20px",maxWidth:480,flex:"1 1 300px"}}>
                <div className="bt" style={{fontSize:15,lineHeight:1.6,marginBottom:10,color:"rgba(255,255,255,0.95)"}}>{insight.text}</div>
                <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
                  <div className="bt" style={{fontSize:10,letterSpacing:"0.18em",opacity:0.75,padding:"3px 10px",border:`1.5px solid ${tc.border}`,borderRadius:10}}>{insight.tag}</div>
                  {insight.sources.map((s,si) => <div key={si} className="bt" style={{fontSize:11,opacity:0.45}}>{s}</div>)}
                </div>
              </div>;
            })}
          </div>
        </div>;
      })}
    </div>

    <div style={{padding:"0 clamp(24px,6vw,80px)",maxWidth:1100,margin:"40px auto 0"}}><Footer/></div>
  </section>;
}

/* ─── PRESENTATION PAGE — BBSRC iCURE JOURNEY ─── */
function PresentationPage() {
  const [unlocked, setUnlocked] = useState(false);
  const [pw, setPw] = useState("");
  const [error, setError] = useState(false);
  const [lbSrc, setLbSrc] = useState(null);

  const tryUnlock = () => {
    if (pw.toUpperCase() === "BBSRC") { setUnlocked(true); setError(false); }
    else { setError(true); setTimeout(() => setError(false), 1800); setPw(""); }
  };

  const openLb = (src) => { setLbSrc(src); document.body.style.overflow = "hidden"; };
  const closeLb = () => { setLbSrc(null); document.body.style.overflow = ""; };

  const Img = ({ src, alt, style = {} }) => (
    <img src={src} alt={alt} loading="lazy" onClick={() => openLb(src)}
      onError={e => { e.target.style.opacity = "0.15"; e.target.style.filter = "brightness(0.3)"; }}
      style={{ display: "block", objectFit: "cover", cursor: "zoom-in", filter: "brightness(0.88) contrast(1.06)", ...style }} />
  );

  const FullBleed = ({ src, alt }) => <Img src={src} alt={alt} style={{ width: "100%", aspectRatio: "16/10" }} />;
  const Grid2 = ({ imgs }) => (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 3 }}>
      {imgs.map((im, i) => <Img key={i} src={im.src} alt={im.alt} style={{ width: "100%", aspectRatio: "4/5", minHeight: 200 }} />)}
    </div>
  );
  const Grid3 = ({ imgs }) => (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 3 }}>
      {imgs.map((im, i) => <Img key={i} src={im.src} alt={im.alt} style={{ width: "100%", aspectRatio: "3/4", minHeight: 160 }} />)}
    </div>
  );
  const HeroSide = ({ main, side }) => (
    <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 3 }}>
      <Img src={main.src} alt={main.alt} style={{ width: "100%", aspectRatio: "3/4" }} />
      <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
        {side.map((im, i) => <Img key={i} src={im.src} alt={im.alt} style={{ width: "100%", flex: 1, minHeight: 0 }} />)}
      </div>
    </div>
  );
  const Strip = ({ imgs }) => (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 3 }}>
      {imgs.map((im, i) => <Img key={i} src={im.src} alt={im.alt} style={{ width: "100%", height: 280, objectFit: "cover" }} />)}
    </div>
  );

  const ChapterIntro = ({ num, name, location, meta, desc }) => (
    <div style={{ padding: "clamp(4rem,8vw,6rem) clamp(1.5rem,6vw,4rem)", maxWidth: 800, margin: "0 auto", textAlign: "center" }}>
      <div className="hl" style={{ fontSize: "clamp(5rem,15vw,8rem)", color: "rgba(255,255,255,0.05)", lineHeight: 1 }}>{num}</div>
      <div className="bt" style={{ fontSize: 12, letterSpacing: "0.32em", textTransform: "uppercase", color: "#c9a96b", marginTop: "-0.5rem", marginBottom: "1.2rem" }}>{name}</div>
      <div className="hl" style={{ fontSize: "clamp(2rem,6vw,3.2rem)", marginBottom: "0.8rem", lineHeight: 1.1 }}>{location}</div>
      <div className="bt" style={{ fontSize: 13, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(255,255,255,0.7)", marginBottom: "1.4rem" }}>{meta}</div>
      <p className="bt" style={{ fontSize: 16, lineHeight: 1.95, color: "rgba(255,255,255,0.85)" }}>{desc}</p>
    </div>
  );
  const InsightStrip = ({ label, text, source, dim }) => (
    <div style={{ background: "#0d0d0d", borderLeft: `3px solid ${dim ? "rgba(255,255,255,0.3)" : "#c9a96b"}`, padding: "clamp(1.5rem,4vw,2.2rem) clamp(1.5rem,5vw,3rem)", margin: "2px 0" }}>
      <div className="bt" style={{ fontSize: 12, letterSpacing: "0.28em", textTransform: "uppercase", color: "#c9a96b", marginBottom: "0.6rem" }}>{label}</div>
      <div className="bt" style={{ fontSize: 16, lineHeight: 1.9, color: "rgba(255,255,255,0.9)", maxWidth: 800 }}>{text}</div>
      {source && <div className="bt" style={{ fontSize: 12, letterSpacing: "0.16em", textTransform: "uppercase", color: "rgba(255,255,255,0.55)", marginTop: "0.7rem" }}>{source}</div>}
    </div>
  );
  const QuoteBlock = ({ text, source }) => (
    <div style={{ padding: "clamp(4rem,9vw,7rem) clamp(1.5rem,8vw,6rem)", background: "#0d0d0d", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "44vh", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: "-2rem", left: "-0.5rem", fontFamily: "'Georgia',serif", fontSize: "clamp(9rem,30vw,18rem)", color: "rgba(255,255,255,0.03)", lineHeight: 1, pointerEvents: "none" }}>"</div>
      <p style={{ fontFamily: "'Georgia',serif", fontStyle: "italic", fontSize: "clamp(1.4rem,3.5vw,2.6rem)", lineHeight: 1.45, color: "#e6e2d8", textAlign: "center", maxWidth: 740, position: "relative", zIndex: 1 }}>{text}</p>
      {source && <div className="bt" style={{ fontSize: 12, letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(255,255,255,0.55)", marginTop: "1.2rem", position: "relative", zIndex: 1 }}>{source}</div>}
    </div>
  );
  const Divider = () => (
    <div style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "3rem clamp(1.5rem,5vw,3rem)" }}>
      <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.08)" }} />
      <div style={{ width: 4, height: 4, borderRadius: "50%", background: "#c9a96b" }} />
      <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.08)" }} />
    </div>
  );

  if (!unlocked) return (
    <section style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 0, padding: "2rem" }}>
      <div className="bt" style={{ fontSize: 11, letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", marginBottom: "2.2rem" }}>Restricted Access · BBSRC Presentation</div>
      <div className="hl" style={{ fontSize: "clamp(2.4rem,10vw,4.6rem)", letterSpacing: "0.04em", textAlign: "center", lineHeight: .95, marginBottom: "2.8rem" }}>BBSRC<br/>iCURE<br/>Journey</div>
      <div style={{ width: 1, height: 44, background: "linear-gradient(to bottom,transparent,rgba(255,255,255,0.2),transparent)", marginBottom: "2.8rem" }} />
      <input type="password" value={pw} onChange={e => setPw(e.target.value)} onKeyDown={e => { if (e.key === "Enter") tryUnlock(); }}
        placeholder="PASSWORD" autoCapitalize="characters"
        style={{ width: 220, background: "transparent", border: "none", borderBottom: error ? "1px solid #c44" : "1px solid rgba(255,255,255,0.2)", color: "#fff", fontFamily: "'Helvetica Neue',Helvetica,sans-serif", fontWeight: 300, fontSize: 16, letterSpacing: "0.4em", textAlign: "center", padding: "0.75rem 0", outline: "none", textTransform: "uppercase", transition: "border-color .3s", cursor: "none", display: "block", marginBottom: "0.6rem" }} />
      {error && <div className="bt" style={{ fontSize: 12, letterSpacing: "0.18em", color: "#c44", textTransform: "uppercase", marginBottom: "0.6rem" }}>Incorrect password</div>}
      <div onClick={tryUnlock} className="bt" style={{ marginTop: "0.5rem", background: "transparent", border: "1px solid rgba(255,255,255,0.2)", color: "rgba(255,255,255,0.6)", fontSize: 12, letterSpacing: "0.28em", textTransform: "uppercase", padding: "0.65rem 2.2rem", cursor: "none", transition: "all .3s" }}
        onMouseEnter={e => { e.target.style.borderColor = "#c9a96b"; e.target.style.color = "#c9a96b"; }}
        onMouseLeave={e => { e.target.style.borderColor = "rgba(255,255,255,0.2)"; e.target.style.color = "rgba(255,255,255,0.6)"; }}>Enter</div>
    </section>
  );

  const Z = (f) => `/assets/${f}`;

  return (
    <div style={{ background: "#070707", minHeight: "100vh" }}>
      {lbSrc && (
        <div onClick={closeLb} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.97)", zIndex: 99998, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
          <button onClick={closeLb} className="bt" style={{ position: "absolute", top: "1rem", right: "1.5rem", background: "none", border: "none", color: "rgba(255,255,255,0.4)", fontSize: 12, letterSpacing: ".2em", textTransform: "uppercase", cursor: "none" }}>✕ close</button>
          <img src={lbSrc} alt="" style={{ maxWidth: "100%", maxHeight: "90vh", objectFit: "contain" }} onClick={e => e.stopPropagation()} />
        </div>
      )}

      <section style={{ position: "relative", height: "100svh", minHeight: 600, display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: "clamp(2rem,6vw,4rem)", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: `url('${Z("IMG_6972.jpeg")}')`, backgroundSize: "cover", backgroundPosition: "center 30%", filter: "brightness(.3) contrast(1.15)", transform: "scale(1.04)" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(7,7,7,.97) 0%, rgba(7,7,7,.35) 45%, transparent 100%)" }} />
        <div style={{ position: "relative", zIndex: 2, maxWidth: 880 }}>
          <div className="bt" style={{ fontSize: 13, letterSpacing: "0.32em", textTransform: "uppercase", color: "#c9a96b", marginBottom: "1.3rem" }}>iCURE · BBSRC Innovation to Commercialisation Programme</div>
          <div className="hl" style={{ fontSize: "clamp(3.4rem,15vw,9rem)", lineHeight: .88, marginBottom: "1.5rem" }}>BBSRC<br/>iCURE<br/>Journey</div>
          <div className="bt" style={{ fontSize: 13, letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(255,255,255,0.7)", marginBottom: "1.8rem" }}>Six Weeks · Two Countries · Nine Sites · One Commercial Pathway</div>
          <p className="bt" style={{ fontSize: 16, lineHeight: 1.95, color: "rgba(255,255,255,0.78)", maxWidth: 520 }}>A visual record of factories, laboratories, production facilities, and commercial discoveries — mapping the route from laboratory research to industrial-scale manufacture.</p>
        </div>
        <div style={{ position: "absolute", bottom: "2rem", right: "clamp(1.5rem,4vw,3rem)", display: "flex", flexDirection: "column", alignItems: "center", gap: ".5rem" }}>
          <div style={{ width: 1, height: 50, background: "linear-gradient(to bottom,rgba(255,255,255,0.25),transparent)" }} />
          <span className="bt" style={{ fontSize: 11, letterSpacing: ".28em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", writingMode: "vertical-rl" }}>Scroll</span>
        </div>
      </section>

      <div style={{ maxWidth: 1200, margin: "0 auto" }}>

        <ScrollReveal>
          <div style={{ padding: "clamp(3.5rem,8vw,5.5rem) clamp(1.5rem,5vw,3rem) clamp(2rem,5vw,3rem)" }}>
            <div className="hl" style={{ fontSize: "clamp(2.6rem,10vw,5rem)", lineHeight: .93, letterSpacing: ".03em", marginBottom: "2.2rem" }}>The Journey<br/>in Numbers</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
              {[
                { n: "2",  l: "Countries" },{ n: "3",  l: "Cities" },{ n: "9+", l: "Sites Visited" },{ n: "6",  l: "Weeks" },
                { n: "4",  l: "Biocellulose Factories" },{ n: "5+", l: "Footwear Manufacturers" },{ n: "3\u00d7", l: "HNB Revisits" },{ n: "5",  l: "Insight Themes Mapped" },
              ].map((s, i) => (
                <div key={i} style={{ background: "#0d0d0d", padding: "1.7rem 1.3rem" }}>
                  <div className="hl" style={{ fontSize: "clamp(2.6rem,9vw,4.5rem)", color: "#c9a96b", lineHeight: 1 }}>{s.n}</div>
                  <div className="bt" style={{ fontSize: 13, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(255,255,255,0.6)", marginTop: "0.22rem" }}>{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal>
          <div style={{ padding: "clamp(2.2rem,6vw,4rem) clamp(1.5rem,8vw,6rem)", background: "#0d0d0d", borderTop: "1px solid rgba(255,255,255,0.06)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="bt" style={{ fontSize: 12, letterSpacing: "0.3em", textTransform: "uppercase", color: "#c9a96b", marginBottom: "1.2rem" }}>Why BBSRC iCURE Mattered</div>
            <p style={{ fontFamily: "'Georgia',serif", fontStyle: "italic", fontSize: "clamp(1.2rem,3vw,1.9rem)", lineHeight: 1.6, color: "#e6e2d8", maxWidth: 880 }}>
              The BBSRC iCURE programme transformed Shape Science from a laboratory concept into a commercially-grounded venture. It funded and structured six weeks of direct fieldwork across Germany and Vietnam — putting us inside the factories, growth facilities and supply chains that will ultimately manufacture this material. Every insight on this page exists because iCURE made that journey possible.
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal>
          <div style={{ padding: "clamp(2.5rem,6vw,4.5rem) clamp(1.5rem,5vw,3rem)" }}>
            <div className="bt" style={{ fontSize: 12, letterSpacing: "0.3em", textTransform: "uppercase", color: "#c9a96b", marginBottom: "1rem", textAlign: "center" }}>The Promo Film · 3 Minutes</div>
            <div style={{ position: "relative", width: "100%", maxWidth: 960, margin: "0 auto", aspectRatio: "16/9", background: "#0d0d0d", border: "1px dashed rgba(255,255,255,0.18)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "1rem" }}>
              {/*
                TO EMBED THE VIDEO: delete the two placeholder lines below and paste:
                <iframe src="https://www.youtube.com/embed/YOUR_VIDEO_ID" title="Shape Science Promo"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen
                  style={{ position:"absolute", inset:0, width:"100%", height:"100%", border:"none" }} />
              */}
              <div style={{ width: 0, height: 0, borderLeft: "26px solid rgba(255,255,255,0.5)", borderTop: "16px solid transparent", borderBottom: "16px solid transparent" }} />
              <div className="bt" style={{ fontSize: 12, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)" }}>Promo video coming soon</div>
            </div>
            <p className="bt" style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", textAlign: "center", marginTop: "1rem", letterSpacing: "0.04em" }}>Watch the full story here any time, then scroll on for the field journey.</p>
          </div>
        </ScrollReveal>

        <Divider />

        <ScrollReveal><ChapterIntro num="01" name="Chapter One" location="Zellerfeld" meta="Hamburg, Germany · Additive Manufacturing · Nike, Moncler, Hugo Boss, Havaianas" desc="World's largest fully 3D printed footwear manufacturer. The visit mapped large-scale additive manufacturing capabilities, production throughput constraints, and the critical question of whether biomaterials could integrate into digitally manufactured uppers." /></ScrollReveal>
        <ScrollReveal><Grid2 imgs={[{ src: Z("IMG_6386.jpeg"), alt: "Zellerfeld sign" }, { src: Z("IMG_6387.jpeg"), alt: "Zellerfeld building" }]} /></ScrollReveal>
        <ScrollReveal><InsightStrip label="Key Finding · Manufacturing Route" text="3D printing cost per unit is not competitive at the volumes shoe manufacturers require, so additive manufacturing is best kept for prototyping, limited editions and personalised applications. Injection moulding is the route to economical mass-scale production." source="Source: Zellerfeld · Cross-referenced: XTL, Sumtop" /></ScrollReveal>
        <ScrollReveal><FullBleed src={Z("IMG_6397.jpeg")} alt="Zellerfeld factory floor" /></ScrollReveal>
        <ScrollReveal><Grid2 imgs={[{ src: Z("IMG_6400.jpeg"), alt: "Research team at Zellerfeld" }, { src: Z("IMG_6397.jpeg"), alt: "Zellerfeld printers" }]} /></ScrollReveal>
        <ScrollReveal><QuoteBlock text="Digital fabrication exists at scale. The question is whether biomaterials can meet its dimensional and mechanical demands." source="Zellerfeld · Hamburg" /></ScrollReveal>

        <Divider />

        <ScrollReveal><ChapterIntro num="02" name="Chapter Two" location="CNES Shoes" meta="Ho Chi Minh City, Vietnam · Medium-Scale Manufacture · MOQ ~200 units" desc="First factory floor access in Vietnam. Observed traditional footwear assembly — cutting and stitching workflows, labour structures, and the exact points where a new material format would need to integrate without disrupting existing production lines." /></ScrollReveal>
        <ScrollReveal><FullBleed src={Z("IMG_6972.jpeg")} alt="CNES factory floor" /></ScrollReveal>
        <ScrollReveal><InsightStrip label="Key Finding · Scale & Entry Point" text="Medium-scale factories are the realistic initial customer. Lower barriers, a practical testing approach, and the owner makes decisions directly — no brand approval chain and no multi-month materials approval process." source="Source: CNES Shoes, Medium Factory HCMC" /></ScrollReveal>
        <ScrollReveal><Grid3 imgs={[{ src: Z("IMG_6975.jpeg"), alt: "CNES sewing assembly" }, { src: Z("IMG_6976.jpeg"), alt: "CNC cutting machine" }, { src: Z("IMG_6978.jpeg"), alt: "Cutting station" }]} /></ScrollReveal>
        <ScrollReveal><HeroSide main={{ src: Z("IMG_6993.jpeg"), alt: "Finished sneakers" }} side={[{ src: Z("IMG_6980.jpeg"), alt: "Shoe lasts and sole" }, { src: Z("IMG_6982.jpeg"), alt: "Scanner" }]} /></ScrollReveal>
        <ScrollReveal><InsightStrip label="Key Finding · Monomaterial Advantage" text="A single material replacing the outer, reinforcement and padding layers would dramatically simplify production — if it is die-cuttable, holds shape, and is skin-comfortable. Adhesive failure and delamination are a recurring source of rejects, especially in hot, humid conditions. This is the pain point a monomaterial directly addresses." source="Source: CNES Shoes · Cross-referenced: XTL" /></ScrollReveal>
        <ScrollReveal><Grid2 imgs={[{ src: Z("IMG_7003.jpeg"), alt: "Worker at leather table" }, { src: Z("IMG_7004.jpeg"), alt: "Leather rolls stacked high" }]} /></ScrollReveal>
        <ScrollReveal><Grid3 imgs={[{ src: Z("IMG_7006.jpeg"), alt: "Cut patterns on bench" }, { src: Z("IMG_7008.jpeg"), alt: "Pattern tracing on leather" }, { src: Z("IMG_7002.jpeg"), alt: "Loafers on lasts for QC" }]} /></ScrollReveal>
        <ScrollReveal><InsightStrip label="Key Finding · Supply Chain Integration" text="The material must be die-cuttable with existing equipment — any change to the production line faces strong resistance. Flat sheets and rolls are the accepted format, and wet or damp substrates are a hard constraint current workflows cannot accommodate." source="Source: CNES Shoes, XTL, Sumtop, APEX" /></ScrollReveal>
        <ScrollReveal><Strip imgs={[{ src: Z("IMG_6984.jpeg"), alt: "Boxes and factory" }, { src: Z("IMG_6986.jpeg"), alt: "Finished shoes on shelves" }, { src: Z("IMG_6999.jpeg"), alt: "Textured uppers on lasts" }, { src: Z("IMG_6997.jpeg"), alt: "White uppers in-process" }, { src: Z("IMG_6989.jpeg"), alt: "Assembly detail" }, { src: Z("IMG_6991.jpeg"), alt: "Shoe racks" }]} /></ScrollReveal>
        <ScrollReveal><QuoteBlock text="Factories tell a different story from laboratories. Scale is real, the ecosystem is complex, and integration demands more than material performance alone." source="CNES Shoes · Ho Chi Minh City" /></ScrollReveal>

        <Divider />

        <ScrollReveal><ChapterIntro num="03" name="Chapter Three" location="HNB Cosmetics" meta="Ho Chi Minh City, Vietnam · Biocellulose Manufacturer · Visited 3 Times" desc="Potential manufacturing partner for bacterial nanocellulose at industrial scale. Visited three times — examining fermentation operations, post-processing, quality control, and industrial-scale production constraints first-hand." /></ScrollReveal>
        <ScrollReveal><Grid2 imgs={[{ src: Z("IMG_3531.jpeg"), alt: "HNB production facility" }, { src: Z("IMG_3535.jpeg"), alt: "HNB biocellulose processing" }]} /></ScrollReveal>
        <ScrollReveal><Grid2 imgs={[{ src: Z("IMG_7349.jpeg"), alt: "HNB facility visit" }, { src: Z("IMG_7821.jpeg"), alt: "HNB biocellulose production" }]} /></ScrollReveal>
        <ScrollReveal><InsightStrip label="Key Finding · Cellulose Production" text="A meaningful share of finished cellulose sheets is rejected at QC for thickness inconsistency, holes, or uneven moisture. Porosity is controlled through growth time and sugar concentration, but tolerances are loose and tighter control requires environmental investment. Contamination remains the biggest issue." source="Source: HNB Bio · Cross-referenced: Ben Tre Facilities" /></ScrollReveal>
        <ScrollReveal><InsightStrip label="Key Finding · Cosmetic Application" dim text="Mask adherence to facial contours and active ingredient delivery are the two performance metrics cosmetic brands care most about. If the scaffold demonstrably improves adherence and delivery, cosmetic brand clients would be very interested." source="Source: HNB Bio" /></ScrollReveal>
        <ScrollReveal><QuoteBlock text="Industrial bacterial cellulose production already exists at scale. The question is where it creates the most value." source="HNB Bio · Ho Chi Minh City" /></ScrollReveal>

        <Divider />

        <ScrollReveal><ChapterIntro num="04" name="Chapter Four" location="Xingtailai" meta="Hanoi, Vietnam · Large-Scale Manufacture · Adidas, Prada, Puma, New Balance, Vans, Under Armour" desc="Large-volume production facility producing for some of the world's most demanding footwear brands. Examined production scale requirements, processing envelopes, material performance constraints, and the brand-driven approval process that governs all material decisions at this scale." /></ScrollReveal>
        <ScrollReveal><FullBleed src={Z("Screenshot 2026-06-04 at 1.42.01 pm.png")} alt="Xingtailai factory" /></ScrollReveal>
        <ScrollReveal><Grid3 imgs={[{ src: Z("Screenshot 2026-06-04 at 1.44.03 pm.png"), alt: "Xingtailai production" }, { src: Z("Screenshot 2026-06-04 at 1.44.21 pm.png"), alt: "Xingtailai floor" }, { src: Z("Screenshot 2026-06-04 at 1.44.35 pm.png"), alt: "Xingtailai detail" }]} /></ScrollReveal>
        <ScrollReveal><Grid3 imgs={[{ src: Z("Screenshot 2026-06-04 at 1.44.50 pm.png"), alt: "Xingtailai manufacturing" }, { src: Z("Screenshot 2026-06-04 at 1.45.04 pm.png"), alt: "Xingtailai assembly" }, { src: Z("Screenshot 2026-06-04 at 1.45.28 pm.png"), alt: "Xingtailai overview" }]} /></ScrollReveal>
        <ScrollReveal><Grid2 imgs={[{ src: Z("Screenshot 2026-06-04 at 1.45.48 pm.png"), alt: "Xingtailai facility" }, { src: Z("Screenshot 2026-06-04 at 1.46.08 pm.png"), alt: "Xingtailai production line" }]} /></ScrollReveal>
        <ScrollReveal><InsightStrip label="Key Finding · Supply Chain Integration" text="Material decisions at large factories are entirely brand-driven — the factory processes whatever the brand's approved materials list specifies. A new supplier must pass a factory audit and supply a full data sheet and physical test reports against internal standards before any trial." source="Source: XTL · Cross-referenced: Sumtop, APEX" /></ScrollReveal>
        <ScrollReveal><InsightStrip label="Key Finding · Scale & Entry Point" dim text="Large-scale factories are a longer-term target once the material is proven at smaller volumes. Limited-edition and innovation capsule lines are the natural entry point at brand level — they absorb the highest retail premiums. Variable-density midsoles without multi-piece construction would reduce bill of materials, labour and assembly time." source="Source: XTL, Sumtop, Zellerfeld" /></ScrollReveal>

        <Divider />

        <ScrollReveal><ChapterIntro num="05" name="Chapter Five" location="Sumtop" meta="Ho Chi Minh City, Vietnam · Large-Scale Manufacture · Skechers, FILA, Gola, DVS, DC" desc="Contract manufacturer with full visibility on production economics at scale. Investigated minimum order quantities, manufacturing timelines, tooling requirements, and the batch production economics that any scale-up strategy must account for." /></ScrollReveal>
        <ScrollReveal><FullBleed src={Z("Screenshot 2026-06-04 at 1.46.47 pm.png")} alt="Sumtop factory" /></ScrollReveal>
        <ScrollReveal><Grid3 imgs={[{ src: Z("Screenshot 2026-06-04 at 1.46.57 pm.png"), alt: "Sumtop production" }, { src: Z("Screenshot 2026-06-04 at 1.47.09 pm.png"), alt: "Sumtop floor" }, { src: Z("Screenshot 2026-06-04 at 1.47.21 pm.png"), alt: "Sumtop assembly" }]} /></ScrollReveal>
        <ScrollReveal><Grid3 imgs={[{ src: Z("Screenshot 2026-06-04 at 1.47.31 pm.png"), alt: "Sumtop manufacturing" }, { src: Z("Screenshot 2026-06-04 at 1.47.42 pm.png"), alt: "Sumtop detail" }, { src: Z("Screenshot 2026-06-04 at 1.47.55 pm.png"), alt: "Sumtop overview" }]} /></ScrollReveal>
        <ScrollReveal><Strip imgs={[{ src: Z("Screenshot 2026-06-04 at 1.48.06 pm.png"), alt: "Sumtop facility" }, { src: Z("Screenshot 2026-06-04 at 1.48.18 pm.png"), alt: "Sumtop production line" }, { src: Z("Screenshot 2026-06-04 at 1.48.32 pm.png"), alt: "Sumtop workers" }, { src: Z("Screenshot 2026-06-04 at 1.48.43 pm.png"), alt: "Sumtop machines" }, { src: Z("Screenshot 2026-06-04 at 1.48.56 pm.png"), alt: "Sumtop interior" }, { src: Z("Screenshot 2026-06-04 at 1.49.15 pm.png"), alt: "Sumtop finished goods" }]} /></ScrollReveal>
        <ScrollReveal><QuoteBlock text="Commercialisation depends as much on manufacturing reality as it does on material science. Every constraint in the factory is a design parameter." source="Field Observation · Multiple Factories" /></ScrollReveal>

        <Divider />

        <ScrollReveal><ChapterIntro num="06" name="Chapter Six" location="Apex" meta="Ho Chi Minh City, Vietnam · Advanced Manufacturing · Skechers, Zara, ECCO, DC" desc="Advanced footwear manufacturer with injection moulding capabilities and vertical integration. Investigated production efficiency innovations and routes to reduce manufacturing steps — a critical advantage if a monomaterial upper can eliminate the multi-layer bonding process." /></ScrollReveal>
        <ScrollReveal><FullBleed src={Z("IMG_7750.jpeg")} alt="Apex factory" /></ScrollReveal>
        <ScrollReveal><Grid3 imgs={[{ src: Z("IMG_7751.jpeg"), alt: "Apex production" }, { src: Z("IMG_7754.jpeg"), alt: "Apex manufacturing" }, { src: Z("IMG_7756.jpeg"), alt: "Apex floor" }]} /></ScrollReveal>
        <ScrollReveal><Grid3 imgs={[{ src: Z("3a26c6a7bb86c28eab51b4b5f6b7afb7.jpg"), alt: "Apex facility" }, { src: Z("e36a301d9535540c8025bd42aed98fa4.jpg"), alt: "Apex overview" }, { src: Z("IMG_7758.jpeg"), alt: "Apex detail" }]} /></ScrollReveal>
        <ScrollReveal><InsightStrip label="Key Finding · Scale & Entry Point" text="The largest manufacturers — Apex-scale and above — produce for major global brands and are always actively sourcing new materials that meet brand specifications. The pathway is clear: prove at medium scale, accumulate test data, then enter the brand approval process. The infrastructure to scale already exists." source="Source: APEX" /></ScrollReveal>

        <Divider />

        <ScrollReveal><ChapterIntro num="07" name="Chapter Seven" location="Textile Supply Chain" meta="Ho Chi Minh City, Vietnam · Wholesale Fabric Supplier" desc="Wholesale textile supplier serving footwear factories across the region. Understanding material dimensions, roll formats, MOQ requirements and lead times revealed what format any new material must conform to." /></ScrollReveal>
        <ScrollReveal><FullBleed src={Z("IMG_7833.jpeg")} alt="Wholesale fabric supplier" /></ScrollReveal>
        <ScrollReveal><Grid2 imgs={[{ src: Z("IMG_7835.jpeg"), alt: "Fabric rolls" }, { src: Z("IMG_7837.jpeg"), alt: "Textile stock" }]} /></ScrollReveal>
        <ScrollReveal><Grid2 imgs={[{ src: Z("IMG_7840.jpeg"), alt: "Material sourcing" }, { src: Z("IMG_7841.jpeg"), alt: "Fabric supplier detail" }]} /></ScrollReveal>
        <ScrollReveal><QuoteBlock text="Every conversation revealed another layer of the ecosystem. Supply chains are architectures of constraint — and constraint is where opportunity lives." source="Field Observation · HCMC" /></ScrollReveal>

        <Divider />

        <ScrollReveal><ChapterIntro num="08" name="Chapter Eight" location="Biocellulose Factories" meta="Ho Chi Minh City Region & Ben Tre, Vietnam · 4 Facilities · Cosmetic & Food Grade" desc="Four separate bacterial nanocellulose production facilities. The Ben Tre visits confirmed that scalability is no longer the primary challenge — production methods closely mirror the laboratory process. Contamination control and thickness consistency remain the key manufacturing constraints." /></ScrollReveal>
        <ScrollReveal><FullBleed src={Z("IMG_7360.jpeg")} alt="Biocellulose production" /></ScrollReveal>
        <ScrollReveal><Grid3 imgs={[{ src: Z("Screenshot 2026-06-04 at 1.50.22 pm.png"), alt: "Biocellulose factory" }, { src: Z("Screenshot 2026-06-04 at 1.50.44 pm.png"), alt: "Cellulose growth trays" }, { src: Z("Screenshot 2026-06-04 at 1.50.56 pm.png"), alt: "Production facility" }]} /></ScrollReveal>
        <ScrollReveal><Grid2 imgs={[{ src: Z("a28b9b19-fa2c-4e42-bcf9-a37a99b1b666.jpg"), alt: "Biocellulose sheets" }, { src: Z("f1f044f3-4485-4aa9-a11f-0ad6f183cbb0.jpg"), alt: "Cellulose processing" }]} /></ScrollReveal>
        <ScrollReveal><Strip imgs={[{ src: Z("Screenshot 2026-06-04 at 1.51.21 pm.png"), alt: "Ben Tre facility" }, { src: Z("Screenshot 2026-06-04 at 1.51.54 pm.png"), alt: "Cellulose production scale" }]} /></ScrollReveal>
        <ScrollReveal><InsightStrip label="Key Finding · Cellulose Production Validated" text="Ben Tre facilities produce bacterial cellulose sheets at scale using methods very close to the lab process — scalability is confirmed. Contamination remains the biggest issue. The scaffold must be biocompatible with the bacterial culture and not inhibit cellulose growth; growth facilities are open to trialling if compatible." source="Source: Ben Tre Facilities, HNB Bio" /></ScrollReveal>
        <ScrollReveal><QuoteBlock text="Scale already exists. The infrastructure is there. Value creation is now the challenge — and the opportunity." source="Ben Tre · Vietnam" /></ScrollReveal>

        <Divider />

        <ScrollReveal>
          <div style={{ padding: "clamp(3.5rem,8vw,5rem) clamp(1.5rem,5vw,3rem) clamp(1rem,3vw,2rem)" }}>
            <div className="bt" style={{ fontSize: 12, letterSpacing: "0.32em", textTransform: "uppercase", color: "#c9a96b", marginBottom: "0.9rem" }}>What Comes Next</div>
            <div className="hl" style={{ fontSize: "clamp(2.2rem,7vw,3.6rem)", lineHeight: 1, marginBottom: "0.6rem" }}>The Road Ahead</div>
            <p className="bt" style={{ fontSize: 15, lineHeight: 1.85, color: "rgba(255,255,255,0.7)", maxWidth: 680 }}>Two invitations that followed directly from the iCURE journey and the promo film.</p>
          </div>
        </ScrollReveal>

        <ScrollReveal>
          <div style={{ background: "#0d0d0d", borderLeft: "3px solid #c9a96b", padding: "clamp(2rem,5vw,3rem) clamp(1.5rem,5vw,3rem)", margin: "2px 0" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", flexWrap: "wrap", marginBottom: "1.4rem" }}>
              <img src={Z("decathlon.png")} alt="Decathlon" onError={e => { e.target.style.display = "none"; }} style={{ height: 34, width: "auto", maxWidth: 220, objectFit: "contain" }} />
              <div className="bt" style={{ fontSize: 12, letterSpacing: "0.24em", textTransform: "uppercase", color: "#c9a96b" }}>23 June 2026 · Lille, France</div>
            </div>
            <div className="hl" style={{ fontSize: "clamp(1.6rem,4vw,2.4rem)", lineHeight: 1.1, marginBottom: "1rem" }}>Decathlon Headquarters</div>
            <p className="bt" style={{ fontSize: 16, lineHeight: 1.9, color: "rgba(255,255,255,0.85)", maxWidth: 780 }}>Following BBSRC's encouragement to engage major brands, we approached Decathlon — who supplied the walking-biomechanics data that parametrically informs our scaffold designs. Impressed by the work and the promo film, they invited us to their headquarters in Lille to explore producing an initial small capsule collection together, showcasing the technology.</p>
          </div>
        </ScrollReveal>

        <ScrollReveal>
          <div style={{ background: "#0d0d0d", borderLeft: "3px solid #c9a96b", padding: "clamp(2rem,5vw,3rem) clamp(1.5rem,5vw,3rem)", margin: "2px 0" }}>
            <div className="bt" style={{ fontSize: 12, letterSpacing: "0.24em", textTransform: "uppercase", color: "#c9a96b", marginBottom: "1.4rem" }}>24 June 2026 · Brussels, Belgium</div>
            <div className="hl" style={{ fontSize: "clamp(1.6rem,4vw,2.4rem)", lineHeight: 1.1, marginBottom: "1rem" }}>Future Fabrics Expo 2026</div>
            <p className="bt" style={{ fontSize: 16, lineHeight: 1.9, color: "rgba(255,255,255,0.85)", maxWidth: 780 }}>Shape Science has been invited to showcase its technology alongside other leading global brands at the Brussels Future Fabrics Expo 2026 — placing bacterial-nanocellulose footwear in front of the wider materials and fashion industry.</p>
          </div>
        </ScrollReveal>

        <ScrollReveal>
          <div style={{ padding: "clamp(3.5rem,8vw,5.5rem) clamp(1.5rem,8vw,6rem)" }}>
            <p style={{ fontFamily: "'Georgia',serif", fontStyle: "italic", fontSize: "clamp(1.1rem,2.6vw,1.5rem)", lineHeight: 1.75, color: "rgba(255,255,255,0.72)", maxWidth: 820 }}>
              Through direct engagement with manufacturers across Germany and Vietnam, the entire commercial pathway required to bring bacterial nanocellulose footwear to market was mapped, validated and documented in the field. This was not a literature review. This was fieldwork — and it is now opening doors.
            </p>
          </div>
        </ScrollReveal>

        <div style={{ padding: "1.8rem 1.5rem", borderTop: "1px solid rgba(255,255,255,0.08)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <span className="bt" style={{ fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)" }}>iCURE · BBSRC</span>
          <span className="bt" style={{ fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)" }}>VENA Project · shapescience.org</span>
        </div>
      </div>
    </div>
  );
}

/* ─── CONTACT PAGE ─── */
function ContactPage() {
  const [form, setForm] = useState({name:"",email:"",message:""});
  const [sent, setSent] = useState(false);
  const inputStyle = {width:"100%",background:"transparent",border:"none",borderBottom:"1px solid rgba(255,255,255,0.3)",color:"#fff",padding:"14px 0",fontSize:18,fontWeight:300,fontFamily:"'Helvetica Neue',Helvetica,sans-serif",outline:"none",letterSpacing:"0.02em",cursor:"none"};

  const handleSubmit = () => {
    window.open(`mailto:${EMAIL_TARGET}?subject=${encodeURIComponent(`Shape Science — Contact from ${form.name}`)}&body=${encodeURIComponent(`Name: ${form.name}\nEmail: ${form.email}\n\n${form.message}`)}`);
    setSent(true);
  };

  if(sent) return <section style={{height:"100vh",display:"flex",flexDirection:"column",justifyContent:"center",alignItems:"center"}}>
    <h2 className="hl" style={{fontSize:"clamp(28px,5vw,48px)",marginBottom:16}}>MESSAGE SENT</h2>
    <p className="bt" style={{fontSize:15,opacity:0.7,letterSpacing:"0.12em"}}>we will respond</p>
    <Footer/>
  </section>;

  return <section style={{minHeight:"100vh",display:"flex",flexDirection:"column",justifyContent:"center",padding:"0 clamp(24px,15vw,320px)"}}>
    <ScrollReveal>
      <div style={{display:"flex",alignItems:"flex-end",gap:16,marginBottom:24}}>
        <span className="bt" style={{fontSize:13,letterSpacing:"0.2em",opacity:0.5,paddingBottom:8}}>05</span>
        <h1 className="hl" style={{fontSize:"clamp(36px,7vw,72px)"}}>CONTACT</h1>
      </div>
      <p className="bt" style={{fontSize:16,lineHeight:1.8,color:"rgba(255,255,255,0.8)",maxWidth:500,marginBottom:48,letterSpacing:"0.02em"}}>
        For collaborations, partnerships, or enquiries about the technology, get in touch and we will respond.
      </p>
    </ScrollReveal>
    <ScrollReveal delay={150}>
      <div style={{maxWidth:500}}>
        {[{key:"name",ph:"Name"},{key:"email",ph:"Email"}].map(f=><div key={f.key} style={{marginBottom:36}}>
          <input style={inputStyle} placeholder={f.ph} value={form[f.key]} onChange={e=>setForm(p=>({...p,[f.key]:e.target.value}))}
            onFocus={e=>e.target.style.borderBottomColor="rgba(255,255,255,0.7)"} onBlur={e=>e.target.style.borderBottomColor="rgba(255,255,255,0.3)"}/>
        </div>)}
        <div style={{marginBottom:48}}>
          <textarea style={{...inputStyle,resize:"vertical",minHeight:90}} placeholder="Message" value={form.message} onChange={e=>setForm(p=>({...p,message:e.target.value}))}
            onFocus={e=>e.target.style.borderBottomColor="rgba(255,255,255,0.7)"} onBlur={e=>e.target.style.borderBottomColor="rgba(255,255,255,0.3)"}/>
        </div>
        <div onClick={handleSubmit} className="bt" style={{display:"inline-block",padding:"14px 56px",border:"1px solid rgba(255,255,255,0.4)",fontSize:14,letterSpacing:"0.18em",fontWeight:300,cursor:"none",transition:"all 0.5s",textTransform:"uppercase"}}
          onMouseEnter={e=>{e.target.style.background="rgba(255,255,255,0.08)";e.target.style.borderColor="#fff";}}
          onMouseLeave={e=>{e.target.style.background="transparent";e.target.style.borderColor="rgba(255,255,255,0.4)";}}>Send</div>
      </div>
    </ScrollReveal>
    <div style={{marginTop:80}}><Footer/></div>
  </section>;
}

/* ─── APP ─── */
export default function App() {
  const [page, setPage] = useState("HOME");
  const [transitioning, setTransitioning] = useState(false);
  const navigate = useCallback((p) => {
    if(p===page) return;
    setTransitioning(true);
    setTimeout(()=>{setPage(p);window.scrollTo(0,0);setTimeout(()=>setTransitioning(false),50);},400);
  },[page]);
  useEffect(() => {
    const h = (e) => navigate(e.detail);
    window.addEventListener("shape:navigate", h);
    return () => window.removeEventListener("shape:navigate", h);
  }, [navigate]);

  const renderPage = () => {
    switch(page){
      case "HOME": return <HomePage setPage={navigate}/>;
      case "ABOUT": return <AboutPage/>;
      case "TECH": return <TechPage/>;
      case "QUESTIONNAIRE": return <QuestionnairePage/>;
      case "CONTACT": return <ContactPage/>;
      case "RESULTS": return <ResultsPage/>;
      case "PRESENTATION": return <PresentationPage/>;
      default: return <HomePage setPage={navigate}/>;
    }
  };

  return <>
    <style>{globalCSS}</style>
    <Cursor/>
    <ScrollProgress/>
    <Nav page={page} setPage={navigate}/>
    <main style={{opacity:transitioning?0:1,transition:"opacity 0.4s cubic-bezier(0.16,1,0.3,1)",minHeight:"100vh"}}>
      {renderPage()}
    </main>
  </>;
}

