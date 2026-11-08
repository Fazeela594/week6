(() => {
"use strict";
const $ = (s, e = document) => e.querySelector(s), $$ = (s, e = document) => [...e.querySelectorAll(s)];
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const KEY = "hunar_week5";
const day = n => { const d = new Date(); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10); };
const money = n => "$" + Number(n).toLocaleString("en-US");
const fmt = d => new Date(d + "T00:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
const left = d => Math.round((new Date(d + "T00:00:00") - new Date(new Date().toDateString())) / 864e5);
const ago = t => { const m = Math.round((Date.now() - t) / 6e4); return m < 1 ? "just now" : m < 60 ? m + " min ago" : m < 1440 ? Math.round(m / 60) + " h ago" : Math.round(m / 1440) + " days ago"; };
const ST = { pending: ["Pending", "#8A5A00", "#FFF3D6"], progress: ["In Progress", "#164F4D", "#DDEFEA"], submitted: ["Submitted", "#2F5D9E", "#E3ECF8"], completed: ["Completed", "#1F6F4A", "#DDF3E6"], cancelled: ["Cancelled", "#B3261E", "#FBE4E1"] };
const MS = { todo: "To do", submitted: "In review", approved: "Approved" };
const badge = s => `<span class="badge" style="color:${ST[s][1]};background:${ST[s][2]}">${ST[s][0]}</span>`;
const av = n => `<span class="av">${esc(n.split(" ").map(w => w[0]).slice(0, 2).join(""))}</span>`;
const released = o => o.ms.filter(m => m.status === "approved").reduce((a, m) => a + m.amount, 0);
const prog = o => o.status === "completed" ? 100 : Math.round(released(o) / (o.ms.reduce((a, m) => a + m.amount, 0) || 1) * 100);
const isActive = o => ["pending", "progress", "submitted"].includes(o.status);

/* ---------- data (saved in localStorage) ---------- */
function seed() {
  const M = (t, a, d, s) => ({ id: Math.random().toString(36).slice(2, 8), title: t, amount: a, due: day(d), status: s || "todo" });
  const H = h => Date.now() - h * 36e5;
  return { role: "client", n: 10, orders: [
    { id: "o1", title: "Responsive portfolio website", client: "Sara Ahmed", freelancer: "Ayesha Khan", budget: 600, deadline: day(10), created: day(-12), status: "progress", revision: "", delivery: null,
      ms: [M("Design mockups", 150, -5, "approved"), M("Frontend build", 300, 3, "submitted"), M("Testing and launch", 100, 9)],
      log: [{ at: H(300), text: "Proposal accepted and order created" }, { at: H(280), text: "Freelancer started the project" }, { at: H(120), text: 'Client approved "Design mockups" and released $150' }, { at: H(5), text: 'Freelancer submitted "Frontend build" for review' }] },
    { id: "o2", title: "Logo and brand kit", client: "Omar Khan", freelancer: "Bilal Ahmed", budget: 120, deadline: day(7), created: day(-1), status: "pending", revision: "", delivery: null,
      ms: [M("Logo concepts", 50, 3), M("Final files", 50, 6)], log: [{ at: H(20), text: "Proposal accepted and order created" }] },
    { id: "o3", title: "Flutter app UI screens", client: "Hina Tariq", freelancer: "Sana Malik", budget: 450, deadline: day(3), created: day(-9), status: "submitted", revision: "",
      delivery: { note: "All 12 screens are finished and exported. Source files are in the shared folder.", link: "https://example.com/delivery", at: H(3) },
      ms: [M("Wireframes", 150, -6, "approved"), M("UI screens", 200, -1, "approved"), M("Handover files", 100, 2, "submitted")],
      log: [{ at: H(220), text: "Proposal accepted and order created" }, { at: H(200), text: "Freelancer started the project" }, { at: H(3), text: "Freelancer submitted the final delivery" }] },
    { id: "o4", title: "SEO audit report", client: "Daniel Paul", freelancer: "Hira Noor", budget: 200, deadline: day(-4), created: day(-20), status: "completed", revision: "",
      delivery: { note: "Full audit report with a prioritised fix list.", link: "", at: H(120) },
      ms: [M("Site crawl", 80, -12, "approved"), M("Report", 120, -5, "approved")], log: [{ at: H(480), text: "Proposal accepted and order created" }, { at: H(100), text: "Client approved the delivery. Project completed" }] },
    { id: "o5", title: "Social media ad setup", client: "Maryam Khan", freelancer: "Daniyal Shah", budget: 150, deadline: day(-2), created: day(-10), status: "cancelled", revision: "", delivery: null,
      ms: [M("Campaign plan", 150, -3)], log: [{ at: H(240), text: "Proposal accepted and order created" }, { at: H(150), text: "Project cancelled" }] }
  ], proposals: [
    { id: "p1", job: "Sales dashboard in Power BI", freelancer: "Usman Tariq", price: 300, days: 7, cover: "I have built 20+ dashboards from Excel and SQL data. I can deliver a clean, interactive dashboard with a short walkthrough." },
    { id: "p2", job: "Landing page copywriting", freelancer: "Hira Noor", price: 90, days: 4, cover: "I write clear, SEO-friendly copy for small businesses. You get two revisions and a keyword list." },
    { id: "p3", job: "Android notes app", freelancer: "Hamza Ali", price: 350, days: 14, cover: "I will build the app in Java with local storage, search and a clean material design interface." }
  ] };
}
function load() { try { const v = JSON.parse(localStorage.getItem(KEY)); if (v && v.orders) return v; } catch {} return seed(); }
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch {} };
let S = load(), tab = "active";
const app = h => { $("#app").innerHTML = h; };
const log = (o, text) => o.log.push({ at: Date.now(), text });
const toast = m => { const t = $("#toast"); t.textContent = m; t.classList.add("show"); clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove("show"), 2200); };
const done = m => { save(); render(); toast(m); };
function ask(title, text, label, fn) {
  $("#cmh").textContent = title; $("#cmt").textContent = text; $("#cmYes").textContent = label;
  $("#cm").hidden = false; $("#cmNo").focus(); ask.fn = fn;
}
function bad(id, m) { const el = $("#" + id); el.classList.toggle("bad", !!m); $("#e-" + id).textContent = m || ""; return !m; }

/* ---------- page: My Orders ---------- */
function card(o) {
  const c = S.role === "client", p = prog(o), d = left(o.deadline);
  const due = o.status === "completed" ? "Completed" : o.status === "cancelled" ? "Cancelled" : d < 0 ? `<span class="late">${-d} day${d < -1 ? "s" : ""} overdue</span>` : d === 0 ? "Due today" : `${d} day${d > 1 ? "s" : ""} left`;
  return `<article class="oc"><div class="oh"><h3><a href="#/order/${o.id}">${esc(o.title)}</a></h3>${badge(o.status)}</div>
    <p class="mute">${c ? "Freelancer" : "Client"}: <b>${esc(c ? o.freelancer : o.client)}</b></p>
    <div><div class="bar" role="progressbar" aria-valuenow="${p}" aria-valuemin="0" aria-valuemax="100"><i style="width:${p}%"></i></div>
    <div class="bm"><span>${p}% complete</span><span>${money(released(o))} of ${money(o.budget)} released</span></div></div>
    <div class="of"><span>${due} · Deadline ${fmt(o.deadline)}</span><a class="btn solid" href="#/order/${o.id}">View project</a></div></article>`;
}
function viewOrders() {
  const c = S.role === "client", A = S.orders.filter(isActive), C = S.orders.filter(o => o.status === "completed"), X = S.orders.filter(o => o.status === "cancelled");
  const list = { active: A, completed: C, cancelled: X, all: S.orders }[tab];
  app(`<div class="ph"><h1>My Orders</h1><p class="mute">${c ? "Projects you hired freelancers for" : "Projects you are working on"}</p></div>
  <div class="stats"><div><b>${A.length}</b><span>Active projects</span></div><div><b>${C.length}</b><span>Completed</span></div>
  <div><b>${money(A.reduce((a, o) => a + o.budget, 0))}</b><span>Value in progress</span></div><div><b>${money(S.orders.reduce((a, o) => a + released(o), 0))}</b><span>Released so far</span></div></div>
  <div class="tabs">${[["active", "Active", A.length], ["completed", "Completed", C.length], ["cancelled", "Cancelled", X.length], ["all", "All", S.orders.length]].map(([k, l, n]) => `<button class="tab${tab === k ? " on" : ""}" data-tab="${k}">${l} <small>${n}</small></button>`).join("")}</div>
  ${list.length ? `<div class="ogrid">${list.map(card).join("")}</div>` : `<div class="empty"><p>No ${tab === "all" ? "" : tab + " "}projects here yet.</p><a class="btn solid" href="#/proposals">View proposals</a></div>`}`);
}

/* ---------- page: Order / Project details ---------- */
function viewOrder(id) {
  const o = S.orders.find(x => x.id === id);
  if (!o) return app('<div class="empty"><p>This project could not be found.</p><a class="btn solid" href="#/orders">Back to My Orders</a></div>');
  const c = S.role === "client", f = !c, open = o.status === "pending" || o.status === "progress";
  const p = prog(o), d = left(o.deadline), total = o.ms.reduce((a, m) => a + m.amount, 0), idx = ["pending", "progress", "submitted", "completed"].indexOf(o.status);
  const allDone = o.ms.length > 0 && o.ms.every(m => m.status !== "todo");

  const mrow = m => {
    const late = m.status !== "approved" && left(m.due) < 0 && (open || o.status === "submitted");
    let a = "";
    if (f && m.status === "todo" && o.status === "progress") a = `<button class="btn ghost" data-a="msub" data-m="${m.id}">Submit for review</button>`;
    if (c && m.status === "submitted" && o.status !== "cancelled" && o.status !== "completed") a = `<button class="btn solid" data-a="mok" data-m="${m.id}">Approve and release ${money(m.amount)}</button><button class="btn ghost" data-a="mbk" data-m="${m.id}">Request changes</button>`;
    if (c && m.status === "todo" && open) a = `<button class="btn ghost del" data-a="mdel" data-m="${m.id}">Remove</button>`;
    return `<li class="ms ${m.status}"><span class="dot"></span><div><b>${esc(m.title)}</b><small>${money(m.amount)} · Due ${fmt(m.due)}${late ? ' · <span class="late">Overdue</span>' : ""}</small></div><span class="chip2">${MS[m.status]}</span><div class="ma">${a}</div></li>`;
  };
  let del = "";
  if (o.delivery) del += `<div class="dl"><b>Latest delivery</b><p>${esc(o.delivery.note)}</p>${o.delivery.link ? `<a href="${esc(o.delivery.link)}" target="_blank" rel="noopener">${esc(o.delivery.link)}</a>` : ""}<small>Submitted ${ago(o.delivery.at)}</small></div>`;
  if (o.revision && o.status === "progress") del += `<div class="warn"><b>Revision requested:</b> ${esc(o.revision)}</div>`;
  if (f && o.status === "progress") del += allDone
    ? `<form id="df" novalidate><div class="fld"><label for="dn">Delivery message</label><textarea id="dn" rows="3" placeholder="Describe what you are delivering"></textarea><small class="err" id="e-dn"></small></div>
       <div class="fld"><label for="dlk">Link to files (optional)</label><input id="dlk" placeholder="https://drive.google.com/..."><small class="err" id="e-dlk"></small></div><button class="btn solid">Submit delivery</button></form>`
    : '<p class="warn">Submit all milestones for review before sending the final delivery.</p>';
  if (c && o.status === "submitted") del += `<div class="row"><button class="btn solid" data-a="complete">Approve and complete</button></div>
    <form id="rf" novalidate style="margin-top:1rem"><div class="fld"><label for="rn">Need changes? Tell the freelancer</label><textarea id="rn" rows="2"></textarea><small class="err" id="e-rn"></small></div><button class="btn ghost">Request revision</button></form>`;
  if (!o.delivery && !(f && o.status === "progress")) del += '<p class="mute">No delivery has been submitted yet.</p>';

  const rem = o.budget - total;
  const addMs = c && open ? `<form id="mf" novalidate style="margin-top:1rem;border-top:1px solid var(--line);padding-top:1rem"><h3 style="font-size:1rem">Add a milestone</h3>
    <div class="frow"><div class="fld"><label for="mt">Title</label><input id="mt" maxlength="60"><small class="err" id="e-mt"></small></div>
    <div class="fld"><label for="ma">Amount ($)</label><input id="ma" type="number" min="1" step="1"><small class="err" id="e-ma"></small></div>
    <div class="fld"><label for="md">Due date</label><input id="md" type="date" min="${day(0)}"><small class="err" id="e-md"></small></div></div>
    <button class="btn ghost">Add milestone</button> <small class="mute">${money(Math.max(rem, 0))} of the budget is unassigned</small></form>` : "";
  const acts = [];
  if (f && o.status === "pending") acts.push('<button class="btn solid" data-a="start">Start project</button>');
  if (open) acts.push('<button class="btn ghost del" data-a="cancel">Cancel project</button>');

  app(`<a class="back" href="#/orders">← Back to My Orders</a>
  <div class="dh"><h1>${esc(o.title)}</h1>${badge(o.status)}</div>
  <span class="viewing">You are viewing as the ${c ? "client" : "freelancer"}</span>
  <div class="dgrid"><div>
    <section class="pn"><h3>Project progress</h3><div class="big">${p}%</div>
      <div class="bar" role="progressbar" aria-valuenow="${p}" aria-valuemin="0" aria-valuemax="100"><i style="width:${p}%"></i></div>
      <div class="bm"><span>${o.ms.filter(m => m.status === "approved").length} of ${o.ms.length} milestones approved</span><span>${money(released(o))} released</span></div>
      <ol class="steps">${["pending", "progress", "submitted", "completed"].map((s, i) => `<li class="${o.status === "cancelled" ? "" : i < idx ? "done" : i === idx ? "now" : ""}">${ST[s][0]}</li>`).join("")}</ol>
      ${o.status === "cancelled" ? '<p class="warn">This project was cancelled.</p>' : o.status === "pending" && c ? '<p class="warn">Waiting for the freelancer to start the project.</p>' : ""}</section>
    <section class="pn"><h3>Milestones</h3>${o.ms.length ? `<ul class="ml">${o.ms.map(mrow).join("")}</ul>` : '<p class="mute">No milestones yet.</p>'}${addMs}</section>
    <section class="pn"><h3>Delivery</h3>${del}</section>
    <section class="pn"><h3>Activity</h3><ul class="tl">${[...o.log].sort((a, b) => b.at - a.at).map(l => `<li>${esc(l.text)}<small>${ago(l.at)}</small></li>`).join("")}</ul></section>
  </div><aside class="side">
    <section class="pn"><h3>Project details</h3><dl><dt>Budget</dt><dd>${money(o.budget)}</dd><dt>Released</dt><dd>${money(released(o))}</dd><dt>Deadline</dt><dd>${fmt(o.deadline)}</dd>
      <dt>Time</dt><dd>${o.status === "completed" || o.status === "cancelled" ? "Closed" : d < 0 ? `<span class="late">${-d} days overdue</span>` : d + " days left"}</dd><dt>Started</dt><dd>${fmt(o.created)}</dd></dl></section>
    <section class="pn"><h3>People</h3><div class="ppl">${av(o.client)}<div><b>${esc(o.client)}</b><small>Client${c ? " (you)" : ""}</small></div></div>
      <div class="ppl">${av(o.freelancer)}<div><b>${esc(o.freelancer)}</b><small>Freelancer${f ? " (you)" : ""}</small></div></div></section>
    ${acts.length ? `<div class="acts">${acts.join("")}</div>` : ""}
  </aside></div>`);
}

/* ---------- page: Proposals (proposal -> accepted -> order) ---------- */
function viewProposals() {
  const c = S.role === "client";
  app(`<div class="ph"><h1>Proposals</h1><p class="mute">Accepting a proposal creates an order and starts the project workflow.</p></div>
  ${c ? "" : '<p class="warn">You are in Freelancer view. Switch to Client view to accept or decline proposals.</p>'}
  ${S.proposals.length ? S.proposals.map(p => `<article class="pc"><div class="oh"><h3>${esc(p.job)}</h3><b>${money(p.price)}</b></div>
    <p class="mute">From <b>${esc(p.freelancer)}</b></p><p>${esc(p.cover)}</p><div class="meta"><span>Delivery in ${p.days} days</span></div>
    ${c ? `<div class="row"><button class="btn solid" data-a="accept" data-p="${p.id}">Accept proposal</button><button class="btn ghost del" data-a="decline" data-p="${p.id}">Decline</button></div>` : ""}</article>`).join("")
    : '<div class="empty"><p>No pending proposals.</p><a class="btn solid" href="#/orders">Go to My Orders</a></div>'}`);
}

/* ---------- router and header ---------- */
function render() {
  const [, page, arg] = (location.hash || "#/orders").split("/");
  $$(".links a").forEach(a => a.classList.toggle("on", a.dataset.p === (page === "order" ? "orders" : page || "orders")));
  $$(".role button").forEach(b => b.classList.toggle("on", b.dataset.role === S.role));
  $("#nOrd").textContent = S.orders.filter(isActive).length; $("#nProp").textContent = S.proposals.length;
  if (page === "order") viewOrder(arg); else if (page === "proposals") viewProposals(); else viewOrders();
}
addEventListener("hashchange", () => { render(); scrollTo(0, 0); });

/* ---------- clicks ---------- */
document.addEventListener("click", e => {
  const b = e.target.closest("[data-a],[data-tab],[data-role]"); if (!b) return;
  if (b.dataset.tab) { tab = b.dataset.tab; return render(); }
  if (b.dataset.role) { S.role = b.dataset.role; save(); render(); return toast("Now viewing as the " + S.role); }
  const id = (location.hash.split("/")[2] || ""), o = S.orders.find(x => x.id === id), m = o && o.ms.find(x => x.id === b.dataset.m);
  switch (b.dataset.a) {
    case "start": o.status = "progress"; log(o, "Freelancer started the project"); done("Project started"); break;
    case "msub": m.status = "submitted"; log(o, `Freelancer submitted "${m.title}" for review`); done("Milestone sent for review"); break;
    case "mok": m.status = "approved"; log(o, `Client approved "${m.title}" and released ${money(m.amount)}`); done(money(m.amount) + " released"); break;
    case "mbk": m.status = "todo"; log(o, `Client asked for changes on "${m.title}"`); done("Sent back for changes"); break;
    case "mdel": o.ms = o.ms.filter(x => x !== m); log(o, `Client removed the milestone "${m.title}"`); done("Milestone removed"); break;
    case "complete": ask("Approve and complete?", "This releases all remaining payments and closes the project.", "Approve", () => { o.ms.forEach(x => x.status = "approved"); o.status = "completed"; log(o, "Client approved the delivery. Project completed"); done("Project completed"); }); break;
    case "cancel": ask("Cancel this project?", "The project will be closed and no more payments will be released.", "Cancel project", () => { o.status = "cancelled"; log(o, "Project cancelled"); done("Project cancelled"); }); break;
    case "accept": {
      const p = S.proposals.find(x => x.id === b.dataset.p), M = (t, pc, at) => ({ id: Math.random().toString(36).slice(2, 8), title: t, amount: Math.round(p.price * pc), due: day(Math.round(p.days * at)), status: "todo" });
      const n = { id: "o" + S.n++, title: p.job, client: "Demo Client", freelancer: p.freelancer, budget: p.price, deadline: day(p.days), created: day(0), status: "pending", revision: "", delivery: null,
        ms: [M("Planning and setup", .25, .3), M("Main work", .5, .7), M("Final delivery", .25, 1)], log: [{ at: Date.now(), text: "Proposal accepted and order created" }] };
      S.orders.unshift(n); S.proposals = S.proposals.filter(x => x !== p); save(); toast("Proposal accepted. Order created"); location.hash = "#/order/" + n.id; break; }
    case "decline": S.proposals = S.proposals.filter(x => x.id !== b.dataset.p); done("Proposal declined"); break;
    case "reset": ask("Reset demo data?", "All orders and changes will go back to the sample data.", "Reset", () => { S = seed(); tab = "active"; location.hash = "#/orders"; done("Demo data reset"); }); break;
  }
});
$("#cmNo").addEventListener("click", () => $("#cm").hidden = true);
$("#cmYes").addEventListener("click", () => { $("#cm").hidden = true; ask.fn && ask.fn(); });
$("#cm").addEventListener("click", e => { if (e.target.id === "cm") $("#cm").hidden = true; });
addEventListener("keydown", e => { if (e.key === "Escape") $("#cm").hidden = true; });

/* ---------- forms with validation ---------- */
document.addEventListener("submit", e => {
  e.preventDefault();
  const o = S.orders.find(x => x.id === location.hash.split("/")[2]); if (!o) return;
  const v = id => $("#" + id).value.trim(), fid = e.target.id;
  if (fid === "mf") {
    const rem = o.budget - o.ms.reduce((a, m) => a + m.amount, 0), a = +v("ma");
    const ok = [bad("mt", v("mt").length < 3 ? "Enter a milestone title (at least 3 characters)." : ""),
      bad("ma", !/^\d+$/.test(v("ma")) || a < 1 ? "Enter a whole amount of 1 or more." : a > rem ? `Only ${money(Math.max(rem, 0))} of the budget is left.` : ""),
      bad("md", !v("md") ? "Choose a due date." : v("md") > o.deadline ? "Due date cannot be after the project deadline." : "")].every(Boolean);
    if (!ok) return toast("Please fix the highlighted fields");
    o.ms.push({ id: Math.random().toString(36).slice(2, 8), title: v("mt"), amount: a, due: v("md"), status: "todo" });
    log(o, `Client added the milestone "${v("mt")}" (${money(a)})`); done("Milestone added");
  } else if (fid === "df") {
    const ok = [bad("dn", v("dn").length < 20 ? `Write at least 20 characters (${v("dn").length}/20).` : ""), bad("dlk", v("dlk") && !/^https?:\/\/\S+\.\S+/.test(v("dlk")) ? "Enter a valid link starting with http or https." : "")].every(Boolean);
    if (!ok) return toast("Please fix the highlighted fields");
    o.delivery = { note: v("dn"), link: v("dlk"), at: Date.now() }; o.revision = ""; o.status = "submitted";
    log(o, "Freelancer submitted the final delivery"); done("Delivery submitted");
  } else if (fid === "rf") {
    if (!bad("rn", v("rn").length < 10 ? "Describe the changes you need (at least 10 characters)." : "")) return;
    o.revision = v("rn"); o.status = "progress"; log(o, "Client requested a revision"); done("Revision requested");
  }
});

/* ---------- start with a loading state ---------- */
app('<div class="skel" style="height:60px"></div><div class="skel" style="height:90px"></div><div class="skel" style="height:240px"></div>');
setTimeout(render, 450);
})();
