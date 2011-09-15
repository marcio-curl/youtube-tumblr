// ==UserScript==
// @include http://www.youtube.com/*
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
	vars = getUrlVars();
	if (!!vars.oauth_token && !!vars.oauth_verifier)
	{
		widget.preferences.youtubeOAuthToken = vars.oauth_token;
		widget.preferences.youtubeOAuthVerifier = vars.oauth_verifier;
  }
}, false);
