$(document).ready(function(){
  /* ---------- Autenticação Tumblr ---------- */  
  var tumblrOAuthConf = {
    consumerKey: 'pvd39CXQNrkrRVFO4HYsU6tRsIXp3pruNochbKqlIn7oEqnOYX',
    consumerSecret: 'nlyl5isbPTkl0PUBgrol78zqtI0dZgQDrPt1SB6AXv2MDhXAUz',
    callbackUrl: 'http://kurhl.tumblr.com',
    requestTokenUrl: 'http://www.tumblr.com/oauth/request_token',
    authorizationUrl: 'http://www.tumblr.com/oauth/authorize',
    accessTokenUrl: 'http://www.tumblr.com/oauth/access_token'
  };

  var tblrOauth = new OAuth(tumblrOAuthConf);
  if (!widget.preferences.tumblrAccessToken || !widget.preferences.tumblrAccessTokenSecret)
  {
    tblrOauth.fetchRequestToken(function(url){   	 	
      $('#statusTumblr').html(' <a href="' + url + '">Autenticar</a>'); // O link deixará de funcionar se o pedido for negado...
      $('#trocarTumblr').hide();
   	  //window.open(url, 'Autorizar');

      setTimeout(aguardarAutorizacaoTumblr, 100);
    }, erro);    
  }
  else
  {
    tblrOauth.setAccessToken(widget.preferences.tumblrAccessToken, widget.preferences.tumblrAccessTokenSecret);
    testeOAuthTumblr();
  }

  // Para o botão de reautenticação
  $('#trocarTumblr').click(function(){
    tblrOauth.fetchRequestToken(function(url){
      $('#trocarTumblr').attr('disabled', 'disabled');
      window.open(url);
      setTimeout(aguardarAutorizacaoTumblr, 100);
    }, erro);
  });

  function aguardarAutorizacaoTumblr()
  {
	  if (!!widget.preferences.tumblrOAuthToken && !!widget.preferences.tumblrOAuthVerifier)
		{		         	
		  tblrOauth.setVerifier(widget.preferences.tumblrOAuthVerifier);
      tblrOauth.fetchAccessToken(function(data){
        var token = $.parseQuery(data.text);
        widget.preferences.tumblrAccessToken = token.oauth_token;
		    widget.preferences.tumblrAccessTokenSecret = token.oauth_token_secret;
        testeOAuthTumblr();
      }, erro);

      // Exclui os tokens temporários
      delete widget.preferences.tumblrOAuthToken;
		  delete widget.preferences.tumblrOAuthVerifier;
    } 
	  else
    {
      setTimeout(aguardarAutorizacaoTumblr, 100);			 
    }
  }

  function testeOAuthTumblr()
  {
    tblrOauth.post("http://api.tumblr.com/v2/user/info", {}, function (data) {
      info = jQuery.parseJSON(data.text);
      $('#statusTumblr').text(info.response.user.name);
      $('#trocarTumblr').removeAttr('disabled').show();
      
      for (i in info.response.user.blogs)
      { 
        $('#blogTumblr').append('<option>' + info.response.user.blogs[i].name + '</option>'); // ###Fazer a separação desse trecho
      }
    }, erro);
  }

  /* ---------- Autenticação YouTube ---------- */  
  var youtubeOAuthConf = {
    consumerKey: 'anonymous',
    consumerSecret: 'anonymous',
    callbackUrl: 'http://www.youtube.com',
    requestTokenUrl: 'https://www.google.com/accounts/OAuthGetRequestToken',
    authorizationUrl: 'https://www.google.com/accounts/OAuthAuthorizeToken',
    accessTokenUrl: 'https://www.google.com/accounts/OAuthGetAccessToken'
  };

  var gdataDevKey = 'AI39si7j4-AcJHD-9-O3-yL1CZIIlXDEyTKyQU6rKYE8aclHeAheWFEI_8nF2YxAPM_nh1f_kuYtVhy3CmNajtNDquDNWVPjCA';
  var paramsGoogle = {
    'scope': 'https://gdata.youtube.com'
  };

  var ytOauth = new OAuth(youtubeOAuthConf);  
  // se não está autenticado...
  if (!widget.preferences.youtubeAccessToken || !widget.preferences.youtubeAccessTokenSecret)
  {    
    var token = '';
    // Fazemos "na mão" por causa do parâmetro scope
    // ### Fazer uma função com parâmetros...
    ytOauth.request({
      method: 'POST',
      url: youtubeOAuthConf.requestTokenUrl,
      data: paramsGoogle,
      success: function(data){
        token = ytOauth.parseTokenRequest(data.text);  	 	
        $('#statusYoutube').html(' <a href="' + youtubeOAuthConf.authorizationUrl + '?oauth_token=' + token.oauth_token + '">Autenticar</a>');
        $('#trocarYoutube').hide();

        setTimeout(aguardarAutorizacaoYoutube, 100);
      },
      failure: erro
    });    
  }        
  else
  {
    ytOauth.setAccessToken(widget.preferences.youtubeAccessToken, widget.preferences.youtubeAccessTokenSecret);
    testeOAuthYoutube();
  }
    
  // Para o botão de reautenticação
  $('#trocarYoutube').click(function(){
    token = '';
    ytOauth.request({
      method: 'POST',
      url: youtubeOAuthConf.requestTokenUrl,
      data: paramsGoogle,
      success: function(data){
        $('#trocarYoutube').attr('disabled', 'disabled');
        token = ytOauth.parseTokenRequest(data.text);  	 	
        window.open(youtubeOAuthConf.authorizationUrl + '?oauth_token=' + token.oauth_token);
        
        setTimeout(aguardarAutorizacaoYoutube, 100);
      },
      failure: erro
    });    
  });

  function aguardarAutorizacaoYoutube()
  {
    if (!!widget.preferences.youtubeOAuthToken && !!widget.preferences.youtubeOAuthVerifier)
	  {		         	
	    ytOauth.setVerifier(widget.preferences.youtubeOAuthVerifier);
		  // o YouTube exige uma pré autenticação
		  ytOauth.setAccessToken(decodeURIComponent(token.oauth_token), decodeURIComponent(token.oauth_token_secret));
      ytOauth.fetchAccessToken(function(data){
        token = $.parseQuery(data.text);
        // guarda os tokens de acesso decodificados
        widget.preferences.youtubeAccessToken = decodeURIComponent(token.oauth_token);
		    widget.preferences.youtubeAccessTokenSecret = decodeURIComponent(token.oauth_token_secret);
        testeOAuthYoutube();
      }, erro);

      // Exclui os tokens temporários
      delete widget.preferences.youtubeOAuthToken;
		  delete widget.preferences.youtubeOAuthVerifier;
    } 
    else
      setTimeout(aguardarAutorizacaoYoutube, 100);			 
  }

  function testeOAuthYoutube()
  {
    ytOauth.get("https://gdata.youtube.com/feeds/api/users/default?v=2&alt=json", function(data) {
      info = jQuery.parseJSON(data.text);
      $('#statusYoutube').text(info.entry.yt$username.$t);
      $('#trocarYoutube').removeAttr('disabled').show();
    }, erro);
    
    ytOauth.get("https://gdata.youtube.com/feeds/api/users/default/playlists?v=2&alt=jsonc", function(data){
      info = jQuery.parseJSON(data.text);
      for (i in info.data.items)
      {
        $('#playlistYoutube').append('<option>' + info.data.items[i].title + '</option>');
      }
    });
  }

  // Todos os erros caem aqui
  function erro(texto)
  {
    $('#erros').addClass('error').text(texto.text);
  }
});

// Links em nova janela ###(tornar isso mais específico)
$('a').click(function(){
  alert($(this).attr('href'));
  window.open($(this).attr('href'));
});