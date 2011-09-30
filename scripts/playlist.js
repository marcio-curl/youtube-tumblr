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
  /* ---------- Autenticação no YouTube ---------- */  
  // Verifica se já possuimos os tokens de acesso
  if (!preferencias.youtubeAccessToken || !preferencias.youtubeAccessTokenSecret)
  {
    obterTokens(oauthYouTube, 'youtube', { scope: 'https://gdata.youtube.com' }, function(link){
      $('#youtubeAuth').html('<a href="' + link + '">Autenticar</a>');
    });
  }
  else
  {
    oauthYouTube.setAccessToken(preferencias.youtubeAccessToken, preferencias.youtubeAccessTokenSecret);

    /* ---------- Opções do YouTube ---------- */  
    // Obtém o nome de usuário da conta associada no YouTube
    reqOAuth(oauthYouTube, {
      metodo: 'GET',
      url: 'https://gdata.youtube.com/feeds/api/users/default?v=2&alt=json',
    }, function(data){
      $('#youtubeAuth').text('Autenticado como ' + data.entry.yt$username.$t);
    });

    // Obtém a lista de playlists
    reqOAuth(oauthYouTube, {
      metodo: 'GET',
      url: 'https://gdata.youtube.com/feeds/api/users/default/playlists?v=2&alt=jsonc' 
    }, function(info){
      $('#playlistYouTube').html('<option></option>');
      $.each(info.data.items, function(i, playlist){
        $('#playlistYouTube').append('<option value=' + playlist.id + '>' + playlist.title + '</option>');          
      });
      
      // seleciona a playlist previamente escolhida após preencher o select
      if (!!preferencias.playlistYouTube)
        $('#playlistYouTube option[value="' + preferencias.playlistYouTube + '"]').attr('selected', 'selected');        
    });

    /* ---------- Lista de vídeos ---------- */  
    if (!!preferencias.blogTumblr && !!preferencias.playlistYouTube)
    {
      reqOAuth(oauthYouTube, { 
        metodo: 'GET', 
        url: 'https://gdata.youtube.com/feeds/api/playlists/' + preferencias.playlistYouTube + '?alt=jsonc&v=2' 
      }, function(data){
        var template = new Array();
        $.each(data.data.items, function(i, item){
          template[i] = {
            videoID: item.video.id,
            imgSrc: function(){ 
              if (!!item.video.thumbnail)
                return item.video.thumbnail.sqDefault;
            },
            link: function(){
              for (i in item.video.player)
                return item.video.player[i]; // ### Saber por que só funciona assim.
            },
            titulo: item.video.title,
            descricao: item.video.description
          };
        });
        
        // Template para a lista de vídeos: o primeiro termo é a chamada para o <script>
        $('#listaVideos').tmpl(template).appendTo('article.lista');
        
        // Chamada para o envio do vídeo.
        $('.video').submit(function(e){
          e.preventDefault();
          // só funciona porque impedimos o envio quando o Tumblr não estiver autenticado
          var item = $(this);
          var legenda = $(this).find('.legenda:first').val();
          var tags = $(this).find('.tags:first').val();
          if (!!legenda && !!tags)
          {
            reqOAuth(oauthTumblr, {
              metodo: 'POST',
              url: 'http://api.tumblr.com/v2/blog/weigay.tumblr.com/post',
              data: {
                type: 'video',
                state: 'queue',
                caption: legenda,
                tags: tags,
                embed: '<iframe width="420" height="315" src="http://www.youtube.com/embed/' + $(this).attr('id') + '" frameborder="0" allowfullscreen></iframe>'
              }
            }, function(){
              item.slideUp();
            });
          }
        });
      });
    }
  }
  
  // Atualiza a playlist utilizada e recarrega a página.
  $('#playlistYouTube').change(function(){
    preferencias.playlistYouTube = $('#playlistYouTube option:selected').val(); // está gerando uma mensagem de erro, mas funciona
    window.location.reload();
  });


  /* ---------- Autenticação no Tumblr ---------- */
  if (!preferencias.tumblrAccessToken || !preferencias.tumblrAccessTokenSecret)
  {
    $('.lista input, .lista textarea').attr('disabled', 'disabled');
    $('section.opcoes').removeClass('success').addClass('notice');    
    obterTokens(oauthTumblr, 'tumblr', {}, function(link){
      $('#tumblrAuth').html('<a href="' + link + '">Autenticar</a>');        
    });
  }
  else
  {
    oauthTumblr.setAccessToken(preferencias.tumblrAccessToken, preferencias.tumblrAccessTokenSecret);
    
    // Obtém os dados do usuário Tubmlr
    reqOAuth(oauthTumblr, {
      metodo: 'POST',
      url: 'http://api.tumblr.com/v2/user/info'    
    }, function(data){
      $('#tumblrAuth').text('Autenticado como ' + data.response.user.name);
      // Opção inicial em branco
      $('#blogTumblr').html('<option></option>');
      // Lista os blogs
      $.each(data.response.user.blogs, function(i, blog){
      $('#blogTumblr').append('<option value="' + blog.name + '">' + blog.name + '</option>');          
    });
        
    if (!!preferencias.blogTumblr)
      $('#blogTumblr option[value="' + preferencias.blogTumblr + '"]').attr('selected', 'selected');
    else
      $('.lista input, .lista textarea').attr('disabled', 'disabled'); // ### não repetir...    
    });
  }

  // escolha do blog usado
  $('#blogTumblr').change(function(){
    preferencias.blogTumblr = $('#blogTumblr option:selected').text();
  });

  $('.fechar a').click(function(){
    $('section.opcoes').hide();
    $('nav.opcoes').show();
  });

  $('nav.opcoes a').click(function(){
    $('section.opcoes').show();
    $('nav.opcoes').hide();    
  });

  /* ---------- Autenticação OAuth ---------- */
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