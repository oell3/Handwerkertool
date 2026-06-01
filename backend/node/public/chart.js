

let charts = {};

document.addEventListener("DOMContentLoaded", () => {
  document
    .getElementById("benutzerdefiniert")
    .addEventListener("click", loadData);

  document.getElementById("monatlich")
    .addEventListener("click", setMonat);

  document.getElementById("Quartal")
    .addEventListener("click", setQuartal);

  document.getElementById("Jährlich")
    .addEventListener("click", setJahr);

  loadData();
});

function setQuartal() {
  const today = new Date();
  const month = today.getMonth();

  const quarterStartMonth = Math.floor(month / 3) * 3;

  const start = new Date(today.getFullYear(), quarterStartMonth, 1);
  const end = today;

  setDateInputs(start, end);
  loadData();
}

function setJahr() {
  const today = new Date();

  const start = new Date(today.getFullYear(), 0, 1);
  const end = today;

  setDateInputs(start, end);
  loadData();
}

function setMonat() {
  const today = new Date();

  const start = new Date(today.getFullYear(), today.getMonth(), 1);
  const end = today;

  setDateInputs(start, end);
  loadData();
}

function setDateInputs(start, end) {
  document.getElementById("start").value =
    start.toISOString().slice(0, 10);

  document.getElementById("end").value =
    end.toISOString().slice(0, 10);
}

async function loadData() {
  console.log("Lade Daten");
  showSkeleton();

  let start = document.getElementById("start").value;
  let end = document.getElementById("end").value;

  if (!start || !end) {
    const today = new Date();
    const s = new Date(today.getFullYear(), today.getMonth(), 1);

    start = s.toISOString().slice(0, 10);
    end = today.toISOString().slice(0, 10);
  }

  const res = await fetch(`/api/dashboard?start=${start}&end=${end}`);
  const data = await res.json();

  console.log(data);

  updateKPIs(data.stats);
  renderCharts(data);
}

// ==============================
// KPI + TREND
// ==============================
function updateKPIs(stats) {
  setKPI("kpi-r", stats.r_now );
  setKPI("kpi-a", stats.a_now);
  setKPI("kpi-z", stats.z_now, );

  setDiff("diff-r", stats.r_now, stats.r_prev,"kim-r");
  setDiff("diff-a", stats.a_now, stats.a_prev, "kim-a");
  setDiff("diff-z", stats.z_now, stats.z_prev,"kim-z");
}

function setKPI(id, value) {
  document.getElementById(id).textContent =
    Number(value).toFixed(2) + " €";

    
}

function setDiff(id, current, prev, ig) {
  
  const el = document.getElementById(id);
  const diff = prev === 0 ? 0 : ((current - prev) / prev) * 100;

  const arrow = diff >= 0 ? "↑" : "↓";


  el.textContent = `Vormonat: ${prev} € ${arrow} ${diff.toFixed(1)}%`;
  el.style.color = diff >= 0 ? "green" : "red";
}

// ==============================
// CHARTS
// ==============================
function renderCharts(data) {
  createChart("Umsatz", data.rechnungen);
  createChart("Angebote", data.angebote);
  createChart("Zahlungen", data.zahlungen);
}

function createChart(id, dataset) {
  if (charts[id]) charts[id].destroy();

  charts[id] = new Chart(document.getElementById(id), {
    type: "line",
    data: {
      labels: dataset.map(e => e.datum_formatiert),
      datasets: [{
        label: id,
        data: dataset.map(e => e.gesamtbetrag)
      }]
    }
  });
}

// ==============================
// SKELETON
// ==============================
function showSkeleton() {
  document.querySelectorAll(".skeleton").forEach(el => {
    el.textContent = "";
    el.style.display = "block";
  });
}

function hideSkeleton() {
  document.querySelectorAll(".skeleton").forEach(el => {
    el.style.display = "block";
  });
}