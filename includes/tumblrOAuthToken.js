// ==UserScript==
// @include http://kurhl.tumblr.com/*
// ==/UserScript==
//
// Extrai as variáveis oauth_token e oauth_verifier derivadas do processo de autenticação
// OAuth e as guarda nas configurações locais da extensão. 

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
