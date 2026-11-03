(function(){
  const isGamePage=document.currentScript?.hasAttribute('data-game-page');

  function isNovember(date){
    return date.getMonth() === 10;
  }

  function getSelectedTheme(){
    const now=new Date();
    const christmasUnlocked=now>=new Date(2026,11,1);
    const christmasActive=now>=new Date(2026,11,1)&&now<new Date(2026,11,26);
    try{
      const settings = JSON.parse(localStorage.getItem('gameRoomSettings') || '{}');
      if(settings.siteTheme==='christmas'&&!christmasUnlocked){
        return isNovember(new Date())?'thanksgiving':'normal';
      }
      if(['thanksgiving','christmas','normal'].includes(settings.siteTheme)){
        return settings.siteTheme;
      }
    }catch{}
    if(christmasActive) return 'christmas';
    return isNovember(now) ? 'thanksgiving' : 'normal';
  }

  function applySeason(){
    const now = new Date();
    const selectedTheme = getSelectedTheme();
    document.documentElement.dataset.season =
      selectedTheme === 'thanksgiving' ? 'thanksgiving' :
      selectedTheme === 'christmas' ? 'christmas' :
      'standard';
    document.documentElement.dataset.siteTheme = selectedTheme;

    if(selectedTheme === 'thanksgiving'||selectedTheme === 'christmas'){
      if(isGamePage){
        document.documentElement.dataset.gameSeason=selectedTheme;
        document.querySelector('.thanksgiving-banner')?.remove();
        if(document.body&&!document.querySelector('.game-season-chip')){
          const chip=document.createElement('div');
          chip.className='game-season-chip';
          chip.setAttribute('aria-label',selectedTheme==='christmas'?'Christmas theme active':'Thanksgiving theme active');
          chip.textContent=selectedTheme==='christmas'?'🎄':'🍂';
          document.body.appendChild(chip);
        }
        const chip=document.querySelector('.game-season-chip');
        if(chip)chip.textContent=selectedTheme==='christmas'?'🎄':'🍂';
      }else if(document.body && !document.querySelector('.thanksgiving-banner')){
        const banner = document.createElement('div');
        banner.className = 'thanksgiving-banner';
        banner.setAttribute('role', 'status');
        banner.innerHTML = selectedTheme === 'christmas'
          ? '<span aria-hidden="true">🎄</span><span>Merry Christmas!</span><span aria-hidden="true">🎁</span>'
          : '<span aria-hidden="true">🍂</span><span>Happy Thanksgiving!</span><span aria-hidden="true">🦃</span>';
        document.body.insertBefore(banner, document.body.firstChild);
      }else if(document.body){
        const banner=document.querySelector('.thanksgiving-banner');
        banner.innerHTML=selectedTheme === 'christmas'
          ? '<span aria-hidden="true">🎄</span><span>Merry Christmas!</span><span aria-hidden="true">🎁</span>'
          : '<span aria-hidden="true">🍂</span><span>Happy Thanksgiving!</span><span aria-hidden="true">🦃</span>';
      }
    }else{
      document.querySelector('.thanksgiving-banner')?.remove();
      document.querySelector('.game-season-chip')?.remove();
    }
  }

  applySeason();

  function scheduleNextUpdate(){
    const now = new Date();
    const boundaries=[
      new Date(now.getFullYear(),10,1,0,0,1),
      new Date(now.getFullYear(),11,1,0,0,1),
      new Date(now.getFullYear(),11,26,0,0,1),
      new Date(now.getFullYear()+1,0,1,0,0,1)
    ];
    const nextBoundary=boundaries.find(date=>date.getTime()>now.getTime())
      ||new Date(now.getFullYear()+1,0,1,0,0,1);
    window.setTimeout(function updateSeason(){
      applySeason();
      scheduleNextUpdate();
    }, nextBoundary.getTime() - now.getTime());
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', applySeason);
  }else{
    applySeason();
  }
  window.addEventListener('storage', function(event){
    if(event.key === 'gameRoomSettings'){
      applySeason();
    }
  });
  window.addEventListener('gameRoomSettingsChanged', applySeason);
  scheduleNextUpdate();
})();
