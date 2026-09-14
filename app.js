const DEFAULTS = Object.freeze({ salary: 3000, visits: 1, minutes: 15, days: 22, hours: 8 });
const STORAGE_KEY = "cagometro:v2";

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

  return {
    valuePerMinute,
    minutesPerDay,
    perDay,
    perMonth,
    perYear,
    minutesPerMonth: minutesPerDay * safeDays,
    minutesPerYear: minutesPerDay * safeDays * 12,
  };
}

export function ranking(perYear) {
  if (perYear <= 0) return "🧻 Bexiga de aço";
  if (perYear < 200) return "🚽 Iniciante do trono";
  if (perYear < 600) return "💩 Cagador amador";
  if (perYear < 1500) return "🏆 Profissional do bidê";
  if (perYear < 4000) return "👑 Realeza da privada";
  return "🚀 Lenda dos intestinos";
}

export function formatDuration(totalMinutes) {
  if (totalMinutes < 60) return `${Math.round(totalMinutes)} min`;
  const hours = totalMinutes / 60;
  return `${hours.toLocaleString("pt-BR", { maximumFractionDigits: 1 })} h`;
}

function init() {
  const $ = (id) => document.getElementById(id);
  const fields = {
    salary: $("salario"),
    visits: $("vezes"),
    minutes: $("minutos"),
    days: $("dias"),
    hours: $("horas"),
  };

  const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 2 });
  const brl0 = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
  let animationFrame = 0;
  let animatedValue = 0;
  let lastSummary = "";

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
    return {
      salary: clampInput(fields.salary),
      visits: clampInput(fields.visits),
      minutes: clampInput(fields.minutes),
      days: clampInput(fields.days),
      hours: clampInput(fields.hours),
    };
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
    const coffees = Math.floor(perYear / 8);
    const pizzas = Math.floor(perYear / 55);
    return `Em valores ilustrativos, isso equivale a cerca de ${coffees} cafés de R$ 8 ou ${pizzas} pizzas de R$ 55 por ano.`;
  }

  function persist(data) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch { /* storage may be unavailable */ }
  }

  function render() {
    const data = values();
    const result = calculate(data);

    $("salarioVal").textContent = brl0.format(data.salary);
    $("vezesVal").textContent = String(data.visits);
    $("minutosVal").textContent = `${data.minutes} min`;
    $("diasVal").textContent = String(data.days);
    $("horasVal").textContent = String(data.hours).replace(".", ",");

    animateMoney(result.perMonth);
    $("porDia").textContent = `${brl.format(result.perDay)} por dia • ${brl0.format(result.perYear)} por ano`;
    $("rank").textContent = ranking(result.perYear);
    $("tempoMes").textContent = formatDuration(result.minutesPerMonth);
    $("tempoAno").textContent = formatDuration(result.minutesPerYear);
    $("porMin").textContent = brl.format(result.valuePerMinute);
    $("fun").textContent = funFact(result.perYear);

    lastSummary = `💩 Cagômetro: ${brl0.format(result.perMonth)}/mês (${brl0.format(result.perYear)}/ano) correspondem ao meu tempo no banheiro durante o expediente. Faça o seu: https://lloupp.github.io/calcshit/`;
    persist(data);
  }

  function restore() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (!saved || typeof saved !== "object") return;
      for (const [key, input] of Object.entries(fields)) {
        if (saved[key] !== undefined) input.value = String(saved[key]);
      }
    } catch { /* ignore invalid local data */ }
  }

  async function share() {
    $("toast").textContent = "";
    try {
      if (navigator.share) {
        await navigator.share({ title: "Cagômetro", text: lastSummary, url: "https://lloupp.github.io/calcshit/" });
        $("toast").textContent = "Resultado compartilhado.";
        return;
      }
      await navigator.clipboard.writeText(lastSummary);
      $("toast").textContent = "Resultado copiado para a área de transferência.";
    } catch (error) {
      if (error?.name === "AbortError") return;
      $("toast").textContent = "Não foi possível compartilhar automaticamente. Copie o endereço da página e tente novamente.";
    }
  }

  restore();
  Object.values(fields).forEach((input) => input.addEventListener("input", render));
  Object.values(fields).forEach((input) => input.addEventListener("change", render));
  $("shareBtn").addEventListener("click", share);
  $("resetBtn").addEventListener("click", () => {
    for (const [key, input] of Object.entries(fields)) input.value = String(DEFAULTS[key]);
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
    render();
    fields.salary.focus();
  });

  render();
}

if (typeof document !== "undefined") init();
