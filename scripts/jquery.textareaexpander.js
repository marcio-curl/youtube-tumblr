(function($)
{
	// This script was written by Steve Fenton
	// http://www.stevefenton.co.uk/Content/Jquery-Textarea-Expander/
	// Feel free to use this jQuery Plugin
	// Version: 3.0.1

	$.fn.inputexpander = function (settings) {
	
		var config = {
			classmodifier: "tae"
		};
		
		if (settings) {
			$.extend(config, settings);
		}
		
		function CheckContent(element) {
			var minHeight = config.minimumheight;
			var boxHeight = element.scrollHeight;
			$(element)[0].style.height = boxHeight+"px";
		}

		return this.each(function () {
			$(this).addClass(config.classmodifier).css({ overflow: "hidden" });
			$(this).bind("keyup", function () {
				CheckContent(this);
			});
		});
	};
})(jQuery);