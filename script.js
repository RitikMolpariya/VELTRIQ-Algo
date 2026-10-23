(() => {
  const config = window.VELTRIQ_CONFIG || {};
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  $('#year').textContent = new Date().getFullYear();

  const nav = $('.desktop-nav');
  const menu = $('.menu-toggle');
  menu?.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    menu.setAttribute('aria-expanded', String(open));
  });
  $$('.desktop-nav a').forEach(link => link.addEventListener('click', () => {
    nav.classList.remove('open'); menu?.setAttribute('aria-expanded', 'false');
  }));

  const setLink = (selector, url) => {
    $$(selector).forEach(link => {
      if (url) { link.href = url; link.target = '_blank'; link.rel = 'noopener noreferrer'; }
      else link.addEventListener('click', event => {
        event.preventDefault();
        const contact = $('#contact');
        contact?.scrollIntoView({behavior: 'smooth'});
        const reminder = $('.setup-reminder');
        if (reminder) { reminder.textContent = 'Add your contact details in config.js to activate this link.'; reminder.classList.add('attention'); }
      });
    });
  };
  setLink('[data-link="whatsapp"]', config.whatsappUrl);
  setLink('[data-link="email"]', config.email ? `mailto:${config.email}` : '');

  const modal = $('#product-modal');
  const title = $('#modal-title');
  const eyebrow = $('#modal-eyebrow');
  const description = $('#modal-description');
  const list = $('#modal-list');
  let lastFocused = null;
  function openProduct(key) {
    const item = config.products?.[key];
    if (!item || !modal) return;
    lastFocused = document.activeElement;
    eyebrow.textContent = item.eyebrow;
    title.textContent = item.title;
    description.textContent = item.description;
    list.replaceChildren(...item.bullets.map(text => {
      const row = document.createElement('div'); row.textContent = text; return row;
    }));
    modal.classList.add('open'); modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('no-scroll'); $('[data-close]', modal)?.focus();
  }
  function closeModal() {
    if (!modal) return;
    modal.classList.remove('open'); modal.setAttribute('aria-hidden', 'true'); document.body.classList.remove('no-scroll'); lastFocused?.focus();
  }
  $$('[data-open]').forEach(button => button.addEventListener('click', () => openProduct(button.dataset.open)));
  $$('[data-close]').forEach(button => button.addEventListener('click', closeModal));
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && modal?.classList.contains('open')) closeModal(); });
})();


(() => {
  const fmt = (value, digits = 2) => Number(value).toLocaleString("en-US", {
    minimumFractionDigits: digits, maximumFractionDigits: digits
  });
  const fmtInt = value => Number(value).toLocaleString("en-US", {maximumFractionDigits: 0});
  const signed = value => `${value < 0 ? "−" : ""}${fmt(Math.abs(value))}`;
  const safeText = value => String(value ?? "");
  const $ = (selector, root = document) => root.querySelector(selector);

  async function initPerformance() {
    const annualHost = $("#annual-chart");
    if (!annualHost) return;
    try {
      const response = await fetch("performance-data.json", {cache: "no-store"});
      if (!response.ok) throw new Error("Could not load performance-data.json");
      const data = await response.json();
      renderEquity(data);
      renderMonthly(data);
      renderHeatmap(data);
      renderDetails(data);
    } catch (error) {
      [annualHost, $("#monthly-chart"), $("#heatmap"), $("#equity-2026-chart")].filter(Boolean).forEach(el => {
        el.innerHTML = '<p class="chart-footnote">Performance data could not be loaded. Run this website through a local web server (for example, <code>py -m http.server 8000</code>) and keep performance-data.json beside index.html.</p>';
      });
    }
  }

  function chartSvg(items, {labelKey, valueKey, countKey, ytdKey, ariaLabel}) {
    const width = 620, height = 290, left = 56, right = 15, top = 15, bottom = countKey ? 58 : 45;
    const plotW = width - left - right, plotH = height - top - bottom;
    const vals = items.map(d => Number(d[valueKey]));
    const minVal = Math.min(0, ...vals), maxVal = Math.max(0, ...vals);
    const pad = Math.max((maxVal - minVal) * 0.12, 1);
    const min = minVal - pad, max = maxVal + pad;
    const y = v => top + ((max - v) / (max - min)) * plotH;
    const zeroY = y(0), step = plotW / Math.max(items.length, 1), barW = Math.min(42, step * 0.56);
    const ticks = 4;
    let s = `<svg viewBox="0 0 ${width} ${height}" role="img" aria-label="${ariaLabel}" xmlns="http://www.w3.org/2000/svg">`;
    for (let i = 0; i <= ticks; i++) {
      const v = max - (max - min) * i / ticks, yy = y(v);
      s += `<line x1="${left}" y1="${yy}" x2="${width-right}" y2="${yy}" class="${Math.abs(v) < (max-min)*0.002 ? "zero-line" : "axis-line"}"/>`;
      s += `<text x="${left-8}" y="${yy+3}" text-anchor="end" class="axis-label">${fmt(v, 0)}</text>`;
    }
    items.forEach((d, i) => {
      const v = Number(d[valueKey]), x = left + i * step + (step - barW) / 2;
      const yy = y(v), rectY = Math.min(yy, zeroY), rectH = Math.max(1, Math.abs(zeroY - yy));
      const color = v < 0 ? "#b96f64" : "#789b7e";
      const label = safeText(d[labelKey]);
      const detail = `${label}: ${signed(v)} account-currency units${countKey ? `; ${fmtInt(d[countKey])} trades` : ""}${d[ytdKey] ? "; year-to-date through 2 October 2026" : ""}`;
      s += `<g class="chart-bar" tabindex="0" role="img" aria-label="${detail.replace(/&/g,"&amp;").replace(/"/g,"&quot;")}"><title>${detail}</title><rect x="${x}" y="${rectY}" width="${barW}" height="${rectH}" rx="2" fill="${color}"/><text x="${x+barW/2}" y="${height-bottom+17}" text-anchor="middle" class="axis-label">${label}</text>`;
      if (countKey) s += `<text x="${x+barW/2}" y="${height-bottom+34}" text-anchor="middle" class="axis-label">${fmtInt(d[countKey])} trades</text>`;
      s += `</g>`;
    });
    s += `</svg>`;
    return s;
  }

  function equitySvg(points, ariaLabel) {
    const width = 760, height = 300, left = 70, right = 18, top = 18, bottom = 48;
    const plotW = width-left-right, plotH = height-top-bottom;
    if (!points.length) return '<p class="chart-footnote">No performance observations are available for this period.</p>';
    const vals = points.map(p => p.equity);
    const minV = Math.min(0, ...vals), maxV = Math.max(0, ...vals);
    const pad = Math.max((maxV-minV)*.12, 1), min=minV-pad, max=maxV+pad;
    const x = i => left + (points.length < 2 ? plotW/2 : i*plotW/(points.length-1));
    const y = v => top + (max-v)/(max-min)*plotH;
    let svg = `<svg viewBox="0 0 ${width} ${height}" role="img" aria-label="${ariaLabel}" xmlns="http://www.w3.org/2000/svg">`;
    for(let i=0;i<=4;i++){const v=max-(max-min)*i/4, yy=y(v);svg+=`<line x1="${left}" y1="${yy}" x2="${width-right}" y2="${yy}" class="axis-line"/><text x="${left-9}" y="${yy+3}" text-anchor="end" class="axis-label">${fmt(v,0)}</text>`;}
    const coords=points.map((p,i)=>`${x(i)},${y(p.equity)}`).join(' ');
    svg+=`<polyline points="${coords}" fill="none" stroke="#789b7e" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>`;
    points.forEach((p,i)=>{const detail=`${p.label}: equity ${signed(p.equity)} account-currency units; period P&L ${signed(p.pnl)} account-currency units`;svg+=`<circle cx="${x(i)}" cy="${y(p.equity)}" r="3.5" fill="${p.pnl<0?'#b96f64':'#789b7e'}" tabindex="0" role="img" aria-label="${detail}" class="equity-point"><title>${detail}</title></circle>`;});
    const labelIdx=[0,Math.floor((points.length-1)/3),Math.floor(2*(points.length-1)/3),points.length-1].filter((v,i,a)=>a.indexOf(v)===i);
    labelIdx.forEach(i=>{svg+=`<text x="${x(i)}" y="${height-17}" text-anchor="middle" class="axis-label">${points[i].label}</text>`;});
    return svg+'</svg>';
  }

  function monthlyPoints(data, startYear, endYear) {
    const points=[];
    data.monthlyByYear.filter(r=>r.year>=startYear && r.year<=endYear).sort((a,b)=>a.year-b.year).forEach(row=>{
      row.values.forEach((pnl,i)=>{
        if(pnl===null || pnl===undefined || !Number.isFinite(Number(pnl))) return;
        points.push({year:row.year, month:i, label:`${data.months[i].slice(0,3)} ${String(row.year).slice(-2)}`, pnl:Number(pnl)});
      });
    });
    let equity=0;
    return points.map(p=>{equity+=p.pnl;return {...p,equity};});
  }

  function renderEquity(data) {
    const host=$("#annual-chart"), filter=$("#equity-range"), title=$("#equity-title"), rangeLabel=$("#equity-date-range");
    const latest=Math.max(...data.monthlyByYear.map(r=>r.year));
    const draw=()=>{
      const years=Number(filter?.value || 3), start=latest-years+1;
      const points=monthlyPoints(data,start,latest);
      if(title) title.textContent=`Multi-Year Equity Curve — Last ${years} Years`;
      if(rangeLabel) rangeLabel.textContent=`${start} – ${latest}${latest===2026?' YTD':''} · zero-based cumulative P&L`;
      host.innerHTML=equitySvg(points,`Cumulative equity curve for ${start} to ${latest}`);
    };
    filter?.addEventListener("change",draw); draw();
    const host2026=$("#equity-2026-chart");
    const points2026=monthlyPoints(data,2026,2026);
    host2026.innerHTML=equitySvg(points2026,"2026 year-to-date cumulative P and L equity curve");
  }

  function renderMonthly(data) {
    const host = $("#monthly-chart");
    host.innerHTML = chartSvg(data.monthlyTotals.map(d => ({...d, label:d.month.slice(0,3)})),
      {labelKey:"label", valueKey:"pnl", ariaLabel:"Combined calendar month net P and L"});
  }

  function renderHeatmap(data) {
    const host=$("#heatmap"), detail=$("#heatmap-detail");
    const values=data.annualPnl.map(d=>Number(d.pnl)).filter(Number.isFinite);
    const maxAbs=Math.max(...values.map(v=>Math.abs(v)),1);
    let html='';
    data.annualPnl.forEach(row=>{
      const v=Number(row.pnl), state=v>0?'positive':v<0?'negative':'zero';
      const shown=`${v<0?'−':''}${fmt(Math.abs(v),0)}`;
      const label=`${row.label}: ${signed(v)} account-currency units${row.ytd?'; year-to-date through 2 October 2026':''}`;
      const intensity=Math.min(.82,.18+Math.abs(v)/maxAbs*.58);
      const bg=v>0?`rgba(120,155,126,${intensity})`:v<0?`rgba(183,105,95,${intensity})`:'rgba(220,220,220,.12)';
      html+=`<button type="button" class="year-heat-cell ${state}" style="--year-heat-bg:${bg}" data-year="${row.year}" aria-label="${label}" title="${label}"><span>${row.label}</span><strong>${shown}</strong></button>`;
    });
    host.innerHTML=html;
    host.querySelectorAll(".year-heat-cell").forEach(cell=>{
      const show=()=>{host.querySelectorAll(".year-heat-cell.selected").forEach(el=>el.classList.remove("selected"));cell.classList.add("selected");const row=data.annualPnl.find(r=>r.year===Number(cell.dataset.year));detail.textContent=`${row.label} · ${signed(Number(row.pnl))} account-currency units${row.ytd?' · year-to-date through 2 October 2026':''}`;};
      cell.addEventListener("mouseenter",show);cell.addEventListener("focus",show);cell.addEventListener("click",show);
    });
  }

  function renderDetails(data) {
    const s = data.statistics, host = $("#details-grid");
    const rows = [
      ["Gross profit", s.grossProfit, "money"], ["Gross loss", s.grossLoss, "money"],
      ["Annualized net profit", s.annualisedNetProfit, "money"], ["Average trade expectancy", s.expectancy, "money"],
      ["Winning trades", s.winningTrades, "int"], ["Losing trades", s.losingTrades, "int"],
      ["Average win", s.averageWin, "money"], ["Average loss", s.averageLoss, "money"],
      ["Payoff ratio", s.payoffRatio, "ratio"], ["Long trades", s.longTrades, "int"],
      ["Long net P&L", s.longNetPnl, "money"], ["Long win rate", s.longWinRatePct, "pct"],
      ["Short trades", s.shortTrades, "int"], ["Short net P&L", s.shortNetPnl, "money"],
      ["Short win rate", s.shortWinRatePct, "pct"], ["Profitable days", s.profitableDaysPct, "pct"],
      ["Profitable months", s.profitableMonthsPct, "pct"], ["Monthly annualized Sharpe", s.monthlyAnnualizedSharpe, "ratio"],
      ["SQN", s.sqn, "ratio"], ["Average holding time", s.averageHoldingHours, "hours"],
      ["Largest win", s.largestWin, "money"], ["Largest loss", s.largestLoss, "money"],
      ["Best day", s.bestDay, "money"], ["Worst day", s.worstDay, "money"],
      ["Best month", s.bestMonth, "money"], ["Worst month", s.worstMonth, "money"],
      ["Calmar ratio", s.calmarRatio, "ratio"], ["Trade P&L standard deviation", s.tradePnlStdDev, "money"],
      ["Maximum consecutive wins", s.maxConsecutiveWins, "int"], ["Maximum consecutive losses", s.maxConsecutiveLosses, "int"]
    ];
    host.innerHTML = rows.map(([label, value, type]) => {
      let display = type === "int" ? fmtInt(value) : type === "pct" ? `${fmt(value,2)}%` :
        type === "hours" ? `${fmt(value,2)} hours` : type === "ratio" ? fmt(value,2) : signed(value);
      return `<div class="detail-row"><span>${label}</span><strong>${display}</strong></div>`;
    }).join("");
  }

  const form = $("#contact-form");
  if (form) {
    form.addEventListener("submit", event => {
      event.preventDefault();
      const status = $("#form-status");
      const fields = [...form.querySelectorAll("[required]")];
      const invalid = fields.find(field => !field.value.trim() || !field.checkValidity());
      status.className = "form-status visible";
      if (invalid) {
        status.classList.add("error");
        status.textContent = invalid.validationMessage || "Please complete all required fields with valid information.";
        invalid.focus();
        return;
      }
      const cfg = window.VELTRIQ_CONFIG || {};
      const payload = Object.fromEntries(new FormData(form).entries());
      if (cfg.contactFormEndpoint) {
        status.classList.add("error");
        status.textContent = "A backend endpoint is configured, but this static front-end has not been wired to a verified submission API. Configure and test the endpoint integration before accepting inquiries.";
        return;
      }
      if (cfg.email) {
        const subject = encodeURIComponent(`Veltriq Capital inquiry — ${payload.service}`);
        const body = encodeURIComponent(
          `Name: ${payload.name}\nEmail: ${payload.email}\nService: ${payload.service}\nPlatform: ${payload.platform || "Not specified"}\n\nProject requirements:\n${payload.requirements}\n\nOptional message:\n${payload.message || "—"}`
        );
        window.location.href = `mailto:${cfg.email}?subject=${subject}&body=${body}`;
        status.classList.add("success");
        status.textContent = "Your email application should open with a prepared draft. The inquiry is not sent until you review and send that email.";
      } else {
        status.classList.add("error");
        status.textContent = "Your form is valid, but no message has been sent. Add a business email in config.js to open a prepared email draft, or connect and test a backend form service.";
      }
    });
  }

  document.querySelectorAll("[data-service]").forEach(link => {
    link.addEventListener("click", () => {
      const service = $("#contact-service");
      if (service) service.value = link.dataset.service;
    });
  });

  initPerformance();
})();
