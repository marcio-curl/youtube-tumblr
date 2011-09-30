// ==UserScript==
// @include http://kurhl.tumblr.com/*
// @include http://www.youtube.com/*
// ==/UserScript==
//
// Extrai as variáveis oauth_token e oauth_verifier derivadas do processo de autenticação
// OAuth e as envia para o script de fundo.

function getUrlVars() {
	var vars = {};
   var parts = window.location.search.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
   	vars[key] = value;
   });
   return vars;
}

window.addEventListener('load', function() {
  if (document.referrer.match(/^http[s]?\:\/\/www\.tumblr\.com\/oauth\/authorize/)) // Não vai funcionar se a url de autenticação mudar...
  {
	  vars = getUrlVars();
	  if (!!vars.oauth_token && !!vars.oauth_verifier)
	  {
		  widget.preferences.tumblrOAuthToken = vars.oauth_token;
		  widget.preferences.tumblrOAuthVerifier = vars.oauth_verifier;
    }
  }
}, false);

opera.extension.onmessage = function(event){
  console.log('Mensagem recebida: ' + event.data);
};