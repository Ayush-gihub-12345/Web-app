/**
 * assets/js/main.js
 * Unified script:
 * - header scroll behavior
 * - mobile nav
 * - swiper init from .swiper-config
 * - AOS & GLightbox init
 * - FAQ toggles
 * - calculator UI + logic + FormSubmit injection
 * - form feedback handling (shows success/error inline)
 */

(function () {
  "use strict";

  const $ = (s, ctx=document) => ctx.querySelector(s);
  const $$ = (s, ctx=document) => Array.from((ctx||document).querySelectorAll(s));
  const on = (el, ev, fn) => el && el.addEventListener(ev, fn);
  const body = document.body;

  /* Header scroll */
  const header = $('#header');
  function updateHeader() {
    if (!header) return;
    if (window.scrollY > 40) { body.classList.add('scrolled'); header.classList.add('scrolled'); }
    else { body.classList.remove('scrolled'); header.classList.remove('scrolled'); }
  }
  window.addEventListener('scroll', updateHeader, {passive:true});
  window.addEventListener('load', updateHeader);

  /* Scroll Top */
  const scrollTopBtn = $('#scroll-top');
  if (scrollTopBtn) on(scrollTopBtn, 'click', (e) => { e.preventDefault(); window.scrollTo({top:0, behavior:'smooth'}); });

  /* Mobile nav toggle */
  const mobileToggle = document.querySelector('.mobile-nav-toggle');
  function toggleMobile() {
    body.classList.toggle('mobile-nav-active');
    if (mobileToggle) {
      mobileToggle.classList.toggle('bi-list');
      mobileToggle.classList.toggle('bi-x');
      mobileToggle.setAttribute('aria-expanded', body.classList.contains('mobile-nav-active'));
    }
  }
  on(mobileToggle, 'click', (e) => { e.preventDefault(); toggleMobile(); });

  const navmenu = $('#navmenu');
  if (navmenu) {
    navmenu.addEventListener('click', (e) => {
      const a = e.target.closest('a');
      if (!a) return;
      const href = a.getAttribute('href') || '';
      if (href.startsWith('#') && body.classList.contains('mobile-nav-active')) toggleMobile();
    });
  }

  /* FAQ toggle (click & keyboard) */
  (function initFAQ(){
    const container = $('.faq-container');
    if (!container) return;
    container.addEventListener('click', (e) => {
      const hit = e.target.closest('.faq-item h3, .faq-item .faq-toggle');
      if (!hit) return;
      const item = hit.closest('.faq-item');
      item && item.classList.toggle('faq-active');
    });
    $$('.faq-item h3', container).forEach(h3 => {
      h3.tabIndex = 0;
      h3.addEventListener('keydown', (ev) => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); h3.click(); } });
    });
  })();

  /* AOS + GLightbox + Swiper init on load */
  window.addEventListener('load', () => {
    if (typeof AOS !== 'undefined') {
      if (window.innerWidth <= 480) $$('[data-aos-delay]').forEach(el => el.removeAttribute('data-aos-delay'));
      AOS.init({ duration:700, once:true });
    }
    if (typeof GLightbox !== 'undefined') GLightbox({ selector: '.glightbox' });

    // init swipers using .swiper-config JSON
    $$('.init-swiper').forEach(sw => {
      const cfgNode = sw.querySelector('.swiper-config');
      let cfg = {};
      if (cfgNode) {
        try { cfg = JSON.parse(cfgNode.textContent.trim()); } catch(e) { cfg = {}; }
      }
      const defaults = { loop:true, speed:600, slidesPerView:'auto', pagination:{ el: '.swiper-pagination', clickable:true } };
      const finalCfg = Object.assign({}, defaults, cfg);
      if (typeof Swiper !== 'undefined') {
        try { new Swiper(sw, finalCfg); } catch(err) { console.warn('Swiper init failed', err); }
      }
    });
  });

  /* Isotope init if available */
  window.addEventListener('load', () => {
    if (typeof imagesLoaded === 'undefined' || typeof Isotope === 'undefined') return;
    $$('.isotope-layout').forEach(item => {
      const container = item.querySelector('.isotope-container');
      if (!container) return;
      imagesLoaded(container, () => {
        try { new Isotope(container, { itemSelector: '.isotope-item', layoutMode: item.dataset.layout || 'masonry' }); } catch(e) { console.warn(e); }
      });
      item.querySelectorAll('.isotope-filters li').forEach(btn => {
        btn.addEventListener('click', function() {
          const active = item.querySelector('.isotope-filters .filter-active');
          active && active.classList.remove('filter-active');
          this.classList.add('filter-active');
          const f = this.getAttribute('data-filter') || '*';
          try { container.isotope.arrange({ filter: f }); } catch(e) {}
          if (typeof AOS !== 'undefined') AOS.refresh();
        });
      });
    });
  });

  /* Calculator & FormSubmit injection */
  (function calculatorAndForm() {
    const calcMount = $('#quote-calculator');
    const checkbox = $('#generate-quote-checkbox');
    const form = $('#contact-simple-form');
    if (!calcMount || !form) return;

    // Inject calculator UI
    calcMount.innerHTML = `
      <div id="calc-wrap" style="display:none;margin-bottom:12px;">
        <div style="display:flex;gap:12px;flex-wrap:wrap;">
          <div style="flex:1 1 220px;">
            <label for="calc-package" style="font-weight:600">Package</label>
            <select id="calc-package" class="form-control">
              <option value="bronze" data-price="2999" data-included-pages="4">Bronze — ₹2,999 (4 pages)</option>
              <option value="silver" data-price="4999" data-included-pages="6">Silver — ₹4,999 (6 pages)</option>
              <option value="gold" data-price="11999" data-included-pages="6">Gold — ₹11,999 (starting)</option>
            </select>
          </div>

          <div style="width:120px;">
            <label for="calc-pages" style="font-weight:600">Pages</label>
            <input id="calc-pages" class="form-control" type="number" min="1" value="4" />
          </div>

          <div style="flex:1 1 160px;">
            <label for="calc-ecom" style="font-weight:600">E-commerce</label>
            <select id="calc-ecom" class="form-control">
              <option value="0" selected>No</option>
              <option value="2500">Catalog — ₹2,500</option>
              <option value="4500">Full shop — ₹4,500</option>
            </select>
          </div>
        </div>

        <div style="display:flex;gap:12px;flex-wrap:wrap;margin-top:8px;">
          <div style="flex:1 1 160px;">
            <label style="font-weight:600">Booking</label>
            <select id="calc-booking" class="form-control"><option value="0" selected>No</option><option value="800">Yes — ₹800</option></select>
          </div>

          <div style="flex:1 1 160px;">
            <label style="font-weight:600">Payments</label>
            <select id="calc-payments" class="form-control"><option value="0" selected>No</option><option value="1200">Yes — ₹1,200</option></select>
          </div>

          <div style="flex:1 1 160px;">
            <label style="font-weight:600">Domain & Setup</label>
            <select id="calc-domain" class="form-control"><option value="0" selected>Client handles</option><option value="800">Setup help — ₹800</option></select>
          </div>

          <div style="flex:1 1 160px;">
            <label style="font-weight:600">Maintenance</label>
            <select id="calc-maintenance" class="form-control"><option value="0" selected>No</option><option value="200">Minor updates ₹200</option><option value="500">Major updates ₹500</option></select>
          </div>
        </div>

        <div style="display:flex;gap:12px;flex-wrap:wrap;margin-top:8px;">
          <div style="flex:1 1 200px;">
            <label style="font-weight:600">Priority Delivery</label>
            <select id="calc-priority" class="form-control"><option value="0" selected>No</option><option value="700">Yes — ₹700</option></select>
          </div>
          <div style="flex:1 1 200px;">
            <label style="font-weight:600">Short note</label>
            <input id="calc-notes" class="form-control" type="text" placeholder="e.g., booking form, gallery" />
          </div>
        </div>

        <div id="quote-summary" style="margin-top:10px;padding:10px;border-radius:8px;background: color-mix(in srgb,var(--brand-accent), transparent 92%);color:#fff;font-weight:700;">
          Total: <span id="quote-total">₹0</span>
          <div id="quote-breakdown" style="font-weight:400;font-size:0.92rem;margin-top:8px;"></div>
        </div>
      </div>
    `;

    const pkg = $('#calc-package', calcMount);
    const pages = $('#calc-pages', calcMount);
    const ecom = $('#calc-ecom', calcMount);
    const booking = $('#calc-booking', calcMount);
    const payments = $('#calc-payments', calcMount);
    const domain = $('#calc-domain', calcMount);
    const maintenance = $('#calc-maintenance', calcMount);
    const priority = $('#calc-priority', calcMount);
    const notes = $('#calc-notes', calcMount);
    const totalElm = $('#quote-total', calcMount);
    const breakdownElm = $('#quote-breakdown', calcMount);
    const wrapper = $('#calc-wrap', calcMount);

    const EXTRA_PAGE_COST = 250;
    const toInt = v => { const n = parseInt(String(v || 0).replace(/[^0-9-]/g,''),10); return Number.isFinite(n) ? n : 0; };

    function getPackageInfo() {
      const opt = pkg.selectedOptions ? pkg.selectedOptions[0] : pkg.options[pkg.selectedIndex];
      const price = toInt(opt.dataset.price || opt.getAttribute('data-price') || 0);
      const included = toInt(opt.dataset.includedPages || opt.getAttribute('data-included-pages') || 0);
      return { id:opt.value, price, included, label:opt.textContent.trim() };
    }

    function compute() {
      const p = getPackageInfo();
      const requestedPages = Math.max(1, toInt(pages.value || p.included));
      const extraPages = Math.max(0, requestedPages - p.included);
      const extraPagesCost = extraPages * EXTRA_PAGE_COST;
      const ecomCost = toInt(ecom.value || 0);
      const bookingCost = toInt(booking.value || 0);
      const paymentsCost = toInt(payments.value || 0);
      const domainCost = toInt(domain.value || 0);
      const maintenanceCost = toInt(maintenance.value || 0);
      const priorityCost = toInt(priority.value || 0);
      const notesText = (notes.value || '').trim();
      const base = p.price;
      const total = base + extraPagesCost + ecomCost + bookingCost + paymentsCost + domainCost + maintenanceCost + priorityCost;

      const lines = [];
      lines.push(`Plan: ${p.label} — ₹${base.toLocaleString('en-IN')}`);
      lines.push(`Pages: ${requestedPages} (included ${p.included})`);
      if (extraPages > 0) lines.push(`Extra pages: ₹${extraPagesCost.toLocaleString('en-IN')}`);
      if (ecomCost) lines.push(`E-commerce: ₹${ecomCost.toLocaleString('en-IN')}`);
      if (bookingCost) lines.push(`Booking: ₹${bookingCost.toLocaleString('en-IN')}`);
      if (paymentsCost) lines.push(`Payments: ₹${paymentsCost.toLocaleString('en-IN')}`);
      if (domainCost) lines.push(`Domain setup: ₹${domainCost.toLocaleString('en-IN')}`);
      if (maintenanceCost) lines.push(`Maintenance/month: ₹${maintenanceCost.toLocaleString('en-IN')}`);
      if (priorityCost) lines.push(`Priority: ₹${priorityCost.toLocaleString('en-IN')}`);
      if (notesText) lines.push(`Notes: ${notesText}`);
      lines.push(`Estimated total: ₹${total.toLocaleString('en-IN')}`);

      return {
        total,
        breakdownText: lines.join('\n'),
        structured: {
          plan: p.label,
          pages: requestedPages,
          included: p.included,
          extraPages,
          costs: { extraPagesCost, ecomCost, bookingCost, paymentsCost, domainCost, maintenanceCost, priorityCost },
          notes: notesText
        }
      };
    }

    function updateUI() {
      const visible = checkbox.checked;
      wrapper.style.display = visible ? 'block' : 'none';
      calcMount.setAttribute('aria-hidden', visible ? 'false' : 'true');
      if (!visible) return;
      const q = compute();
      totalElm.textContent = `₹${q.total.toLocaleString('en-IN')}`;
      breakdownElm.textContent = q.breakdownText.replace(/\n/g,'\n');
    }

    [pkg, pages, ecom, booking, payments, domain, maintenance, priority, notes].forEach(el => {
      if (!el) return; on(el,'input', updateUI); on(el,'change', updateUI);
    });
    if (checkbox) on(checkbox,'change', updateUI);
    updateUI();

    // global helper used by price buttons
    window.WebpageWaleQuote = window.WebpageWaleQuote || {};
    window.WebpageWaleQuote.applyPricing = function(opts){
      const contact = document.getElementById('contact');
      contact && contact.scrollIntoView({ behavior:'smooth', block:'start' });
      if (checkbox) checkbox.checked = true;
      updateUI();
      if (opts && opts.name) {
        const name = String(opts.name).toLowerCase();
        for (let i=0;i<pkg.options.length;i++){
          const o = pkg.options[i];
          if (o.value.toLowerCase() === name || (o.textContent||'').toLowerCase().includes(name)) { pkg.selectedIndex = i; break; }
        }
      }
      if (opts && typeof opts.includedPages !== 'undefined') pages.value = opts.includedPages;
      updateUI();
      setTimeout(()=>{ const nm = form.querySelector('input[name="name"]'); nm && nm.focus(); }, 450);
    };

    // On submit inject hidden fields for FormSubmit and quote data
    form.addEventListener('submit', function(e){
      // remove old injected fields
      $$('.injected-field', form).forEach(n => n.remove());

      const addHidden = (name, value) => {
        const i = document.createElement('input');
        i.type = 'hidden';
        i.name = name;
        i.value = value || '';
        i.className = 'injected-field';
        form.appendChild(i);
        return i;
      };

      const wantsQuote = checkbox && checkbox.checked;
      const q = wantsQuote ? compute() : null;

      // Standard recommended fields
      addHidden('_source', 'webpagewale.in');
      addHidden('_submitted_at', new Date().toISOString());
      addHidden('_template', form.querySelector('input[name="_template"]') ? form.querySelector('input[name="_template"]').value : 'table');
      addHidden('_cc', form.querySelector('input[name="_cc"]') ? form.querySelector('input[name="_cc"]').value : 'contact@webpagewale.in');

      // Subject
      addHidden('_subject', q ? `${q.structured.plan} plan enquiry: ₹${q.total}` : 'Website enquiry from website');

      // Reply-to (FormSubmit uses email field automatically, we also set _replyto if possible)
      const emailInput = form.querySelector('input[name="email"]');
      if (emailInput && emailInput.value) addHidden('_replyto', emailInput.value);

      // autoresponse (visible copy to user)
      addHidden('_autoresponse', `Thanks for contacting WebpageWale. We received your enquiry. ${q ? ('Estimated total ₹' + q.total) : ''}`);

      // include quote details
      if (wantsQuote && q) {
        addHidden('quote_total', q.total);
        addHidden('quote_breakdown', q.breakdownText);
        addHidden('quote_data', JSON.stringify(q.structured));
        addHidden('chosen_plan', q.structured.plan || '');
      } else {
        addHidden('quote_total', '');
        addHidden('quote_breakdown', '');
        addHidden('quote_data', '');
        addHidden('chosen_plan', '');
      }

      // If you'd like to disable captcha (not recommended): addHidden('_captcha','false');
      // Allow normal submit to proceed. FormSubmit will return the default thank-you or redirect via _next.
      // Show a short inline "sending" state:
      const successBox = $('#fs-success'), errorBox = $('#fs-error');
      successBox && (successBox.style.display = 'none'); errorBox && (errorBox.style.display='none');
    }, false);

    // Optional: show feedback on form submission using the redirect page or FormSubmit response.
    // Because FormSubmit does full-page redirect by default, we won't intercept the submit.
    // The success/error elements are here for progressive enhancement (if you later add AJAX).
  })();

  // Minor accessibility touches
  window.addEventListener('load', () => {
    $$('.clients img').forEach(img => { if (!img.alt) img.alt = 'client'; });
  });

})();
