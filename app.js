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
  $$("[data-hero]").forEach((el) => (el.textContent = S.hero[el.dataset.hero]));
  $$("[data-about]").forEach((el) => (el.textContent = S.about[el.dataset.about]));
  $("[data-steps]").innerHTML = S.steps.map((s) => `<li><b>${s.t}</b><span>${s.d}</span></li>`).join("");

  // ---------- Поводы и работы ----------
  let current = S.occasions[0];
  const chips = $("[data-chips]");
  chips.innerHTML = S.occasions.map((o) => `<button class="chip" role="tab" data-id="${o.id}">${o.title}</button>`).join("");
  function show(id) {
    current = S.occasions.find((o) => o.id === id) || S.occasions[0];
    $$(".chip", chips).forEach((c) => c.setAttribute("aria-selected", c.dataset.id === current.id));
    $("[data-occ-lead]").textContent = current.lead;
    $("[data-occ-from]").textContent = current.from;
    $("[data-grid]").innerHTML = current.works.map((w, i) => `
      <article class="card">
        <div class="pic">${w.img ? `<img src="${w.img}" alt="${w.title}" loading="lazy">` : placeholder(w)}</div>
        <div class="body"><h3>${w.title}</h3>
          <button class="btn" data-want="${i}">${current.mk ? "Записаться" : "Хочу похожее"}</button></div>
      </article>`).join("");
  }
  chips.addEventListener("click", (e) => { const b = e.target.closest(".chip"); if (b) { show(b.dataset.id); goal("occasion_" + b.dataset.id); } });
  $("[data-grid]").addEventListener("click", (e) => { const b = e.target.closest("[data-want]"); if (b) open(current.works[+b.dataset.want]); });
  $("[data-own]").onclick = () => open(null);
  show(current.id);

  // ---------- Окно заявки ----------
  const modal = $("[data-modal]"), form = $("[data-form]");
  let work = null;
  function open(w) {
    work = w;
    $("[data-m-occ]").textContent = current.title;
    $("[data-m-title]").textContent = w ? w.title : "Своя идея";
    const mk = !!current.mk;
    form.querySelector("fieldset").hidden = mk;
    form.qty.placeholder = mk ? "сколько детей" : "например, 30";
    modal.hidden = false; document.body.style.overflow = "hidden";
    goal("want_open");
  }
  function close() { modal.hidden = true; document.body.style.overflow = ""; }
  $("[data-close]").onclick = close;
  modal.addEventListener("click", (e) => { if (e.target === modal) close(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !modal.hidden) close(); });

  function fmtDate(v) { if (!v) return ""; const [y, m, d] = v.split("-"); return `${d}.${m}.${y}`; }
  function message() {
    const f = form, mk = !!current.mk, lines = [];
    lines.push(`Здравствуйте, ${S.master}! Пишу с сайта.`);
    lines.push(mk ? "Хочу мастер-класс по росписи пряников." : `Хочу заказать: ${current.title}${work ? ` — как «${work.title}»` : ", своя идея"}.`);
    if (f.qty.value) lines.push(`${mk ? "Детей" : "Количество"}: ${f.qty.value}`);
    if (f.date.value) lines.push(`${mk ? "Дата" : "К дате"}: ${fmtDate(f.date.value)}`);
    if (!mk) lines.push(`Дизайн: ${f.design.value}`);
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
  if (S.contacts.vk) alt.push(["vk", "Скопировать → ВК", S.contacts.vk.replace(/vk\.com\/club(\d+)/, "vk.me/club$1")]);
  $("[data-alt]").innerHTML = alt.map(([k, t]) => `<button type="button" class="btn btn-ghost btn-sm" data-alt-go="${k}">${t}</button>`).join("");
  $("[data-alt]").addEventListener("click", async (e) => {
    const b = e.target.closest("[data-alt-go]"); if (!b) return;
    const item = alt.find((a) => a[0] === b.dataset.altGo);
    const ok = await copy(message()); goal("send_" + item[0]);
    toast(ok ? "Текст заявки скопирован — вставьте его в чат" : "Не получилось скопировать, напишите своими словами");
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
