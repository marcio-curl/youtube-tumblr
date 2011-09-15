window.addEventListener('load', function() {

  // Define uma página local para abertura no SpeedDial.
  if (opera.contexts.speeddial)
    opera.contexts.speeddial.url = "popup.html";

}, false);