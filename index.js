const $ = (id) => document.getElementById(id);

const currencies = {
  USD:{symbol:"$",locale:"en-US"}, INR:{symbol:"₹",locale:"en-IN"}, EUR:{symbol:"€",locale:"de-DE"},
  GBP:{symbol:"£",locale:"en-GB"}, AUD:{symbol:"A$",locale:"en-AU"}, CAD:{symbol:"C$",locale:"en-CA"},
  SGD:{symbol:"S$",locale:"en-SG"}, AED:{symbol:"د.إ",locale:"ar-AE"}, JPY:{symbol:"¥",locale:"ja-JP"}
};

let lastCalculation = null;
let deferredPrompt = null;

function num(id, fallback=0){ return Math.max(0, Number($(id).value)||fallback); }
function getValues(){ return {amount:num("amount"),tipPercent:Math.min(50,num("tip")),people:Math.max(1,Math.floor(num("people",1))),tax:num("tax"),service:num("service"),roundUp:$("roundUp").checked,unequal:$("unequalSplit").checked,customShare:num("customShare")}; }
function formatMoney(value,currency=$("currency").value){
  const c=currencies[currency]||currencies.USD;
  return new Intl.NumberFormat(c.locale,{style:"currency",currency,maximumFractionDigits:2}).format(value||0);
}
function calculate(){
  const v=getValues(),currency=$("currency").value,tip=v.amount*v.tipPercent/100,tax=v.amount*v.tax/100,service=v.amount*v.service/100,total=v.amount+tip+tax+service;
  let perPerson=total/v.people;
  if(v.unequal&&v.customShare>0&&v.people>1) perPerson=Math.max(0,total-v.customShare)/(v.people-1);
  const displayPerPerson=v.roundUp?Math.ceil(perPerson):perPerson;
  $("tipValue").textContent=v.tipPercent+"%";$("currencySymbol").textContent=currencies[currency].symbol;$("people").value=v.people;
  $("tipPerPerson").textContent=formatMoney(tip/v.people);$("billPerPerson").textContent=formatMoney(v.amount/v.people);
  $("extrasPerPerson").textContent=formatMoney((tax+service)/v.people);$("totalTip").textContent=formatMoney(tip);$("grandTotal").textContent=formatMoney(total);$("totalPerPerson").textContent=formatMoney(displayPerPerson);
  $("amountError").textContent=$("amount").value!==""&&Number($("amount").value)<0?"Bill amount cannot be negative.":"";
  document.querySelectorAll(".preset").forEach(btn=>btn.classList.toggle("active",Number(btn.dataset.tip)===v.tipPercent));
  lastCalculation={...v,currency,total,tip,tax,service,perPerson:displayPerPerson};savePreferences();
}
function setTip(value){$("tip").value=value;calculate()}
function changePeople(delta){$("people").value=Math.max(1,getValues().people+delta);calculate()}
function reset(){
  ["amount","tax","service","customShare"].forEach(id=>$(id).value="");$("tip").value=15;$("people").value=1;$("currency").value="USD";$("roundUp").checked=false;$("unequalSplit").checked=false;
  $("advancedPanel").classList.remove("open");$("advancedToggle").classList.remove("open");$("advancedToggle").setAttribute("aria-expanded","false");$("unequalPanel").style.display="none";calculate();toast("Calculator reset");
}
function saveCalculation(){
  if(!getValues().amount){$("amount").focus();$("amountError").textContent="Enter a bill amount first.";return}
  const v=getValues(),history=JSON.parse(localStorage.getItem("tipwise-history")||"[]");
  history.unshift({amount:v.amount,tipPercent:v.tipPercent,people:v.people,tax:v.tax,service:v.service,currency:$("currency").value,total:lastCalculation.total,date:new Date().toISOString()});
  localStorage.setItem("tipwise-history",JSON.stringify(history.slice(0,10)));renderHistory();toast("Calculation saved");
}
function renderHistory(){
  const list=$("historyList"),history=JSON.parse(localStorage.getItem("tipwise-history")||"[]");
  if(!history.length){list.innerHTML='<div class="empty">Your saved calculations will appear here.</div>';return}
  list.innerHTML=history.map(item=>{
    const extra=(item.tax||0)+(item.service||0);
    return '<div class="history-item"><span>'+formatMoney(item.amount,item.currency)+' · '+item.tipPercent+'% tip · '+item.people+' '+(item.people===1?"person":"people")+(extra?' · +'+extra.toFixed(1)+'% extras':'')+'</span><strong>'+formatMoney(item.total/item.people,item.currency)+'/person</strong></div>';
  }).join("");
}
function savePreferences(){localStorage.setItem("tipwise-preferences",JSON.stringify({currency:$("currency").value,tip:$("tip").value,people:$("people").value,tax:$("tax").value,service:$("service").value,roundUp:$("roundUp").checked}))}
function loadPreferences(){
  const p=JSON.parse(localStorage.getItem("tipwise-preferences")||"null");if(!p)return;
  if(p.currency&&currencies[p.currency])$("currency").value=p.currency;if(p.tip)$("tip").value=p.tip;if(p.people)$("people").value=p.people;if(p.tax!=null)$("tax").value=p.tax;if(p.service!=null)$("service").value=p.service;$("roundUp").checked=!!p.roundUp;
}
function resultText(){
  if(!lastCalculation)return "";const v=lastCalculation;
  return "TipWise bill summary\nBill: "+formatMoney(v.amount)+"\nTip: "+v.tipPercent+"% ("+formatMoney(v.tip)+")\nTax: "+formatMoney(v.tax)+"\nService charge: "+formatMoney(v.service)+"\nPeople: "+v.people+"\nFinal bill: "+formatMoney(v.total)+"\nPer person: "+formatMoney(v.perPerson);
}
function fallbackCopy(text){
  const area=document.createElement("textarea");area.value=text;area.setAttribute("readonly","");area.style.position="fixed";area.style.opacity="0";document.body.appendChild(area);area.select();
  let ok=false;try{ok=document.execCommand("copy")}catch{}area.remove();return ok;
}
async function copyResult(){
  const text=resultText();
  if(!text){toast("Enter a bill amount first");return}
  try{
    if(navigator.clipboard&&window.isSecureContext){await navigator.clipboard.writeText(text);toast("Result copied")}
    else if(fallbackCopy(text)) toast("Result copied")
    else toast("Select and copy the result manually")
  }catch{if(fallbackCopy(text))toast("Result copied");else toast("Copy isn't available")}
}
async function shareResult(){
  const text=resultText();
  if(!text){toast("Enter a bill amount first");return}
  if(navigator.share){
    try{await navigator.share({title:"TipWise bill summary",text});toast("Share sheet opened")}catch(error){if(error.name!=="AbortError")toast("Sharing failed")}
  }else{await copyResult();toast("Sharing unavailable — result copied instead")}
}
function toast(message){const el=$("toast");el.textContent=message;el.classList.add("show");clearTimeout(window.tipwiseToast);window.tipwiseToast=setTimeout(()=>el.classList.remove("show"),1800)}
function setTheme(light){document.body.classList.toggle("light",light);localStorage.setItem("tipwise-light",light?"1":"0");$("themeBtn").textContent=light?"🌙":"☀️"}
function toggleAdvanced(){
  const open=$("advancedPanel").classList.toggle("open");$("advancedToggle").classList.toggle("open",open);$("advancedToggle").setAttribute("aria-expanded",String(open));
}
function toggleUnequal(){
  $("unequalPanel").style.display=$("unequalSplit").checked?"block":"none";calculate();
}

$("amount").addEventListener("input",calculate);$("tip").addEventListener("input",calculate);
$("people").addEventListener("input",()=>{$("people").value=Math.max(1,Math.floor(Number($("people").value)||1));calculate()});
$("currency").addEventListener("change",calculate);
["tax","service","customShare"].forEach(id=>$(id).addEventListener("input",calculate));
$("roundUp").addEventListener("change",calculate);$("unequalSplit").addEventListener("change",toggleUnequal);
$("minus").addEventListener("click",()=>changePeople(-1));$("plus").addEventListener("click",()=>changePeople(1));
$("reset").addEventListener("click",reset);$("save").addEventListener("click",saveCalculation);$("copyResult").addEventListener("click",copyResult);$("shareResult").addEventListener("click",shareResult);
$("clearHistory").addEventListener("click",()=>{localStorage.removeItem("tipwise-history");renderHistory();toast("History cleared")});
document.querySelectorAll(".preset").forEach(btn=>btn.addEventListener("click",()=>setTip(btn.dataset.tip)));
$("advancedToggle").addEventListener("click",toggleAdvanced);
$("themeBtn").addEventListener("click",()=>setTheme(!document.body.classList.contains("light")));

window.addEventListener("beforeinstallprompt",(event)=>{event.preventDefault();deferredPrompt=event;$("installBtn").hidden=false});
$("installBtn").addEventListener("click",async()=>{
  if(!deferredPrompt){toast("Install is available from your browser menu");return}
  deferredPrompt.prompt();const choice=await deferredPrompt.userChoice;deferredPrompt=null;$("installBtn").hidden=true;
  if(choice.outcome==="accepted")toast("TipWise installed");else toast("Install cancelled");
});
window.addEventListener("appinstalled",()=>{$("installBtn").hidden=true;toast("TipWise installed")});

loadPreferences();
if(localStorage.getItem("tipwise-light")==="1")setTheme(true);
calculate();renderHistory();
if("serviceWorker" in navigator)window.addEventListener("load",()=>navigator.serviceWorker.register("sw.js").catch(()=>{}));