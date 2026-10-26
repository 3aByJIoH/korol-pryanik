(function () {
  const S = window.SITE;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  // Откуда пришёл человек: ?src=qr на наклейке, ?src=vk в группе и т.д. Попадает в текст заявки.
  const src = new URLSearchParams(location.search).get("src");
  const SRC_NAMES = { qr: "QR на коробке", vk: "ВКонтакте", maps: "Яндекс Карты", wa: "WhatsApp" };

  // ---------- Статистика (только после согласия на cookie) ----------
  function goal(name) { try { if (window.ym && S.metrika) ym(S.metrika, "reachGoal", name); } catch (e) {} }
  function loadMetrika() {
    if (!S.metrika) return;
    (function (m, e, t, r, i, k, a) { m[i] = m[i] || function () { (m[i].a = m[i].a || []).push(arguments); }; m[i].l = 1 * new Date();
      k = e.createElement(t), a = e.getElementsByTagName(t)[0], k.async = 1, k.src = r, a.parentNode.insertBefore(k, a); })
      (window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");
    ym(S.metrika, "init", { clickmap: true, trackLinks: true, accurateTrackBounce: true });
  }
  function cookieInit() {
    let v = null; try { v = localStorage.getItem("kp-cookie"); } catch (e) {}
    if (v === "yes") return loadMetrika();
    if (v === "no" || !S.metrika) return; // без счётчика баннер не нужен
    const box = $("[data-cookie]"); box.hidden = false;
    const set = (val) => { try { localStorage.setItem("kp-cookie", val); } catch (e) {} box.hidden = true; if (val === "yes") loadMetrika(); };
    $("[data-cookie-yes]").onclick = () => set("yes");
    $("[data-cookie-no]").onclick = () => set("no");
  }

  // ---------- Заглушки-картинки, пока нет фото ----------
  const SHAPES = {
    circle: '<circle cx="50" cy="50" r="40"/>',
    heart: '<path d="M50 86C20 64 10 48 14 34c4-14 22-20 36-6 14-14 32-8 36 6 4 14-6 30-36 52z"/>',
    hex: '<path d="M50 10l35 20v40L50 90 15 70V30z"/>',
    rect: '<rect x="18" y="12" width="64" height="76" rx="8"/>',
    egg: '<ellipse cx="50" cy="54" rx="31" ry="40"/>',
    ball: '<circle cx="50" cy="56" r="34"/><rect x="42" y="12" width="16" height="12" rx="3"/>',
    house: '<path d="M18 48L50 18l32 30v38H18z"/>',
    tree: '<path d="M50 10l26 34H62l20 26H18l20-26H24z"/><rect x="44" y="70" width="12" height="16"/>',
    box: '<rect x="16" y="34" width="68" height="50" rx="4"/><rect x="12" y="22" width="76" height="16" rx="4"/>'
  };
  function placeholder(w) {
    const [fill, line] = w.c || ["#fbf3e6", "#c98a3a"];
    const s = SHAPES[w.shape] || SHAPES.circle;
    return `<svg viewBox="0 0 100 100" aria-hidden="true"><g fill="#d7a76a" transform="translate(2 3)">${s}</g>
      <g fill="${fill}" stroke="${line}" stroke-width="3" stroke-dasharray="1 5" stroke-linecap="round">${s}</g>
      <circle cx="50" cy="52" r="7" fill="${line}" opacity=".55"/></svg>`;
  }

  // ---------- Тексты ----------
  $$("[data-brand]").forEach((el) => (el.textContent = S.brand));
  $$("[data-city]").forEach((el) => (el.textContent = S.city));
  $$("[data-address]").forEach((el) => (el.textContent = S.address || S.city));
  $$("[data-phone]").forEach((el) => { el.textContent = S.contacts.phone || ""; el.href = "tel:+" + S.contacts.whatsapp; el.onclick = () => goal("contact_phone"); });
  if (S.extras) $("[data-extras]").innerHTML = S.extras.map((x, i) => `<li><span>${x.t}</span><span class="extra-p">${x.p}</span><button class="btn btn-sm btn-ghost" data-extra="${i}">Заказать</button></li>`).join("");
  if (S.ingredients) $("[data-ingredients]").innerHTML = S.ingredients.map((x) => `<p><b>${x.t}:</b> ${x.d}</p>`).join("");
  if (S.terms) $("[data-terms]").innerHTML = S.terms.map((x) => `<div><dt>${x.t}</dt><dd>${x.d}</dd></div>`).join("");
  $$("[data-hero]").forEach((el) => (el.textContent = S.hero[el.dataset.hero]));
  $$("[data-about]").forEach((el) => (el.textContent = S.about[el.dataset.about]));
  $("[data-steps]").innerHTML = S.steps.map((s) => `<li><b>${s.t}</b><span>${s.d}</span></li>`).join("");

  // ---------- Поводы и работы ----------
  let current = S.occasions[0];
  const chips = $("[data-chips]");
  // Категории — плитки: значок, название, цена «от»
  const CAT_ICON = { holidays: ["ball", "#fbe9ef", "#c45a7b"], cake: ["circle", "#fdf0f3", "#c97a92"], logo: ["rect", "#eef0f4", "#45506b"],
    wedding: ["heart", "#f6e7e1", "#c9a27a"], "3d": ["house", "#f3e3cc", "#9b6a3c"], guests: ["circle", "#fff7ea", "#c98a3a"],
    selfpaint: ["egg", "#eef2ea", "#8aa07a"], coloring: ["rect", "#ffffff", "#c98a3a"], mk: ["tree", "#e6f0e3", "#4f7a45"] };
  const catIcon = (id) => { const c = CAT_ICON[id] || ["circle", "#fbf3e6", "#c98a3a"]; return placeholder({ shape: c[0], c: [c[1], c[2]] }); };
  chips.innerHTML = S.occasions.map((o) => `<button class="chip cat" role="tab" data-id="${o.id}">
      <span class="cat-ic" aria-hidden="true">${catIcon(o.id)}</span><span class="cat-t">${o.title}</span><span class="cat-p">${o.from}</span></button>`).join("") +
    (S.custom ? `<button class="chip cat chip-custom" type="button" data-custom>
      <span class="cat-ic" aria-hidden="true">✎</span><span class="cat-t">${S.custom.title}</span><span class="cat-p">напишите мне</span></button>` : "");
  // «Своя идея»: сразу в WhatsApp, без списка работ
  function writeCustom() {
    const lines = [`Здравствуйте, ${S.master}! Пишу с сайта.`, S.custom.text];
    if (src) lines.push(`(Откуда узнали: ${SRC_NAMES[src] || src})`);
    goal("custom_wa");
    window.open(`https://wa.me/${S.contacts.whatsapp}?text=` + encodeURIComponent(lines.join(String.fromCharCode(10))), "_blank", "noopener");
  }
  const fmtP = (n) => n.toLocaleString("ru-RU");
  // Цена null = «по запросу»: в минимуме не участвует
  const minPrice = (p) => { const a = p.shapes.flatMap((x) => x.sizes.map((z) => z.p)).filter((v) => v != null); return a.length ? Math.min(...a) : null; };
  const minOf = (p) => p.noMin ? 0 : (p.min || (p.unit === "за штуку" ? S.minOrder || 0 : 0));
  const fromText = (p) => { const m = minPrice(p); return m == null ? "цена по запросу" : `от ${fmtP(m)} ₽ <small>${p.unit}${minOf(p) ? `, заказ от ${minOf(p)} шт` : ""}</small>`; };
  function show(id) {
    current = S.occasions.find((o) => o.id === id) || S.occasions[0];
    $$(".chip", chips).forEach((c) => c.setAttribute("aria-selected", c.dataset.id === current.id));
    $("[data-occ-lead]").textContent = current.lead;
    $("[data-occ-from]").textContent = current.from;
    const grid = $("[data-grid]");
    grid.classList.remove("swap"); void grid.offsetWidth; if (show.ready) grid.classList.add("swap"); show.ready = true;
    if (current.products) { // новая схема: товар -> настройка в окне
      grid.innerHTML = current.products.map((p, i) => `
      <article class="card prod-card" style="--i:${i}">
        <div class="pic">${p.img ? `<img src="${p.img}" alt="${p.title}" loading="lazy">` : placeholder(p)}</div>
        <div class="body"><h3>${p.title}</h3><p class="prod-desc">${p.desc}</p>
          ${p.shapes.length > 1 ? `<p class="prod-opts">Формы: ${p.shapes.map((x) => x.name.toLowerCase()).join(", ")}</p>` : ""}
          <p class="base-from">${fromText(p)}</p>
          <button class="btn" data-prod="${i}">Выбрать</button></div>
      </article>`).join("");
      return;
    }
    grid.innerHTML = current.works.map((w, i) => `
      <article class="card" style="--i:${i}">
        <div class="pic">${w.img ? `<img src="${w.img}" alt="${w.title}" loading="lazy">` : placeholder(w)}</div>
        <div class="body"><h3>${w.title}</h3>
          <button class="btn" data-want="${i}">${current.mk ? "Записаться" : "Хочу похожее"}</button></div>
      </article>`).join("");
  }
  chips.addEventListener("click", (e) => { const b = e.target.closest(".chip"); if (b && b.hasAttribute("data-custom")) { writeCustom(); return; } if (b) { show(b.dataset.id); goal("occasion_" + b.dataset.id);
    if (window.innerWidth < 760) $(".occasion-head").scrollIntoView({ behavior: "smooth", block: "start" }); } });
  $("[data-grid]").addEventListener("click", (e) => {
    const b = e.target.closest("[data-want]"); if (b) return open(current.works[+b.dataset.want]);
    const k = e.target.closest("[data-prod]"); if (k) open(current.products[+k.dataset.prod], null, true);
  });
  $("[data-own]").onclick = () => (S.custom ? writeCustom() : open(null));
  $("[data-extras]").addEventListener("click", (e) => { const b = e.target.closest("[data-extra]"); if (b) open(null, S.extras[+b.dataset.extra].t); });
  show(current.id);

  // ---------- Варианты оформления (демо) ----------
  const SW = { // цвета кружков в переключателе: фон, глазурь, тесто
    classic: ["#FFFCF8", "#FFF8F0", "#B9773A"], school: ["#FFFCF9", "#FBE3D3", "#C2562C"], ny: ["#FBFDFF", "#FFFFFF", "#1F3B32"], valentine: ["#FFFAFA", "#F9C9D3", "#C4475E"],
    feb23: ["#FAFBFC", "#FFFFFF", "#22344A"], march8: ["#FFFDF5", "#FFE58A", "#C9930F"], easter: ["#FFFDFB", "#EADCF7", "#8E6FA8"]
  };
  const DECO = { snow: "❄", hearts: "♥", stars: "★", flowers: "✿", eggs: "" };
  const EGG = ["#B79BDB", "#9DC27A", "#F0B57A", "#E895AE", "#8FB6E0"];
  const themes = S.themes || [];
  const list = $("[data-themer-list]"), panel = $("[data-themer-panel]"), toggle = $("[data-themer-toggle]");
  list.innerHTML = themes.map((t) => { const c = SW[t.id] || SW.classic;
    return `<button type="button" class="theme-opt" role="radio" data-theme-id="${t.id}" aria-checked="false">
      <span class="theme-swatch" style="--sw-bg:${c[0]};--sw-pipe:${c[1]};--sw-ring:${c[2]}"></span>${t.name}</button>`; }).join("");

  function flurry(t) {
    const box = $("[data-flurry]"); if (!box) return; box.innerHTML = ""; box.className = "flurry";
    if (!t.deco) return;
    if (t.deco === "hearts") box.classList.add("rise");
    const n = window.innerWidth < 600 ? 10 : 16;
    let html = "";
    for (let i = 0; i < n; i++) {
      const st = `left:${Math.round(Math.random() * 100)}%;--s:${10 + Math.round(Math.random() * 14)}px;--d:${10 + Math.round(Math.random() * 10)}s;` +
        `--delay:-${Math.round(Math.random() * 18)}s;--dx:${Math.round(Math.random() * 60 - 30)}px;--y:${Math.round(Math.random() * 90)}%`;
      html += t.deco === "eggs"
        ? `<span class="flake egg" style="${st};--c:${EGG[i % EGG.length]}"></span>`
        : `<span class="flake" style="${st}">${DECO[t.deco]}</span>`;
    }
    box.innerHTML = html;
  }

  function applyTheme(id, user) {
    const t = themes.find((x) => x.id === id) || themes[0];
    if (!t) return;
    if (t.id === "classic") delete document.documentElement.dataset.theme; else document.documentElement.dataset.theme = t.id;
    $("[data-hero=kicker]").textContent = t.note || S.hero.kicker;
    $("[data-hero=title]").textContent = t.title || S.hero.title;
    $("[data-hero=text]").textContent = t.text || S.hero.text;
    $$(".theme-opt", list).forEach((b) => b.setAttribute("aria-checked", b.dataset.themeId === t.id));
    $("[data-themer-label]").textContent = "Оформление";
    flurry(t);
    if (user) {
      if (t.occasion) show(t.occasion);
      try { localStorage.setItem("kp-theme", t.id); } catch (e) {}
      const u = new URL(location.href); if (t.id === "classic") u.searchParams.delete("theme"); else u.searchParams.set("theme", t.id);
      history.replaceState(null, "", u);
      goal("theme_" + t.id);
    } else if (t.occasion) show(t.occasion);
  }
  toggle.addEventListener("click", () => { const open = panel.hidden; panel.hidden = !open; toggle.setAttribute("aria-expanded", open); });
  list.addEventListener("click", (e) => { const b = e.target.closest(".theme-opt"); if (b) applyTheme(b.dataset.themeId, true); });
  document.addEventListener("click", (e) => { if (!panel.hidden && !e.target.closest("[data-themer]")) { panel.hidden = true; toggle.setAttribute("aria-expanded", "false"); } });
  // Шрифт заголовков
  const fonts = S.fonts || [], fontList = $("[data-font-list]");
  if (fontList) fontList.innerHTML = fonts.map((f) =>
    `<button type="button" class="font-opt" role="radio" data-font-id="${f.id}" aria-checked="false" style="font-family:${f.css.replace(/"/g, "'")}">${f.name}<small>Пряники</small></button>`).join("");
  function applyFont(id, user) {
    const f = fonts.find((x) => x.id === id) || fonts[0]; if (!f) return;
    document.documentElement.style.setProperty("--display", f.css + ', "Times New Roman", Georgia, serif');
    document.documentElement.dataset.font = f.id;
    $$(".font-opt", fontList).forEach((b) => b.setAttribute("aria-checked", b.dataset.fontId === f.id));
    if (user) {
      try { localStorage.setItem("kp-font", f.id); } catch (e) {}
      const u = new URL(location.href); if (f.id === fonts[0].id) u.searchParams.delete("font"); else u.searchParams.set("font", f.id);
      history.replaceState(null, "", u); goal("font_" + f.id);
    }
  }
  if (fontList) fontList.addEventListener("click", (e) => { const b = e.target.closest(".font-opt"); if (b) applyFont(b.dataset.fontId, true); });
  let startFont = new URLSearchParams(location.search).get("font");
  if (!startFont) { try { startFont = localStorage.getItem("kp-font"); } catch (e) {} }
  applyFont(startFont || (fonts[0] && fonts[0].id), false);

  let startTheme = new URLSearchParams(location.search).get("theme");
  if (!startTheme) { try { startTheme = localStorage.getItem("kp-theme"); } catch (e) {} }
  applyTheme(startTheme || "classic", false);

  // ---------- Окно заявки ----------
  const modal = $("[data-modal]"), form = $("[data-form]");
  let work = null, extra = null, isBase = false, cfg = { sh: 0, sz: 0, pk: 0 };
  function open(w, ex, base) {
    work = w; extra = ex || null; isBase = !!base; cfg = { sh: 0, sz: 0, pk: 0 };
    form.reset();
    $("[data-m-occ]").textContent = extra ? "Дополнительно" : current.title;
    $("[data-m-title]").textContent = extra ? extra : (w ? w.title : "Своя идея");
    const mk = !extra && !!current.mk;
    form.querySelector("[data-size]").hidden = mk || isBase;
    form.querySelector("[data-design]").hidden = !isBase || !!w.noDesign;
    const sub = $("[data-m-sub]"); sub.hidden = !isBase; sub.textContent = isBase ? w.desc : "";
    $("[data-config]").hidden = !isBase; $("[data-estimate]").hidden = !isBase;
    if (isBase) { renderConfig(); estimate(); }
    form.qty.placeholder = mk ? "сколько человек" : isBase && minOf(w) ? `от ${minOf(w)}` : "например, 30";
    form.qty.closest("label").firstChild.textContent = (isBase && w.qtyLabel) || (isBase && w.unit === "за набор" ? "Сколько наборов" : mk ? "Сколько человек" : "Сколько штук");
    modal.hidden = false; document.body.style.overflow = "hidden";
    goal("want_open");
  }
  // Настройка товара: форма, размер, упаковка, примерная сумма
  function renderConfig() {
    const p = work, sh = p.shapes[cfg.sh];
    let h = "";
    if (p.shapes.length > 1) h += `<div class="cfg-group"><span class="cfg-label">Форма</span><div class="cfg-pills">${p.shapes.map((x, i) =>
      `<button type="button" class="pill" data-sh="${i}" aria-pressed="${i === cfg.sh}">${x.name}</button>`).join("")}</div></div>`;
    h += `<div class="cfg-group"><span class="cfg-label">${p.sizeLabel || "Размер"}</span><div class="cfg-pills">${sh.sizes.map((z, i) =>
      `<button type="button" class="pill" data-sz="${i}" aria-pressed="${i === cfg.sz}">${z.s}<small>${z.p == null ? "по запросу" : fmtP(z.p) + " ₽"}</small></button>`).join("")}</div></div>`;
    h += p.packs.length > 1
      ? `<div class="cfg-group"><span class="cfg-label">Упаковка</span><div class="cfg-pills">${p.packs.map((k, i) =>
        `<button type="button" class="pill" data-pk="${i}" aria-pressed="${i === cfg.pk}">${k.n}<small>${k.p ? "+" + fmtP(k.p) + " ₽" : "бесплатно"}</small></button>`).join("")}</div></div>`
      : `<p class="cfg-note">${p.packs[0].n}</p>`;
    $("[data-config]").innerHTML = h;
  }
  function estimate() {
    if (!isBase) return;
    const sh = work.shapes[cfg.sh], sz = sh.sizes[cfg.sz], pk = work.packs[cfg.pk], unit = sz.p + pk.p;
    const q = +form.qty.value || 0, el = $("[data-estimate]");
    if (sz.p == null) { el.innerHTML = `<b>Цена по запросу</b><small>Зависит от размера и наполнения, назову в чате.</small>`; return; }
    const mn = minOf(work), low = mn && q && q < mn ? `<span class="est-warn">Минимальный заказ ${mn} штук</span>` : "";
    el.innerHTML = q
      ? `<b>Примерно: ${fmtP(q)} × ${fmtP(unit)} ₽ = ${fmtP(q * unit)} ₽</b>${low}<small>Сумма примерная, точную назову в чате.</small>`
      : `<b>${fmtP(unit)} ₽ ${work.unit}</b><small>Укажите количество, и я посчитаю сумму.</small>`;
  }
  $("[data-config]").addEventListener("click", (e) => {
    const b = e.target.closest(".pill"); if (!b) return;
    if (b.dataset.sh != null) { cfg.sh = +b.dataset.sh; cfg.sz = 0; }
    if (b.dataset.sz != null) cfg.sz = +b.dataset.sz;
    if (b.dataset.pk != null) cfg.pk = +b.dataset.pk;
    renderConfig(); estimate();
  });
  form.qty.addEventListener("input", estimate);
  function close() { modal.hidden = true; document.body.style.overflow = ""; }
  $("[data-close]").onclick = close;
  modal.addEventListener("click", (e) => { if (e.target === modal) close(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !modal.hidden) close(); });

  function fmtDate(v) { if (!v) return ""; const [y, m, d] = v.split("-"); return `${d}.${m}.${y}`; }
  // Заявка по товару: в виде карточки заказа, как Катя пишет клиентам в WhatsApp
  const UNIT_SHORT = { "за штуку": "шт", "за набор": "набор", "с человека": "чел" };
  function orderCard() {
    const f = form, sh = work.shapes[cfg.sh], sz = sh.sizes[cfg.sz], pk = work.packs[cfg.pk];
    const u = UNIT_SHORT[work.unit] || "шт", q = +f.qty.value || 0, lines = [];
    lines.push(`Здравствуйте, ${S.master}! Хочу сделать заказ с сайта.`, "", "Ваш заказ:");
    lines.push(work.sizeLabel ? `${work.title}: ${sz.s}` : `${work.title}, ${work.shapes.length > 1 ? sh.name.toLowerCase() + " " : ""}${sz.s}`);
    if (work.packs.length > 1) lines.push(`Упаковка: ${pk.n.toLowerCase()}`);
    if (!work.noDesign) lines.push(`Рисунок: ${f.design.value}`);
    if (q) lines.push(`${q} ${u === "набор" ? "наб." : u}`);
    if (sz.p == null) lines.push("Цена: по запросу");
    else { lines.push(`${fmtP(sz.p + pk.p)} р/${u}`); if (q) lines.push(`Сумма: примерно ${fmtP(q * (sz.p + pk.p))} р`); }
    if (f.date.value) lines.push(`Нужно к: ${fmtDate(f.date.value)}`);
    if (f.note.value.trim()) lines.push(`Пожелания: ${f.note.value.trim()}`);
    if (src) lines.push("", `(Откуда узнали: ${SRC_NAMES[src] || src})`);
    return lines.join("\n");
  }
  function message() {
    if (isBase) return orderCard();
    const f = form, mk = !extra && !!current.mk, lines = [];
    lines.push(`Здравствуйте, ${S.master}! Пишу с сайта.`);
    lines.push(extra ? `Хочу заказать: ${extra}.` : isBase ? `Хочу заказать: ${work.title}.` : mk ? "Хочу мастеркласс по росписи пряников." : `Хочу заказать: ${current.title}${work ? `, как «${work.title}»` : ", своя идея"}.`);
    if (isBase) {
      const sh = work.shapes[cfg.sh], sz = sh.sizes[cfg.sz], pk = work.packs[cfg.pk];
      lines.push(`${work.sizeLabel || "Форма и размер"}: ${work.shapes.length > 1 ? sh.name.toLowerCase() + ", " : ""}${sz.s}`);
      if (work.packs.length > 1) lines.push(`Упаковка: ${pk.n.toLowerCase()}`);
      if (!work.noDesign) lines.push(`Оформление: ${f.design.value}${f.design.value.startsWith("у меня") ? " (образец пришлю в этом чате)" : ""}`);
    }
    if (f.qty.value) lines.push(`${mk ? "Участников" : "Количество"}: ${f.qty.value}`);
    if (f.date.value) lines.push(`На когда: ${fmtDate(f.date.value)}`);
    if (!mk && f.size.value.trim()) lines.push(`Размер и форма: ${f.size.value.trim()}`);
    if (f.note.value.trim()) lines.push(`Пожелания: ${f.note.value.trim()}`);
    if (isBase) { const sh = work.shapes[cfg.sh], sz = sh.sizes[cfg.sz], pk = work.packs[cfg.pk], q = +f.qty.value || 0;
      if (q && sz.p != null) lines.push(`Примерная сумма: ${fmtP(q * (sz.p + pk.p))} ₽`); }
    if (src) lines.push(`(Откуда узнали: ${SRC_NAMES[src] || src})`);
    return lines.join("\n");
  }
  function toast(t) { const el = $("[data-toast]"); el.textContent = t; el.hidden = false; clearTimeout(toast.t); toast.t = setTimeout(() => (el.hidden = true), 3500); }
  async function copy(t) {
    try { await navigator.clipboard.writeText(t); return true; } catch (e) {
      const a = document.createElement("textarea"); a.value = t; document.body.appendChild(a); a.select();
      let ok = false; try { ok = document.execCommand("copy"); } catch (e2) {} a.remove(); return ok;
    }
  }
  const waLink = (text) => `https://wa.me/${S.contacts.whatsapp}${text ? "?text=" + encodeURIComponent(text) : ""}`;

  form.addEventListener("submit", (e) => {
    e.preventDefault(); goal("send_wa");
    window.open(waLink(message()), "_blank", "noopener");
  });
  // MAX и VK не умеют открывать чат с готовым текстом: копируем и открываем чат
  const alt = [];
  if (S.contacts.max) alt.push(["max", "Скопировать → MAX", S.contacts.max]);
  if (S.contacts.vk) alt.push(["vk", "Скопировать → ВК", S.contacts.vkMessages || S.contacts.vk]);
  $("[data-alt]").innerHTML = alt.map(([k, t]) => `<button type="button" class="btn btn-ghost btn-sm" data-alt-go="${k}">${t}</button>`).join("");
  $("[data-alt]").addEventListener("click", async (e) => {
    const b = e.target.closest("[data-alt-go]"); if (!b) return;
    const item = alt.find((a) => a[0] === b.dataset.altGo);
    const ok = await copy(message()); goal("send_" + item[0]);
    toast(ok ? "Текст заявки скопирован, вставьте его в чат" : "Не получилось скопировать, напишите своими словами");
    setTimeout(() => window.open(item[2], "_blank", "noopener"), 600);
  });

  // ---------- Общие кнопки связи ----------
  const general = `Здравствуйте, ${S.master}! Пишу с сайта.`;
  $$("[data-wa-general]").forEach((a) => { a.href = waLink(general); a.target = "_blank"; a.rel = "noopener"; a.onclick = () => goal("contact_wa"); });
  const cbtn = [`<a class="btn wa" href="${waLink(general)}" target="_blank" rel="noopener" data-g="contact_wa">WhatsApp</a>`];
  if (S.contacts.max) cbtn.push(`<a class="btn btn-ghost" href="${S.contacts.max}" target="_blank" rel="noopener" data-g="contact_max">MAX</a>`);
  if (S.contacts.vk) cbtn.push(`<a class="btn btn-ghost" href="${S.contacts.vk}" target="_blank" rel="noopener" data-g="contact_vk">ВКонтакте</a>`);
  $("[data-contacts]").innerHTML = cbtn.join("");
  $("[data-contacts]").addEventListener("click", (e) => { const a = e.target.closest("[data-g]"); if (a) goal(a.dataset.g); });

  cookieInit();
})();
