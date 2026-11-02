/* Tudo que Preciso — vitrine de afiliados (sem bibliotecas) */
(function () {
  'use strict';

  const FAV_KEY = 'tqp:favoritos';
  const REL = 'sponsored nofollow noopener';
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
  const ddmm = iso => { const [, m, d] = String(iso).split('-'); return d && m ? `${d}/${m}` : ''; };
  const norm = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  const state = { q: '', cat: '', prices: [], favOnly: false, sort: 'rank' };
  let data = { categories: [], products: [] };
  let catById = {};
  let favs = loadFavs();

  function loadFavs() {
    try { return new Set(JSON.parse(localStorage.getItem(FAV_KEY) || '[]')); } catch (e) { return new Set(); }
  }
  function saveFavs() {
    try { localStorage.setItem(FAV_KEY, JSON.stringify([...favs])); } catch (e) { /* navegação privada */ }
  }

  const icon = (name, cls = 'i') => `<svg class="${cls}" aria-hidden="true"><use href="#i-${name}"/></svg>`;

  function discount(p) {
    if (!p.oldPrice || p.oldPrice <= p.price) return 0;
    return Math.round((1 - p.price / p.oldPrice) * 100);
  }

  function waLink(p) {
    const text = `Olha esse produto no Mercado Livre: ${p.name} — ${p.affiliateLink}`;
    return 'https://wa.me/?text=' + encodeURIComponent(text);
  }

  function cardHTML(p) {
    const cat = catById[p.category] || { name: '' };
    const off = discount(p);
    const isFav = favs.has(p.id);
    const link = esc(p.affiliateLink);
    const name = esc(p.name);
    return `
      <article class="card">
        <span class="card-rank"><b>${p.rank}º</b> mais vendido</span>
        <button class="fav-btn" type="button" data-fav="${esc(p.id)}" aria-pressed="${isFav}" aria-label="${isFav ? 'Remover dos' : 'Adicionar aos'} favoritos: ${name}">${icon('heart')}</button>
        <a class="card-media" href="${link}" target="_blank" rel="${REL}" tabindex="-1" aria-hidden="true">
          <img src="${esc(p.image)}" alt="${name}" loading="lazy" decoding="async" width="400" height="400">
          ${off ? `<span class="card-off">-${off}%${p.priceIsPix ? ' no Pix' : ''}</span>` : ''}
        </a>
        <div class="card-body">
          <span class="card-cat">${esc(cat.name)}</span>
          <h3 class="card-title"><a href="${link}" target="_blank" rel="${REL}">${name}</a></h3>
          <div class="price-old">${p.oldPrice ? brl.format(p.oldPrice) : ''}</div>
          <div class="price-row">
            <span class="price">${brl.format(p.price)}</span>
            ${p.priceIsPix ? '<span class="pix">no Pix</span>' : ''}
          </div>
          <span class="price-date">${icon('calendar')} Preço consultado em ${ddmm(p.checkedAt || data.updatedAt)}</span>
          <div class="card-cta">
            <a class="btn btn-primary" href="${link}" target="_blank" rel="${REL}">Ver no Mercado Livre ${icon('external')}</a>
            <div class="card-links">
              <a class="current-price" href="${link}" target="_blank" rel="${REL}">Ver preço atual no Mercado Livre</a>
              <a class="share-wa" href="${waLink(p)}" target="_blank" rel="noopener" aria-label="Compartilhar ${name} no WhatsApp" title="Compartilhar no WhatsApp">${icon('whatsapp')}</a>
            </div>
          </div>
        </div>
      </article>`;
  }

  function sorted(list) {
    const l = list.slice();
    if (state.sort === 'price-asc') l.sort((a, b) => a.price - b.price);
    else if (state.sort === 'price-desc') l.sort((a, b) => b.price - a.price);
    else l.sort((a, b) => a.rank - b.rank || data.categories.findIndex(c => c.id === a.category) - data.categories.findIndex(c => c.id === b.category));
    return l;
  }

  function inPrice(p) {
    if (!state.prices.length) return true;
    return state.prices.some(r => { const [min, max] = r.split('-').map(Number); return p.price >= min && p.price < max; });
  }

  function filtered() {
    const words = norm(state.q).split(/\s+/).filter(Boolean);
    const seen = new Set();
    return data.products.filter(p => {
      if (state.cat && p.category !== state.cat) return false;
      if (state.favOnly && !favs.has(p.id)) return false;
      if (!inPrice(p)) return false;
      if (words.length) {
        const hay = norm(p.name + ' ' + (catById[p.category] || {}).name);
        if (!words.every(w => hay.includes(w))) return false;
      }
      // o mesmo anúncio pode aparecer em duas categorias; sem filtro de categoria mostramos uma vez só
      if (!state.cat) { if (seen.has(p.affiliateLink)) return false; seen.add(p.affiliateLink); }
      return true;
    });
  }

  const isFiltering = () => Boolean(state.q.trim() || state.cat || state.prices.length || state.favOnly || state.sort !== 'rank');

  function renderHome() {
    $('[data-top]').innerHTML = data.categories.map(c => {
      const p = data.products.find(x => x.category === c.id && x.rank === 1);
      if (!p) return '';
      return `<li class="top-item"><a href="${esc(p.affiliateLink)}" target="_blank" rel="${REL}">
        <span class="top-num" aria-hidden="true">1º</span>
        <img src="${esc(p.image)}" alt="${esc(p.name)}" loading="lazy" decoding="async" width="72" height="72">
        <span class="top-info"><span class="top-cat">${esc(c.name)}</span><span class="top-name">${esc(p.name)}</span>
        <span class="top-price">${brl.format(p.price)} ${p.priceIsPix ? '<small>no Pix</small>' : ''}</span></span></a></li>`;
    }).join('');

    $('[data-sections]').innerHTML = data.categories.map(c => {
      const items = data.products.filter(p => p.category === c.id).sort((a, b) => a.rank - b.rank);
      if (!items.length) return '';
      return `<section class="section" id="cat-${esc(c.id)}" aria-labelledby="h-${esc(c.id)}">
        <div class="section-head">
          <h2 id="h-${esc(c.id)}"><span class="cat-mini">${icon(c.icon)}</span> Mais vendidos em ${esc(c.name)}</h2>
          <button class="link-btn" type="button" data-pick-cat="${esc(c.id)}">Ver só esta categoria</button>
        </div>
        <div class="grid">${items.map(cardHTML).join('')}</div>
      </section>`;
    }).join('');
  }

  function render() {
    const filtering = isFiltering();
    $('[data-home]').hidden = filtering;
    $('[data-results]').hidden = !filtering;

    const list = sorted(filtered());
    $$('[data-count]').forEach(el => { el.textContent = list.length; });

    if (filtering) {
      $('[data-results-grid]').innerHTML = list.map(cardHTML).join('');
      $('[data-empty]').hidden = list.length > 0;
      let title = state.favOnly ? 'Meus favoritos' : state.cat ? `Mais vendidos em ${catById[state.cat].name}` : 'Resultados';
      if (state.q.trim()) title += ` para “${state.q.trim()}”`;
      $('[data-results-title]').textContent = title;
    }

    const status = $('[data-status]');
    const total = new Set(data.products.map(p => p.affiliateLink)).size;
    status.innerHTML = filtering
      ? `<strong>${list.length}</strong> ${list.length === 1 ? 'produto encontrado' : 'produtos encontrados'}`
      : `<strong>${total}</strong> produtos em <strong>${data.categories.length}</strong> categorias`;

    const active = (state.cat ? 1 : 0) + state.prices.length + (state.favOnly ? 1 : 0);
    const badge = $('[data-active-count]');
    badge.hidden = !active;
    badge.textContent = active;

    $$('[data-cat-btn]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.catBtn === state.cat && !state.favOnly)));
    $('[data-filter-cat]').value = state.cat;
    $$('[data-filter-price]').forEach(i => { i.checked = state.prices.includes(i.value); });
    $('[data-filter-favs]').checked = state.favOnly;
    $('[data-sort]').value = state.sort;
  }

  function updateFavCount() {
    $$('[data-fav-count]').forEach(el => { el.textContent = favs.size; el.hidden = favs.size === 0; });
  }

  function scrollToContent() {
    const target = $('#conteudo .layout');
    if (target) window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - (window.innerWidth <= 900 ? 120 : 130), behavior: 'smooth' });
  }

  function setCat(id) {
    state.cat = id;
    state.favOnly = false;
    render();
    scrollToContent();
  }

  function clearAll() {
    Object.assign(state, { q: '', cat: '', prices: [], favOnly: false, sort: 'rank' });
    $('#busca').value = '';
    render();
  }

  // Drawer (menu lateral)
  const drawer = $('#drawer');
  function openDrawer() { drawer.hidden = false; document.documentElement.style.overflow = 'hidden'; $$('[data-open-drawer]').forEach(b => b.setAttribute('aria-expanded', 'true')); $('.drawer-panel button', drawer).focus(); }
  function closeDrawer() { drawer.hidden = true; document.documentElement.style.overflow = ''; $$('[data-open-drawer]').forEach(b => b.setAttribute('aria-expanded', 'false')); }

  // Painel de filtros (celular)
  const filters = $('#filtros');
  const backdrop = $('.filters-backdrop');
  function openFilters() { filters.classList.add('open'); backdrop.hidden = false; document.documentElement.style.overflow = 'hidden'; }
  function closeFilters() { filters.classList.remove('open'); backdrop.hidden = true; document.documentElement.style.overflow = ''; }

  function bind() {
    let t;
    $('#busca').addEventListener('input', e => {
      clearTimeout(t);
      t = setTimeout(() => { state.q = e.target.value; render(); }, 120);
    });
    $('#busca').addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); state.q = e.target.value; render(); scrollToContent(); e.target.blur(); } });
    $('[data-search-go]').addEventListener('click', () => { state.q = $('#busca').value; render(); scrollToContent(); });

    $('[data-filter-cat]').addEventListener('change', e => { state.cat = e.target.value; render(); });
    $$('[data-filter-price]').forEach(i => i.addEventListener('change', () => {
      state.prices = $$('[data-filter-price]').filter(x => x.checked).map(x => x.value); render();
    }));
    $('[data-filter-favs]').addEventListener('change', e => { state.favOnly = e.target.checked; render(); });
    $('[data-sort]').addEventListener('change', e => { state.sort = e.target.value; render(); });

    document.addEventListener('click', e => {
      const fav = e.target.closest('[data-fav]');
      if (fav) {
        const id = fav.dataset.fav;
        favs.has(id) ? favs.delete(id) : favs.add(id);
        saveFavs(); updateFavCount();
        const on = favs.has(id);
        $$(`[data-fav="${CSS.escape(id)}"]`).forEach(b => {
          b.setAttribute('aria-pressed', String(on));
          b.setAttribute('aria-label', b.getAttribute('aria-label').replace(/^(Adicionar aos|Remover dos)/, on ? 'Remover dos' : 'Adicionar aos'));
          b.classList.remove('pop'); void b.offsetWidth; b.classList.add('pop');
        });
        if (state.favOnly) render();
        return;
      }
      const catBtn = e.target.closest('[data-cat-btn]');
      if (catBtn) { setCat(catBtn.dataset.catBtn); closeDrawer(); return; }
      const pick = e.target.closest('[data-pick-cat]');
      if (pick) { setCat(pick.dataset.pickCat); return; }
      if (e.target.closest('[data-show-favs]')) { closeDrawer(); state.favOnly = true; state.cat = ''; render(); scrollToContent(); return; }
      if (e.target.closest('[data-clear]')) { clearAll(); return; }
      if (e.target.closest('[data-open-drawer]')) { openDrawer(); return; }
      if (e.target.closest('[data-close-drawer]') || e.target === drawer) { closeDrawer(); return; }
      if (e.target.closest('a[href="#mais-vendidos"]')) {
        e.preventDefault(); closeDrawer(); clearAll();
        $('#mais-vendidos').scrollIntoView({ behavior: 'smooth' });
        return;
      }
      if (e.target.closest('[data-open-filters]')) { openFilters(); return; }
      if (e.target.closest('.filters-apply')) { closeFilters(); scrollToContent(); return; }
      if (e.target.closest('[data-close-filters]')) { closeFilters(); return; }
      if (e.target.closest('[data-to-top]')) { window.scrollTo({ top: 0, behavior: 'smooth' }); }
    });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeDrawer(); closeFilters(); } });

    const toTop = $('[data-to-top]');
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (ticking) return; ticking = true;
      requestAnimationFrame(() => { toTop.hidden = window.scrollY < 700; ticking = false; });
    }, { passive: true });
  }

  function renderStatic() {
    const all = { id: '', name: 'Todas', icon: 'todas' };
    $('[data-cat-bar]').innerHTML = [all, ...data.categories].map(c =>
      `<li><button class="cat-btn" type="button" data-cat-btn="${esc(c.id)}" aria-pressed="false"><span class="cat-ico">${icon(c.icon)}</span>${esc(c.name)}</button></li>`).join('');
    $('[data-drawer-cats]').innerHTML = [{ id: '', name: 'Todas as categorias', icon: 'todas' }, ...data.categories].map(c =>
      `<li><button type="button" data-cat-btn="${esc(c.id)}">${icon(c.icon)} ${esc(c.name)}</button></li>`).join('');
    $('[data-filter-cat]').insertAdjacentHTML('beforeend', data.categories.map(c => `<option value="${esc(c.id)}">${esc(c.name)}</option>`).join(''));
    $('[data-footer-cats]').innerHTML = data.categories.map(c => `<li><button type="button" data-cat-btn="${esc(c.id)}">${esc(c.name)}</button></li>`).join('');
    $$('[data-updated]').forEach(el => { el.textContent = ddmm(data.updatedAt); });
  }

  async function init() {
    $$('[data-year]').forEach(el => { el.textContent = new Date().getFullYear(); });
    try {
      const res = await fetch('products.json', { cache: 'no-cache' });
      if (!res.ok) throw new Error(res.status);
      data = await res.json();
    } catch (e) {
      $('[data-sections]').innerHTML = '<div class="empty"><p><strong>Não foi possível carregar os produtos.</strong></p><p>Recarregue a página em alguns segundos.</p></div>';
      return;
    }
    catById = Object.fromEntries(data.categories.map(c => [c.id, c]));
    // remove favoritos de produtos que não existem mais
    const ids = new Set(data.products.map(p => p.id));
    favs = new Set([...favs].filter(id => ids.has(id)));
    renderStatic();
    renderHome();
    bind();
    updateFavCount();
    render();
  }

  init();
})();
