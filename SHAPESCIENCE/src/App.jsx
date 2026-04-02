import { useState, useEffect, useRef, useCallback } from "react";

/* ─────────────────────────── CONSTANTS ─────────────────────────── */
const PAGES = ["HOME", "ABOUT", "TECH", "QUESTIONNAIRE", "CONTACT"];
const EMAIL_TARGET = "alfie.mcmeeking18@imperial.ac.uk";

/* ─────────────────────────── STYLES ─────────────────────────── */
const fontLink = (() => {
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
  .headline { font-family:'Oswald',sans-serif; font-weight:700; text-transform:uppercase; letter-spacing:-0.02em; }
  .body-text { font-family:'Helvetica Neue',Helvetica,Arial,sans-serif; font-weight:300; }

  @keyframes grainAnim {
    0%,100%{transform:translate(0,0)}10%{transform:translate(-5%,-10%)}20%{transform:translate(-15%,5%)}
    30%{transform:translate(7%,-25%)}40%{transform:translate(-5%,25%)}50%{transform:translate(-15%,10%)}
    60%{transform:translate(15%,0%)}70%{transform:translate(0%,15%)}80%{transform:translate(3%,35%)}
    90%{transform:translate(-10%,10%)}
  }
  @keyframes fadeUp { from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:translateY(0)} }
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
  @keyframes textReveal { from{opacity:0;filter:blur(8px)}to{opacity:1;filter:blur(0)} }
  @keyframes restrictedPulse { 0%,100%{opacity:0.6}50%{opacity:1} }
  @keyframes scanline { 0%{top:-100%}100%{top:100%} }
`;

/* ─────────────────────────── FILM GRAIN OVERLAY ─────────────────────────── */
function FilmGrain() {
  return (
    <div style={{
      position:"fixed",inset:0,zIndex:9998,pointerEvents:"none",overflow:"hidden",
    }}>
      <div style={{
        position:"absolute",inset:"-200%",width:"400%",height:"400%",
        background:`url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
        opacity:0.05,animation:"grainAnim 8s steps(10) infinite",
      }}/>
    </div>
  );
}

/* ─────────────────────────── CUSTOM CURSOR ─────────────────────────── */
function Cursor() {
  const ref = useRef(null);
  useEffect(() => {
    const move = (e) => {
      if (ref.current) {
        ref.current.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
      }
    };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, []);
  return (
    <div ref={ref} style={{
      position:"fixed",top:-6,left:-4,zIndex:99999,pointerEvents:"none",willChange:"transform",
    }}>
      <svg width="12" height="14" viewBox="0 0 12 14">
        <polygon points="6,0 12,14 0,14" fill="#fff"/>
      </svg>
    </div>
  );
}

/* ─────────────────────────── SCROLL PROGRESS ─────────────────────────── */
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
    <div style={{
      position:"fixed",top:0,right:0,width:2,height:"100vh",zIndex:9990,background:"rgba(255,255,255,0.08)"
    }}>
      <div style={{width:"100%",height:`${pct}%`,background:"#fff",transition:"height 0.15s linear"}}/>
    </div>
  );
}

/* ─────────────────────────── NAV ─────────────────────────── */
function Nav({ page, setPage }) {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <nav style={{
      position:"fixed",top:0,left:0,right:0,zIndex:9000,padding:"24px 32px",
      display:"flex",justifyContent:"space-between",alignItems:"center",
      background:"linear-gradient(to bottom,rgba(0,0,0,0.8),transparent)",
    }}>
      <div className="headline" style={{fontSize:16,letterSpacing:"0.08em",cursor:"none"}}
        onClick={()=>setPage("HOME")}>
        SHAPE SCIENCE
      </div>
      {/* Desktop nav */}
      <div style={{display:"flex",gap:28}} className="desktop-nav">
        {PAGES.map(p=>(
          <div key={p} className="body-text" onClick={()=>setPage(p)} style={{
            fontSize:11,letterSpacing:"0.12em",fontWeight:p===page?400:300,
            opacity:p===page?1:0.5,transition:"opacity 0.4s",cursor:"none",
            textTransform:"uppercase",
          }}>{p}</div>
        ))}
      </div>
      {/* Mobile hamburger */}
      <div className="mobile-nav-btn" onClick={()=>setMenuOpen(!menuOpen)} style={{
        display:"none",flexDirection:"column",gap:4,cursor:"none",padding:4,
      }}>
        <span style={{width:20,height:1,background:"#fff",transition:"0.3s",
          transform:menuOpen?"rotate(45deg) translateY(3.5px)":"none"}}/>
        <span style={{width:20,height:1,background:"#fff",transition:"0.3s",
          opacity:menuOpen?0:1}}/>
        <span style={{width:20,height:1,background:"#fff",transition:"0.3s",
          transform:menuOpen?"rotate(-45deg) translateY(-3.5px)":"none"}}/>
      </div>
      {/* Mobile overlay */}
      {menuOpen && (
        <div style={{
          position:"fixed",inset:0,background:"rgba(0,0,0,0.97)",zIndex:8999,
          display:"flex",flexDirection:"column",justifyContent:"center",alignItems:"center",gap:36,
        }}>
          {PAGES.map(p=>(
            <div key={p} className="headline" onClick={()=>{setPage(p);setMenuOpen(false);}} style={{
              fontSize:32,opacity:p===page?1:0.5,cursor:"none",
            }}>{p}</div>
          ))}
        </div>
      )}
      <style>{`
        @media(max-width:768px){
          .desktop-nav{display:none!important}
          .mobile-nav-btn{display:flex!important}
        }
      `}</style>
    </nav>
  );
}

/* ─────────────────────────── HOME PAGE ─────────────────────────── */
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
      {/* Hero */}
      <section style={{
        height:"100vh",display:"flex",flexDirection:"column",justifyContent:"center",alignItems:"center",
        position:"relative",overflow:"hidden",
      }}>
        {/* Noise video placeholder */}
        <div style={{
          position:"absolute",inset:0,background:"radial-gradient(ellipse at center,#111 0%,#000 70%)",
        }}>
          <div style={{
            position:"absolute",inset:0,opacity:0.03,
            background:`repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(255,255,255,0.03) 2px,rgba(255,255,255,0.03) 4px)`,
            animation:"flicker 3s infinite",
          }}/>
        </div>
        <div style={{
          position:"relative",zIndex:1,textAlign:"center",
          opacity:visible?1:0,transform:visible?"translateY(0)":"translateY(40px)",
          transition:"all 1.2s cubic-bezier(0.16,1,0.3,1)",
        }}>
          {/* Gabriel Moses style layout: small prefix line + massive bold title on single line */}
          <div style={{marginBottom:40}}>
            <p className="body-text" style={{
              fontSize:"clamp(11px,1.4vw,16px)",letterSpacing:"0.25em",
              opacity:0.4,marginBottom:14,fontWeight:300,textTransform:"lowercase",
            }}>an experiment by</p>
            <h1 className="headline" style={{
              fontSize:"clamp(52px,13vw,160px)",lineHeight:0.88,
              letterSpacing:"-0.02em",whiteSpace:"nowrap",
            }}>
              SHAPE SCIENCE
            </h1>
          </div>
          <div onClick={()=>setPage("CONTACT")} className="body-text" style={{
            display:"inline-block",padding:"12px 48px",border:"1px solid rgba(255,255,255,0.3)",
            fontSize:11,letterSpacing:"0.2em",fontWeight:300,transition:"all 0.6s",
            cursor:"none",textTransform:"uppercase",
          }}
          onMouseEnter={e=>{e.target.style.background="rgba(255,255,255,0.08)";e.target.style.borderColor="#fff";}}
          onMouseLeave={e=>{e.target.style.background="transparent";e.target.style.borderColor="rgba(255,255,255,0.3)";}}
          >Contact</div>
        </div>
        {/* Scroll hint */}
        <div className="body-text" style={{
          position:"absolute",bottom:40,left:"50%",transform:"translateX(-50%)",
          opacity:0.3,fontSize:10,letterSpacing:"0.3em",
          animation:"fadeIn 2s 1.5s both",
        }}>scroll</div>
      </section>

      {/* Explainer */}
      <section style={{minHeight:"100vh",display:"flex",flexDirection:"column",justifyContent:"center",padding:"120px clamp(24px,8vw,160px)"}}>
        {phrases.map((p,i)=>(
          <ScrollReveal key={i} delay={p.d}>
            <p className="body-text" style={{
              fontSize:"clamp(24px,4vw,52px)",fontWeight:300,lineHeight:1.3,
              marginBottom:48,opacity:0.85,maxWidth:800,
            }}>{p.t}</p>
          </ScrollReveal>
        ))}
        <ScrollReveal delay={600}>
          <p className="body-text" style={{fontSize:13,lineHeight:2,opacity:0.4,maxWidth:500,marginTop:40,letterSpacing:"0.04em"}}>
            A new approach to material design — where biology meets computation, 
            and form is grown rather than imposed. More details coming soon.
          </p>
        </ScrollReveal>
      </section>

      {/* Visual blocks */}
      <section style={{padding:"80px clamp(24px,8vw,160px)",display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:24}}>
        {[1,2,3].map(i=>(
          <ScrollReveal key={i} delay={i*150}>
            <div style={{
              aspectRatio:"4/5",background:"#0a0a0a",border:"1px solid rgba(255,255,255,0.04)",
              position:"relative",overflow:"hidden",
            }}>
              <div style={{
                position:"absolute",inset:0,
                background:`radial-gradient(circle at ${30+i*20}% ${40+i*10}%,rgba(255,255,255,0.02),transparent)`,
              }}/>
            </div>
          </ScrollReveal>
        ))}
      </section>
    </div>
  );
}

/* ─────────────────────────── SCROLL REVEAL ─────────────────────────── */
function ScrollReveal({ children, delay = 0 }) {
  const ref = useRef(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e])=>{
      if(e.isIntersecting) { setTimeout(()=>setVis(true), delay); obs.disconnect(); }
    }, { threshold:0.15 });
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

/* ─────────────────────────── ABOUT PAGE ─────────────────────────── */
function AboutPage() {
  const [hovering, setHovering] = useState(false);
  const fragments = [
    { text:"EXPERIMENTAL DESIGN", x:"8%",y:"20%",rot:-4 },
    { text:"COMPUTATIONAL FORM",x:"65%",y:"12%",rot:2 },
    { text:"LIVING SYSTEMS",x:"5%",y:"55%",rot:-1 },
    { text:"GROWN STRUCTURE",x:"70%",y:"65%",rot:3 },
    { text:"MATERIAL INTELLIGENCE",x:"12%",y:"82%",rot:-2 },
    { text:"BIOFABRICATION",x:"62%",y:"85%",rot:1 },
    { text:"FUTURE FOOTWEAR",x:"72%",y:"40%",rot:-3 },
    { text:"GROWN, NOT MADE",x:"15%",y:"40%",rot:2 },
  ];

  return (
    <section style={{minHeight:"100vh",display:"flex",flexDirection:"column",justifyContent:"center",alignItems:"center",position:"relative",padding:"120px 24px"}}>
      {/* Floating text fragments */}
      {fragments.map((f,i)=>(
        <div key={i} className="headline" style={{
          position:"absolute",left:f.x,top:f.y,fontSize:"clamp(10px,1.5vw,14px)",
          letterSpacing:"0.15em",opacity:hovering?0.6:0,
          transform:`rotate(${f.rot}deg) translateY(${hovering?0:10}px)`,
          transition:`all 0.8s ${i*80}ms cubic-bezier(0.16,1,0.3,1)`,
          pointerEvents:"none",whiteSpace:"nowrap",
        }}>{f.text}</div>
      ))}

      {/* Subject container */}
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
        {/* Silhouette placeholder */}
        <div style={{
          width:"60%",height:"75%",position:"relative",
          background:hovering
            ? "linear-gradient(to bottom,rgba(255,255,255,0.08),rgba(255,255,255,0.02))"
            : "rgba(255,255,255,0.01)",
          transition:"all 1.2s",
          clipPath:"polygon(30% 0%, 70% 0%, 80% 15%, 78% 50%, 85% 55%, 82% 100%, 18% 100%, 15% 55%, 22% 50%, 20% 15%)",
        }}>
          {/* "Shoe" shape revealed on hover */}
          <div style={{
            position:"absolute",bottom:"18%",left:"50%",transform:"translateX(-50%)",
            width:"50%",height:"15%",
            background:hovering?"rgba(255,255,255,0.12)":"transparent",
            transition:"all 1s 0.3s",
            borderRadius:"2px",
            clipPath:"polygon(10% 30%, 90% 0%, 100% 100%, 0% 100%)",
          }}/>
        </div>
        <p className="body-text" style={{
          fontSize:10,letterSpacing:"0.25em",opacity:hovering?0.5:0,
          transition:"opacity 0.8s 0.4s",marginTop:20,textAlign:"center",
        }}>hover to illuminate</p>
      </div>

      <div style={{
        marginTop:60,maxWidth:500,textAlign:"center",
        opacity:hovering?0.7:0.3,transition:"opacity 0.8s",
      }}>
        <p className="body-text" style={{fontSize:13,lineHeight:2,letterSpacing:"0.04em",fontWeight:300}}>
          Structure emerges from instruction. Form follows biology. 
          We set the conditions — the material shapes itself.
        </p>
      </div>
    </section>
  );
}

/* ─────────────────────────── TECH PAGE ─────────────────────────── */
function TechPage() {
  return (
    <section style={{
      height:"100vh",display:"flex",flexDirection:"column",justifyContent:"center",alignItems:"center",
      position:"relative",overflow:"hidden",
    }}>
      {/* Scanline */}
      <div style={{
        position:"absolute",inset:0,pointerEvents:"none",overflow:"hidden",
      }}>
        <div style={{
          position:"absolute",left:0,right:0,height:"30%",
          background:"linear-gradient(to bottom,transparent,rgba(255,255,255,0.01),transparent)",
          animation:"scanline 4s linear infinite",
        }}/>
      </div>
      {/* Glitch text */}
      <div style={{position:"relative"}}>
        <h1 className="headline" style={{
          fontSize:"clamp(36px,8vw,90px)",letterSpacing:"0.06em",
          animation:"restrictedPulse 3s infinite",
        }}>
          ACCESS RESTRICTED
        </h1>
        {/* Glitch layers */}
        <h1 className="headline" style={{
          position:"absolute",top:0,left:0,
          fontSize:"clamp(36px,8vw,90px)",letterSpacing:"0.06em",
          color:"rgba(255,255,255,0.3)",
          animation:"glitch1 3s infinite linear alternate-reverse",
          transform:"translateX(2px)",
        }}>ACCESS RESTRICTED</h1>
        <h1 className="headline" style={{
          position:"absolute",top:0,left:0,
          fontSize:"clamp(36px,8vw,90px)",letterSpacing:"0.06em",
          color:"rgba(255,255,255,0.15)",
          animation:"glitch2 2.5s infinite linear alternate",
          transform:"translateX(-2px)",
        }}>ACCESS RESTRICTED</h1>
      </div>
      <p className="body-text" style={{
        marginTop:32,fontSize:11,letterSpacing:"0.3em",opacity:0.25,fontWeight:300,
      }}>clearance required</p>
    </section>
  );
}

/* ─────────────────────────── QUESTIONNAIRE PAGE ─────────────────────────── */
const QUESTIONS = [
  { category:"PRODUCTION", questions:[
    { id:"q1",label:"Current materials in use",type:"text",placeholder:"List primary materials..." },
    { id:"q2",label:"Bio-based material experience",type:"select",options:["None","Experimental","Active production"] },
  ]},
  { category:"PROCESS", questions:[
    { id:"q3",label:"Manufacturing methods",type:"text",placeholder:"Injection moulding, foaming, extrusion..." },
    { id:"q4",label:"Tolerance range (mm)",type:"text",placeholder:"±0.00" },
    { id:"q5",label:"Production constraints",type:"textarea",placeholder:"Describe limitations..." },
  ]},
  { category:"SUSTAINABILITY", questions:[
    { id:"q6",label:"Current waste streams",type:"textarea",placeholder:"Identify primary waste outputs..." },
    { id:"q7",label:"Sustainability targets",type:"select",options:["Undefined","Short-term","Long-term integration"] },
  ]},
  { category:"INTEGRATION", questions:[
    { id:"q8",label:"Openness to new material systems",type:"select",options:["Resistant","Cautious","Open","Actively seeking"] },
    { id:"q9",label:"Scalability constraints",type:"textarea",placeholder:"Volume, tooling, facility..." },
  ]},
];

function QuestionnairePage() {
  const [formData, setFormData] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const update = (id,val) => setFormData(prev=>({...prev,[id]:val}));

  const inputStyle = {
    width:"100%",background:"transparent",border:"none",
    borderBottom:"1px solid rgba(255,255,255,0.15)",color:"#fff",
    padding:"10px 0",fontSize:13,fontWeight:300,fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif",
    outline:"none",letterSpacing:"0.02em",cursor:"none",
  };
  const selectStyle = {
    ...inputStyle,borderBottom:"1px solid rgba(255,255,255,0.15)",
    WebkitAppearance:"none",appearance:"none",borderRadius:0,
    backgroundImage:`url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%23ffffff' fill-opacity='0.4'/%3E%3C/svg%3E")`,
    backgroundRepeat:"no-repeat",backgroundPosition:"right 0 center",
  };

  if(submitted) return (
    <section style={{height:"100vh",display:"flex",flexDirection:"column",justifyContent:"center",alignItems:"center"}}>
      <h2 className="headline" style={{fontSize:"clamp(28px,5vw,48px)",marginBottom:16}}>RECEIVED</h2>
      <p className="body-text" style={{fontSize:12,opacity:0.4,letterSpacing:"0.15em"}}>your data has been logged</p>
    </section>
  );

  return (
    <section style={{minHeight:"100vh",padding:"140px clamp(24px,8vw,160px) 80px"}}>
      <ScrollReveal>
        <h1 className="headline" style={{fontSize:"clamp(32px,6vw,64px)",marginBottom:12}}>QUESTIONNAIRE</h1>
        <p className="body-text" style={{fontSize:11,letterSpacing:"0.2em",opacity:0.3,marginBottom:80}}>manufacturer assessment protocol</p>
      </ScrollReveal>

      {QUESTIONS.map((section,si)=>(
        <ScrollReveal key={si} delay={si*100}>
          <div style={{marginBottom:64}}>
            <div className="body-text" style={{
              fontSize:10,letterSpacing:"0.3em",opacity:0.35,marginBottom:32,
              paddingBottom:8,borderBottom:"1px solid rgba(255,255,255,0.06)",
              textTransform:"uppercase",
            }}>{String(si+1).padStart(2,"0")} — {section.category}</div>
            {section.questions.map(q=>(
              <div key={q.id} style={{marginBottom:28}}>
                <label className="body-text" style={{fontSize:10,letterSpacing:"0.2em",opacity:0.5,display:"block",marginBottom:8}}>
                  {q.label}
                </label>
                {q.type==="text" && (
                  <input style={inputStyle} placeholder={q.placeholder}
                    value={formData[q.id]||""} onChange={e=>update(q.id,e.target.value)}
                    onFocus={e=>e.target.style.borderBottomColor="rgba(255,255,255,0.5)"}
                    onBlur={e=>e.target.style.borderBottomColor="rgba(255,255,255,0.15)"}
                  />
                )}
                {q.type==="textarea" && (
                  <textarea style={{...inputStyle,resize:"vertical",minHeight:60}} placeholder={q.placeholder}
                    value={formData[q.id]||""} onChange={e=>update(q.id,e.target.value)}
                    onFocus={e=>e.target.style.borderBottomColor="rgba(255,255,255,0.5)"}
                    onBlur={e=>e.target.style.borderBottomColor="rgba(255,255,255,0.15)"}
                  />
                )}
                {q.type==="select" && (
                  <select style={selectStyle} value={formData[q.id]||""} onChange={e=>update(q.id,e.target.value)}>
                    <option value="" style={{background:"#000"}}>Select</option>
                    {q.options.map(o=><option key={o} value={o} style={{background:"#000"}}>{o}</option>)}
                  </select>
                )}
              </div>
            ))}
          </div>
        </ScrollReveal>
      ))}

      <ScrollReveal delay={400}>
        <div onClick={()=>setSubmitted(true)} className="body-text" style={{
          display:"inline-block",padding:"14px 56px",border:"1px solid rgba(255,255,255,0.2)",
          fontSize:11,letterSpacing:"0.2em",fontWeight:300,cursor:"none",
          transition:"all 0.5s",marginTop:20,textTransform:"uppercase",
        }}
        onMouseEnter={e=>{e.target.style.background="rgba(255,255,255,0.06)";e.target.style.borderColor="#fff";}}
        onMouseLeave={e=>{e.target.style.background="transparent";e.target.style.borderColor="rgba(255,255,255,0.2)";}}
        >Submit</div>
      </ScrollReveal>
    </section>
  );
}

/* ─────────────────────────── CONTACT PAGE ─────────────────────────── */
function ContactPage() {
  const [form, setForm] = useState({name:"",email:"",message:""});
  const [sent, setSent] = useState(false);

  const inputStyle = {
    width:"100%",background:"transparent",border:"none",
    borderBottom:"1px solid rgba(255,255,255,0.12)",color:"#fff",
    padding:"12px 0",fontSize:14,fontWeight:300,fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif",
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
      <h2 className="headline" style={{fontSize:"clamp(28px,5vw,48px)",marginBottom:16}}>MESSAGE SENT</h2>
      <p className="body-text" style={{fontSize:12,opacity:0.4,letterSpacing:"0.15em"}}>we will respond</p>
    </section>
  );

  return (
    <section style={{
      height:"100vh",display:"flex",flexDirection:"column",justifyContent:"center",
      padding:"0 clamp(24px,15vw,320px)",
    }}>
      <ScrollReveal>
        <h1 className="headline" style={{fontSize:"clamp(36px,7vw,72px)",marginBottom:60}}>CONTACT</h1>
      </ScrollReveal>
      <ScrollReveal delay={150}>
        <div style={{maxWidth:500}}>
          {[
            {key:"name",ph:"Name"},
            {key:"email",ph:"Email"},
          ].map(f=>(
            <div key={f.key} style={{marginBottom:32}}>
              <input style={inputStyle} placeholder={f.ph}
                value={form[f.key]} onChange={e=>setForm(prev=>({...prev,[f.key]:e.target.value}))}
                onFocus={e=>e.target.style.borderBottomColor="rgba(255,255,255,0.5)"}
                onBlur={e=>e.target.style.borderBottomColor="rgba(255,255,255,0.12)"}
              />
            </div>
          ))}
          <div style={{marginBottom:48}}>
            <textarea style={{...inputStyle,resize:"vertical",minHeight:80}} placeholder="Message"
              value={form.message} onChange={e=>setForm(prev=>({...prev,message:e.target.value}))}
              onFocus={e=>e.target.style.borderBottomColor="rgba(255,255,255,0.5)"}
              onBlur={e=>e.target.style.borderBottomColor="rgba(255,255,255,0.12)"}
            />
          </div>
          <div onClick={handleSubmit} className="body-text" style={{
            display:"inline-block",padding:"14px 56px",border:"1px solid rgba(255,255,255,0.2)",
            fontSize:11,letterSpacing:"0.2em",fontWeight:300,cursor:"none",transition:"all 0.5s",
            textTransform:"uppercase",
          }}
          onMouseEnter={e=>{e.target.style.background="rgba(255,255,255,0.06)";e.target.style.borderColor="#fff";}}
          onMouseLeave={e=>{e.target.style.background="transparent";e.target.style.borderColor="rgba(255,255,255,0.2)";}}
          >Send</div>
        </div>
      </ScrollReveal>
    </section>
  );
}

/* ─────────────────────────── APP ─────────────────────────── */
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

  const renderPage = () => {
    switch(page){
      case "HOME": return <HomePage setPage={navigate}/>;
      case "ABOUT": return <AboutPage/>;
      case "TECH": return <TechPage/>;
      case "QUESTIONNAIRE": return <QuestionnairePage/>;
      case "CONTACT": return <ContactPage/>;
      default: return <HomePage setPage={navigate}/>;
    }
  };

  return (
    <>
      <style>{globalCSS}</style>
      <Cursor/>
      <FilmGrain/>
      <ScrollProgress/>
      <Nav page={page} setPage={navigate}/>
      <main style={{
        opacity:transitioning?0:1,
        transition:"opacity 0.4s cubic-bezier(0.16,1,0.3,1)",
        minHeight:"100vh",
      }}>
        {renderPage()}
      </main>
      {/* Footer */}
      <footer style={{
        padding:"40px 32px",borderTop:"1px solid rgba(255,255,255,0.04)",
        display:"flex",justifyContent:"space-between",alignItems:"center",
        fontSize:10,letterSpacing:"0.15em",opacity:0.25,
      }}>
        <span className="body-text">Shape Science © 2026</span>
        <span className="body-text">shapescience.org</span>
      </footer>
    </>
  );
}
