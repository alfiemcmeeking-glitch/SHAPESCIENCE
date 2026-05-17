import { useState, useEffect, useRef, useCallback } from "react";

const PAGES = ["HOME", "ABOUT", "TECH", "QUESTIONNAIRE", "CONTACT", "RESULTS"];
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
    const obs = new IntersectionObserver(([e])=>{if(e.isIntersecting){setTimeout(()=>setVis(true),delay);obs.disconnect();}},{threshold:0.15});
    if(ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [delay]);
  return <div ref={ref} style={{opacity:vis?1:0,transform:vis?"translateY(0)":"translateY(24px)",
    transition:`opacity 0.8s ${delay}ms, transform 0.8s ${delay}ms`,transitionTimingFunction:"cubic-bezier(0.16,1,0.3,1)",
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

/* ─── HOME PAGE ─── */
function HomePage({ setPage }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => { setTimeout(()=>setVisible(true), 200); }, []);
  const phrases = [{t:"We grow structure.",d:0},{t:"Geometry becomes material.",d:200},{t:"Matter is instructed, not manufactured.",d:400}];
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
      {[1,2,3].map(i=><ScrollReveal key={i} delay={i*150}>
        <div style={{aspectRatio:"4/5",background:"#0a0a0a",border:"1px solid rgba(255,255,255,0.04)",position:"relative",overflow:"hidden"}}>
          <img src={`/assets/home-0${i}.jpg`} alt={`Shape Science ${i}`} onError={e=>{e.target.style.display="none"}} style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover",filter:"grayscale(100%) contrast(1.1)"}}/>
          <div className="bt" style={{position:"absolute",bottom:16,left:16,fontSize:10,opacity:0.4,letterSpacing:"0.2em",mixBlendMode:"difference"}}>IMAGE {String(i).padStart(2,"0")}</div>
        </div>
      </ScrollReveal>)}
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
    <Footer/>
  </section>;
}

/* ─── TECH PAGE — THE VENA PROJECT ─── */
function TechPage() {
  const [hovered, setHovered] = useState(false);
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
      <div style={{maxWidth:800,marginBottom:20}}>
        <div style={{display:"flex",alignItems:"flex-end",gap:14,marginBottom:24}}>
          <span className="bt" style={{fontSize:13,letterSpacing:"0.2em",opacity:0.5,paddingBottom:8}}>03</span>
          <span className="hl" style={{fontSize:"clamp(28px,4vw,42px)",opacity:0.4}}>TECH</span>
        </div>
        <div className="hl" style={{fontSize:"clamp(40px,8vw,100px)",lineHeight:0.9,letterSpacing:"-0.02em",marginBottom:20}}>
          THE VENA PROJECT
        </div>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:32}}>
          <div style={{padding:"4px 14px",border:"1px solid rgba(255,255,255,0.3)",display:"inline-block"}}>
            <span className="bt" style={{fontSize:11,letterSpacing:"0.25em",color:"#fff",opacity:0.8}}>PATENT PENDING</span>
          </div>
          <span className="bt" style={{fontSize:11,letterSpacing:"0.2em",color:"rgba(255,255,255,0.6)"}}>IMPERIAL COLLEGE LONDON · VIETNAM</span>
        </div>
        <p className="bt" style={{fontSize:16,lineHeight:1.9,color:"rgba(255,255,255,0.85)",maxWidth:640,letterSpacing:"0.02em"}}>
          A platform technology that grows structured materials using biological processes guided by computational geometry. The result is a new class of material — one that is instructed, not manufactured.
        </p>
      </div>
    </ScrollReveal>

    {/* Horizontal rule */}
    <div style={{width:"100%",height:1,background:"linear-gradient(to right,rgba(255,255,255,0.15),transparent)",margin:"40px 0 48px"}}/>

    <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"1fr 1fr",gap:isMobile?32:48,maxWidth:1000}}>
      {pillars.map((p,i) => <ScrollReveal key={i} delay={i*120}>
        <div style={{paddingLeft:20,borderLeft:"1px solid rgba(255,255,255,0.12)"}}>
          <div className="bt" style={{fontSize:11,letterSpacing:"0.3em",color:"rgba(255,255,255,0.5)",marginBottom:10}}>{p.num}</div>
          <div className="hl" style={{fontSize:"clamp(16px,2vw,22px)",marginBottom:12,lineHeight:1.2}}>{p.title}</div>
          <p className="bt" style={{fontSize:14,lineHeight:1.8,color:"rgba(255,255,255,0.75)",letterSpacing:"0.02em"}}>{p.desc}</p>
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
    {id:"manufacturing_route",theme:"MANUFACTURING ROUTE",tagline:"How should the scaffold be produced at scale?",frequency:6,insights:[
      {text:"3D printing works for initial prototyping but injection moulding is essential for mass-scale production volumes.",sources:["Zellerfeld"],tag:"RECURRING"},
      {text:"3D printing cost per unit is not competitive at the volumes shoe manufacturers need (MOQ 3,000+ per size at large factories).",sources:["Zellerfeld","XTL","Sumtop"],tag:"RECURRING"},
      {text:"Custom 3D printing per customer could be viable for personalised applications like orthopaedic insoles, but this is application-dependent.",sources:["Zellerfeld"],tag:"OPPORTUNITY"},
      {text:"Zellerfeld aims to become a general 3D printing company beyond footwear — future collaboration feasible once they expand.",sources:["Zellerfeld"],tag:"FUTURE"},
    ]},
    {id:"supply_chain_fit",theme:"SUPPLY CHAIN INTEGRATION",tagline:"Can the material fit existing production lines?",frequency:6,insights:[
      {text:"Material must be die-cuttable with existing equipment. Any change to the production line will face strong resistance.",sources:["XTL","Sumtop","Medium Factory HCMC","APEX"],tag:"RECURRING"},
      {text:"Flat sheets and rolls up to 6mm thickness are the accepted formats. Wet or damp substrates are problematic for current workflows.",sources:["Medium Factory HCMC"],tag:"CONSTRAINT"},
      {text:"Large factories import materials from China and produce in Vietnam. They are open to new materials as long as they perform and the brand approves.",sources:["XTL","Sumtop","APEX"],tag:"RECURRING"},
      {text:"Material decisions at large factories are entirely brand-driven. The factory processes whatever the brand\u2019s approved materials list specifies.",sources:["XTL","Sumtop","APEX"],tag:"RECURRING"},
      {text:"For a new supplier, brands require factory audit, full data sheet, and physical test reports against internal standards. Approval takes 3\u20136 months.",sources:["XTL","Sumtop"],tag:"BARRIER"},
    ]},
    {id:"scale_entry",theme:"SCALE & ENTRY POINT",tagline:"Where should the material enter the market first?",frequency:6,insights:[
      {text:"Medium-scale factories (MOQ ~200 units) are the realistic initial customers. Lower barriers, practical testing approach, owner makes decisions directly.",sources:["Medium Factory HCMC"],tag:"RECURRING"},
      {text:"Large-scale factories (MOQ 3,000+ per size) are a longer-term target once the material is proven at smaller volumes.",sources:["XTL","Sumtop","APEX"],tag:"RECURRING"},
      {text:"Limited-edition and innovation capsule lines are the natural entry point at brand level — they absorb 20\u201330% retail premiums.",sources:["Zellerfeld","XTL","Sumtop"],tag:"RECURRING"},
      {text:"Brands historically accept 5\u201315% material cost premium for sustainability, depending on product tier.",sources:["Zellerfeld","XTL","Sumtop"],tag:"DATA POINT"},
      {text:"The largest manufacturers (APEX-scale) produce for Nike and other major brands — always actively sourcing new materials that meet brand specs.",sources:["APEX"],tag:"INSIGHT"},
    ]},
    {id:"monomaterial",theme:"MONOMATERIAL ADVANTAGE",tagline:"Can a single material replace multi-layer construction?",frequency:4,insights:[
      {text:"Typical shoe uppers have 3\u20134 bonded layers. Adhesive application and drying accounts for 20\u201325% of total production time.",sources:["Medium Factory HCMC"],tag:"DATA POINT"},
      {text:"Adhesive failure and delamination cause 5\u20138% reject rates. In hot, humid conditions the failure rate increases.",sources:["Medium Factory HCMC"],tag:"PAIN POINT"},
      {text:"A single material replacing outer, reinforcement, and padding layers would dramatically simplify production — if it is die-cuttable, holds shape, and is skin-comfortable.",sources:["Medium Factory HCMC","XTL"],tag:"OPPORTUNITY"},
      {text:"Variable-density midsoles without multi-piece construction would reduce bill of materials, labour, and assembly time at large factories.",sources:["XTL","Sumtop"],tag:"OPPORTUNITY"},
    ]},
    {id:"cellulose_production",theme:"CELLULOSE PRODUCTION AT SCALE",tagline:"Can the raw material be produced affordably?",frequency:3,insights:[
      {text:"Ben Tre facilities produce bacterial cellulose sheets at scale using methods very close to Shape Science\u2019s lab process. Scalability is confirmed.",sources:["Ben Tre Facilities"],tag:"VALIDATED"},
      {text:"Contamination is the biggest issue at growth facilities (~8% tray reject rate). Temperature fluctuations cause thickness inconsistency.",sources:["Ben Tre Facilities"],tag:"CHALLENGE"},
      {text:"Porosity is controlled through growth time and sugar concentration. Current tolerances are loose (\u00b115%) — tighter control needs environmental investment.",sources:["Ben Tre Facilities","HNB Bio"],tag:"CONSTRAINT"},
      {text:"10\u201312% of finished cellulose sheets are rejected at QC for thickness inconsistency, holes, or uneven moisture.",sources:["HNB Bio"],tag:"DATA POINT"},
      {text:"Scaffold must be biocompatible with bacterial culture and not inhibit cellulose growth. If compatible, growth facilities are open to trialling.",sources:["Ben Tre Facilities"],tag:"REQUIREMENT"},
    ]},
    {id:"sustainability",theme:"SUSTAINABILITY & END-OF-LIFE",tagline:"How important is biodegradability vs recyclability?",frequency:4,insights:[
      {text:"Biodegradability is a strong differentiator provided durability during use is not compromised. Inability to mechanically recycle is not a dealbreaker.",sources:["Zellerfeld"],tag:"INSIGHT"},
      {text:"EU EPR legislation is expected to tighten material requirements within 2\u20133 years. Multiple factories flagged this as incoming.",sources:["XTL","Sumtop","Zellerfeld"],tag:"RECURRING"},
      {text:"Brands require cradle-to-gate LCA to ISO 14044 with carbon footprint in kg CO\u2082e per functional unit at minimum.",sources:["Zellerfeld","XTL"],tag:"REQUIREMENT"},
      {text:"A verified 50%+ reduction in embodied carbon justifies 10\u201312% material cost premium for innovation lines.",sources:["Zellerfeld"],tag:"DATA POINT"},
    ]},
    {id:"cosmetics_application",theme:"COSMETIC FACEMASK APPLICATION",tagline:"Can scaffolds improve cellulose sheet masks?",frequency:2,insights:[
      {text:"Mask adherence to facial contours and active ingredient delivery are the two performance metrics cosmetic brands care most about.",sources:["HNB Bio"],tag:"INSIGHT"},
      {text:"If scaffold demonstrably improves adherence and delivery, cosmetic brand clients would be very interested. Validation takes 3\u20134 months.",sources:["HNB Bio"],tag:"OPPORTUNITY"},
      {text:"ASEAN market regulatory approval is straightforward. EU/US pathway is handled by the brand directly.",sources:["HNB Bio"],tag:"INSIGHT"},
    ]},
  ];

  const RESPONDENTS = [
    {name:"Zellerfeld",location:"Hamburg, Germany",type:"3D Printing Factory",scale:"World\u2019s largest 3D printed shoe factory"},
    {name:"XTL (Xingtailai)",location:"Hanoi, Vietnam",type:"Large-Scale Footwear",scale:"MOQ ~3,000/size · Nike, Prada, New Balance, Under Armour, Vans"},
    {name:"Sumtop Footwear Vietnam",location:"Hanoi, Vietnam",type:"Large-Scale Footwear",scale:"MOQ ~3,000/size · Major global brands"},
    {name:"APEX",location:"Vietnam",type:"Large-Scale Footwear",scale:"Chinese manufacturer · Nike and other major global brands"},
    {name:"Medium-Scale Factory",location:"HCMC Region, Vietnam",type:"Medium Footwear",scale:"MOQ ~200 units"},
    {name:"HNB Bio Cellulose",location:"Ho Chi Minh City, Vietnam",type:"Cellulose Processing",scale:"End-product manufacturing from BC sheets"},
    {name:"Ben Tre Growth Facilities",location:"Ben Tre, Vietnam",type:"Cellulose Growth",scale:"3 raw material growth sites"},
  ];

  const tagColors = {
    "RECURRING":{bg:"rgba(255,255,255,0.12)",border:"rgba(255,255,255,0.35)"},
    "VALIDATED":{bg:"rgba(80,200,120,0.15)",border:"rgba(80,200,120,0.4)"},
    "OPPORTUNITY":{bg:"rgba(100,180,255,0.12)",border:"rgba(100,180,255,0.35)"},
    "DATA POINT":{bg:"rgba(255,200,60,0.12)",border:"rgba(255,200,60,0.35)"},
    "PAIN POINT":{bg:"rgba(255,100,100,0.12)",border:"rgba(255,100,100,0.3)"},
    "CHALLENGE":{bg:"rgba(255,150,50,0.12)",border:"rgba(255,150,50,0.3)"},
    "CONSTRAINT":{bg:"rgba(200,150,255,0.12)",border:"rgba(200,150,255,0.3)"},
    "BARRIER":{bg:"rgba(255,80,80,0.1)",border:"rgba(255,80,80,0.25)"},
    "REQUIREMENT":{bg:"rgba(180,180,255,0.1)",border:"rgba(180,180,255,0.3)"},
    "INSIGHT":{bg:"rgba(255,255,255,0.06)",border:"rgba(255,255,255,0.2)"},
    "FUTURE":{bg:"rgba(100,220,200,0.1)",border:"rgba(100,220,200,0.3)"},
  };

  const filteredThemes = activeTheme === "ALL" ? INSIGHT_THEMES : INSIGHT_THEMES.filter(t => t.id === activeTheme);
  const recurringCount = INSIGHT_THEMES.reduce((s,t) => s + t.insights.filter(i => i.tag === "RECURRING").length, 0);
  const totalInsights = INSIGHT_THEMES.reduce((s,t) => s + t.insights.length, 0);

  // Duplicate photos for seamless infinite scroll
  const carouselPhotos = [...FACTORY_PHOTOS, ...FACTORY_PHOTOS];

  return <section style={{minHeight:"100vh",padding:"120px 0 60px",maxWidth:"100%",overflow:"hidden"}}>
    <div style={{padding:"0 clamp(24px,6vw,80px)",maxWidth:1100,margin:"0 auto"}}>
      <div style={{display:"flex",alignItems:"flex-end",gap:16,marginBottom:8}}>
        <span className="bt" style={{fontSize:12,letterSpacing:"0.2em",opacity:0.5,paddingBottom:6}}>06</span>
        <h1 className="hl" style={{fontSize:"clamp(32px,6vw,60px)"}}>RESULTS</h1>
      </div>
      <p className="bt" style={{fontSize:14,color:"rgba(255,255,255,0.7)",lineHeight:1.6,marginBottom:40,maxWidth:700,letterSpacing:"0.02em"}}>
        Insights from {RESPONDENTS.length} manufacturer visits across Germany and Vietnam, March\u2013May 2026. Grouped by theme to surface patterns across the supply chain.
      </p>
    </div>

    {/* ── FACTORY CAROUSEL ── */}
    <div style={{marginBottom:12,padding:"0 clamp(24px,6vw,80px)"}}>
      <div className="hl" style={{fontSize:"clamp(20px,3vw,32px)",marginBottom:6}}>FACTORIES VISITED</div>
      <p className="bt" style={{fontSize:11,letterSpacing:"0.2em",opacity:0.4,marginBottom:20}}>{RESPONDENTS.length} MANUFACTURERS · GERMANY & VIETNAM</p>
    </div>
    <div style={{width:"100%",overflow:"hidden",marginBottom:16}}>
      <div style={{
        display:"flex",gap:16,
        animation:"carouselScroll 40s linear infinite",
        width:"max-content",
      }}>
        {carouselPhotos.map((p,i) => <div key={i} style={{flex:"0 0 auto",width:"clamp(280px,30vw,400px)",position:"relative"}}>
          <img src={p.src} alt={p.label} style={{width:"100%",height:220,objectFit:"cover",filter:"grayscale(100%) contrast(1.1)",display:"block"}}
            onError={e=>{e.target.style.display="none"}}/>
          <div className="bt" style={{position:"absolute",bottom:8,left:10,fontSize:9,letterSpacing:"0.15em",opacity:0.5,mixBlendMode:"difference"}}>{p.label}</div>
        </div>)}
      </div>
    </div>

    {/* Scroll hint */}
    <div style={{textAlign:"center",marginBottom:48,padding:"16px 0"}}>
      <div className="bt" style={{fontSize:10,letterSpacing:"0.3em",opacity:0.35,textTransform:"uppercase",marginBottom:8}}>scroll for insights</div>
      <div style={{fontSize:18,opacity:0.3,animation:"floatArrow 2s ease-in-out infinite"}}>↓</div>
    </div>

    <div style={{padding:"0 clamp(24px,6vw,80px)",maxWidth:1100,margin:"0 auto"}}>
      {/* Stats */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:16,marginBottom:48}}>
        {[{label:"MANUFACTURERS",value:RESPONDENTS.length},{label:"INSIGHT THEMES",value:INSIGHT_THEMES.length},{label:"TOTAL INSIGHTS",value:totalInsights},{label:"RECURRING",value:recurringCount}].map(s=>
          <div key={s.label} style={{border:"1px solid rgba(255,255,255,0.08)",padding:"20px 16px",textAlign:"center"}}>
            <div className="hl" style={{fontSize:32,marginBottom:6}}>{s.value}</div>
            <div className="bt" style={{fontSize:9,letterSpacing:"0.25em",opacity:0.4}}>{s.label}</div>
          </div>
        )}
      </div>

      {/* Respondents */}
      <div className="bt" style={{fontSize:10,letterSpacing:"0.28em",opacity:0.4,marginBottom:14}}>RESPONDENTS</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:10,marginBottom:48}}>
        {RESPONDENTS.map((r,i) => <div key={i} style={{border:"1px solid rgba(255,255,255,0.08)",padding:"14px 16px"}}>
          <div className="bt" style={{fontSize:12,opacity:0.9,marginBottom:4,fontWeight:500}}>{r.name}</div>
          <div className="bt" style={{fontSize:11,opacity:0.6,lineHeight:1.5}}>{r.location} · {r.type}<br/>{r.scale}</div>
        </div>)}
      </div>

      {/* Theme filter */}
      <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:32,paddingBottom:20,borderBottom:"1px solid rgba(255,255,255,0.08)"}}>
        {[{id:"ALL",label:"ALL THEMES"},...INSIGHT_THEMES.map(t=>({id:t.id,label:t.theme}))].map(t=>
          <div key={t.id} onClick={()=>setActiveTheme(t.id)} className="bt" style={{
            padding:"6px 12px",border:activeTheme===t.id?"1px solid #fff":"1px solid rgba(255,255,255,0.15)",
            fontSize:9,letterSpacing:"0.15em",cursor:"none",background:activeTheme===t.id?"rgba(255,255,255,0.08)":"transparent",
            opacity:activeTheme===t.id?1:0.6,transition:"all 0.3s",
          }}>{t.label}</div>
        )}
      </div>

      {/* Insights */}
      {filteredThemes.map(theme => <div key={theme.id} style={{marginBottom:40}}>
        <div style={{marginBottom:16}}>
          <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:6}}>
            <div className="hl" style={{fontSize:"clamp(18px,3vw,26px)"}}>{theme.theme}</div>
            <div className="bt" style={{fontSize:9,letterSpacing:"0.15em",opacity:0.4,padding:"3px 8px",border:"1px solid rgba(255,255,255,0.15)"}}>{theme.insights.length}</div>
            <div className="bt" style={{fontSize:9,letterSpacing:"0.1em",opacity:0.35,marginLeft:"auto"}}>{theme.frequency} sources</div>
          </div>
          <div className="bt" style={{fontSize:12,opacity:0.45}}>{theme.tagline}</div>
        </div>
        <div style={{display:"flex",flexWrap:"wrap",gap:10}}>
          {theme.insights.map((insight,ii) => {
            const tc = tagColors[insight.tag] || tagColors["INSIGHT"];
            return <div key={ii} style={{background:tc.bg,border:`1px solid ${tc.border}`,borderRadius:24,padding:"12px 18px",maxWidth:480,flex:"1 1 280px"}}>
              <div className="bt" style={{fontSize:13,opacity:1,lineHeight:1.55,marginBottom:8,color:"rgba(255,255,255,0.9)"}}>{insight.text}</div>
              <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
                <div className="bt" style={{fontSize:8,letterSpacing:"0.2em",opacity:0.6,padding:"2px 8px",border:`1px solid ${tc.border}`,borderRadius:10}}>{insight.tag}</div>
                {insight.sources.map((s,si) => <div key={si} className="bt" style={{fontSize:9,opacity:0.35}}>{s}</div>)}
              </div>
            </div>;
          })}
        </div>
      </div>)}
    </div>

    <div style={{padding:"0 clamp(24px,6vw,80px)",maxWidth:1100,margin:"40px auto 0"}}><Footer/></div>
  </section>;
}

/* ─── CONTACT PAGE ─── */
function ContactPage() {
  const [form, setForm] = useState({name:"",email:"",message:""});
  const [sent, setSent] = useState(false);
  const inputStyle = {width:"100%",background:"transparent",border:"none",borderBottom:"1px solid rgba(255,255,255,0.2)",color:"#fff",padding:"14px 0",fontSize:16,fontWeight:300,fontFamily:"'Helvetica Neue',Helvetica,sans-serif",outline:"none",letterSpacing:"0.02em",cursor:"none"};

  const handleSubmit = () => {
    window.open(`mailto:${EMAIL_TARGET}?subject=${encodeURIComponent(`Shape Science — Contact from ${form.name}`)}&body=${encodeURIComponent(`Name: ${form.name}\nEmail: ${form.email}\n\n${form.message}`)}`);
    setSent(true);
  };

  if(sent) return <section style={{height:"100vh",display:"flex",flexDirection:"column",justifyContent:"center",alignItems:"center"}}>
    <h2 className="hl" style={{fontSize:"clamp(28px,5vw,48px)",marginBottom:16}}>MESSAGE SENT</h2>
    <p className="bt" style={{fontSize:14,opacity:0.5,letterSpacing:"0.12em"}}>we will respond</p>
    <Footer/>
  </section>;

  return <section style={{minHeight:"100vh",display:"flex",flexDirection:"column",justifyContent:"center",padding:"0 clamp(24px,15vw,320px)"}}>
    <ScrollReveal>
      <div style={{display:"flex",alignItems:"flex-end",gap:16,marginBottom:60}}>
        <span className="bt" style={{fontSize:13,letterSpacing:"0.2em",opacity:0.5,paddingBottom:8}}>05</span>
        <h1 className="hl" style={{fontSize:"clamp(36px,7vw,72px)"}}>CONTACT</h1>
      </div>
    </ScrollReveal>
    <ScrollReveal delay={150}>
      <div style={{maxWidth:500}}>
        {[{key:"name",ph:"Name"},{key:"email",ph:"Email"}].map(f=><div key={f.key} style={{marginBottom:36}}>
          <input style={inputStyle} placeholder={f.ph} value={form[f.key]} onChange={e=>setForm(p=>({...p,[f.key]:e.target.value}))}
            onFocus={e=>e.target.style.borderBottomColor="rgba(255,255,255,0.6)"} onBlur={e=>e.target.style.borderBottomColor="rgba(255,255,255,0.2)"}/>
        </div>)}
        <div style={{marginBottom:48}}>
          <textarea style={{...inputStyle,resize:"vertical",minHeight:90}} placeholder="Message" value={form.message} onChange={e=>setForm(p=>({...p,message:e.target.value}))}
            onFocus={e=>e.target.style.borderBottomColor="rgba(255,255,255,0.6)"} onBlur={e=>e.target.style.borderBottomColor="rgba(255,255,255,0.2)"}/>
        </div>
        <div onClick={handleSubmit} className="bt" style={{display:"inline-block",padding:"14px 56px",border:"1px solid rgba(255,255,255,0.3)",fontSize:13,letterSpacing:"0.18em",fontWeight:300,cursor:"none",transition:"all 0.5s",textTransform:"uppercase"}}
          onMouseEnter={e=>{e.target.style.background="rgba(255,255,255,0.06)";e.target.style.borderColor="#fff";}}
          onMouseLeave={e=>{e.target.style.background="transparent";e.target.style.borderColor="rgba(255,255,255,0.3)";}}>Send</div>
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
