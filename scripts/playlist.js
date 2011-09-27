var background = opera.extension.bgProcess;
var preferencias = widget.preferences;

// Autenticação OAuth no Tumblr
var oauthTumblr = new OAuth({
  consumerKey: 'pvd39CXQNrkrRVFO4HYsU6tRsIXp3pruNochbKqlIn7oEqnOYX',
  consumerSecret: 'nlyl5isbPTkl0PUBgrol78zqtI0dZgQDrPt1SB6AXv2MDhXAUz',
  callbackUrl: 'http://kurhl.tumblr.com',
  requestTokenUrl: 'http://www.tumblr.com/oauth/request_token',
  authorizationUrl: 'http://www.tumblr.com/oauth/authorize',
  accessTokenUrl: 'http://www.tumblr.com/oauth/access_token'  
});

// Autenticação OAuth no YouTube
var oauthYouTube = new OAuth({
  consumerKey: 'anonymous',
  consumerSecret: 'anonymous',
  callbackUrl: 'http://www.youtube.com',
  requestTokenUrl: 'https://www.google.com/accounts/OAuthGetRequestToken',
  authorizationUrl: 'https://www.google.com/accounts/OAuthAuthorizeToken',
  accessTokenUrl: 'https://www.google.com/accounts/OAuthGetAccessToken'
});

$(document).ready(function(){
  // Mostra as opções
  $('nav.opcoes > a').click(function(){
    $('article.opcoes').show();
    /* ---------- Autenticação no Tumblr ---------- */

    /* metodo: GET, POST, ou outro;
       url: a url com as informações do usuário;
       data: parâmetros a serem enviados; 
       callback: a função que dirá o que fazer com os dados recebidos na url */ 
    var paramsTesteTumblr = {
      metodo: 'POST',
      url: 'http://api.tumblr.com/v2/user/info',
    };
  
    if (!preferencias.tumblrAccessToken || !preferencias.tumblrAccessTokenSecret)
    {
      /* Trecho que poderia ficar sem template */
      /*
      var authUrl = {url: 'www.weigay.com'};
      // $(<do script>).tmpl(<variável com os dados>).appendTo(<onde será colocado>);
      $('#authLink').tmpl(authUrl).appendTo('#tumblrAuth');
      */
    
      //obterTokens(oauthTumblr, 'tumblr', '#tumblrAuth');
      obterTokens(oauthTumblr, 'tumblr', {}, function(link){
        $('#tumblrAuth').html('<a href="' + link + '">Autenticar</a>');        
      });
    }
    else
    {
      oauthTumblr.setAccessToken(preferencias.tumblrAccessToken, preferencias.tumblrAccessTokenSecret);
      //alert(oauthTumblr.requestTokenUrl);
      reqOAuth(oauthTumblr, paramsTesteTumblr, function(data){
        $('#tumblrAuth').text('Autenticado como ' + data.response.user.name);
        $('#blogTumblr').html('<option></option>');
        // Lista os blogs
        $.each(data.response.user.blogs, function(i, blog){
          $('#blogTumblr').append('<option value="' + blog.name + '">' + blog.name + '</option>');          
        });
        
        if (!!preferencias.blogTumblr)
          $('#blogTumblr option[value="' + preferencias.blogTumblr + '"]').attr('selected', 'selected');
      });
    }

    $('#blogTumblr').change(function(){
      preferencias.blogTumblr = $('#blogTumblr option:selected').text();
    });

    /* ---------- Autenticação no YouTube ---------- */
    var paramsTesteYouTube = {
      metodo: 'GET',
      url: 'https://gdata.youtube.com/feeds/api/users/default?v=2&alt=json',
    };
  
    var paramsGoogle = {
      scope: 'https://gdata.youtube.com'
    }

    if (!preferencias.youtubeAccessToken || !preferencias.youtubeAccessTokenSecret)
    {
      obterTokens(oauthYouTube, 'youtube', paramsGoogle, function(link){
        $('#youtubeAuth').html('<a href="' + link + '">Autenticar</a>');
      });
    }
    else
    {
      oauthYouTube.setAccessToken(preferencias.youtubeAccessToken, preferencias.youtubeAccessTokenSecret);
      reqOAuth(oauthYouTube, paramsTesteYouTube, function(data){
        $('#youtubeAuth').text('Autenticado como ' + data.entry.yt$username.$t);
      });
      reqOAuth(oauthYouTube, { metodo: 'GET', url: 'https://gdata.youtube.com/feeds/api/users/default/playlists?v=2&alt=jsonc' }, function(info){
        $('#playlistYouTube').html('<option></option>');
        $.each(info.data.items, function(i, playlist){
          $('#playlistYouTube').append('<option value=' + playlist.id + '>' + playlist.title + '</option>');          
        });
        
        // ###acho que isso poderia ficar melhor...
        if (!!preferencias.playlistYouTube)
          $('#playlistYouTube option[value="' + preferencias.playlistYouTube + '"]').attr('selected', 'selected');
      });
    }

    $('#playlistYouTube').change(function(){
      preferencias.playlistYouTube = $('#playlistYouTube option:selected').val(); // está gerando uma mensagem de erro, mas funciona
      window.location.reload();
    });


    /* oauth: objeto jsOAuth
     params: objeto com o nome do serviço e parâmetros adicionais como o scope do YouTube 
     callback: o que fazer depois que obtemos o token e a url de autenticação */
    function obterTokens(oauth, servico, params, callback)
    {
      var requestToken = new Object(); // Variável que armazenará os tokens temporários  
    
      oauth.request({
        method: 'POST',
        url: oauth.requestTokenUrl,
        data: params,
        success: function(data){
          requestToken = oauth.parseTokenRequest(data.text);
          var url = oauth.authorizationUrl + '?oauth_token=' + requestToken.oauth_token;
          callback(url);
          setTimeout(aguardarAutoriz, 100);
        },
        failure: erro
      });
    
      // Irá verificar se os tokens temporários foram definidos no script de fundo.
      function aguardarAutoriz()
      {
        if (!!background.OAuthTmpToken[servico])
        {
          oauth.setVerifier(background.OAuthTmpToken[servico].oauthVerifier);
          // Faz uma pré-autenticação (necessária para o YouTube)
          oauth.setAccessToken(requestToken.oauth_token, requestToken.oauth_token_secret);
  
          // obtemos o token de acesso e guardamos para uso futuro
          oauth.fetchAccessToken(function(data){
            var tokens = $.parseQuery(data.text);
            preferencias[servico + 'AccessToken'] = decodeURIComponent(tokens.oauth_token);
            preferencias[servico + 'AccessTokenSecret'] = decodeURIComponent(tokens.oauth_token_secret);
  
            window.location.reload() // Não é a melhor solução...
          }, erro);
          
          delete background.OAuthTmpToken[servico];
        }   
        else
          setTimeout(aguardarAutoriz, 100);
      }    
    }
  });
  // Fim das opções

  /* ---------- Lista de vídeos ---------- */  
  if (!preferencias.tumblrAccessToken || !preferencias.tumblrAccessTokenSecret || !preferencias.youtubeAccessToken || !preferencias.youtubeAccessTokenSecret)
    $('nav.opcoes > a').trigger('click');
  else
  {
    oauthYouTube.setAccessToken(preferencias.youtubeAccessToken, preferencias.youtubeAccessTokenSecret);
    if (!!preferencias.blogTumblr && !!preferencias.playlistYouTube)
      reqOAuth(oauthYouTube, { 
        metodo: 'GET', 
        url: 'https://gdata.youtube.com/feeds/api/playlists/' + preferencias.playlistYouTube + '?alt=jsonc&v=2' 
        }, function(data){
          $.each(data.data.items, function(i, item){
            if (!!item.video.thumbnail)
              $('article.lista').append('<p><img src="' + item.video.thumbnail.sqDefault + '" alt="Thumb"></p>')
            $('article.lista').append('<p>' + item.video.title + '</p>')
            $('article.lista').append('<p>' + item.video.description + '</p>')
//            console.log(item.video.title);                  
          });
      });
  }
  

  /* Função para obtermos os nomes de usuário dos serviços.
  oauth: objeto jsOAuth.
  params: objeto com o modo de conexão (GET, POST, ...), a url e a callback com o que deve ser feito */
  function reqOAuth(oauth, params, callback)
  {
    oauth.request({
      method: params.metodo,
      url: params.url,
      data: params.data,
      success: function(data){
        info = jQuery.parseJSON(data.text);
        callback(info);
      },
      failure: erro
    });
  }

  // Todos os erros caem aqui
  function erro(texto)
  {
    $('#erros').addClass('error').text(texto.text);
  }
});

// Links em nova janela
$('article.opcoes a').click(function(){
  window.open($(this).attr('href'));
});