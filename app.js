(()=>{"use strict";const t=window.SITE||{},e=(t,e=document)=>e.querySelector(t),n=document.documentElement,o=matchMedia("(prefers-reduced-motion: reduce)").matches,a=(navigator.hardwareConcurrency||8)<=2||(navigator.deviceMemory||8)<=2,s=o||a,r=!!(window.CSS&&CSS.supports&&CSS.supports("transform-style","preserve-3d"));function i(t,e={},...n){const o=document.createElement(t);for(const t in e){const n=e[t];"class"===t?o.className=n:"text"===t?o.textContent=n:t.startsWith("on")?o.addEventListener(t.slice(2),n):!1!==n&&null!=n&&o.setAttribute(t,!0===n?"":n)}return n.flat().forEach(t=>{null!=t&&!1!==t&&o.append(t.nodeType?t:document.createTextNode(t))}),o}s&&n.classList.add("lite");function c(t=440,e=.08,n="sine",o=.05,a=0){false}const l=()=>c(520,.09,"triangle",.06,300);let d;function p(t=["🎓","🎉","✨","🧢","💙","💛"],n=36){if(o)return;const a=e("#fx");for(let e=0;e<n;e++){const n=i("span",{class:"rain",text:t[e%t.length],style:`left:${100*Math.random()}%;animation-duration:${2.2+2*Math.random()}s;animation-delay:${.8*Math.random()}s;font-size:${20+22*Math.random()}px`});a.append(n),setTimeout(()=>n.remove(),5400)}}let u=0;function h(t,e,n=14){if(t.dataset.on||s||!r)return;t.dataset.on="1";const o=i("span",{class:"wob"});for(let t=n;t>=0;t--){const n=0===t?"#fff":`hsl(${218+1.2*t} ${72-t}% ${64-2.7*t}%)`;o.append(i("span",{class:"lay",text:e,style:`--z:${3*-t};color:${n}`}))}t.append(i("span",{class:"stack","aria-hidden":"true"},o)),t.classList.add("enh")}o||addEventListener("pointermove",t=>function(t,e){u||(u=requestAnimationFrame(()=>{u=0,n.style.setProperty("--mx",t.toFixed(3)),n.style.setProperty("--my",e.toFixed(3))}))}(2*(t.clientX/innerWidth-.5),2*(t.clientY/innerHeight-.5)),{passive:!0});const m=["photo coming soon","someone was blinking","our best side is still loading","tape is ready, photo is not","the photographer is stuck in traffic"];function f(t,e,n){t.classList.add("empty"),t.classList.remove("init"),t.replaceChildren(i("span",{text:"📷"}),i("b",{text:n||m[e%m.length]}))}function g(t,e,n,o){if(!e)return f(t,n,o);!function(t,e,n){const o=new Image;o.alt="",o.decoding="async",o.loading="lazy";let a=0;o.onerror=()=>{++a<e.length?o.src=e[a]:n()},o.src=e[0],t.classList.remove("empty"),t.replaceChildren(o)}(t,[e],()=>f(t,n,o))}const y=(t,e)=>/^(https?:)?\/\//.test(t)||t.includes("/")?t:e+"/"+t;let b=[],v=0;function w(){const t=b[v],n=e("#lbimg"),o=e("#lbvideo");if(o){o.paused||o.pause();try{o.removeAttribute("src"),o.load()}catch(t){}}const a=t.vid&&o?o:n;t.vid&&o?(n.hidden=!0,n.removeAttribute("src"),o.hidden=!1,o.muted=!1,o.src=t.src,o.play&&o.play().catch(()=>{})):(o&&(o.hidden=!0),n.hidden=!1,n.src=t.src,n.alt=t.cap||""),a.classList.remove("swap"),a.offsetWidth,a.classList.add("swap"),e("#lbcap").textContent=t.cap||"";const s=b.length>1;e("#lbprev").hidden=!s,e("#lbnext").hidden=!s}function x(t,n){b=t,v=n,w(),e("#lb").hidden=!1,e("#lbclose").focus()}function k(t){const e=[...t.querySelectorAll(".polaroid-card")];if(e.length<2)return;const n="http://www.w3.org/2000/svg";let o,a=t.querySelector(".yarn");a?o=a.firstChild:(a=document.createElementNS(n,"svg"),a.setAttribute("class","yarn draw"),o=document.createElementNS(n,"path"),o.setAttribute("pathLength","1"),a.append(o),t.prepend(a)),a.setAttribute("width",t.scrollWidth),a.setAttribute("height",t.scrollHeight);const s=e.map(t=>[t.offsetLeft+t.offsetWidth/2,t.offsetTop]);let r=`M${s[0][0]} ${s[0][1]}`;for(let t=1;t<s.length;t++){const[e,n]=s[t-1],[o,a]=s[t];r+=` Q${(e+o)/2} ${Math.max(n,a)+28} ${o} ${a}`}o.setAttribute("d",r)}function C(t){const e=document.getElementById("detectiveWallOverlay");if(e&&!e.classList.contains("closing")){if(t||s)return void e.remove();l(),e.classList.add("closing"),setTimeout(()=>e.remove(),280)}}function E(){const t=e("#lbvideo");t&&(t.paused||t.pause(),t.removeAttribute("src"),t.load&&t.load()),e("#lb").hidden=!0,e("#lbimg").removeAttribute("src")}addEventListener("keydown",t=>{const n=e("#lb");if(n&&!n.hidden){const n=e("#lbvideo");if(n&&!n.hidden&&t.target===n&&("ArrowLeft"===t.key||"ArrowRight"===t.key))return;return void("Escape"===t.key?E():"ArrowLeft"===t.key?e("#lbprev").click():"ArrowRight"===t.key&&e("#lbnext").click())}"Escape"===t.key&&C()}),e("#lbclose").onclick=E,e("#lb").addEventListener("click",t=>{"lb"===t.target.id&&E()}),e("#lbprev").onclick=()=>{v=(v-1+b.length)%b.length,w()},e("#lbnext").onclick=()=>{v=(v+1)%b.length,w()};const L=["splash","countdown","home","randoms","people","trips","mail"];let A="splash",S=!1,T=null,$=0;const M=()=>{const t=location.hash.slice(1);return L.includes(t)?t:null};function N(t){if(t===A)return;if(S)return void(T=t);const n=e("#"+A),o=e("#"+t);if(!o)return;S=!0,document.body.classList.add("busy"),o.scrollTop=0,o.classList.add("on","incoming"),ct(t),c(180,.5,"sawtooth",.03,900);let a="function"!=typeof o.animate||s?Promise.resolve():function(t,n){const o=e("#fx"),a=e=>{const n=t.cloneNode(!0);return n.removeAttribute("id"),n.querySelectorAll("[id]").forEach(t=>t.removeAttribute("id")),n.setAttribute("aria-hidden","true"),n.inert=!0,n.style.clipPath="l"===e?"inset(0 50% 0 0)":"inset(0 0 0 50%)",n},s=i("div",{class:"cutslit"}),r=i("div",{class:"cutseam"}),c=a("l"),l=a("r");o.append(s,c,l,r),c.scrollTop=l.scrollTop=t.scrollTop,r.animate([{transform:"scaleY(0)"},{transform:"scaleY(1)"}],{duration:260,easing:"cubic-bezier(.3,.7,.2,1)",fill:"both"}),r.animate([{opacity:1},{opacity:0}],{duration:200,delay:260,fill:"both"});const d={duration:900,delay:240,easing:"cubic-bezier(.7,0,.2,1)",fill:"both"},p=c.animate([{transform:"translateX(0)"},{transform:"translateX(-50%)"}],d),u=l.animate([{transform:"translateX(0)"},{transform:"translateX(50%)"}],d);return s.animate([{transform:"scaleX(0)"},{transform:"scaleX(1)"}],d),s.animate([{opacity:1},{opacity:1,offset:.55},{opacity:0}],d),n.animate([{transform:"scale(1.12)"},{transform:"none"}],{duration:1100,delay:240,easing:"cubic-bezier(.2,.7,.2,1)",fill:"backwards"}),Promise.all([p.finished,u.finished]).catch(()=>{}).then(()=>[s,c,l,r].forEach(t=>t.remove()))}(n,o);Promise.race([Promise.resolve(a).catch(()=>{}),new Promise(t=>setTimeout(t,1500))]).then(()=>{n.getAnimations&&n.getAnimations().forEach(t=>t.cancel()),n.classList.remove("on"),o.classList.remove("incoming"),A=t,S=!1,document.body.classList.remove("busy");const e=o.querySelector("h1,h2");if(e&&(e.setAttribute("tabindex","-1"),e.focus({preventScroll:!0})),T){const t=T;T=null,N(t)}})}addEventListener("popstate",t=>{const e=t.state;$=e?e.d:0,N(e&&e.id||M()||"splash")}),document.addEventListener("click",t=>{const e=t.target.closest("[data-go],[data-back]");e&&(t.preventDefault(),!S&&(l(),e.dataset.go?function(t){S||t===A||($++,history.pushState({id:t,d:$},"","#"+t),N(t))}(e.dataset.go):S||($>0?history.back():(history.replaceState({id:"home",d:0},"","#home"),N("home")))))});let I=0;document.addEventListener("click",t=>{const n=t.target.closest("[data-m]");n&&(l(),n.classList.remove("wiggle"),n.offsetWidth,n.classList.add("wiggle"),++I>=5&&(I=0,p(),function(t){const n=e("#toast");n.textContent=t,n.classList.add("show"),clearTimeout(d),d=setTimeout(()=>n.classList.remove("show"),2800)}("Congratulations, you found the confetti.")))}),function(){const n=t.welcome,o=(Array.isArray(n)?n[n.length-1]:n)||"Welcome in the home of our memories";e("#ctitle").textContent=t.countdownTitle||"The Final Countdown",e("#csub").textContent=t.countdownSub||"Every second brings us closer.",e("#etitle").textContent=t.enterTitle||"Enter our home",e("#esub").textContent=t.enterSub||"Explore our life.",s?e("#l5t").textContent=o:setTimeout(()=>{let t=0;const n=setInterval(()=>{e("#l5t").textContent=o.slice(0,++t),t>=o.length&&clearInterval(n)},36)},1e3),h(e("#logo3d"),"MEIS'27",16)}();const D=t.countdowns&&t.countdowns.length?t.countdowns:[{id:"grad",label:"Graduation Day",date:"2027-07-21T18:00:00",sub:"",joke:"",done:""}],P=new Date(t.startDate||"2026-09-12T08:00:00");let W=D[D.length-1].id,j={};const z=()=>D.find(t=>t.id===W)||D[0];function F(t){return String(t).padStart(2,"0")}function B(){const t=z();let n=new Date(t.date)-Date.now();const o=n<=0||isNaN(n);o&&(n=0);const a=Math.floor(n/1e3),s={d:Math.floor(a/86400),h:Math.floor(a%86400/3600),m:Math.floor(a%3600/60),s:a%60};for(const t in s){const n=e("#cd-"+t),o="d"===t?String(s[t]):F(s[t]);j[t]!==o&&(n.textContent=o,j[t]=o)}e("#cdfin").hidden=!o,o&&(e("#cdfin").textContent=t.done||"WE DID IT.")}function O(){const t=new Date(z().date),e=(Date.now()-P)/(t-P);return isNaN(e)?0:((t,e,n)=>Math.min(n,Math.max(e,t)))(e,.02,1)}const q=["we just left the driveway","still on the easy part","halfway. the snacks are gone","the road gets steep","nearly there","THE FLAG"];function R(t){const n=e("#roadp"),o=e("#rider");if(!n||!o)return;const a=n.getTotalLength(),s=O(),r=n.getPointAtLength(a*s);o.setAttribute("transform",`translate(${r.x} ${r.y})`);const i=e("#roadnote");i&&(i.textContent=q[Math.min(q.length-1,Math.floor(s*q.length))])}function G(t,n){W=t;const o=z();j={};const a=e("#cdsub");a&&(a.textContent=o.sub||"");const s=e("#cdjoke");s&&(s.textContent=o.joke||""),document.querySelectorAll("#cdtabs button").forEach(e=>e.setAttribute("aria-pressed",String(e.dataset.id===t))),B(),R()}!function(){const t=e("#cdtabs");D.length<2&&(t.hidden=!0),D.forEach(e=>t.append(i("button",{class:"tabbtn",type:"button","data-id":e.id,text:e.label,"aria-pressed":"false",onclick:()=>{l(),G(e.id)}}))),G(W),setInterval(B,1e3)}();let H=!1;t.excuses;!function(){if(H)return;H=!0,e("#warntxt").textContent=t.warning||"warning: contains pure legends",e("#bubble").textContent=t.bubble||"Yes, we really are graduating.",g(e("#grouppol .ph"),t.groupPhoto,0,"group photo coming soon"),e("#groupcap").textContent=t.groupCaption||"the whole crew";const n=(t.band||["SCAN. SMILE. REMEMBER."]).map(t=>t+"   ★   ").join("").repeat(3);e("#band").append(i("span",{text:n}),i("span",{text:n}));const o=e("#rules");(t.rules||[]).forEach(t=>o.append(i("li",{text:t})))}();let X=!1;let U=!1;function Y(t){if(!t)return"";let e=t.match(/\/d\/([a-zA-Z0-9_-]+)/)||t.match(/id=([a-zA-Z0-9_-]+)/);return e&&e[1]?`https://lh3.googleusercontent.com/d/${e[1]}`:t}let _=!1;async function J(t){if(t.startsWith("data:"))return!0;if(/^(https?:)?\/\//.test(t))return new Promise(e=>{const n=new Image,o=setTimeout(()=>e(!1),6e3);n.onload=()=>{clearTimeout(o),e(!0)},n.onerror=()=>{clearTimeout(o),e(!1)},n.src=t});for(let e=0;e<3;e++){const n=await Promise.race([fetch(t,{method:"HEAD",cache:"no-store"}).then(t=>({s:t.status,ok:t.ok})).catch(()=>null),new Promise(t=>setTimeout(()=>t(null),3500))]);if(n&&n.s<500&&429!==n.s)return!!n.ok;if(e<2)await new Promise(t=>setTimeout(t,700))}return!1}async function Q(t){if(!t)return[];const e=[];for(let n=1;n<=300;n+=20){const o=[];for(let t=n;t<n+20;t++)o.push(t);const a=await Promise.all(o.map(e=>J(t+"/"+e+".jpg")));if(a.forEach((n,a)=>n&&e.push(t+"/"+o[a]+".jpg")),!a.some(Boolean))break}return e}function Z(t){return new Promise(e=>{const n=document.createElement("video");n.preload="metadata",n.muted=!0;const o=setTimeout(()=>{a(),e(!1)},4e3);function a(){clearTimeout(o);try{n.removeAttribute("src"),n.load()}catch(t){}}n.onloadedmetadata=()=>{a(),e(!0)},n.onerror=()=>{a(),e(!1)},n.src=t})}function __anyOk(t){return new Promise((e,n)=>{let o=0;const r=t.length;t.forEach(t=>{Promise.resolve(t).then(e,()=>{++o===r&&n(new Error("none"))})})})}async function K(t,e){try{const n=await __anyOk(["mp4","mov","webm","m4v"].map(n=>Z(t+"/"+e+"."+n).then(o=>o?t+"/"+e+"."+n:Promise.reject(new Error("no")))));return n}catch(t){return null}}async function V(t){if(!t)return[];const e=[];for(let n=1;n<=300;n+=5){const o=[];for(let t=n;t<n+5;t++)o.push(t);const a=await Promise.all(o.map(e=>K(t,e)));if(a.forEach((t,n)=>t&&e.push(t)),!a.some(Boolean))break}return e}async function __fetchText(t,e){const n=await Promise.race([fetch(t,{cache:"no-cache"}).then(t=>t.ok?t.text():null).catch(()=>null),new Promise(t=>setTimeout(()=>t(null),e))]);return n||null}async function tt(){let e=null;try{const n=await __fetchText("trips/trips.txt",8e3);if(n){const o=function(t){const e=[];return String(t||"").split(/\r?\n/).forEach((t,n)=>{const o=t.trim();if(!o||o.startsWith("#")||o.startsWith("//"))return;const a=o.split("|").map(t=>t.trim()),s=a.shift()||"";if(!s)return;let r=null,i=null;for(;;){const t=a.length?a[a.length-1]:"";if(/^photos:/i.test(t))r=a.pop().replace(/^photos:/i,"").split(",").map(t=>t.trim()).filter(Boolean);else{if(!/^videos:/i.test(t))break;i=a.pop().replace(/^videos:/i,"").split(",").map(t=>t.trim()).filter(Boolean)}}let c="";a.length>=3&&(c=a.pop());const l=a.shift()||"",d=a.join(" | ");c=c.replace(/^\/+|\/+$/g,""),c||(c=s.replace(/\s+/g,"")||"trip"+(n+1)),/^(https?:)?\/\//.test(c)||c.includes("/")||(c="trips/"+c),r&&(r=r.map(t=>/^(https?:)?\/\//.test(t)||t.includes("/")?t:c+"/"+t)),i&&(i=i.map(t=>/^(https?:)?\/\//.test(t)||t.includes("/")?t:c+"/"+t)),e.push({name:s,date:l,note:d,folder:c,photos:r,videos:i})}),e}(n);o.length&&(e=o)}}catch(t){}if(!e)return(t.trips||[]).map(t=>({...t}));const __enhance=async n=>{let r=null;if(n.photos&&n.photos.length){const c=n.photos.find(p=>/(^|\/)cover\.(jpe?g|png|webp)$/i.test(p));r=c||null}else{const s=await Promise.all(["cover.jpg","cover.jpeg","cover.png","cover.webp"].map(async c=>(await J(n.folder+"/"+c))?c:null));const f=s.find(Boolean);r=f?n.folder+"/"+f:null;n.photos=await Q(n.folder)}if(!n.photos.length){const e=(t.trips||[]).find(t=>t.photos&&t.photos.length&&String(t.name||"").trim().toLowerCase()===String(n.name||"").trim().toLowerCase());e&&(n.photos=e.photos.slice())}n.videos||(n.videos=await V(n.folder));n.cover=r||n.photos[0]||null};await Promise.all(e.map(n=>new Promise(o=>{const r=setTimeout(o,15e3);__enhance(n).then(()=>{clearTimeout(r),o()},()=>{clearTimeout(r),o()})})));return e}function et(){if(_)return;_=!0;const n=e("#tripl");n.className="tl",n.replaceChildren(i("p",{class:"hand none",text:"Loading trips…"}));const o=t=>{n.replaceChildren(),t.length?t.forEach((t,e)=>{const o=(t.photos||[]).map(t=>({src:y(t,"photos"),vid:!1})).concat((t.videos||[]).map(t=>({src:y(t,"photos"),vid:!0}))),a=(t.photos||[]).length,s=(t.videos||[]).length,r=t.cover?y(t.cover,"photos"):o.length?o[0].src:null,c=()=>{l(),function(t,e){C(!0);const n=(e||[]).map((n,o)=>({src:n.src,vid:!!n.vid,cap:`${t} · ${o+1}/${e.length}`})),o=i("div",{class:"detective-grid"}),a=i("div",{class:"detective-board"},i("div",{class:"board-header"},i("span",{class:"classified-stamp",text:"CASE FILE"}),i("h2",{class:"wall-heading",text:t})),o),s=i("div",{id:"detectiveWallOverlay",class:"wall-overlay active",role:"dialog","aria-modal":"true","aria-label":t},i("button",{class:"wall-close",type:"button","aria-label":"Close",text:"✕",onclick:()=>C()}),a);n.length?n.forEach((t,e)=>{const a=(10*Math.random()-5).toFixed(1);let s=null;t.vid&&(s=document.createElement("video"),s.className="vidcard",s.preload="metadata",s.muted=!0,s.playsInline=!0,s.loop=!0,s.setAttribute("aria-hidden","true"),s.src=t.src+"#t=0.1");const r=i("div",{class:"polaroid-card",style:`--rot:${a}deg;--i:${Math.min(e,12)}`,tabindex:"0",role:"button","aria-label":t.cap},i("div",{class:"push-pin"}),i("div",{class:"photo-inner"},s||i("img",{src:t.src,alt:t.cap,loading:"lazy"}),t.vid?i("span",{class:"playbadge",text:"▶","aria-hidden":"true"}):null),i("div",{class:"photo-label",text:"#"+(e+1)+(t.vid?" 🎬":"")})),c=()=>{l(),x(n,e)};r.onclick=c,r.onkeydown=t=>{("Enter"===t.key||" "===t.key)&&(t.preventDefault(),c())},o.append(r)}):o.append(i("p",{class:"hand",style:"color:#fef08a;font-size:24px;text-align:center;grid-column:1/-1",text:"⏳ Photos coming soon for this trip!"})),s.addEventListener("click",t=>{t.target===s&&C()}),document.body.append(s),requestAnimationFrame(()=>k(o)),window.ResizeObserver&&new ResizeObserver(()=>k(o)).observe(o)}(t.name,o)},d=i("div",{class:"tphoto"}),p=t=>d.replaceChildren(i("div",{class:"tempty",text:t||"📷"}));if(r){const e=i("img",{class:"tbg",src:r,alt:"","aria-hidden":"true",loading:"lazy"}),n=i("img",{class:"tfg",src:r,alt:t.name,loading:"lazy"});n.onerror=()=>p(),d.append(e,n)}else p(s&&!a?"🎬":"📷");const u=a&&s?"📸 "+a+" · 🎬 "+s:a?"📸 "+a:s?"🎬 "+s:"";u&&d.append(i("span",{class:"tcount",text:u})),d.append(i("span",{class:"topen",text:"Open the wall →"}));const h=i("div",{class:"tcard",role:"button",tabindex:"0","aria-label":"Open "+t.name,onclick:c,onkeydown:t=>{("Enter"===t.key||" "===t.key)&&(t.preventDefault(),c())}},d,i("div",{class:"tbody"},t.date?i("span",{class:"tdate",text:t.date}):null,i("h3",{text:t.name}),t.note?i("p",{text:t.note}):null));n.append(i("div",{class:"tstop",style:`--i:${Math.min(e,8)}`},i("span",{class:"tdot","aria-hidden":"true",text:"📍"}),h))}):n.append(i("p",{class:"hand none",text:"Trips coming soon…"}))};tt().then(o).catch(()=>o(t.trips||[]))}const nt=()=>(t.mailApi||"").trim();let ot=null;async function at(t){return(await fetch(nt(),{method:"POST",body:JSON.stringify(t)})).json()}function st(t,e,n){t.replaceChildren(i("option",{value:"",text:n}),...e.map(t=>i("option",{value:t,text:t})))}let rt=!1;function it(){if(rt)return;rt=!0,async function(){if(ot)return ot;let t=[];try{t=(await(await fetch("data.json")).json()).map(t=>t.Name).filter(Boolean)}catch(t){}return ot=t}().then(t=>{st(e("#to"),t,"pick a victim…"),st(e("#who"),t,"pick your name…"),st(e("#from"),t,"anonymous"),st(e("#ccname"),t,"Select your name…")});const t=e("#tabw"),n=e("#tabr"),o=e("#panelw"),a=e("#panelr");t&&n&&o&&a&&(t.onclick=()=>{l(),t.setAttribute("aria-pressed","true"),n.setAttribute("aria-pressed","false"),o.hidden=!1,a.hidden=!0},n.onclick=()=>{l(),n.setAttribute("aria-pressed","true"),t.setAttribute("aria-pressed","false"),a.hidden=!1,o.hidden=!0});const s=e("#sendform"),r=e("#from"),c=e("#fromCodeField");r&&c&&(r.onchange=()=>{r.value?(c.hidden=!1,c.querySelector("input").required=!0):(c.hidden=!0,c.querySelector("input").required=!1,c.querySelector("input").value="")}),s&&(s.onsubmit=async t=>{t.preventDefault();const n=e("#sendbtn"),o=e("#sendmsg"),a=r.value,i=s.querySelector('[name="fromCode"]').value;if(a){n.disabled=!0,o.textContent="Verifying your identity...";try{if(!(await at({a:"read",name:a,code:i})).ok)return o.className="msg",o.textContent="❌ Wrong secret code! You cannot sign as someone else.",void(n.disabled=!1)}catch(t){return o.className="msg",o.textContent="Connection error during verification.",void(n.disabled=!1)}}n.disabled=!0,o.textContent="Sending...";try{const e=new FormData(t.target),n=window.meisWish&&window.meisWish.is(e.get("to")),a=await at({a:"send",to:e.get("to"),text:e.get("text"),from:e.get("from"),hp:e.get("hp"),wish:n?1:0});a.ok?(o.className="msg ok",o.textContent=a.locked&&a.opens?"Sent! 🎂 It will open on their birthday ("+a.opens+")":"Sent successfully! 🚀",t.target.reset(),c.hidden=!0,window.meisWish&&window.meisWish.clear(),p()):(o.className="msg",o.textContent="empty"===a.error?"Message cannot be empty.":"Error sending. Try again.")}catch(t){o.className="msg",o.textContent="Connection error."}n.disabled=!1});const d=e("#readform");d&&(d.onsubmit=async t=>{t.preventDefault();const n=e("#readbtn"),o=e("#readmsg");n.disabled=!0,o.textContent="Opening...";try{const n=new FormData(t.target),a=await at({a:"read",name:n.get("who"),code:n.get("code")});if(a.ok){o.textContent="",d.hidden=!0,e("#box").hidden=!1,e("#boxhead").textContent=`${n.get("who")}'s mailbox. Eyes only. 👀`;const t=e("#letters");t.replaceChildren(),0===a.messages.length?(a.wishes&&a.wishes.length||a.waiting?null:t.append(i("p",{class:"hand",text:"No messages yet. (Quiet in here!)"}))):a.messages.forEach(e=>{t.append(i("div",{class:"letter"},i("p",{class:"txt",text:e.text}),i("p",{class:"meta",text:`From: ${e.from||"Anonymous"} • ${e.when}`})))}),window.meisWall&&window.meisWall(a,n.get("who"))}else o.className="msg",o.textContent="locked"===a.error?"Too many tries. Wait 10 minutes.":"Wrong code or name!"}catch(t){o.className="msg",o.textContent="Connection error."}n.disabled=!1});const u=e("#lockbtn");u&&(u.onclick=()=>{l(),e("#box").hidden=!0;const t=e("#readform");t&&(t.hidden=!1,t.reset()),e("#readmsg").textContent=""});const h=e("#gotocodepage"),m=e("#changecodeback"),f=e("#changecodeform");h&&(h.onclick=()=>{l(),e("#readform").hidden=!0,e("#changecodeform").hidden=!1}),m&&(m.onclick=()=>{l(),e("#changecodeform").hidden=!0,e("#readform").hidden=!1}),f&&(f.onsubmit=async t=>{t.preventDefault();const n=e("#changecodebtn"),o=e("#changecodemsg");n.disabled=!0,o.textContent="Updating code...";try{const n=new FormData(t.target),a=await at({a:"changecode",name:n.get("name"),oldCode:n.get("oldCode"),newCode:n.get("newCode")});a.ok?(o.className="msg ok",o.textContent="Code changed successfully! 🔐",f.reset(),setTimeout(()=>{f.hidden=!0,e("#readform").hidden=!1,o.textContent=""},1500)):(o.className="msg",o.textContent="bad"===a.error?"Wrong old code or name!":"Error updating code.")}catch(t){o.className="msg",o.textContent="Connection error."}n.disabled=!1})}function ct(n){if("home"===n){h(e("#meis"),"MEIS'27")}"countdown"===n&&(B(),R()),"randoms"===n&&function(){if(X)return;X=!0;const n=e("#randomsGrid");if(!n)return;n.replaceChildren();const o=[];(t.randoms||[]).forEach(t=>{const e=Array.isArray(t)?t[0]:"string"==typeof t?t:"",n=Array.isArray(t)?t[1]:"";if(!e)return;const a=y(e,"photos");o.push({src:a,cap:n})}),0!==o.length?o.forEach((t,e)=>{const a=i("div",{class:"polaroid-card tilt",style:`--rot: ${(6*Math.random()-3).toFixed(1)}deg; cursor: pointer;`},i("div",{class:"push-pin"}),i("div",{class:"photo-inner"},i("img",{src:t.src,alt:t.cap||"Random shot",loading:"lazy"})),i("div",{class:"photo-label",text:t.cap||`DROP #${e+1}`}));a.onclick=()=>{l(),x(o,e)},n.append(a)}):n.append(i("p",{class:"hand",style:"color: #FFC83D; font-size: 26px; grid-column: 1/-1; text-align: center;",text:"⏳ Weekly drop incoming... check back soon!"}))}(),"people"===n&&function(){if(U)return;U=!0;const n=e("#pgrid");n.innerHTML='<p class="hand">Loading legends...</p>';const o=e("#psearch");if(o){const t=()=>{const t=o.value.trim().toLowerCase();n.querySelectorAll(".pcard").forEach(e=>{e.style.display=!t||(e.getAttribute("data-name")||"").includes(t)?"":"none"})};o.addEventListener("input",t),o.addEventListener("search",t)}fetch("data.json").then(t=>t.json()).then(e=>{t.people=e,n.innerHTML="",e.map(t=>({name:t.Name,photo:Y(t["Old or current you"]),baby:Y(t["Baby you"])})).forEach((t,e)=>{const o=i("div",{class:"ph"}),a=i("div",{class:"ph"});t.photo?(o.style.backgroundImage=`url('${t.photo}')`,o.style.backgroundSize="cover",o.style.backgroundPosition="center"):f(o,e,"photo soon"),t.baby?(a.style.backgroundImage=`url('${t.baby}')`,a.style.backgroundSize="cover",a.style.backgroundPosition="center"):f(a,e,"baby photo 🍼");const s=t.name?t.name.split(/\s+/)[0]:"",r=i("div",{class:"face front"},i("figure",{class:"polaroid"},o,i("figcaption",{text:t.name}))),c=i("div",{class:"face back"},i("figure",{class:"polaroid"},a,i("figcaption",{text:"Little "+s}))),d=i("button",{class:"pcard",type:"button","aria-pressed":"false","data-name":t.name?t.name.toLowerCase():""},i("div",{class:"inner"},r,c));d.addEventListener("click",()=>{l(),d.setAttribute("aria-pressed",String("true"!==d.getAttribute("aria-pressed")))}),n.append(d)})}).catch(()=>{n.innerHTML='<p class="hand">Failed to load legends.</p>'})}(),"trips"===n&&et(),"mail"===n&&it()}const lt=M()||"splash";function dt(t){return new Promise((e,n)=>{const o=new FileReader;o.readAsDataURL(t),o.onload=function(t){const o=new Image;o.src=t.target.result,o.onload=function(){const t=document.createElement("canvas");let n=o.width,a=o.height;n>a?n>800&&(a*=800/n,n=800):a>800&&(n*=800/a,a=800),t.width=n,t.height=a,t.getContext("2d").drawImage(o,0,0,n,a);const s=t.toDataURL("image/jpeg",.7);e(s)},o.onerror=t=>n(t)},o.onerror=t=>n(t)})}history.replaceState({id:lt,d:0},"","splash"===lt?location.pathname:"#"+lt),"splash"!==lt&&(e("#splash").classList.remove("on"),e("#"+lt).classList.add("on"),A=lt,ct(lt)),window.addEventListener("DOMContentLoaded",()=>{const t=document.getElementById("welcomeOverlay"),e=document.getElementById("theaterCard"),n=document.getElementById("typewriterText"),o=document.getElementById("closeWelcomeBtn"),a=document.getElementById("vaultStatus"),s=document.getElementById("vaultSvg"),r="Before we go our separate ways, I built this space for us — a place to capture every memory, laugh, and milestone from our previous years. Enjoy the ride!";if(s){let t='<defs><linearGradient id="vst" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#6c7fe0"/><stop offset="1" stop-color="#1a2257"/></linearGradient><radialGradient id="vpl" cx=".4" cy=".35" r=".8"><stop offset="0" stop-color="#2a3678"/><stop offset="1" stop-color="#0b1034"/></radialGradient></defs><circle cx="200" cy="200" r="196" fill="none" stroke="url(#vst)" stroke-width="7"/><circle class="v-glow" cx="200" cy="200" r="204"/>';for(let e=0;e<12;e++)t+='<g transform="rotate('+30*e+' 200 200)"><rect class="v-bolt" x="189" y="-8" width="22" height="40" rx="6" fill="url(#vst)" stroke="#8fa2ff" stroke-opacity=".5"/></g>';t+='<circle cx="200" cy="200" r="170" fill="url(#vpl)" stroke="#3a4a9a" stroke-width="4"/><circle cx="200" cy="200" r="150" fill="none" stroke="#26317a" stroke-width="2"/>';for(let e=0;e<60;e++)t+='<line x1="200" y1="56" x2="200" y2="'+(e%5?62:70)+'" stroke="#6f84ff" stroke-opacity=".55" transform="rotate('+6*e+' 200 200)"/>';t+='<g class="v-wheel"><circle cx="200" cy="200" r="62" fill="none" stroke="url(#vst)" stroke-width="9"/>';for(let e=0;e<6;e++)t+='<g transform="rotate('+60*e+' 200 200)"><line x1="200" y1="200" x2="200" y2="104" stroke="url(#vst)" stroke-width="9" stroke-linecap="round"/><circle cx="200" cy="100" r="12" fill="url(#vst)" stroke="#a9b8ff" stroke-opacity=".6"/></g>';t+='<circle cx="200" cy="200" r="26" fill="url(#vst)" stroke="#a9b8ff" stroke-opacity=".6" stroke-width="2"/><circle cx="200" cy="200" r="9" fill="#0b1034"/></g>',s.innerHTML=t}let i=0;n?setTimeout(function t(){n&&i<154?(n.innerHTML+=r.charAt(i),i++,setTimeout(t,12)):o&&(o.style.opacity="1",o.style.pointerEvents="auto")},500):o&&(o.style.opacity="1",o.style.pointerEvents="auto"),o&&(o.onclick=()=>{!t||t.classList.contains("unlock")||(e&&e.classList.add("fade-out"),t.classList.add("unlock"),a&&(a.textContent="● UNLOCKING…"),setTimeout(()=>{t.classList.add("opened"),document.body.classList.add("vault-opening"),a&&(a.textContent="● OPEN")},2e3),setTimeout(()=>{t.classList.add("gone"),document.body.classList.remove("vault-opening")},4e3))})}),window.uploadDirectImage=async function(e){const n=document.getElementById("uploadStatusMsg");if(!e.files||0===e.files.length)return;const o=Array.from(e.files);n.textContent=`Compressing & Uploading 0/${o.length}... ⏳`,n.style.color="#fff";let a=0,s="";for(let e=0;e<o.length;e++){const r=o[e];n.textContent=`Processing image ${e+1} of ${o.length}... ⏳`;try{const e=await dt(r),n=(t.mailApi||"").trim(),o=await(await fetch(n,{method:"POST",body:JSON.stringify({a:"upload_direct_photo",photo:e})})).json();o&&o.ok?a++:s=o&&(o.detail||o.error)||"no reply"}catch(t){console.error("Error uploading image:",t),s="network: "+t}}a>0?(n.textContent=`${a} photo(s) uploaded successfully! Waiting for admin approval ✨`,n.style.color="#76ff03",e.value=""):(n.textContent="Upload failed: "+s,n.style.color="#ff5252")}})();

;(()=>{"use strict";
/* Trips: tiny "add photos" button -> pick a trip -> pick photos -> sent to admin for approval */
const S=window.SITE||{};
const q=(s,r=document)=>r.querySelector(s);
const MAX_FILES=12;
let ov=null,urls=[],busy=false;

function el(tag,css,text){const n=document.createElement(tag);if(css)n.style.cssText=css;if(text!=null)n.textContent=text;return n}

function tripNames(txt){
  const out=[],seen=new Set();
  String(txt||"").replace(/^\uFEFF/,"").split(/\r?\n/).forEach(raw=>{
    const line=raw.trim();
    if(!line||line.startsWith("#")||line.startsWith("//"))return;
    const n=(line.split("|")[0]||"").trim();
    if(n&&!seen.has(n.toLowerCase())){seen.add(n.toLowerCase());out.push(n)}
  });
  return out;
}

async function loadTrips(){
  try{
    const r=await fetch("trips/trips.txt",{cache:"no-cache"});
    if(r.ok){const l=tripNames(await r.text());if(l.length)return l}
  }catch(e){}
  return (S.trips||[]).map(t=>String(t&&t.name||"").trim()).filter(Boolean);
}

function compress(file,max=1600){
  return new Promise((res,rej)=>{
    const url=URL.createObjectURL(file),img=new Image();
    img.onload=()=>{
      try{
        let w=img.naturalWidth,h=img.naturalHeight;
        const k=Math.min(1,max/Math.max(w,h));
        w=Math.round(w*k);h=Math.round(h*k);
        const c=document.createElement("canvas");c.width=w;c.height=h;
        c.getContext("2d").drawImage(img,0,0,w,h);
        let qlt=.82,d=c.toDataURL("image/jpeg",qlt);
        while(d.length>1.9e6&&qlt>.4){qlt-=.12;d=c.toDataURL("image/jpeg",qlt)}
        URL.revokeObjectURL(url);res(d);
      }catch(e){URL.revokeObjectURL(url);rej(e)}
    };
    img.onerror=e=>{URL.revokeObjectURL(url);rej(new Error("cannot read this image"))};
    img.src=url;
  });
}

async function post(api,trip,file){
  const photo=await compress(file);
  const r=await fetch(api,{method:"POST",body:JSON.stringify({a:"upload_trip_photo",trip,photo})});
  const j=await r.json();
  if(!j||!j.ok)throw new Error(j&&(j.detail||j.error)||"no reply");
}

function onKey(e){if(e.key==="Escape"&&ov){e.stopPropagation();closeDialog()}}
function closeDialog(){
  urls.forEach(u=>URL.revokeObjectURL(u));urls=[];
  if(ov){ov.remove();ov=null}
  document.removeEventListener("keydown",onKey,true);
}

function openDialog(){
  if(ov)return;
  const api=String(S.mailApi||"").trim();
  let files=[];
  ov=el("div","position:fixed;inset:0;z-index:99998;display:flex;align-items:center;justify-content:center;padding:16px;background:rgba(5,8,24,.72)");
  ov.setAttribute("role","dialog");ov.setAttribute("aria-modal","true");ov.setAttribute("aria-label","Add photos to a trip");
  const box=el("div","position:relative;width:min(420px,100%);max-height:90vh;overflow:auto;box-sizing:border-box;padding:18px;border-radius:14px;background:#12183a;color:#fff;border:1px solid rgba(255,255,255,.22);font:14px/1.5 system-ui,-apple-system,Segoe UI,sans-serif;box-shadow:0 20px 60px rgba(0,0,0,.5)");
  const x=el("button","position:absolute;top:8px;right:10px;background:none;border:0;color:#fff;font-size:20px;cursor:pointer;opacity:.7","✕");
  x.type="button";x.setAttribute("aria-label","Close");x.onclick=closeDialog;
  const title=el("div","font-weight:800;font-size:16px;margin:0 28px 4px 0","Add photos to a trip");
  const hint=el("div","opacity:.7;font-size:12px;margin-bottom:12px","Pick the trip, choose your photos and send them. They appear after admin approval.");
  const sel=el("select","width:100%;box-sizing:border-box;padding:9px 10px;border-radius:8px;border:1px solid rgba(255,255,255,.25);background:#0b1030;color:#fff;font:inherit");
  sel.setAttribute("aria-label","Trip");
  const o0=el("option",null,"Loading trips…");o0.value="";sel.append(o0);
  const pick=el("label","display:block;margin-top:10px;text-align:center;padding:9px;border-radius:8px;border:1px dashed rgba(255,255,255,.35);cursor:pointer;opacity:.5;pointer-events:none","📷 Choose photos");
  const file=el("input");file.type="file";file.accept="image/*";file.multiple=true;file.style.display="none";pick.append(file);
  const thumbs=el("div","display:flex;flex-wrap:wrap;gap:6px;margin-top:10px");
  const send=el("button","display:none;width:100%;margin-top:12px;padding:10px;border:0;border-radius:8px;background:#FFC83D;color:#0A1F4A;font:inherit;font-weight:800;cursor:pointer","Send for review");
  send.type="button";
  const msg=el("div","margin-top:10px;font-size:12px;min-height:16px");msg.setAttribute("role","status");
  box.append(x,title,hint,sel,pick,thumbs,send,msg);ov.append(box);

  function renderThumbs(){
    urls.forEach(u=>URL.revokeObjectURL(u));urls=[];thumbs.replaceChildren();
    files.forEach(f=>{
      const u=URL.createObjectURL(f);urls.push(u);
      const im=el("img","width:52px;height:52px;object-fit:cover;border-radius:6px");im.src=u;im.alt="";thumbs.append(im);
    });
    send.style.display=files.length?"block":"none";
  }
  sel.onchange=()=>{const on=!!sel.value;pick.style.opacity=on?"1":".5";pick.style.pointerEvents=on?"auto":"none"};
  file.onchange=()=>{
    const all=Array.from(file.files||[]).filter(f=>/^image\//.test(f.type)||/\.(jpe?g|png|webp|heic|heif)$/i.test(f.name));
    files=all.slice(0,MAX_FILES);renderThumbs();
    msg.style.color="#fff";
    msg.textContent=files.length?`${files.length} photo(s) ready`+(all.length>MAX_FILES?` (first ${MAX_FILES} only)`:""):"";
  };
  send.onclick=async()=>{
    if(busy||!sel.value||!files.length)return;
    if(!api){msg.style.color="#ff5252";msg.textContent="Uploads aren't connected yet.";return}
    busy=true;send.disabled=true;sel.disabled=true;
    let ok=0,err="";
    for(let i=0;i<files.length;i++){
      msg.style.color="#fff";msg.textContent=`Uploading ${i+1} of ${files.length}… ⏳`;
      try{await post(api,sel.value,files[i]);ok++}catch(e){err=String(e&&e.message||e)}
    }
    busy=false;send.disabled=false;sel.disabled=false;
    if(ok){
      msg.style.color="#76ff03";
      msg.textContent=`${ok} photo(s) sent! Waiting for admin approval ✨`+(ok<files.length?` (${files.length-ok} failed)`:"");
      files=[];file.value="";renderThumbs();
    }else{msg.style.color="#ff5252";msg.textContent="Upload failed: "+err}
  };
  ov.addEventListener("click",e=>{if(e.target===ov)closeDialog()});
  document.addEventListener("keydown",onKey,true);
  document.body.append(ov);
  loadTrips().then(list=>{
    o0.textContent=list.length?"Choose a trip…":"No trips yet";
    list.forEach(n=>{const o=el("option",null,n);o.value=n;sel.append(o)});
  });
}

function mount(){
  const list=q("#tripl");
  if(!list||q("#tripAddBtn"))return;
  const wrap=el("div","text-align:center;margin:4px 0 8px");
  const b=el("button","font:inherit;font-size:12px;padding:3px 11px;border-radius:999px;background:transparent;color:inherit;border:1px solid currentColor;opacity:.6;cursor:pointer","＋ add photos");
  b.id="tripAddBtn";b.type="button";b.title="Add your photos to a trip";
  b.onmouseenter=b.onfocus=()=>{b.style.opacity="1"};
  b.onmouseleave=b.onblur=()=>{b.style.opacity=".6"};
  b.onclick=openDialog;
  wrap.append(b);list.parentNode.insertBefore(wrap,list);
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",mount);else mount();
})();

;(()=>{"use strict";
/* Birthday wall: every wish that has an "opens on" date lands on one wall of sticky notes */
const reduce=matchMedia("(prefers-reduced-motion: reduce)").matches;
const COLORS=["#fff176","#ffb3c7","#a5d8ff","#b8f2c0","#ffd6a5","#e1c7ff"];
const CONF=["🎂","🎉","✨","🎈","💛","💙","🥳"];
let ov=null,back=null;

function el(tag,cls,text){const n=document.createElement(tag);if(cls)n.className=cls;if(text!=null)n.textContent=text;return n}
function hs(v){let h=0;for(const c of String(v))h=(h*31+c.charCodeAt(0))|0;return Math.abs(h)}
const plural=(n,w)=>n+" "+w+(n===1?"":"es");

function css(){
  if(document.getElementById("wallCss"))return;
  const s=document.createElement("style");s.id="wallCss";
  s.textContent=`
#wallEntry{display:block;width:100%;box-sizing:border-box;margin:0 0 14px;padding:12px 14px;text-align:center;cursor:pointer;color:inherit;font:inherit;border:2px dashed currentColor;border-radius:12px;background:rgba(255,200,61,.22)}
#wallEntry b{display:block;font:700 28px/1.1 "Caveat","Segoe Print",cursive}
#wallEntry small{display:block;margin-top:2px;font-size:13px;opacity:.8}
#wallEntry.locked{opacity:.75;background:rgba(120,120,120,.12)}
#wallEntry.shake{animation:wallShake .45s}
#wallOv{position:fixed;inset:0;z-index:99997;background-color:#4a2e18;background-image:radial-gradient(rgba(255,255,255,.07) 1.4px,transparent 1.6px),radial-gradient(rgba(0,0,0,.2) 1.4px,transparent 1.6px),linear-gradient(160deg,#6b4423,#34200f);background-size:22px 22px,31px 31px,100% 100%;background-position:0 0,11px 13px,0 0;animation:wallIn .35s ease both}
#wallOv .wsc{position:absolute;inset:0;overflow:auto;-webkit-overflow-scrolling:touch;padding:max(18px,env(safe-area-inset-top)) 16px max(32px,env(safe-area-inset-bottom))}
#wallOv .wx{position:fixed;top:max(10px,env(safe-area-inset-top));right:12px;z-index:3;width:38px;height:38px;border-radius:50%;border:1px solid rgba(255,255,255,.35);background:rgba(0,0,0,.35);color:#fff;font-size:18px;cursor:pointer}
#wallOv .wt{margin:34px 0 2px;text-align:center;color:#fff3c4;font:700 clamp(36px,9vw,58px)/1.05 "Caveat","Segoe Print",cursive;text-shadow:0 3px 0 rgba(0,0,0,.35)}
#wallOv .ws{margin:0 0 26px;text-align:center;color:#f3dcb4;font:600 24px/1.2 "Caveat","Segoe Print",cursive}
#wallOv .wg{max-width:980px;margin:0 auto;display:grid;grid-template-columns:repeat(auto-fill,minmax(190px,1fr));gap:30px 24px;padding:8px 4px 20px}
#wallOv .wy{grid-column:1/-1;text-align:center;color:#ffd98a;font:700 32px "Caveat","Segoe Print",cursive}
#wallOv .wn{position:relative;box-sizing:border-box;display:flex;flex-direction:column;justify-content:space-between;min-height:150px;padding:24px 16px 12px;color:#26231d;background:var(--c);box-shadow:0 8px 18px rgba(0,0,0,.4),inset 0 -22px 30px rgba(0,0,0,.05);transform:rotate(var(--r));animation:wallDrop .6s cubic-bezier(.2,.9,.3,1.2) both;animation-delay:var(--d);font:600 24px/1.12 "Caveat","Segoe Print","Bradley Hand",cursive;overflow-wrap:anywhere;white-space:pre-wrap}
#wallOv .wp{position:absolute;top:-8px;left:50%;width:16px;height:16px;margin-left:-8px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#ff9a9a,#d11 60%,#800);box-shadow:0 3px 4px rgba(0,0,0,.45)}
#wallOv .wf{margin-top:10px;text-align:right;font-size:22px;opacity:.75}
#wallOv .wl{max-width:520px;margin:6px auto 0;padding:10px 14px;text-align:center;color:#f3dcb4;font:600 22px "Caveat","Segoe Print",cursive;border:2px dashed rgba(243,220,180,.5);border-radius:12px}
#wallOv .wfx{position:fixed;inset:0;overflow:hidden;pointer-events:none;z-index:2}
#wallOv .wc{position:absolute;top:-40px;animation:wallFall linear forwards}
@keyframes wallIn{from{opacity:0}to{opacity:1}}
@keyframes wallDrop{from{opacity:0;transform:translateY(-46px) rotate(calc(var(--r)*3)) scale(.92)}to{opacity:1;transform:rotate(var(--r))}}
@keyframes wallFall{to{transform:translateY(112vh) rotate(540deg)}}
@keyframes wallShake{0%,100%{transform:none}20%{transform:translateX(-6px)}40%{transform:translateX(6px)}60%{transform:translateX(-4px)}80%{transform:translateX(4px)}}
@media (prefers-reduced-motion:reduce){#wallOv,#wallOv .wn,#wallEntry.shake{animation:none}}`;
  document.head.append(s);
}

function onKey(e){if(e.key==="Escape"&&ov){e.stopPropagation();closeWall()}}
function closeWall(){
  if(ov){ov.remove();ov=null}
  document.removeEventListener("keydown",onKey,true);
  if(back&&document.contains(back))back.focus();
  back=null;
}

function confetti(layer){
  if(reduce)return;
  for(let i=0;i<36;i++){
    const s=el("span","wc",CONF[i%CONF.length]);
    s.style.cssText=`left:${(Math.random()*100).toFixed(1)}%;font-size:${(18+Math.random()*20).toFixed(0)}px;animation-duration:${(2.6+Math.random()*2.4).toFixed(2)}s;animation-delay:${(Math.random()*.9).toFixed(2)}s`;
    layer.append(s);
  }
  setTimeout(()=>layer.replaceChildren(),6000);
}

function openWall(a,who,from){
  if(ov)return;
  css();back=from||null;
  const list=(a.wishes||[]).map((w,i)=>({w,i})).sort((x,y)=>String(y.w.year||"").localeCompare(String(x.w.year||""))||x.i-y.i).map(x=>x.w);
  const first=String(who||"").trim().split(/\s+/)[0]||"you";
  const years=[...new Set(list.map(w=>w.year||""))];
  ov=el("div");ov.id="wallOv";ov.setAttribute("role","dialog");ov.setAttribute("aria-modal","true");ov.setAttribute("aria-label","Birthday wall");
  const x=el("button","wx","✕");x.type="button";x.setAttribute("aria-label","Close");x.onclick=closeWall;
  const sc=el("div","wsc");
  sc.append(el("h2","wt","Happy Birthday, "+first+"! 🎂"),el("p","ws",plural(list.length,"wish")+" written just for you"));
  const grid=el("div","wg");
  let idx=0,lastYear=null;
  list.forEach(w=>{
    if(years.length>1&&w.year!==lastYear){lastYear=w.year;if(w.year)grid.append(el("div","wy",w.year))}
    const h=hs(w.id||w.text),n=el("div","wn");
    n.style.setProperty("--c",COLORS[h%COLORS.length]);
    n.style.setProperty("--r",((h%90)/10-4.5).toFixed(1)+"deg");
    n.style.setProperty("--d",(250+Math.min(idx++,20)*70)+"ms");
    n.append(el("span","wp"),el("div",null,String(w.text||"")),el("div","wf","— "+(String(w.from||"").trim()||"Anonymous")));
    grid.append(n);
  });
  sc.append(grid);
  const waiting=Number(a.waiting)||0;
  if(waiting)sc.append(el("div","wl","🔒 +"+plural(waiting,"wish")+" more, opening on "+(a.opens||"your next birthday")));
  const fx=el("div","wfx");
  ov.append(sc,fx,x);
  ov.addEventListener("click",e=>{if(e.target===ov)closeWall()});
  document.addEventListener("keydown",onKey,true);
  document.body.append(ov);
  x.focus({preventScroll:true});
  confetti(fx);
}

window.meisWall=function(a,who){
  css();
  const head=document.getElementById("boxhead");
  if(!head||!a)return;
  const old=document.getElementById("wallEntry");if(old)old.remove();
  const open=(a.wishes||[]).length,waiting=Number(a.waiting)||0;
  if(!open&&!waiting)return;
  const card=el("button");card.id="wallEntry";card.type="button";
  const title=el("b"),sub=el("small");
  card.append(title,sub);
  let subText;
  if(open){
    title.textContent="🎂 My birthday wall";
    subText=plural(open,"wish")+" from people who love you · tap to open"+(waiting?" (+"+waiting+" locked)":"");
    card.onclick=()=>openWall(a,who,card);
  }else{
    card.classList.add("locked");
    title.textContent="🔒 Birthday wall";
    subText=plural(waiting,"wish")+" waiting for "+(a.opens||"your birthday");
    card.onclick=()=>{
      card.classList.remove("shake");void card.offsetWidth;card.classList.add("shake");
      sub.textContent="Not yet! It opens on "+(a.opens||"your birthday")+" 🎂";
      clearTimeout(card._t);card._t=setTimeout(()=>{sub.textContent=subText},2200);
    };
  }
  sub.textContent=subText;
  head.after(card);
};
})();
