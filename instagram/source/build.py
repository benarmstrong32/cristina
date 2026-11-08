D='/tmp/claude-0/-home-user-cristina/38073e3e-01d7-559b-b4ed-5653a7a83c2d/scratchpad/ig/'
base='''<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{font-family:G;src:url(node_modules/@fontsource/gelasio/files/gelasio-latin-400-normal.woff2)}
@font-face{font-family:G;font-style:italic;src:url(node_modules/@fontsource/gelasio/files/gelasio-latin-400-italic.woff2)}
:root{--ink:#454d3a;--paper:#fcf9f2;--peach:#f3d4bd;--sage:#edf0e5;--muted:#59634f;--line:#cdd3c3;--rust:#8a5237}
*{box-sizing:border-box}html,body{margin:0}
.post{width:1080px;height:1350px;position:relative;overflow:hidden;color:var(--ink);font-family:"Liberation Sans",Arial,sans-serif;
 background:radial-gradient(900px 640px at 95% -6%,rgba(243,212,189,.75),transparent 70%),radial-gradient(800px 700px at -10% 40%,rgba(205,217,194,.6),transparent 70%),var(--paper);padding:84px 88px}
.logo{width:250px;display:block}
.eyebrow{font-size:22px;letter-spacing:4px;text-transform:uppercase;font-weight:700;color:var(--ink)}
h1{font:400 104px/1.02 G,Georgia,serif;letter-spacing:-3px;margin:28px 0 30px}
h2{font:400 82px/1.06 G,Georgia,serif;letter-spacing:-2.2px;margin:26px 0 28px}
em{color:var(--rust);font-style:italic}
p{font-size:34px;line-height:1.5;color:var(--muted);margin:0 0 22px}
.foot{position:absolute;left:88px;right:88px;bottom:70px;display:flex;justify-content:space-between;align-items:center;font-size:25px;color:var(--ink);border-top:1.5px solid var(--line);padding-top:26px}
.foot b{font-weight:700}
.blossom{position:absolute;pointer-events:none}
.list{margin-top:10px;border-top:1.5px solid var(--line)}
.item{display:flex;gap:30px;padding:20px 0;border-bottom:1.5px solid var(--line);align-items:baseline}
.item .n{font-size:22px;color:var(--rust);font-weight:700;letter-spacing:1px;min-width:40px}
.item h3{font:400 40px/1.2 G,Georgia,serif;margin:0}
.item p{font-size:27px;margin:6px 0 0}
.chips{display:flex;gap:16px;flex-wrap:wrap;margin-top:34px}
.chip{border:1.5px solid var(--ink);border-radius:999px;padding:14px 26px;font-size:26px;background:rgba(255,254,249,.6)}
.photo{width:100%;height:440px;object-fit:cover;border-radius:120px 14px 14px 14px;box-shadow:18px 18px 0 -2px #f3d4bd}
.cta{background:#454d3a;color:#fcf9f2;border-radius:14px;padding:34px 40px;margin-top:34px}
.cta b{display:block;font:400 44px/1.2 G,Georgia,serif;margin-bottom:10px}
.cta span{font-size:29px;line-height:1.45;opacity:.92}
.quote{font:400 46px/1.35 G,Georgia,serif;border-left:4px solid var(--rust);padding-left:34px;margin:30px 0}
</style></head><body><div class="post">%s</div></body></html>'''
foot='<div class="foot"><span><b>atherpace.org</b></span><span>Help 24/7: 800-799-7233</span></div>'
posts={
'01-intro':'''<img class="logo" src="logo.png">
<div style="margin-top:70px" class="eyebrow">Free resource navigation · Across the U.S.</div>
<h1>Find support.<br><em>At your pace.</em></h1>
<p style="max-width:820px">If someone is hurting, frightening, or controlling you, you can explore your options. You don’t have to know what to call it or what comes next.</p>
<div class="chips"><span class="chip">All 50 states + DC</span><span class="chip">Rural support</span><span class="chip">No sign-up</span><span class="chip">No story required</span></div>
<img class="blossom" src="blossom.svg" style="width:330px;right:40px;bottom:150px;opacity:.95">
'''+foot,
'02-not-always-hitting':'''<div class="eyebrow">Understanding what’s happening</div>
<h2>Abuse isn’t<br><em>always hitting.</em></h2>
<div class="list">
<div class="item"><span class="n">01</span><div><h3>Words that wear you down</h3></div></div>
<div class="item"><span class="n">02</span><div><h3>Control and isolation</h3></div></div>
<div class="item"><span class="n">03</span><div><h3>Money used as a leash</h3></div></div>
<div class="item"><span class="n">04</span><div><h3>Watching and tracking</h3></div></div>
<div class="item"><span class="n">05</span><div><h3>Pressure around sex</h3></div></div>
<div class="item"><span class="n">06</span><div><h3>Threats and physical harm</h3></div></div>
</div>
<p style="margin-top:34px">If something feels wrong, you’re allowed to ask. <br>You don’t need a label first.</p>
<img class="blossom" src="sprig.svg" style="width:260px;right:-30px;top:40px;opacity:.9">
'''+foot,
'03-rural':'''<img class="photo" src="photo-forest-road.jpg">
<div style="margin-top:56px" class="eyebrow">Rural areas, small towns &amp; tribal lands</div>
<h2>Far from town.<br><em>Not far from help.</em></h2>
<p>Long drives. Weak signal. Neighbors who know your car. Support can still start today, without the drive.</p>
<div class="cta"><b>Call not private? Text instead.</b><span>Text START to 88788, 24/7. Advocates can find programs that serve your area.</span></div>
'''+foot,
'04-phone':'''<div class="eyebrow">Phone &amp; technology safety</div>
<h2>Worried about<br>your phone?<br><em>Trust that feeling.</em></h2>
<div class="list">
<div class="item"><span class="n">01</span><div><h3>Use a safer device to look for help.</h3><p>A library computer or a trusted friend’s phone.</p></div></div>
<div class="item"><span class="n">02</span><div><h3>Think before deleting apps.</h3><p>Removing a tracker suddenly can alert the other person.</p></div></div>
<div class="item"><span class="n">03</span><div><h3>Private browsing has limits.</h3><p>It can’t hide what you do from monitoring software.</p></div></div>
</div>
<div class="cta"><b>An advocate can help you plan.</b><span>Call 800-799-7233 or text START to 88788 from a safer device. More tips at atherpace.org.</span></div>
<img class="blossom" src="sprig.svg" style="width:240px;right:-20px;top:60px;opacity:.85">
'''+foot,
'05-quote':'''<img class="logo" src="logo.png" style="width:210px">
<div style="position:absolute;left:88px;right:88px;top:330px">
<div class="eyebrow">The next step is yours</div>
<h1 style="font-size:98px">You can look.<br>You can pause.<br><em>You can come back.</em></h1>
<p style="max-width:760px">There’s no timeline you have to follow.</p></div>
<img class="blossom" src="blossom.svg" style="width:360px;right:30px;bottom:140px">
'''+foot,
'06-worried-about-someone':'''<div class="eyebrow">Supporting someone you care about</div>
<h2>Worried about<br><em>someone?</em></h2>
<div class="quote">“I’m worried about you. I’m here whenever you want to talk.”</div>
<div class="list">
<div class="item"><span class="n">01</span><div><h3>Listen, and believe her.</h3></div></div>
<div class="item"><span class="n">02</span><div><h3>Respect her choices and timing.</h3></div></div>
<div class="item"><span class="n">03</span><div><h3>Offer practical help.</h3><p>A ride, a phone, a place to keep a bag.</p></div></div>
<div class="item"><span class="n">04</span><div><h3>Don’t confront the person hurting her.</h3><p>It can make things more dangerous.</p></div></div>
</div>
<div class="cta" style="padding:28px 40px"><b>Advocates support friends and family too.</b><span>Call 800-799-7233 for advice on how to help.</span></div>
'''+foot,
}
for k,v in posts.items(): open(D+k+'.html','w').write(base.replace('%s',v,1))
print(list(posts))
