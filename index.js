const $ = (id) => document.getElementById(id);

const currencies = {
  USD: { symbol: "$", locale: "en-US" },
  INR: { symbol: "₹", locale: "en-IN" },
  EUR: { symbol: "€", locale: "de-DE" },
  GBP: { symbol: "£", locale: "en-GB" },
  AUD: { symbol: "A$", locale: "en-AU" },
  CAD: { symbol: "C$", locale: "en-CA" },
  SGD: { symbol: "S$", locale: "en-SG" }
};

function getValues() {
  const amount = Math.max(0, Number($("amount").value) || 0);
  const tipPercent = Math.max(0, Math.min(50, Number($("tip").value) || 0));
  const people = Math.max(1, Math.floor(Number($("people").value) || 1));
  return { amount, tipPercent, people };
}

function formatMoney(value) {
  const currency = $("currency").value;
  return new Intl.NumberFormat(currencies[currency].locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 2
  }).format(value);
}

function calculate() {
  const { amount, tipPercent, people } = getValues();
  const tip = amount * tipPercent / 100;
  const total = amount + tip;

  $("tipValue").textContent = tipPercent + "%";
  $("currencySymbol").textContent = currencies[$("currency").value].symbol;
  $("tipPerPerson").textContent = formatMoney(tip / people);
  $("billPerPerson").textContent = formatMoney(amount / people);
  $("totalTip").textContent = formatMoney(tip);
  $("grandTotal").textContent = formatMoney(total);
  $("totalPerPerson").textContent = formatMoney(total / people);

  $("amountError").textContent = $("amount").value !== "" && Number($("amount").value) < 0
    ? "Bill amount cannot be negative."
    : "";

  document.querySelectorAll(".preset").forEach(btn => {
    btn.classList.toggle("active", Number(btn.dataset.tip) === tipPercent);
  });
}

function setTip(value) {
  $("tip").value = value;
  calculate();
}

function changePeople(delta) {
  const next = Math.max(1, getValues().people + delta);
  $("people").value = next;
  calculate();
}

function reset() {
  $("amount").value = "";
  $("tip").value = 15;
  $("people").value = 1;
  $("currency").value = "USD";
  calculate();
}

function saveCalculation() {
  const { amount, tipPercent, people } = getValues();
  if (!amount) {
    $("amount").focus();
    $("amountError").textContent = "Enter a bill amount first.";
    return;
  }

  const history = JSON.parse(localStorage.getItem("tipwise-history") || "[]");
  history.unshift({
    amount, tipPercent, people,
    currency: $("currency").value,
    total: amount + amount * tipPercent / 100,
    date: new Date().toLocaleString()
  });
  localStorage.setItem("tipwise-history", JSON.stringify(history.slice(0, 8)));
  renderHistory();
}

function renderHistory() {
  const list = $("historyList");
  const history = JSON.parse(localStorage.getItem("tipwise-history") || "[]");
  if (!history.length) {
    list.innerHTML = '<div class="empty">Your saved calculations will appear here.</div>';
    return;
  }

  list.innerHTML = history.map(item => {
    const formatter = new Intl.NumberFormat(currencies[item.currency].locale, {
      style: "currency", currency: item.currency, maximumFractionDigits: 2
    });
    return '<div class="history-item"><span>' +
      formatter.format(item.amount) + ' · ' + item.tipPercent + '% tip · ' + item.people + ' ' +
      (item.people === 1 ? 'person' : 'people') + '</span><strong>' +
      formatter.format(item.total / item.people) + '/person</strong></div>';
  }).join("");
}

$("amount").addEventListener("input", calculate);
$("tip").addEventListener("input", calculate);
$("people").addEventListener("input", () => {
  $("people").value = Math.max(1, Math.floor(Number($("people").value) || 1));
  calculate();
});
$("currency").addEventListener("change", calculate);
$("minus").addEventListener("click", () => changePeople(-1));
$("plus").addEventListener("click", () => changePeople(1));
$("reset").addEventListener("click", reset);
$("save").addEventListener("click", saveCalculation);
$("clearHistory").addEventListener("click", () => {
  localStorage.removeItem("tipwise-history");
  renderHistory();
});
document.querySelectorAll(".preset").forEach(btn => btn.addEventListener("click", () => setTip(btn.dataset.tip)));

$("themeBtn").addEventListener("click", () => {
  document.body.classList.toggle("dark");
  const dark = document.body.classList.contains("dark");
  localStorage.setItem("tipwise-dark", dark ? "1" : "0");
  $("themeBtn").textContent = dark ? "☀️" : "🌙";
});

if (localStorage.getItem("tipwise-dark") === "1") {
  document.body.classList.add("dark");
  $("themeBtn").textContent = "☀️";
}

calculate();
renderHistory();