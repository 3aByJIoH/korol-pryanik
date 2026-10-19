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
  chips.innerHTML = S.occasions.map((o) => `<button class="chip" role="tab" data-id="${o.id}">${o.title}</button>`).join("") +
    (S.custom ? `<button class="chip chip-custom" type="button" data-custom>${S.custom.title}</button>` : "");
  // «Своя идея»: сразу в WhatsApp, без списка работ
  function writeCustom() {
    const lines = [`Здравствуйте, ${S.master}! Пишу с сайта.`, S.custom.text];
    if (src) lines.push(`(Откуда узнали: ${SRC_NAMES[src] || src})`);
    goal("custom_wa");
    window.open(`https://wa.me/${S.contacts.whatsapp}?text=` + encodeURIComponent(lines.join(String.fromCharCode(10))), "_blank", "noopener");
  }
  function show(id) {
    current = S.occasions.find((o) => o.id === id) || S.occasions[0];
    $$(".chip", chips).forEach((c) => c.setAttribute("aria-selected", c.dataset.id === current.id));
    $("[data-occ-lead]").textContent = current.lead;
    $("[data-occ-from]").textContent = current.from;
    const grid = $("[data-grid]");
    grid.classList.remove("swap"); void grid.offsetWidth; if (show.ready) grid.classList.add("swap"); show.ready = true;
    if (current.bases) { // новая схема: вид пряника + выбор оформления
      grid.innerHTML = current.bases.map((b, i) => `
      <article class="card base-card" style="--i:${i}">
        <div class="pic">${b.img ? `<img src="${b.img}" alt="${b.title}" loading="lazy">` : placeholder(b)}</div>
        ${(b.v || []).length ? `<div class="variants" aria-label="Примеры оформления">${b.v.map((c) => `<span>${placeholder({ shape: b.shape, c })}</span>`).join("")}</div>` : ""}
        <div class="body"><h3>${b.title}</h3><p class="base-sub">${b.sub}</p><p class="base-from">${b.from}</p>
          <button class="btn" data-base="${i}">Выбрать оформление</button></div>
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
  chips.addEventListener("click", (e) => { const b = e.target.closest(".chip"); if (b && b.hasAttribute("data-custom")) { writeCustom(); return; } if (b) { show(b.dataset.id); goal("occasion_" + b.dataset.id); } });
  $("[data-grid]").addEventListener("click", (e) => {
    const b = e.target.closest("[data-want]"); if (b) return open(current.works[+b.dataset.want]);
    const k = e.target.closest("[data-base]"); if (k) open(current.bases[+k.dataset.base], null, true);
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
  let work = null, extra = null, isBase = false;
  function open(w, ex, base) {
    work = w; extra = ex || null; isBase = !!base;
    form.reset();
    $("[data-m-occ]").textContent = extra ? "Дополнительно" : current.title;
    $("[data-m-title]").textContent = extra ? extra : (w ? w.title : "Своя идея");
    const mk = !extra && !!current.mk;
    form.querySelector("[data-size]").hidden = mk || isBase;
    form.querySelector("[data-design]").hidden = !isBase;
    const sub = $("[data-m-sub]"); sub.hidden = !isBase; sub.textContent = isBase ? `${w.sub}, ${w.from}` : "";
    form.qty.placeholder = mk ? "сколько человек" : "например, 30";
    modal.hidden = false; document.body.style.overflow = "hidden";
    goal("want_open");
  }
  function close() { modal.hidden = true; document.body.style.overflow = ""; }
  $("[data-close]").onclick = close;
  modal.addEventListener("click", (e) => { if (e.target === modal) close(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !modal.hidden) close(); });

  function fmtDate(v) { if (!v) return ""; const [y, m, d] = v.split("-"); return `${d}.${m}.${y}`; }
  function message() {
    const f = form, mk = !extra && !!current.mk, lines = [];
    lines.push(`Здравствуйте, ${S.master}! Пишу с сайта.`);
    lines.push(extra ? `Хочу заказать: ${extra}.` : isBase ? `Хочу заказать: ${work.title} (${work.sub}), раздел «${current.title}».` : mk ? "Хочу мастеркласс по росписи пряников." : `Хочу заказать: ${current.title}${work ? `, как «${work.title}»` : ", своя идея"}.`);
    if (f.qty.value) lines.push(`${mk ? "Участников" : "Количество"}: ${f.qty.value}`);
    if (f.date.value) lines.push(`На когда: ${fmtDate(f.date.value)}`);
    if (isBase) lines.push(`Оформление: ${f.design.value}${f.design.value.startsWith("у меня") ? " (образец пришлю в этом чате)" : ""}`);
    if (!mk && f.size.value.trim()) lines.push(`Размер и форма: ${f.size.value.trim()}`);
    if (f.note.value.trim()) lines.push(`Пожелания: ${f.note.value.trim()}`);
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
