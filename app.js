const DEFAULTS = Object.freeze({ salary: 3000, visits: 1, minutes: 15, days: 22, hours: 8 });
const STORAGE_KEY = "cagometro:v3";
const PAGE_URL = "https://lloupp.github.io/calcshit/";

export function calculate({ salary, visits, minutes, days, hours }) {
  const safeSalary = Math.max(0, Number(salary) || 0);
  const safeVisits = Math.max(0, Number(visits) || 0);
  const safeMinutes = Math.max(0, Number(minutes) || 0);
  const safeDays = Math.max(1, Number(days) || 1);
  const safeHours = Math.max(0.5, Number(hours) || 0.5);
  const valuePerMinute = safeSalary / (safeDays * safeHours * 60);
  const minutesPerDay = safeVisits * safeMinutes;
  const perDay = valuePerMinute * minutesPerDay;
  const perMonth = perDay * safeDays;
  const perYear = perMonth * 12;
  return { valuePerMinute, minutesPerDay, perDay, perMonth, perYear, minutesPerMonth: minutesPerDay * safeDays, minutesPerYear: minutesPerDay * safeDays * 12 };
}

export function ranking(perYear) {
  if (perYear <= 0) return "🧻 Bexiga de aço";
  if (perYear < 200) return "🚽 Estagiário do trono";
  if (perYear < 600) return "💩 Analista sanitário";
  if (perYear < 1500) return "🏆 Gerente do bidê";
  if (perYear < 4000) return "👑 Diretor de evacuação";
  if (perYear < 10000) return "💼 VP de operações intestinais";
  return "🚀 CEO do banheiro";
}

export function formatDuration(totalMinutes) {
  if (totalMinutes < 60) return `${Math.round(totalMinutes)} min`;
  return `${(totalMinutes / 60).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} h`;
}

export function sessionEarnings(valuePerMinute, elapsedMs) {
  return Math.max(0, Number(valuePerMinute) || 0) * Math.max(0, Number(elapsedMs) || 0) / 60000;
}

export function careerProjection(perYear, years = [1, 5, 10, 30]) {
  const annual = Math.max(0, Number(perYear) || 0);
  return years.map((year) => ({ year, value: annual * year }));
}

export function absurdMetrics(result) {
  const annual = Math.max(0, Number(result?.perYear) || 0);
  const minutes = Math.max(0, Number(result?.minutesPerYear) || 0);
  return [
    { icon: "☕", label: "cafés de R$ 8", value: Math.floor(annual / 8).toLocaleString("pt-BR") },
    { icon: "🍕", label: "pizzas de R$ 55", value: Math.floor(annual / 55).toLocaleString("pt-BR") },
    { icon: "📅", label: "dias de 8h no trono/ano", value: (minutes / 480).toLocaleString("pt-BR", { maximumFractionDigits: 1 }) },
    { icon: "📈", label: "ROI intestinal", value: annual > 0 ? "imensurável" : "em análise" },
  ];
}

export function achievements(result, sessionMs = 0) {
  const annual = Math.max(0, Number(result?.perYear) || 0);
  const monthlyMinutes = Math.max(0, Number(result?.minutesPerMonth) || 0);
  const sessionMinutes = Math.max(0, Number(sessionMs) || 0) / 60000;
  return [
    { icon: "🧻", title: "Contrato assinado", text: "Ganhar pelo menos R$ 1 por ano no trono.", unlocked: annual >= 1 },
    { icon: "☕", title: "Cafezinho pago", text: "Chegar a R$ 100 por ano.", unlocked: annual >= 100 },
    { icon: "🏆", title: "Profissional", text: "Ultrapassar R$ 1.000 por ano.", unlocked: annual >= 1000 },
    { icon: "👑", title: "C-level sanitário", text: "Ultrapassar R$ 5.000 por ano.", unlocked: annual >= 5000 },
    { icon: "⏱️", title: "Hora extra intestinal", text: "Passar 10 horas por mês no trono.", unlocked: monthlyMinutes >= 600 },
    { icon: "🚽", title: "Sessão executiva", text: "Cronometrar 5 minutos em uma sessão.", unlocked: sessionMinutes >= 5 },
  ];
}

function init() {
  const $ = (id) => document.getElementById(id);
  const fields = { salary: $("salario"), visits: $("vezes"), minutes: $("minutos"), days: $("dias"), hours: $("horas") };
  const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 2 });
  const brl0 = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
  let animationFrame = 0;
  let animatedValue = 0;
  let lastSummary = "";
  let lastResult = calculate(DEFAULTS);
  let sessionStartedAt = null;
  let sessionAccumulatedMs = 0;
  let sessionTimer = 0;

  function clampInput(input) {
    const min = Number(input.min);
    const max = Number(input.max);
    let value = Number(input.value);
    if (!Number.isFinite(value)) value = Number(input.defaultValue) || 0;
    if (Number.isFinite(min)) value = Math.max(min, value);
    if (Number.isFinite(max)) value = Math.min(max, value);
    input.value = String(value);
    return value;
  }

  function values() {
    return { salary: clampInput(fields.salary), visits: clampInput(fields.visits), minutes: clampInput(fields.minutes), days: clampInput(fields.days), hours: clampInput(fields.hours) };
  }

  function animateMoney(target) {
    cancelAnimationFrame(animationFrame);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      animatedValue = target;
      $("mes").textContent = brl0.format(target);
      return;
    }
    const start = animatedValue;
    const startedAt = performance.now();
    const duration = 360;
    const step = (now) => {
      const progress = Math.min((now - startedAt) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      animatedValue = start + (target - start) * eased;
      $("mes").textContent = brl0.format(animatedValue);
      if (progress < 1) animationFrame = requestAnimationFrame(step);
      else animatedValue = target;
    };
    animationFrame = requestAnimationFrame(step);
  }

  function funFact(perYear) {
    if (perYear <= 0) return "Zero reais — eficiência intestinal ou home office estratégico.";
    if (perYear < 500) return "Seu departamento sanitário ainda está em fase de investimento.";
    if (perYear < 2000) return "Já existe orçamento suficiente para uma pequena operação intestinal.";
    if (perYear < 10000) return "O banheiro já merece centro de custo próprio.";
    return "Nesse nível, o conselho deveria pedir um relatório trimestral do banheiro.";
  }

  function persist(data) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch { /* storage may be unavailable */ }
  }

  function currentSessionMs() {
    return sessionAccumulatedMs + (sessionStartedAt ? Date.now() - sessionStartedAt : 0);
  }

  function formatClock(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const base = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    return hours ? `${String(hours).padStart(2, "0")}:${base}` : base;
  }

  function renderCareer() {
    $("careerGrid").replaceChildren(...careerProjection(lastResult.perYear).map(({ year, value }) => {
      const item = document.createElement("div"); item.className = "career-item";
      const label = document.createElement("span"); label.textContent = year === 1 ? "1 ano" : `${year} anos`;
      const strong = document.createElement("strong"); strong.textContent = brl0.format(value);
      item.append(label, strong); return item;
    }));
  }

  function renderAbsurd() {
    $("absurdGrid").replaceChildren(...absurdMetrics(lastResult).map((metric) => {
      const item = document.createElement("div"); item.className = "absurd-item";
      const icon = document.createElement("span"); icon.className = "absurd-icon"; icon.textContent = metric.icon;
      const copy = document.createElement("div"); const strong = document.createElement("strong"); strong.textContent = metric.value;
      const label = document.createElement("span"); label.textContent = metric.label; copy.append(strong, label); item.append(icon, copy); return item;
    }));
  }

  function renderAchievements() {
    const list = achievements(lastResult, currentSessionMs());
    $("achievementCount").textContent = `${list.filter((item) => item.unlocked).length}/${list.length}`;
    $("achievementGrid").replaceChildren(...list.map((achievement) => {
      const item = document.createElement("div"); item.className = `achievement${achievement.unlocked ? " unlocked" : " locked"}`;
      item.setAttribute("aria-label", `${achievement.title}: ${achievement.unlocked ? "desbloqueada" : "bloqueada"}`);
      const icon = document.createElement("span"); icon.className = "achievement-icon"; icon.textContent = achievement.icon;
      const copy = document.createElement("div"); const strong = document.createElement("strong"); strong.textContent = achievement.title;
      const text = document.createElement("span"); text.textContent = achievement.text; copy.append(strong, text); item.append(icon, copy); return item;
    }));
  }

  function renderSession() {
    const elapsed = currentSessionMs();
    $("sessionTime").textContent = formatClock(elapsed);
    $("sessionMoney").textContent = brl.format(sessionEarnings(lastResult.valuePerMinute, elapsed));
    $("sessionResetBtn").disabled = elapsed === 0;
    renderAchievements();
  }

  function render() {
    const data = values();
    lastResult = calculate(data);
    $("salarioVal").textContent = brl0.format(data.salary);
    $("vezesVal").textContent = String(data.visits);
    $("minutosVal").textContent = `${data.minutes} min`;
    $("diasVal").textContent = String(data.days);
    $("horasVal").textContent = String(data.hours).replace(".", ",");
    animateMoney(lastResult.perMonth);
    $("porDia").textContent = `${brl.format(lastResult.perDay)} por dia • ${brl0.format(lastResult.perYear)} por ano`;
    $("rank").textContent = ranking(lastResult.perYear);
    $("tempoMes").textContent = formatDuration(lastResult.minutesPerMonth);
    $("tempoAno").textContent = formatDuration(lastResult.minutesPerYear);
    $("porMin").textContent = brl.format(lastResult.valuePerMinute);
    $("fun").textContent = funFact(lastResult.perYear);
    lastSummary = `💩 Cagômetro: ${brl0.format(lastResult.perMonth)}/mês (${brl0.format(lastResult.perYear)}/ano) correspondem ao meu tempo no banheiro durante o expediente. Meu cargo: ${ranking(lastResult.perYear)}. Faça o seu: ${PAGE_URL}`;
    renderCareer(); renderAbsurd(); renderSession(); persist(data);
  }

  function restore() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (!saved || typeof saved !== "object") return;
      for (const [key, input] of Object.entries(fields)) if (saved[key] !== undefined) input.value = String(saved[key]);
    } catch { /* ignore invalid local data */ }
  }

  async function share() {
    $("toast").textContent = "";
    try {
      if (navigator.share) { await navigator.share({ title: "Cagômetro", text: lastSummary, url: PAGE_URL }); $("toast").textContent = "Resultado compartilhado."; return; }
      await navigator.clipboard.writeText(lastSummary); $("toast").textContent = "Resultado copiado para a área de transferência.";
    } catch (error) {
      if (error?.name === "AbortError") return;
      $("toast").textContent = "Não foi possível compartilhar automaticamente. Copie o endereço da página e tente novamente.";
    }
  }

  function wrapCanvasText(ctx, text, x, y, maxWidth, lineHeight) {
    const words = text.split(" "); let line = ""; let currentY = y;
    for (const word of words) {
      const test = line ? `${line} ${word}` : word;
      if (ctx.measureText(test).width > maxWidth && line) { ctx.fillText(line, x, currentY); line = word; currentY += lineHeight; }
      else line = test;
    }
    if (line) ctx.fillText(line, x, currentY);
    return currentY;
  }

  async function generateCard() {
    const canvas = document.createElement("canvas"); canvas.width = 1080; canvas.height = 1350;
    const ctx = canvas.getContext("2d"); const gradient = ctx.createLinearGradient(0, 0, 1080, 1350);
    gradient.addColorStop(0, "#3a2416"); gradient.addColorStop(1, "#8a5b36"); ctx.fillStyle = gradient; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.textAlign = "center"; ctx.fillStyle = "#fff8ee"; ctx.font = "700 56px system-ui, sans-serif"; ctx.fillText("💩 CAGÔMETRO", 540, 150);
    ctx.fillStyle = "#ffd49b"; ctx.font = "900 112px system-ui, sans-serif"; ctx.fillText(brl0.format(lastResult.perMonth), 540, 360);
    ctx.fillStyle = "#fff8ee"; ctx.font = "600 40px system-ui, sans-serif"; ctx.fillText("por mês no banheiro", 540, 430);
    ctx.font = "800 44px system-ui, sans-serif"; ctx.fillText(ranking(lastResult.perYear), 540, 560);
    ctx.font = "600 34px system-ui, sans-serif"; ctx.fillStyle = "#f7e6d2";
    wrapCanvasText(ctx, `${brl0.format(lastResult.perYear)} por ano • ${formatDuration(lastResult.minutesPerYear)} por ano no trono`, 540, 690, 880, 52);
    ctx.fillStyle = "rgba(255,255,255,.12)"; ctx.fillRect(100, 820, 880, 250);
    ctx.fillStyle = "#fff8ee"; ctx.font = "700 34px system-ui, sans-serif"; ctx.fillText("AUDITORIA EXECUTIVA", 540, 890);
    ctx.font = "600 30px system-ui, sans-serif"; const metrics = absurdMetrics(lastResult);
    ctx.fillText(`${metrics[0].icon} ${metrics[0].value} ${metrics[0].label}`, 540, 955);
    ctx.fillText(`${metrics[1].icon} ${metrics[1].value} ${metrics[1].label}`, 540, 1010);
    ctx.fillStyle = "#ffd49b"; ctx.font = "700 28px system-ui, sans-serif"; ctx.fillText("lloupp.github.io/calcshit", 540, 1200);
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
    if (!blob) throw new Error("card generation failed");
    const file = new File([blob], "cagometro.png", { type: "image/png" });
    try {
      if (navigator.canShare?.({ files: [file] })) { await navigator.share({ files: [file], title: "Meu Cagômetro", text: lastSummary }); $("toast").textContent = "Card pronto para compartilhar."; return; }
      const link = document.createElement("a"); link.href = URL.createObjectURL(blob); link.download = "cagometro.png"; link.click(); setTimeout(() => URL.revokeObjectURL(link.href), 1000); $("toast").textContent = "Card gerado como imagem.";
    } catch (error) { if (error?.name === "AbortError") return; throw error; }
  }

  function toggleSession() {
    if (sessionStartedAt) {
      sessionAccumulatedMs += Date.now() - sessionStartedAt; sessionStartedAt = null; clearInterval(sessionTimer); sessionTimer = 0;
      $("sessionToggleBtn").textContent = "Continuar sessão"; $("liveBadge").textContent = "pausado"; $("liveBadge").classList.remove("active");
      $("sessionMessage").textContent = `Sessão pausada em ${formatClock(sessionAccumulatedMs)}.`; renderSession(); return;
    }
    sessionStartedAt = Date.now(); $("sessionToggleBtn").textContent = "Pausar sessão"; $("liveBadge").textContent = "ao vivo"; $("liveBadge").classList.add("active");
    $("sessionMessage").textContent = "Cronômetro rodando. A firma está patrocinando este momento.";
    sessionTimer = window.setInterval(renderSession, 250); renderSession();
  }

  function resetSession() {
    sessionStartedAt = null; sessionAccumulatedMs = 0; clearInterval(sessionTimer); sessionTimer = 0;
    $("sessionToggleBtn").textContent = "Começar sessão"; $("liveBadge").textContent = "parado"; $("liveBadge").classList.remove("active");
    $("sessionMessage").textContent = "Nenhuma descarga contabilizada ainda."; renderSession();
  }

  restore();
  Object.values(fields).forEach((input) => input.addEventListener("input", render));
  Object.values(fields).forEach((input) => input.addEventListener("change", render));
  $("shareBtn").addEventListener("click", share);
  $("cardBtn").addEventListener("click", () => generateCard().catch(() => { $("toast").textContent = "Não foi possível gerar o card neste navegador."; }));
  $("sessionToggleBtn").addEventListener("click", toggleSession);
  $("sessionResetBtn").addEventListener("click", resetSession);
  $("resetBtn").addEventListener("click", () => {
    for (const [key, input] of Object.entries(fields)) input.value = String(DEFAULTS[key]);
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
    render(); fields.salary.focus();
  });
  render();
}

if (typeof document !== "undefined") init();
