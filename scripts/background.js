var OAuthTmpToken = new Object();

// o que fazer quando conectado...
opera.extension.onconnect = function(evento){
//  console.log('conectado');
};

// Guarda os tokens temporários
opera.extension.onmessage = function(evento){
  console.log('token recebido');
  OAuthTmpToken[evento.data.servico] = new Object;
  OAuthTmpToken[evento.data.servico].oauthToken = evento.data.oauth_token;
  OAuthTmpToken[evento.data.servico].oauthVerifier = evento.data.oauth_verifier;
};

window.addEventListener('load', function() {

  // Define uma página local para abertura no SpeedDial.
  if (opera.contexts.speeddial)
    opera.contexts.speeddial.url = "popup.html";

}, false);