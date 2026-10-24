/* إضافات مصروفي: المحفظة اليومية + المصروف الكامل. لا تغيّر مفتاح التخزين ولا المصروفات القديمة. */
(function(){
S.wallet=S.wallet||{};S.funds=S.funds||[];if(!(S.usd>0))S.usd=0.71;
const CUR={jod:["دينار","د"],usd:["دولار","$"],ils:["شيكل","₪"]};
let fc="jod";
const mn=ym=>{const[a,b]=ym.split("-").map(Number);return a*12+b-1};
const toJ=f=>f.c==="usd"?f.a*S.usd:f.c==="ils"?f.a/rate():f.a;
const main=document.querySelector("main");

const w=document.createElement("section");w.className="card";
w.innerHTML=`<h2>💼 المحفظة</h2>
<label for="wal">كم كاش معك في المحفظة هذا اليوم؟ (دينار)</label>
<input id="wal" type="number" inputmode="decimal" min="0" step="any" placeholder="مثال: 20">
<div class="sum gap"><span>صرفت كاش في هذا اليوم</span><b id="wsp"></b></div>
<div class="sum"><span>المتبقي في المحفظة</span><b id="wlf"></b></div>`;
document.querySelector(".hero").after(w);

const f=document.createElement("section");f.className="card";
f.innerHTML=`<h2>💰 مصروفي الكامل</h2>
<div class="sum"><span>إجمالي الأموال</span><b id="ft"></b></div>
<div class="sum"><span>إجمالي ما صرفته</span><b id="fs"></b></div>
<div class="sum"><span>المتبقي</span><b id="fr"></b></div>
<div class="sum"><span>حصة هذا الشهر</span><b id="fm"></b></div>
<div class="sum"><span>صرفت هذا الشهر</span><b id="fms"></b></div>
<div class="sum"><span>المتبقي من حصة الشهر</span><b id="fml"></b></div>
<div id="flist"></div>
<h2 style="margin-top:14px">إضافة مبلغ</h2>
<div class="pair"><div><label for="fa">المبلغ</label><input id="fa" class="amt" type="number" inputmode="decimal" min="0" step="any" placeholder="0"></div>
<div><label>العملة</label><div class="chips" id="fcur" style="margin:4px 0 0"><button type="button" class="chip on" data-k="jod">دينار</button><button type="button" class="chip" data-k="usd">دولار</button><button type="button" class="chip" data-k="ils">شيكل</button></div></div></div>
<div class="pair gap"><div><label for="fmo">قسّمه على كم شهر؟</label><input id="fmo" type="number" inputmode="numeric" min="1" step="1" value="1"></div>
<div><label for="fst">يبدأ من شهر</label><input id="fst" type="month"></div></div>
<div class="gap"><label for="fn">ملاحظة (اختياري)</label><input id="fn" type="text" maxlength="40"></div>
<button class="add" id="fadd">إضافة</button>
<div class="gap"><label for="usd">1 دولار = كم دينار؟</label><input id="usd" type="number" inputmode="decimal" min="0" step="any"></div>`;
main.lastElementChild.before(f);
$("fst").value=todayS.slice(0,7);$("usd").value=S.usd;

function ex(){
  S.wallet=S.wallet||{};S.funds=S.funds||[];if(!(S.usd>0))S.usd=0.71;
  const wv=S.wallet[day];
  if(document.activeElement!==$("wal"))$("wal").value=wv==null?"":wv;
  const cs=sum(byDay(day).filter(x=>x.p!=="visa"));
  $("wsp").textContent=jd(cs)+" د";
  $("wlf").innerHTML=wv==null?"—":`<span class="${wv-cs>=0?"pos":"neg"}">${jd(wv-cs)} د</span>`;
  const ym=day.slice(0,7),tot=S.funds.reduce((s,x)=>s+toJ(x),0),sp=sum(S.items);
  const share=S.funds.reduce((s,x)=>{const d=mn(ym)-mn(x.s);return d>=0&&d<x.m?s+toJ(x)/x.m:s},0);
  const ms=sum(S.items.filter(x=>x.d.startsWith(ym)));
  const D=n=>jd(n)+" د";
  $("ft").textContent=D(tot);$("fs").textContent=D(sp);
  $("fr").innerHTML=`<span class="${tot-sp>=0?"pos":"neg"}">${D(tot-sp)}</span>`;
  $("fm").textContent=D(share);$("fms").textContent=D(ms);
  $("fml").innerHTML=`<span class="${share-ms>=0?"pos":"neg"}">${D(share-ms)}</span>`;
  $("flist").innerHTML=S.funds.length?S.funds.map(x=>`<div class="row"><div class="ic">💰</div><div class="m"><b>${jd(x.a)} ${CUR[x.c][0]}</b><span>${x.m>1?"موزّعة على "+x.m+" أشهر من "+esc(x.s):"شهر "+esc(x.s)}${x.n?" · "+esc(x.n):""}</span></div><div class="p">${jd(toJ(x))} د</div><button class="x" data-id="${x.id}" aria-label="حذف">✕</button></div>`).join(""):`<div class="empty">أضف مبلغاً مثل 1000 دولار أو 2000 دينار.</div>`;
}
const old=render;render=function(){old();ex()};

$("wal").oninput=e=>{const v=parseFloat(e.target.value);if(v>=0)S.wallet[day]=v;else delete S.wallet[day];save();ex()};
$("fcur").onclick=e=>{const b=e.target.closest(".chip");if(!b)return;fc=b.dataset.k;[...$("fcur").children].forEach(x=>x.classList.toggle("on",x===b))};
$("fadd").onclick=()=>{const a=parseFloat($("fa").value);if(!(a>0)){$("fa").focus();return}
  S.funds.push({id:Date.now()+Math.random().toString(36).slice(2,6),a:a,c:fc,m:Math.max(1,parseInt($("fmo").value)||1),s:$("fst").value||todayS.slice(0,7),n:$("fn").value.trim()});
  $("fa").value="";$("fn").value="";save();ex()};
$("flist").onclick=e=>{const b=e.target.closest(".x");if(!b)return;S.funds=S.funds.filter(x=>x.id!==b.dataset.id);save();ex()};
$("usd").oninput=e=>{S.usd=parseFloat(e.target.value)||0.71;save();ex()};
ex();
})();
