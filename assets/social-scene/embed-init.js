(function(){
    'use strict';
    const query=new URLSearchParams(location.search),popout=window.parent===window&&query.get('popout')==='1'&&window.opener;
    if((window.parent===window&&!popout)||query.get('embed')!=='portfolio')return;
    document.documentElement.dataset.portfolioEmbed='true';
    if(popout)document.documentElement.dataset.portfolioPopout='true';
    document.documentElement.dataset.portfolioTheme=new URLSearchParams(location.search).get('portfolio-theme')==='light'?'light':'dark';
})();
