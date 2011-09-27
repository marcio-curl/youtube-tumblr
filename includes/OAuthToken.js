// ==UserScript==
// @include http://kurhl.tumblr.com/*
// @include http://www.youtube.com/*
// ==/UserScript==
//
// Extrai as variáveis oauth_token e oauth_verifier derivadas do processo de autenticação
// OAuth e as envia para o script de fundo.

// Isso vai deixar de funcionar se a url de autenticação mudar.
var tumblrAuthUrl = 'http://www.tumblr.com/oauth/authorize';
var youtubeAuthUrl = 'http://www.youtube.com/oauth_authorize_token';

function getUrlVars() {
	var vars = {};
   var parts = window.location.search.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
   	vars[key] = value;
   });
   return vars;
}

window.addEventListener('load', function(){
  if (document.referrer.search(tumblrAuthUrl) == 0) 
    enviaToken('tumblr');
  else if(document.referrer.search(youtubeAuthUrl) == 0)
    enviaToken('youtube');

  function enviaToken(servico)
  {
  	vars = getUrlVars();
	  if (!!vars.oauth_token && !!vars.oauth_verifier)
	  {
	    vars.servico = servico;
	    opera.extension.postMessage(vars); // Envia os tokens para o script de fundo
    }
  }
}, false);
