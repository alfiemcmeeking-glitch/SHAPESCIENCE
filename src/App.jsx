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
  @keyframes flicker { 0%,100%{opacity:0.04}50%{opacity:0.06} }
  @keyframes glitch1 {
    0%{clip-path:inset(40% 0 61% 0)}20%{clip-path:inset(92% 0 1% 0)}40%{clip-path:inset(43% 0 1% 0)}
    60%{clip-path:inset(25% 0 58% 0)}80%{clip-path:inset(54% 0 7% 0)}100%{clip-path:inset(58% 0 43% 0)}
  }
  @keyframes glitch2 {
    0%{clip-path:inset(24% 0 29% 0)}20%{clip-path:inset(54% 0 8% 0)}40%{clip-path:inset(3% 0 78% 0)}
    60%{clip-path:inset(76% 0 12% 0)}80%{clip-path:inset(10% 0 58% 0)}100%{clip-path:inset(67% 0 22% 0)}
  }
  @keyframes restrictedPulse { 0%,100%{opacity:0.6}50%{opacity:1} }
  @keyframes scanline { 0%{top:-100%}100%{top:100%} }
  @keyframes floatArrow { 0%,100%{transform:translateX(-50%) translateY(0)}50%{transform:translateX(-50%) translateY(10px)} }
  @keyframes glitchBg {
    0%{background-position:0 0}25%{background-position:5px -5px}50%{background-position:-5px 5px}
    75%{background-position:5px 5px}100%{background-position:0 0}
  }
`;

/* ─── FILM GRAIN ─── */
function FilmGrain() {
  return (
    <div style={{position:"fixed",inset:0,zIndex:9998,pointerEvents:"none",overflow:"hidden"}}>
      <div style={{
        position:"absolute",inset:"-200%",width:"400%",height:"400%",
        background:`url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
        opacity:0.05,animation:"grainAnim 8s steps(10) infinite",
      }}/>
    </div>
  );
}

/* ─── CURSOR — B&W CIRCLE WITH MANGA-STYLE FLOWING SMOKE TENDRILS ─── */
function Cursor() {
  const dotRef = useRef(null);
  const [hovering, setHovering] = useState(false);

  useEffect(() => {
    const move = (e) => {
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${e.clientX - 9}px, ${e.clientY - 9}px)`;
      }

      // Detect whether we're over a clickable element.
      // React's onClick doesn't leave a DOM attribute, so we detect via React Fiber.
      const el = document.elementFromPoint(e.clientX, e.clientY);
      if (!el) { setHovering(false); return; }
      let cur = el;
      let isClickable = false;
      while (cur && cur !== document.body) {
        const tag = cur.tagName;
        if (tag === "A" || tag === "BUTTON" || tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") {
          isClickable = true; break;
        }
        if (cur.getAttribute && (cur.getAttribute("role") === "button" || cur.hasAttribute("data-clickable"))) {
          isClickable = true; break;
        }
        // Check React Fiber for onClick prop
        const fiberKey = Object.keys(cur).find(k => k.startsWith("__reactProps"));
        if (fiberKey && cur[fiberKey] && cur[fiberKey].onClick) {
          isClickable = true; break;
        }
        cur = cur.parentElement;
      }
      setHovering(isClickable);
    };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, []);

  return (
    <>
      <div
        ref={dotRef}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: 18,
          height: 18,
          borderRadius: "50%",
          background: hovering ? "#d42020" : "transparent",
          border: hovering ? "2px solid #d42020" : "2px solid #fff",
          zIndex: 99999,
          pointerEvents: "none",
          willChange: "transform, background, border",
          transition: "background 0.15s ease, border-color 0.15s ease",
        }}
      />
    </>
  );
}

/* ─── SCROLL PROGRESS — WIDER ─── */
function ScrollProgress() {
  const [pct, setPct] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      setPct(h > 0 ? (window.scrollY / h) * 100 : 0);
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <div style={{position:"fixed",top:0,right:0,width:5,height:"100vh",zIndex:9990,background:"rgba(255,255,255,0.1)"}}>
      <div style={{width:"100%",height:`${pct}%`,background:"#fff",transition:"height 0.15s linear"}}/>
    </div>
  );
}

/* ─── SCROLL REVEAL ─── */
function ScrollReveal({ children, delay = 0 }) {
  const ref = useRef(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e])=>{
      if(e.isIntersecting){setTimeout(()=>setVis(true),delay);obs.disconnect();}
    },{threshold:0.15});
    if(ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [delay]);
  return (
    <div ref={ref} style={{
      opacity:vis?1:0,transform:vis?"translateY(0)":"translateY(24px)",
      transition:`opacity 0.8s ${delay}ms, transform 0.8s ${delay}ms`,
      transitionTimingFunction:"cubic-bezier(0.16,1,0.3,1)",
    }}>{children}</div>
  );
}

/* ─── FOOTER — ON EVERY PAGE ─── */
function Footer() {
  const socials = [
    {name:"TikTok",url:"#"},
    {name:"Instagram",url:"#"},
    {name:"LinkedIn",url:"#"},
    {name:"X",url:"#"},
  ];
  // Secret RESULTS link via a custom event so we don't need to plumb setPage everywhere
  const goResults = () => {
    window.dispatchEvent(new CustomEvent("shape:navigate", {detail:"RESULTS"}));
  };
  return (
    <footer style={{
      padding:"48px 32px 32px",borderTop:"1px solid rgba(255,255,255,0.06)",
      display:"flex",flexWrap:"wrap",justifyContent:"space-between",alignItems:"center",gap:16,
    }}>
      <span className="bt" style={{fontSize:12,opacity:0.4,letterSpacing:"0.08em"}}>Shape Science © 2026</span>
      <div style={{display:"flex",gap:20}}>
        {socials.map(s=>(
          <span key={s.name} className="bt" style={{
            fontSize:11,opacity:0.35,letterSpacing:"0.1em",cursor:"none",transition:"opacity 0.3s",
          }}
          onMouseEnter={e=>e.target.style.opacity=0.8}
          onMouseLeave={e=>e.target.style.opacity=0.35}
          >{s.name}</span>
        ))}
      </div>
      <span
        className="bt"
        onClick={goResults}
        style={{fontSize:11,opacity:0.3,letterSpacing:"0.1em",cursor:"none",transition:"opacity 0.3s"}}
        onMouseEnter={e=>e.target.style.opacity=0.7}
        onMouseLeave={e=>e.target.style.opacity=0.3}
      >shapescience.org</span>
    </footer>
  );
}

/* ─── NAV — BIGGER, BRIGHTER TEXT ─── */
function Nav({ page, setPage }) {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <nav style={{
      position:"fixed",top:0,left:0,right:0,zIndex:9000,padding:"24px 32px",
      display:"flex",justifyContent:"space-between",alignItems:"center",
      background:"linear-gradient(to bottom,rgba(0,0,0,0.85),transparent)",
    }}>
      <div className="hl" style={{fontSize:18,letterSpacing:"0.08em",cursor:"none"}}
        onClick={()=>setPage("HOME")}>SHAPE SCIENCE</div>
      <div style={{display:"flex",gap:28}} className="desktop-nav">
        {PAGES.map(p=>(
          <div key={p} className="bt" onClick={()=>setPage(p)} style={{
            fontSize:13,letterSpacing:"0.1em",fontWeight:p===page?400:300,
            opacity:p===page?1:0.7,transition:"opacity 0.4s",cursor:"none",
            textTransform:"uppercase",
          }}>{p}</div>
        ))}
      </div>
      <div className="mobile-nav-btn" onClick={()=>setMenuOpen(!menuOpen)} style={{
        display:"none",flexDirection:"column",gap:5,cursor:"none",padding:4,
      }}>
        <span style={{width:22,height:1.5,background:"#fff",transition:"0.3s",
          transform:menuOpen?"rotate(45deg) translateY(4.5px)":"none"}}/>
        <span style={{width:22,height:1.5,background:"#fff",transition:"0.3s",opacity:menuOpen?0:1}}/>
        <span style={{width:22,height:1.5,background:"#fff",transition:"0.3s",
          transform:menuOpen?"rotate(-45deg) translateY(-4.5px)":"none"}}/>
      </div>
      {menuOpen && (
        <div style={{
          position:"fixed",inset:0,background:"rgba(0,0,0,0.97)",zIndex:8999,
          display:"flex",flexDirection:"column",justifyContent:"center",alignItems:"center",gap:36,
        }}>
          {PAGES.map(p=>(
            <div key={p} className="hl" onClick={()=>{setPage(p);setMenuOpen(false);}} style={{
              fontSize:32,opacity:p===page?1:0.5,cursor:"none",
            }}>{p}</div>
          ))}
        </div>
      )}
      <style>{`
        @media(max-width:768px){.desktop-nav{display:none!important}.mobile-nav-btn{display:flex!important}}
      `}</style>
    </nav>
  );
}

/* ─── HERO TITLE — Gabriel Moses style: all inline on one line, baseline aligned ─── */
function HeroTitle() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // MOBILE: three stacked words fill the screen exactly.
  //
  // Layout strategy:
  //   - Outer container fills 100dvw × 100dvh with safe padding around the
  //     outside (top reserved for nav logo/menu, sides and bottom give breathing
  //     room so no glyph ever touches an edge).
  //   - Inner block is a flex column — each row gets a DIFFERENT rowPct so
  //     the three words have visibly different heights (deliberately warped).
  //   - Each word is its own SVG with preserveAspectRatio="none" so the glyphs
  //     stretch exactly to the row's width AND height. This is what makes SHORT
  //     rows look "squashed" and TALL rows look "heavy" — same word scaled to
  //     different aspect ratios.
  //   - textLength with lengthAdjust="spacingAndGlyphs" forces width-stretch
  //     without cutting letters off. The viewBox Y position is chosen to leave
  //     space for descenders and avoid cropping.
  //
  // Height proportions (summing to 100): SHAPE 25, SCIENCE 50, 2026 25.
  // This makes SCIENCE literally twice as tall as the other two, as requested.
  if (isMobile) {
    const lines = [
      { text: "SHAPE",   flex: 20, vbW: 340 },
      { text: "SCIENCE", flex: 60, vbW: 460 },
      { text: "2026",    flex: 20, vbW: 260 },
    ];
    // viewBox: y starts at 14 (clips space above caps), height is 55 (clips below baseline)
    // This removes the dead space SVG reserves for ascenders/descenders
    const vbY = 8;
    const vbH = 63;
    return (
      <div className="hl" style={{
        width:"100%",
        flex:"1 1 auto",
        minHeight:0,
        boxSizing:"border-box",
        padding:0,
        display:"flex",
        flexDirection:"column",
      }}>
        {lines.map((line,i) => (
          <div key={i} style={{
            flex:`${line.flex} 1 0`,
            minHeight:0,
          }}>
            <svg
              viewBox={`0 ${vbY} ${line.vbW} ${vbH}`}
              preserveAspectRatio="none"
              style={{width:"100%",height:"100%",display:"block"}}
            >
              <text
                x="50%"
                y="68"
                textAnchor="middle"
                fontSize="72"
                fontFamily="'Oswald', sans-serif"
                fontWeight="700"
                fill="#fff"
                textLength={line.vbW * 0.96}
                lengthAdjust="spacingAndGlyphs"
              >
                {line.text}
              </text>
            </svg>
          </div>
        ))}
      </div>
    );
  }

  // DESKTOP: original single-line layout, unchanged.
  return (
    <div className="hl" style={{
      display:"flex",
      alignItems:"baseline",
      justifyContent:"center",
      gap:"clamp(8px,1.6vw,22px)",
      width:"100%",
      whiteSpace:"nowrap",
      lineHeight:0.85,
      fontWeight:700,
      letterSpacing:"-0.02em",
    }}>
      <span style={{fontSize:"clamp(38px,11vw,150px)"}}>
        SHAPE SCIENCE
      </span>
      <span style={{
        fontSize:"clamp(18px,4.5vw,60px)",
        letterSpacing:"0.02em",
        opacity:0.85,
      }}>
        2026
      </span>
    </div>
  );
}

/* ─── HOME PAGE ─── */
function HomePage({ setPage }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => { setTimeout(()=>setVisible(true), 200); }, []);

  const phrases = [
    { t: "We grow structure.", d: 0 },
    { t: "Geometry becomes material.", d: 200 },
    { t: "Matter is instructed, not manufactured.", d: 400 },
  ];

  return (
    <div>
      <section style={{
        height:"100dvh",display:"flex",flexDirection:"column",justifyContent:"center",alignItems:"center",
        position:"relative",overflow:"hidden",
      }}>
        {/* Background video — fullscreen, auto-loop, muted, no controls */}
        <video
          ref={el => {
            if (el) {
              el.setAttribute("muted", "");
              el.setAttribute("playsinline", "");
              el.setAttribute("webkit-playsinline", "");
              el.muted = true;
              el.play().catch(() => {});
            }
          }}
          autoPlay
          loop
          muted
          playsInline
          webkit-playsinline=""
          disablePictureInPicture
          controlsList="nofullscreen nodownload noremoteplayback"
          style={{
            position:"absolute",inset:0,width:"100%",height:"100%",
            objectFit:"cover",zIndex:0,
            filter:"grayscale(100%) contrast(1.1)",
          }}
        >
          <source src="/assets/hero-bg.mp4" type="video/mp4" />
        </video>
        {/* Dark overlay so text remains readable */}
        <div style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.45)",zIndex:0}}/>
        {/* Fade to black at the bottom — smooth gradient */}
        <div style={{
          position:"absolute",bottom:0,left:0,right:0,height:"35%",
          background:"linear-gradient(to bottom, transparent, #000)",
          zIndex:0,pointerEvents:"none",
        }}/>
        <div style={{
          position:"relative",zIndex:1,textAlign:"center",
          width:"100%",height:"100%",
          display:"flex",flexDirection:"column",justifyContent:"center",alignItems:"center",
          paddingTop:72,  // reserve space for nav above the hero on mobile
          boxSizing:"border-box",
          opacity:visible?1:0,transform:visible?"translateY(0)":"translateY(40px)",
          transition:"all 1.2s cubic-bezier(0.16,1,0.3,1)",
        }}>
          <HeroTitle />
        </div>
      </section>

      <section style={{minHeight:"100vh",display:"flex",flexDirection:"column",justifyContent:"center",padding:"120px clamp(24px,8vw,160px)"}}>
        {phrases.map((p,i)=>(
          <ScrollReveal key={i} delay={p.d}>
            <p className="bt" style={{
              fontSize:"clamp(24px,4vw,52px)",fontWeight:300,lineHeight:1.3,
              marginBottom:48,opacity:0.85,maxWidth:800,
            }}>{p.t}</p>
          </ScrollReveal>
        ))}
        <ScrollReveal delay={600}>
          <p className="bt" style={{fontSize:14,lineHeight:2,opacity:0.5,maxWidth:500,marginTop:40,letterSpacing:"0.04em"}}>
            A new approach to material design — where biology meets computation, 
            and form is grown rather than imposed. More details coming soon.
          </p>
        </ScrollReveal>
      </section>

      <section style={{padding:"80px clamp(24px,8vw,160px)",display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:24}}>
        {[1,2,3].map(i=>(
          <ScrollReveal key={i} delay={i*150}>
            <div style={{
              aspectRatio:"4/5",background:"#0a0a0a",border:"1px solid rgba(255,255,255,0.04)",
              position:"relative",overflow:"hidden",
            }}>
              {/* Drop your image at /public/assets/home-0{i}.jpg */}
              <img
                src={`/assets/home-0${i}.jpg`}
                alt={`Shape Science ${i}`}
                onError={(e)=>{e.target.style.display="none"}}
                style={{
                  position:"absolute",inset:0,width:"100%",height:"100%",
                  objectFit:"cover",filter:"grayscale(100%) contrast(1.1)",
                }}
              />
              <div style={{
                position:"absolute",inset:0,
                background:`radial-gradient(circle at ${30+i*20}% ${40+i*10}%,rgba(255,255,255,0.02),transparent)`,
                pointerEvents:"none",
              }}/>
              <div className="bt" style={{
                position:"absolute",bottom:16,left:16,fontSize:10,opacity:0.4,letterSpacing:"0.2em",
                mixBlendMode:"difference",
              }}>IMAGE {String(i).padStart(2,"0")}</div>
            </div>
          </ScrollReveal>
        ))}
      </section>
      <Footer/>
    </div>
  );
}

/* ─── ABOUT PAGE ─── */
function AboutPage() {
  const [hovering, setHovering] = useState(false);
  const fragments = [
    {text:"EXPERIMENTAL DESIGN",x:"8%",y:"20%",rot:-4},
    {text:"COMPUTATIONAL FORM",x:"65%",y:"12%",rot:2},
    {text:"LIVING SYSTEMS",x:"5%",y:"55%",rot:-1},
    {text:"GROWN STRUCTURE",x:"70%",y:"65%",rot:3},
    {text:"MATERIAL INTELLIGENCE",x:"12%",y:"82%",rot:-2},
    {text:"BIOFABRICATION",x:"62%",y:"85%",rot:1},
    {text:"FUTURE FOOTWEAR",x:"72%",y:"40%",rot:-3},
    {text:"GROWN, NOT MADE",x:"15%",y:"40%",rot:2},
  ];

  return (
    <section style={{minHeight:"100vh",display:"flex",flexDirection:"column",justifyContent:"center",alignItems:"center",position:"relative",padding:"120px 24px"}}>
      {/* Gabriel Moses style page title */}
      <div style={{position:"absolute",top:100,left:"clamp(24px,8vw,80px)",display:"flex",alignItems:"flex-end",gap:12}}>
        <span className="bt" style={{fontSize:12,letterSpacing:"0.2em",opacity:0.5}}>02</span>
        <span className="hl" style={{fontSize:"clamp(28px,5vw,56px)"}}>ABOUT</span>
      </div>

      {fragments.map((f,i)=>(
        <div key={i} className="hl" style={{
          position:"absolute",left:f.x,top:f.y,fontSize:"clamp(10px,1.5vw,14px)",
          letterSpacing:"0.15em",opacity:hovering?0.6:0,
          transform:`rotate(${f.rot}deg) translateY(${hovering?0:10}px)`,
          transition:`all 0.8s ${i*80}ms cubic-bezier(0.16,1,0.3,1)`,
          pointerEvents:"none",whiteSpace:"nowrap",
        }}>{f.text}</div>
      ))}

      <div
        onMouseEnter={()=>setHovering(true)}
        onMouseLeave={()=>setHovering(false)}
        style={{
          width:"clamp(280px,40vw,500px)",height:"clamp(400px,60vh,700px)",
          position:"relative",cursor:"none",
          background:hovering
            ? "radial-gradient(ellipse at 50% 40%, rgba(255,255,255,0.06), transparent 70%)"
            : "transparent",
          transition:"background 1s",
          display:"flex",flexDirection:"column",justifyContent:"center",alignItems:"center",
          border:"1px solid rgba(255,255,255,0.03)",
        }}
      >
        {/* Drop your photo at /public/assets/about-portrait.jpg */}
        <img
          src="/assets/about-portrait.jpg"
          alt="About"
          onError={(e)=>{e.target.style.display="none"; e.target.nextSibling.style.display="block";}}
          style={{
            width:"60%",height:"75%",objectFit:"cover",
            filter: hovering ? "grayscale(100%) contrast(1.2) brightness(1.1)" : "grayscale(100%) contrast(0.9) brightness(0.7)",
            transition:"all 1.2s",
          }}
        />
        <div style={{
          width:"60%",height:"75%",position:"relative",display:"none",
          background:hovering
            ?"linear-gradient(to bottom,rgba(255,255,255,0.08),rgba(255,255,255,0.02))"
            :"rgba(255,255,255,0.01)",
          transition:"all 1.2s",
          clipPath:"polygon(30% 0%, 70% 0%, 80% 15%, 78% 50%, 85% 55%, 82% 100%, 18% 100%, 15% 55%, 22% 50%, 20% 15%)",
        }}>
          <div style={{
            position:"absolute",bottom:"18%",left:"50%",transform:"translateX(-50%)",
            width:"50%",height:"15%",
            background:hovering?"rgba(255,255,255,0.12)":"transparent",
            transition:"all 1s 0.3s",borderRadius:"2px",
            clipPath:"polygon(10% 30%, 90% 0%, 100% 100%, 0% 100%)",
          }}/>
        </div>
        <p className="bt" style={{
          fontSize:11,letterSpacing:"0.2em",opacity:hovering?0.5:0.2,
          transition:"opacity 0.8s 0.4s",marginTop:20,textAlign:"center",
        }}>hover to illuminate</p>
      </div>

      <div style={{marginTop:60,maxWidth:500,textAlign:"center",opacity:hovering?0.7:0.35,transition:"opacity 0.8s"}}>
        <p className="bt" style={{fontSize:14,lineHeight:2,letterSpacing:"0.04em",fontWeight:300}}>
          Structure emerges from instruction. Form follows biology. 
          We set the conditions — the material shapes itself.
        </p>
      </div>
      <Footer/>
    </section>
  );
}

/* ─── TECH PAGE — clean minimal "in development" ─── */
function TechPage() {
  const [hovered, setHovered] = useState(false);

  return (
    <section style={{
      minHeight:"100vh",display:"flex",flexDirection:"column",justifyContent:"center",alignItems:"center",
      position:"relative",padding:"120px 24px",
    }}>
      {/* Gabriel Moses style page label */}
      <div style={{position:"absolute",top:100,left:"clamp(24px,8vw,80px)",display:"flex",alignItems:"flex-end",gap:12}}>
        <span className="bt" style={{fontSize:12,letterSpacing:"0.2em",opacity:0.5}}>03</span>
        <span className="hl" style={{fontSize:"clamp(28px,5vw,56px)"}}>TECH</span>
      </div>

      <div
        onMouseEnter={()=>setHovered(true)}
        onMouseLeave={()=>setHovered(false)}
        style={{
          textAlign:"center",position:"relative",
          maxWidth:900,
        }}
      >
        <div className="hl" style={{
          fontSize:"clamp(48px,10vw,140px)",
          lineHeight:0.9,
          letterSpacing:"-0.02em",
          marginBottom:24,
        }}>
          IN DEVELOPMENT
        </div>

        <div className="bt" style={{
          fontSize:"clamp(13px,1.4vw,16px)",
          letterSpacing:"0.15em",
          opacity:hovered?0.7:0.4,
          transition:"opacity 0.6s",
          textTransform:"uppercase",
          marginBottom:8,
        }}>
          Bacterial nanocellulose · Computational scaffolding · Bioweld interface
        </div>

        <div className="bt" style={{
          fontSize:"clamp(11px,1.1vw,13px)",
          letterSpacing:"0.2em",
          opacity:0.3,
          textTransform:"uppercase",
          marginTop:32,
        }}>
          Imperial College London · Vietnam
        </div>
      </div>

      {/* Subtle horizontal line accents */}
      <div style={{
        position:"absolute",left:"8%",right:"8%",top:"50%",height:1,
        background:"linear-gradient(to right,transparent,rgba(255,255,255,0.08),transparent)",
        opacity:hovered?1:0.4,
        transition:"opacity 0.8s",
        pointerEvents:"none",
      }}/>

      <Footer/>
    </section>
  );
}

/* ─── QUESTIONNAIRE — sector-based with hypothesis-driven questions ─── */

const SECTORS = [
  {
    id: "textile_integrators",
    label: "Textile Manufacturing Integrator",
    short: "Textile Integrator",
    description: "2nd-tier company combining materials and components into intermediaries (e.g. M.I.T Vietnam)",
    hypotheses: [
      {
        id: "h1",
        statement: "Integration into existing manufacturing processes",
        questions: [
          {id:"q1",label:"Can you walk us through your current material intake process? Do you need a datasheet?",type:"textarea"},
          {id:"q2",label:"What material formats do your machines currently accept (rolls, sheets, pellets, wet substrate)? What physical tolerances are critical for uninterrupted production?",type:"textarea"},
          {id:"q3",label:"How do you currently evaluate a new material's compatibility with your equipment before committing to a production run?",type:"textarea"},
          {id:"q4",label:"If you were to consider licensing a novel material platform, who in your organisation would be the key decision-makers, and what data or certifications would they need?",type:"textarea"},
        ],
      },
      {
        id: "h2",
        statement: "Monomaterial technology shortens manufacturing timelines",
        questions: [
          {id:"q5",label:"How many distinct material layers or components typically go into one of your finished intermediary products, and which bonding methods do you use?",type:"textarea"},
          {id:"q6",label:"What proportion of your production time or labour cost is attributable to lamination, adhesive application, or drying/curing stages?",type:"textarea"},
          {id:"q7",label:"Have you experienced quality or consistency issues caused by adhesive failure, delamination, or multi-layer alignment? How significant in terms of reject rates or rework?",type:"textarea"},
          {id:"q8",label:"If a single-material component could replace a bonded multi-layer stack with equivalent or better performance, what would need to be true about its mechanical properties and processability?",type:"textarea"},
          {id:"q9",label:"Are there regulatory or customer requirements around adhesive chemicals or VOC emissions in your production environment that influence your material choices?",type:"textarea"},
        ],
      },
    ],
  },
  {
    id: "global_brands",
    label: "Global Footwear / Apparel Brand",
    short: "Global Brand",
    description: "Brand with focus on design innovation — Nike, Adidas, Zellerfeld, Camper, Puma, etc.",
    hypotheses: [
      {
        id: "h1",
        statement: "Localised custom material properties",
        questions: [
          {id:"q1",label:"When developing a new product line, at what stage do you specify material properties and how often does this happen?",type:"textarea"},
          {id:"q2",label:"Can you describe a project where you wished you could fine-tune a material's stiffness, breathability, or cushioning in specific areas, but couldn't because of supplier limitations?",type:"textarea"},
          {id:"q3",label:"How do you currently communicate customised material specifications to your suppliers? What documentation is required?",type:"textarea"},
          {id:"q4",label:"If you could dial in material density, porosity, or tensile strength at specific locations in a component, what products or applications would that unlock?",type:"textarea"},
          {id:"q5",label:"What is your internal process for approving and testing a new material before it reaches prototype stage — who is involved and what timeline does it require?",type:"textarea"},
        ],
      },
      {
        id: "h2",
        statement: "Biodegradability over recyclability at end-of-life",
        questions: [
          {id:"q6",label:"How do you conduct testing for EN 13432 or ASTM D6400? Are we supplying this? How often does this need to be updated?",type:"textarea"},
          {id:"q7",label:"Are any of your product lines currently subject to extended producer responsibility (EPR) regulations or incoming legislation that would make end-of-life material behaviour a compliance issue?",type:"textarea"},
          {id:"q8",label:"If a material were fully biodegradable under standard composting conditions but could not be mechanically recycled, how would that affect its appeal in your material selection process?",type:"textarea"},
          {id:"q9",label:"Do you have internal KPIs for biodegradable content of each product?",type:"textarea"},
        ],
      },
      {
        id: "h3",
        statement: "Willingness to pay premium for sustainable alternatives",
        questions: [
          {id:"q10",label:"What percentage price premium have you historically accepted for a material that offers a demonstrable sustainability advantage?",type:"text"},
          {id:"q11",label:"What material do you use to benchmark against — the current solution or best in class?",type:"textarea"},
          {id:"q12",label:"How do you calculate or communicate the return on investment for a sustainable material? (brand equity, reduced carbon fees, consumer price uplift at retail)",type:"textarea"},
          {id:"q13",label:"Are there specific product tiers — premium lines, limited editions, innovation capsules — where a higher material cost would be more easily absorbed?",type:"textarea"},
        ],
      },
      {
        id: "h4",
        statement: "Paris Agreement / climate commitment alignment",
        questions: [
          {id:"q14",label:"What carbon or lifecycle assessment data would you require from a material supplier?",type:"textarea"},
          {id:"q15",label:"Is there a price at which a verified low-carbon material becomes commercially justified for you?",type:"textarea"},
        ],
      },
      {
        id: "h5",
        statement: "Aesthetic and quality perception over synthetic competitors",
        questions: [
          {id:"q16",label:"When you evaluate a new material for the first time, what sensory or visual cues do you use to form an initial quality impression? Do you have KPIs for that?",type:"textarea"},
        ],
      },
    ],
  },
  {
    id: "cellulose_producer",
    label: "Cellulose Producer",
    short: "Cellulose Producer",
    description: "Manufacturer of pure cellulosic materials (e.g. HNB Bio, cosmetic facemask manufacturers)",
    hypotheses: [
      {
        id: "h1",
        statement: "Scaffold-based material can improve cosmetic facemask products",
        questions: [
          {id:"q1",label:"What are the most common manufacturing defects or performance limitations you encounter with your current cellulose sheet masks?",type:"textarea"},
          {id:"q2",label:"How do you currently control sheet porosity and liquid absorption rate in your production process, and what tolerances are acceptable for your cosmetic brand customers?",type:"textarea"},
          {id:"q3",label:"If a scaffold-structured bacterial cellulose substrate could demonstrably improve mask adherence to facial contours and active ingredient delivery, what would your validation and regulatory approval process look like?",type:"textarea"},
        ],
      },
    ],
  },
  {
    id: "product_consultants",
    label: "Product Consultants / CMF Library",
    short: "Consultant / CMF",
    description: "Material design agencies, capsule collection consultants, CMF libraries (Material Bank, HIIDA Lab)",
    hypotheses: [
      {
        id: "h1",
        statement: "CMF Library and consultant integration",
        questions: [
          {id:"q1",label:"Is anyone using CMF Libraries? If so, how often and for what types of projects?",type:"textarea"},
          {id:"q2",label:"How many brands are accessing the CMF library currently?",type:"text"},
          {id:"q3",label:"What are your fees for material listing and brand access?",type:"text"},
          {id:"q4",label:"What does the typical onboarding process look like for new materials being added to the library?",type:"textarea"},
        ],
      },
    ],
  },
];

/* ─── STORAGE LAYER ───
 * Currently uses localStorage so responses persist on the device that submitted them.
 * To swap to a real backend (Supabase, Vercel KV, Google Sheets via SheetDB, etc.):
 * replace saveResponse() and loadResponses() with API calls to your backend.
 * The data shape is { id, sector, timestamp, answers: { qId: value } }
 */
const STORAGE_KEY = "shape_science_responses_v1";

function saveResponse(sectorId, answers) {
  try {
    const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    const entry = {
      id: Date.now() + "_" + Math.random().toString(36).slice(2, 8),
      sector: sectorId,
      timestamp: new Date().toISOString(),
      answers,
    };
    existing.push(entry);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
    return true;
  } catch (e) {
    console.error("Save failed:", e);
    return false;
  }
}

function loadResponses() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch (e) {
    return [];
  }
}

function QuestionnairePage() {
  const [selectedSector, setSelectedSector] = useState(null);
  const [formData, setFormData] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const update = (id,val) => setFormData(prev=>({...prev,[id]:val}));

  const inputStyle = {
    width:"100%",background:"transparent",border:"none",
    borderBottom:"1px solid rgba(255,255,255,0.2)",color:"#fff",
    padding:"12px 0",fontSize:15,fontWeight:300,fontFamily:"'Helvetica Neue',Helvetica,sans-serif",
    outline:"none",letterSpacing:"0.02em",cursor:"none",
  };

  const handleSubmit = () => {
    saveResponse(selectedSector.id, formData);
    // Also fire off mailto for backup notification
    const lines = [
      `Sector: ${selectedSector.label}`,
      `Submitted: ${new Date().toISOString()}`,
      "",
      ...selectedSector.hypotheses.flatMap(h => [
        `--- ${h.statement} ---`,
        ...h.questions.map(q => `${q.label}\n  ${formData[q.id] || "(no answer)"}`),
        "",
      ]),
    ].join("\n");
    const subject = encodeURIComponent(`Shape Science — ${selectedSector.short} response`);
    const body = encodeURIComponent(lines);
    window.open(`mailto:${EMAIL_TARGET}?subject=${subject}&body=${body}`);
    setSubmitted(true);
  };

  if(submitted) return (
    <section style={{minHeight:"100vh",display:"flex",flexDirection:"column",justifyContent:"center",alignItems:"center",padding:"120px 24px"}}>
      <h2 className="hl" style={{fontSize:"clamp(28px,5vw,56px)",marginBottom:20,letterSpacing:"-0.01em"}}>RECEIVED</h2>
      <p className="bt" style={{fontSize:14,opacity:0.5,letterSpacing:"0.12em",textAlign:"center",maxWidth:480}}>
        Your response has been logged. Thank you for contributing to the Shape Science research.
      </p>
      <Footer/>
    </section>
  );

  // Sector selection screen
  if (!selectedSector) {
    return (
      <section style={{minHeight:"100vh",padding:"140px clamp(24px,8vw,160px) 80px"}}>
        <ScrollReveal>
          <div style={{display:"flex",alignItems:"flex-end",gap:16,marginBottom:16}}>
            <span className="bt" style={{fontSize:13,letterSpacing:"0.2em",opacity:0.5,paddingBottom:6}}>04</span>
            <h1 className="hl" style={{fontSize:"clamp(36px,7vw,72px)"}}>QUESTIONNAIRE</h1>
          </div>
          <p className="bt" style={{fontSize:14,letterSpacing:"0.15em",opacity:0.45,marginBottom:60}}>
            select your sector to begin
          </p>
        </ScrollReveal>

        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(320px,1fr))",gap:16,maxWidth:1200}}>
          {SECTORS.map((sector,i)=>(
            <ScrollReveal key={sector.id} delay={i*100}>
              <div
                onClick={()=>setSelectedSector(sector)}
                style={{
                  padding:"32px 28px",
                  border:"1px solid rgba(255,255,255,0.12)",
                  background:"rgba(255,255,255,0.01)",
                  cursor:"none",
                  transition:"all 0.4s",
                  minHeight:200,
                  display:"flex",
                  flexDirection:"column",
                  justifyContent:"space-between",
                }}
                onMouseEnter={e=>{
                  e.currentTarget.style.background="rgba(255,255,255,0.04)";
                  e.currentTarget.style.borderColor="rgba(255,255,255,0.4)";
                }}
                onMouseLeave={e=>{
                  e.currentTarget.style.background="rgba(255,255,255,0.01)";
                  e.currentTarget.style.borderColor="rgba(255,255,255,0.12)";
                }}
              >
                <div>
                  <div className="bt" style={{fontSize:11,letterSpacing:"0.25em",opacity:0.4,marginBottom:14}}>
                    0{i+1} / SECTOR
                  </div>
                  <div className="hl" style={{fontSize:22,letterSpacing:"-0.01em",lineHeight:1.15,marginBottom:14}}>
                    {sector.label}
                  </div>
                  <div className="bt" style={{fontSize:13,opacity:0.5,lineHeight:1.5,letterSpacing:"0.02em"}}>
                    {sector.description}
                  </div>
                </div>
                <div className="bt" style={{
                  fontSize:11,letterSpacing:"0.2em",opacity:0.5,marginTop:24,
                  textTransform:"uppercase",
                }}>
                  {sector.hypotheses.reduce((n,h)=>n+h.questions.length,0)} questions →
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
        <div style={{marginTop:80}}><Footer/></div>
      </section>
    );
  }

  // Question form for selected sector
  return (
    <section style={{minHeight:"100vh",padding:"140px clamp(24px,8vw,160px) 80px"}}>
      <ScrollReveal>
        <div
          onClick={()=>{setSelectedSector(null);setFormData({});}}
          className="bt"
          style={{fontSize:11,letterSpacing:"0.2em",opacity:0.5,marginBottom:24,cursor:"none",
            display:"inline-block",textTransform:"uppercase",
          }}
          onMouseEnter={e=>e.target.style.opacity=0.9}
          onMouseLeave={e=>e.target.style.opacity=0.5}
        >← change sector</div>
        <div style={{display:"flex",alignItems:"flex-end",gap:16,marginBottom:16}}>
          <span className="bt" style={{fontSize:13,letterSpacing:"0.2em",opacity:0.5,paddingBottom:6}}>04</span>
          <h1 className="hl" style={{fontSize:"clamp(28px,5vw,56px)",letterSpacing:"-0.01em"}}>{selectedSector.label.toUpperCase()}</h1>
        </div>
        <p className="bt" style={{fontSize:13,letterSpacing:"0.12em",opacity:0.4,marginBottom:80,maxWidth:600}}>
          {selectedSector.description}
        </p>
      </ScrollReveal>

      {selectedSector.hypotheses.map((hypothesis,hi)=>(
        <ScrollReveal key={hypothesis.id} delay={hi*80}>
          <div style={{marginBottom:80}}>
            <div className="bt" style={{fontSize:10,letterSpacing:"0.3em",opacity:0.35,marginBottom:8}}>
              HYPOTHESIS {String(hi+1).padStart(2,"0")}
            </div>
            <div className="hl" style={{
              fontSize:"clamp(18px,2.4vw,26px)",letterSpacing:"-0.005em",
              marginBottom:14,maxWidth:780,lineHeight:1.25,
            }}>
              {hypothesis.statement}
            </div>
            <div style={{
              width:40,height:1,background:"rgba(255,255,255,0.25)",marginBottom:36,
            }}/>
            {hypothesis.questions.map((q,qi)=>(
              <div key={q.id} style={{marginBottom:36}}>
                <label className="bt" style={{
                  fontSize:13,letterSpacing:"0.04em",opacity:0.7,
                  display:"block",marginBottom:10,lineHeight:1.45,maxWidth:780,
                }}>
                  <span style={{opacity:0.4,marginRight:10}}>Q{qi+1}.</span>
                  {q.label}
                </label>
                {q.type==="textarea" ? (
                  <textarea
                    style={{...inputStyle,resize:"vertical",minHeight:60,maxWidth:780}}
                    value={formData[q.id]||""}
                    onChange={e=>update(q.id,e.target.value)}
                    onFocus={e=>e.target.style.borderBottomColor="rgba(255,255,255,0.6)"}
                    onBlur={e=>e.target.style.borderBottomColor="rgba(255,255,255,0.2)"}
                  />
                ) : (
                  <input
                    style={{...inputStyle,maxWidth:780}}
                    value={formData[q.id]||""}
                    onChange={e=>update(q.id,e.target.value)}
                    onFocus={e=>e.target.style.borderBottomColor="rgba(255,255,255,0.6)"}
                    onBlur={e=>e.target.style.borderBottomColor="rgba(255,255,255,0.2)"}
                  />
                )}
              </div>
            ))}
          </div>
        </ScrollReveal>
      ))}

      <ScrollReveal delay={400}>
        <div onClick={handleSubmit} className="bt" style={{
          display:"inline-block",padding:"16px 60px",border:"1px solid rgba(255,255,255,0.4)",
          fontSize:13,letterSpacing:"0.18em",fontWeight:300,cursor:"none",
          transition:"all 0.5s",marginTop:20,textTransform:"uppercase",
        }}
        onMouseEnter={e=>{e.target.style.background="rgba(255,255,255,0.08)";e.target.style.borderColor="#fff";}}
        onMouseLeave={e=>{e.target.style.background="transparent";e.target.style.borderColor="rgba(255,255,255,0.4)";}}
        >Submit Response</div>
      </ScrollReveal>
      <div style={{marginTop:80}}><Footer/></div>
    </section>
  );
}

/* ─── RESULTS PAGE — password protected, shows aggregated questionnaire data ─── */
function ResultsPage() {
  const [unlocked, setUnlocked] = useState(false);
  const [pw, setPw] = useState("");
  const [error, setError] = useState(false);
  const [activeSector, setActiveSector] = useState("ALL");
  const [responses, setResponses] = useState([]);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    if (unlocked) {
      setResponses(loadResponses());
    }
  }, [unlocked]);

  const tryUnlock = () => {
    if (pw.toUpperCase() === "SHAPE") {
      setUnlocked(true);
      setError(false);
    } else {
      setError(true);
      setTimeout(()=>setError(false), 1500);
    }
  };

  // PASSWORD GATE
  if (!unlocked) {
    return (
      <section style={{
        minHeight:"100vh",display:"flex",flexDirection:"column",justifyContent:"center",alignItems:"center",
        padding:"120px 24px",
      }}>
        <div className="bt" style={{fontSize:10,letterSpacing:"0.4em",opacity:0.4,marginBottom:24}}>RESTRICTED</div>
        <div className="hl" style={{fontSize:"clamp(40px,8vw,90px)",letterSpacing:"-0.02em",marginBottom:48,textAlign:"center"}}>RESULTS</div>
        <input
          type="password"
          value={pw}
          onChange={e=>setPw(e.target.value)}
          onKeyDown={e=>e.key==="Enter"&&tryUnlock()}
          placeholder="password"
          style={{
            width:280,background:"transparent",border:"none",
            borderBottom: error ? "1px solid #ff4444" : "1px solid rgba(255,255,255,0.3)",
            color:"#fff",padding:"14px 0",fontSize:18,
            fontFamily:"'Helvetica Neue',Helvetica,sans-serif",fontWeight:300,
            textAlign:"center",letterSpacing:"0.4em",outline:"none",cursor:"none",
            transition:"border-color 0.3s",
          }}
        />
        <div onClick={tryUnlock} className="bt" style={{
          marginTop:32,padding:"12px 48px",border:"1px solid rgba(255,255,255,0.3)",
          fontSize:12,letterSpacing:"0.2em",cursor:"none",textTransform:"uppercase",
          transition:"all 0.4s",
        }}>Unlock</div>
        {error && (
          <div className="bt" style={{marginTop:16,fontSize:11,color:"#ff6666",letterSpacing:"0.15em"}}>INVALID</div>
        )}
      </section>
    );
  }

  // DATA WRANGLING
  const filtered = activeSector === "ALL"
    ? responses
    : responses.filter(r => r.sector === activeSector);

  const sectorCounts = {};
  responses.forEach(r => { sectorCounts[r.sector] = (sectorCounts[r.sector] || 0) + 1; });
  const total = responses.length;

  // Question completion rate per sector — how many of each sector's questions got answered on average
  const completion = {};
  SECTORS.forEach(s => {
    const totalQs = s.hypotheses.reduce((a,h)=>a+h.questions.length,0);
    const sectorResps = responses.filter(r=>r.sector===s.id);
    if (sectorResps.length === 0) { completion[s.id] = 0; return; }
    const answered = sectorResps.reduce((sum,r) => {
      return sum + Object.values(r.answers).filter(v=>v && String(v).trim().length>0).length;
    }, 0);
    completion[s.id] = (answered / (sectorResps.length * totalQs)) * 100;
  });

  // Pie chart slices for distribution
  const pieColors = ["#ffffff","#aaaaaa","#666666","#333333"];
  let cumulative = 0;
  const slices = SECTORS.map((s,i) => {
    const count = sectorCounts[s.id] || 0;
    if (count === 0) return null;
    const pct = count / total;
    const startAngle = cumulative * 2 * Math.PI;
    const endAngle = (cumulative + pct) * 2 * Math.PI;
    cumulative += pct;
    const x1 = 80 + 64 * Math.sin(startAngle);
    const y1 = 80 - 64 * Math.cos(startAngle);
    const x2 = 80 + 64 * Math.sin(endAngle);
    const y2 = 80 - 64 * Math.cos(endAngle);
    const largeArc = pct > 0.5 ? 1 : 0;
    return {
      path: `M 80 80 L ${x1} ${y1} A 64 64 0 ${largeArc} 1 ${x2} ${y2} Z`,
      color: pieColors[i % pieColors.length],
      label: s.short,
      count,
      pct,
    };
  }).filter(Boolean);

  // Build a CSV for export
  const buildCsv = () => {
    const rows = [["id","timestamp","sector","question","answer"]];
    responses.forEach(r => {
      const sector = SECTORS.find(s=>s.id===r.sector);
      if (!sector) return;
      sector.hypotheses.forEach(h => {
        h.questions.forEach(q => {
          const ans = r.answers[q.id] || "";
          rows.push([r.id, r.timestamp, sector.short, q.label, ans]);
        });
      });
    });
    return rows.map(row => row.map(cell =>
      `"${String(cell).replace(/"/g,'""')}"`
    ).join(",")).join("\n");
  };

  const downloadCsv = () => {
    const csv = buildCsv();
    const blob = new Blob([csv], {type:"text/csv"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `shape_science_responses_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const emailExport = () => {
    const summary = [
      `Shape Science — Weekly Digest`,
      `Generated ${new Date().toLocaleString()}`,
      ``,
      `Total responses: ${total}`,
      ``,
      `By sector:`,
      ...SECTORS.map(s => `  ${s.short}: ${sectorCounts[s.id]||0} (${total?((sectorCounts[s.id]||0)/total*100).toFixed(0):0}%)`),
      ``,
      `Completion rate:`,
      ...SECTORS.map(s => `  ${s.short}: ${completion[s.id].toFixed(0)}%`),
    ].join("\n");
    const subject = encodeURIComponent("Shape Science — Responses Digest");
    const body = encodeURIComponent(summary + "\n\n(Full CSV export downloaded separately)");
    window.open(`mailto:${EMAIL_TARGET}?subject=${subject}&body=${body}`);
  };

  // UI
  const toggleExpanded = (id) => setExpandedId(expandedId === id ? null : id);

  return (
    <section style={{minHeight:"100vh",padding:"120px clamp(24px,6vw,80px) 60px",maxWidth:1100,margin:"0 auto"}}>
      {/* Header */}
      <div style={{display:"flex",alignItems:"flex-end",gap:16,marginBottom:8}}>
        <span className="bt" style={{fontSize:12,letterSpacing:"0.2em",opacity:0.5,paddingBottom:6}}>06</span>
        <h1 className="hl" style={{fontSize:"clamp(32px,6vw,60px)"}}>RESULTS</h1>
      </div>
      <p className="bt" style={{fontSize:12,letterSpacing:"0.15em",opacity:0.45,marginBottom:32}}>
        {total} response{total !== 1 ? "s" : ""} · {new Date().toLocaleDateString(undefined,{year:"numeric",month:"short",day:"numeric"})}
      </p>

      {total === 0 ? (
        <div className="bt" style={{fontSize:14,opacity:0.4,padding:"60px 0",letterSpacing:"0.05em"}}>
          No responses yet. When manufacturers complete the questionnaire on this device, results will appear here.
        </div>
      ) : (
        <>
          {/* TOP ROW — Distribution pie + Completion bars side-by-side */}
          <div style={{
            display:"grid",gridTemplateColumns:"1fr 1fr",gap:40,marginBottom:48,
          }} className="stats-grid">
            {/* Distribution pie */}
            <div style={{border:"1px solid rgba(255,255,255,0.08)",padding:24,borderRadius:2}}>
              <div className="bt" style={{fontSize:10,letterSpacing:"0.28em",opacity:0.5,marginBottom:18}}>
                DISTRIBUTION
              </div>
              <div style={{display:"flex",alignItems:"center",gap:20}}>
                <svg viewBox="0 0 160 160" style={{width:140,height:140,flexShrink:0}}>
                  {slices.map((s,i)=>(
                    <path key={i} d={s.path} fill={s.color} stroke="#000" strokeWidth="1.5"/>
                  ))}
                </svg>
                <div style={{flex:1,minWidth:0}}>
                  {slices.map((s,i)=>(
                    <div key={i} style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
                      <div style={{width:10,height:10,background:s.color,flexShrink:0,border:"1px solid rgba(255,255,255,0.15)"}}/>
                      <div className="bt" style={{fontSize:11,opacity:0.85,flex:1,letterSpacing:"0.02em",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>
                        {s.label}
                      </div>
                      <div className="bt" style={{fontSize:11,opacity:0.55,flexShrink:0}}>
                        {s.count} · {(s.pct*100).toFixed(0)}%
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Completion rate bars */}
            <div style={{border:"1px solid rgba(255,255,255,0.08)",padding:24,borderRadius:2}}>
              <div className="bt" style={{fontSize:10,letterSpacing:"0.28em",opacity:0.5,marginBottom:18}}>
                COMPLETION RATE
              </div>
              {SECTORS.map(s => (
                <div key={s.id} style={{marginBottom:14}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:4}}>
                    <div className="bt" style={{fontSize:11,opacity:0.85,letterSpacing:"0.02em"}}>{s.short}</div>
                    <div className="bt" style={{fontSize:10,opacity:0.55}}>{completion[s.id].toFixed(0)}%</div>
                  </div>
                  <div style={{height:4,background:"rgba(255,255,255,0.06)",borderRadius:1,overflow:"hidden"}}>
                    <div style={{
                      width:`${completion[s.id]}%`,height:"100%",background:"#fff",
                      transition:"width 0.6s cubic-bezier(0.16,1,0.3,1)",
                    }}/>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action row — export */}
          <div style={{
            display:"flex",gap:8,marginBottom:32,flexWrap:"wrap",
          }}>
            <div onClick={downloadCsv} className="bt" style={{
              padding:"8px 18px",border:"1px solid rgba(255,255,255,0.25)",
              fontSize:10,letterSpacing:"0.2em",textTransform:"uppercase",cursor:"none",
            }}>Download CSV</div>
            <div onClick={emailExport} className="bt" style={{
              padding:"8px 18px",border:"1px solid rgba(255,255,255,0.25)",
              fontSize:10,letterSpacing:"0.2em",textTransform:"uppercase",cursor:"none",
            }}>Email digest to me</div>
          </div>

          {/* Sector toggle */}
          <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:24,
            paddingBottom:20,borderBottom:"1px solid rgba(255,255,255,0.08)",
          }}>
            {[{id:"ALL",label:`ALL (${total})`},...SECTORS.map(s=>({id:s.id,label:`${s.short.toUpperCase()} (${sectorCounts[s.id]||0})`}))].map(t=>(
              <div
                key={t.id}
                onClick={()=>setActiveSector(t.id)}
                className="bt"
                style={{
                  padding:"6px 12px",
                  border: activeSector===t.id ? "1px solid #fff" : "1px solid rgba(255,255,255,0.15)",
                  fontSize:10,letterSpacing:"0.15em",cursor:"none",
                  background: activeSector===t.id ? "rgba(255,255,255,0.08)" : "transparent",
                  opacity: activeSector===t.id ? 1 : 0.6,
                  transition:"all 0.3s",
                }}
              >
                {t.label}
              </div>
            ))}
          </div>

          {/* Responses — collapsed by default, click to expand */}
          <div className="bt" style={{fontSize:10,letterSpacing:"0.28em",opacity:0.5,marginBottom:14}}>
            RESPONSES {activeSector !== "ALL" ? `· ${SECTORS.find(s=>s.id===activeSector)?.short}` : ""}
          </div>

          {filtered.length === 0 ? (
            <div className="bt" style={{fontSize:12,opacity:0.4,padding:"20px 0"}}>
              No responses in this sector yet.
            </div>
          ) : (
            <div>
              {filtered.map((response, idx) => {
                const sector = SECTORS.find(s => s.id === response.sector);
                if (!sector) return null;
                const isOpen = expandedId === response.id;
                const date = new Date(response.timestamp);
                const preview = Object.values(response.answers).find(v=>v && String(v).trim().length>0) || "";
                return (
                  <div key={response.id} style={{
                    borderBottom:"1px solid rgba(255,255,255,0.06)",
                  }}>
                    <div
                      onClick={()=>toggleExpanded(response.id)}
                      style={{
                        display:"flex",alignItems:"center",gap:16,padding:"14px 0",cursor:"none",
                      }}
                    >
                      <div className="bt" style={{fontSize:10,opacity:0.4,letterSpacing:"0.15em",width:36,flexShrink:0}}>
                        {String(idx+1).padStart(3,"0")}
                      </div>
                      <div className="bt" style={{fontSize:11,opacity:0.85,width:160,flexShrink:0,letterSpacing:"0.02em"}}>
                        {sector.short}
                      </div>
                      <div className="bt" style={{fontSize:11,opacity:0.5,width:90,flexShrink:0}}>
                        {date.toLocaleDateString(undefined,{month:"short",day:"numeric"})}
                      </div>
                      <div className="bt" style={{
                        fontSize:11,opacity:0.55,flex:1,minWidth:0,
                        overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",
                        fontStyle: preview ? "normal" : "italic",
                      }}>
                        {preview ? `"${String(preview).slice(0,90)}${String(preview).length>90?"…":""}"` : "(empty)"}
                      </div>
                      <div className="bt" style={{fontSize:10,opacity:0.5,flexShrink:0,letterSpacing:"0.1em"}}>
                        {isOpen ? "▲" : "▼"}
                      </div>
                    </div>
                    {isOpen && (
                      <div style={{padding:"8px 0 28px 52px"}}>
                        {sector.hypotheses.map(h => {
                          const answered = h.questions.filter(q=>{
                            const a = response.answers[q.id];
                            return a && String(a).trim().length>0;
                          });
                          if (answered.length === 0) return null;
                          return (
                            <div key={h.id} style={{marginBottom:18}}>
                              <div className="bt" style={{
                                fontSize:10,letterSpacing:"0.18em",opacity:0.45,marginBottom:10,
                                textTransform:"uppercase",
                              }}>
                                {h.statement}
                              </div>
                              {answered.map(q => (
                                <div key={q.id} style={{marginBottom:10,maxWidth:800}}>
                                  <div className="bt" style={{fontSize:11,opacity:0.4,marginBottom:3,lineHeight:1.4}}>
                                    {q.label}
                                  </div>
                                  <div className="bt" style={{
                                    fontSize:12.5,opacity:0.9,lineHeight:1.5,
                                    paddingLeft:10,borderLeft:"1px solid rgba(255,255,255,0.15)",
                                  }}>
                                    {response.answers[q.id]}
                                  </div>
                                </div>
                              ))}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
      <style>{`@media(max-width:760px){.stats-grid{grid-template-columns:1fr!important}}`}</style>
      <div style={{marginTop:40}}><Footer/></div>
    </section>
  );
}

/* ─── CONTACT PAGE — more readable ─── */
function ContactPage() {
  const [form, setForm] = useState({name:"",email:"",message:""});
  const [sent, setSent] = useState(false);

  const inputStyle = {
    width:"100%",background:"transparent",border:"none",
    borderBottom:"1px solid rgba(255,255,255,0.2)",color:"#fff",
    padding:"14px 0",fontSize:16,fontWeight:300,fontFamily:"'Helvetica Neue',Helvetica,sans-serif",
    outline:"none",letterSpacing:"0.02em",cursor:"none",
  };

  const handleSubmit = () => {
    const subject = encodeURIComponent(`Shape Science — Contact from ${form.name}`);
    const body = encodeURIComponent(`Name: ${form.name}\nEmail: ${form.email}\n\n${form.message}`);
    window.open(`mailto:${EMAIL_TARGET}?subject=${subject}&body=${body}`);
    setSent(true);
  };

  if(sent) return (
    <section style={{height:"100vh",display:"flex",flexDirection:"column",justifyContent:"center",alignItems:"center"}}>
      <h2 className="hl" style={{fontSize:"clamp(28px,5vw,48px)",marginBottom:16}}>MESSAGE SENT</h2>
      <p className="bt" style={{fontSize:14,opacity:0.5,letterSpacing:"0.12em"}}>we will respond</p>
      <Footer/>
    </section>
  );

  return (
    <section style={{minHeight:"100vh",display:"flex",flexDirection:"column",justifyContent:"center",
      padding:"0 clamp(24px,15vw,320px)",
    }}>
      <ScrollReveal>
        <div style={{display:"flex",alignItems:"flex-end",gap:16,marginBottom:60}}>
          <span className="bt" style={{fontSize:13,letterSpacing:"0.2em",opacity:0.5,paddingBottom:8}}>05</span>
          <h1 className="hl" style={{fontSize:"clamp(36px,7vw,72px)"}}>CONTACT</h1>
        </div>
      </ScrollReveal>
      <ScrollReveal delay={150}>
        <div style={{maxWidth:500}}>
          {[{key:"name",ph:"Name"},{key:"email",ph:"Email"}].map(f=>(
            <div key={f.key} style={{marginBottom:36}}>
              <input style={inputStyle} placeholder={f.ph}
                value={form[f.key]} onChange={e=>setForm(prev=>({...prev,[f.key]:e.target.value}))}
                onFocus={e=>e.target.style.borderBottomColor="rgba(255,255,255,0.6)"}
                onBlur={e=>e.target.style.borderBottomColor="rgba(255,255,255,0.2)"}
              />
            </div>
          ))}
          <div style={{marginBottom:48}}>
            <textarea style={{...inputStyle,resize:"vertical",minHeight:90}} placeholder="Message"
              value={form.message} onChange={e=>setForm(prev=>({...prev,message:e.target.value}))}
              onFocus={e=>e.target.style.borderBottomColor="rgba(255,255,255,0.6)"}
              onBlur={e=>e.target.style.borderBottomColor="rgba(255,255,255,0.2)"}
            />
          </div>
          <div onClick={handleSubmit} className="bt" style={{
            display:"inline-block",padding:"14px 56px",border:"1px solid rgba(255,255,255,0.3)",
            fontSize:13,letterSpacing:"0.18em",fontWeight:300,cursor:"none",transition:"all 0.5s",
            textTransform:"uppercase",
          }}
          onMouseEnter={e=>{e.target.style.background="rgba(255,255,255,0.06)";e.target.style.borderColor="#fff";}}
          onMouseLeave={e=>{e.target.style.background="transparent";e.target.style.borderColor="rgba(255,255,255,0.3)";}}
          >Send</div>
        </div>
      </ScrollReveal>
      <div style={{marginTop:80}}><Footer/></div>
    </section>
  );
}

/* ─── APP ─── */
export default function App() {
  const [page, setPage] = useState("HOME");
  const [transitioning, setTransitioning] = useState(false);

  const navigate = useCallback((p) => {
    if(p===page) return;
    setTransitioning(true);
    setTimeout(()=>{
      setPage(p);
      window.scrollTo(0,0);
      setTimeout(()=>setTransitioning(false), 50);
    }, 400);
  },[page]);

  // Listen for custom navigation events (e.g. from Footer's secret RESULTS link)
  useEffect(() => {
    const handler = (e) => navigate(e.detail);
    window.addEventListener("shape:navigate", handler);
    return () => window.removeEventListener("shape:navigate", handler);
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

  return (
    <>
      <style>{globalCSS}</style>
      <Cursor/>
      <ScrollProgress/>
      <Nav page={page} setPage={navigate}/>
      <main style={{
        opacity:transitioning?0:1,
        transition:"opacity 0.4s cubic-bezier(0.16,1,0.3,1)",
        minHeight:"100vh",
      }}>
        {renderPage()}
      </main>
    </>
  );
}



