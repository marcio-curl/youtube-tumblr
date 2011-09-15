$(document).ready(function(){  
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
    $('#statusTumblr').text("Não autenticado...");
    
    tblrOauth.fetchRequestToken(function(url){   	 	
      //$('#statusTumblr').append(' <a href="' + url + '">Link</a>');
   	  window.open(url, 'Autorizar');

      setTimeout(aguardarAutorizacao, 100);

      function aguardarAutorizacao()
      {
			  if (!!widget.preferences.tumblrOAuthToken && !!widget.preferences.tumblrOAuthVerifier)
			  {		         	
				  tblrOauth.setVerifier(widget.preferences.tumblrOAuthVerifier);
          tblrOauth.fetchAccessToken(function(data){
            var token = $.parseQuery(data.text);
            widget.preferences.tumblrAccessToken = token.oauth_token;
		        widget.preferences.tumblrAccessTokenSecret = token.oauth_token_secret;
            testeOAuth();
          }, erro);

          // Exclui os tokens temporários
          delete widget.preferences.tumblrOAuthToken;
		      delete widget.preferences.tumblrOAuthVerifier;
        } 
			  else
        {
         	setTimeout(aguardarAutorizacao, 100);			 
  		  }
      }
    }, erro);    
  }
  else
  {
    tblrOauth.setAccessToken(widget.preferences.tumblrAccessToken, widget.preferences.tumblrAccessTokenSecret);
    testeOAuth();
  }
  
  function testeOAuth()
  {    
    tblrOauth.post("http://api.tumblr.com/v2/user/info", {}, function (data) {
      info = jQuery.parseJSON(data.text);
      $('#statusTumblr').text(info.meta.msg);
    }, erro);		
  }


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
    $('#statusYoutube').text("Não autenticado...");
    
    var token = '';
    ytOauth.request({
      method: 'POST',
      url: youtubeOAuthConf.requestTokenUrl,
      data: paramsGoogle,
      success: function(data){
        token = ytOauth.parseTokenRequest(data.text);   	 	
        $('#statusYoutube').append(' <a href="' + youtubeOAuthConf.authorizationUrl + '?oauth_token=' + token.oauth_token + '">Link</a>');
//   	    window.open(youtubeOAuthConf.authorizationUrl + '?oauth_token=' + token.oauth_token, 'Autorizar');
        setTimeout(aguardarAutorizacao2, 100);
        
        function aguardarAutorizacao2()
        {
			    if (!!widget.preferences.youtubeOAuthToken && !!widget.preferences.youtubeOAuthVerifier)
			    {		         	
				    ytOauth.setVerifier(widget.preferences.youtubeOAuthVerifier);
				    // o youtube exige uma pré autenticação
				    ytOauth.setAccessToken(decodeURIComponent(token.oauth_token), decodeURIComponent(token.oauth_token_secret));
            ytOauth.fetchAccessToken(function(data){
              token = $.parseQuery(data.text);
              // guarda os tokens decodificados
              widget.preferences.youtubeAccessToken = decodeURIComponent(token.oauth_token);
		          widget.preferences.youtubeAccessTokenSecret = decodeURIComponent(token.oauth_token_secret);
              testeOAuth2();
            }, erro);

            // Exclui os tokens temporários
            delete widget.preferences.youtubeOAuthToken;
		        delete widget.preferences.youtubeOAuthVerifier;
          } 
			    else
         	  setTimeout(aguardarAutorizacao2, 100);			 
        }
      },
      failure: erro
    });    
  }        
  else
  {
    ytOauth.setAccessToken(widget.preferences.youtubeAccessToken, widget.preferences.youtubeAccessTokenSecret);
    testeOAuth2();
  }
  
  function testeOAuth2()
  { 
    ytOauth.get("https://gdata.youtube.com/feeds/api/users/default?v=2&alt=json", function (data) {
      info = jQuery.parseJSON(data.text);
      $('#statusYoutube').text("OK");
    }, erro);		
  }


  function erro(texto)
  {
    alert("Erro: " + texto.text); // Melhorar a chamada de erro.
  }
});