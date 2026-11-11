(function(){
  var d=document,b=d.body;
  // Quick exit: leave immediately and replace this page in history
  d.querySelectorAll('[data-quick-exit]').forEach(function(btn){
    btn.addEventListener('click',function(){ try{window.open('https://www.weather.com','_blank');}catch(e){} window.location.replace('https://www.google.com'); });
  });
  d.addEventListener('keydown',function(e){ if(e.key==='Escape' && e.shiftKey){ window.location.replace('https://www.google.com'); } });

  // Header shadow on scroll
  var h=d.querySelector('.site-header');
  function onScroll(){ if(h) h.classList.toggle('scrolled',window.scrollY>8); }
  window.addEventListener('scroll',onScroll,{passive:true}); onScroll();

  // Mobile menu
  var t=d.querySelector('.menu-toggle');
  if(t){ t.addEventListener('click',function(){ var o=b.classList.toggle('nav-open'); t.setAttribute('aria-expanded',o); }); }
  d.querySelectorAll('.sub-toggle').forEach(function(s){
    s.addEventListener('click',function(){ var li=s.parentElement, o=li.classList.toggle('open'); s.setAttribute('aria-expanded',o); });
  });
  d.addEventListener('click',function(e){ d.querySelectorAll('.has-sub.open').forEach(function(li){ if(!li.contains(e.target) && window.innerWidth>1020){ li.classList.remove('open'); } }); });

  // Gentle reveal
  var els=d.querySelectorAll('.reveal');
  if('IntersectionObserver' in window){
    var io=new IntersectionObserver(function(es){ es.forEach(function(en){ if(en.isIntersecting){ en.target.classList.add('in'); io.unobserve(en.target);} }); },{rootMargin:'0px 0px -8% 0px'});
    els.forEach(function(el){ io.observe(el); });
  } else { els.forEach(function(el){ el.classList.add('in'); }); }

  // TOC active state
  var links=d.querySelectorAll('.toc a');
  if(links.length && 'IntersectionObserver' in window){
    var map={}; links.forEach(function(a){ map[a.getAttribute('href').slice(1)]=a; });
    var to=new IntersectionObserver(function(es){ es.forEach(function(en){ if(en.isIntersecting){ links.forEach(function(a){a.classList.remove('active');}); var a=map[en.target.id]; if(a) a.classList.add('active'); } }); },{rootMargin:'-20% 0px -70% 0px'});
    Object.keys(map).forEach(function(id){ var el=d.getElementById(id); if(el) to.observe(el); });
  }

  // Contact form: opens the visitor's email app with the message filled in
  var f=d.getElementById('contact-form');
  if(f){
    f.addEventListener('submit',function(e){
      e.preventDefault();
      var v=function(n){ return (f.elements[n] && f.elements[n].value || '').trim(); };
      var body='Name: '+v('name')+'\nEmail: '+v('email')+'\nPhone: '+v('phone')+'\nBest way to reach me: '+v('method')+'\nI\'m interested in: '+v('interest')+'\n\n'+v('message');
      window.location.href='mailto:'+f.dataset.to+'?subject='+encodeURIComponent('New client inquiry from '+(v('name')||'website'))+'&body='+encodeURIComponent(body);
      var s=d.getElementById('form-status'); if(s){ s.textContent='Thank you. Your email app should open with your message ready to send. If it doesn’t, you can call (704) 284-9288.'; }
    });
  }
  var y=d.getElementById('year'); if(y) y.textContent=new Date().getFullYear();
})();
