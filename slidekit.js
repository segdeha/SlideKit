/*	SlideKit behaviors
	Andrew Hedges, andrew@hedges.name
	2010-04-14 17:07
*/

/**
 * Trim whitespace from the beginning and end of a string, from: http://snippets.dzone.com/posts/show/701
 */
''.trim || (String.prototype.trim = function () {
	return this.replace(/^\s+|\s+$/, '');
});

// keep our crap out of the global scope
(function (window, document, undefined) {
	
	// bail if this ain't WebKit
	if (navigator.userAgent.indexOf('WebKit') < 0) {
		alert('SlideKit only works in WebKit browsers.');
		return;
	}
	
	const
		SELECTOR_SLIDES = '.slidekit > li',
		HTML_FORM       = 'FORM',
		UNDEF           = 'undefined'
	;
	
	var
		slides,
		history
	;
	
	/**
	 * Apply a function to an item or collection of items
	 * @private
	 * @param  function                    func   Function
	 * @param  object|string|number|array  items  Item or array of items to which to iterate over and apply the function
	 * @return void
	 */
	function map(func, items) {
		var idx, len;
		
		// if this isn't an array, put it in one (form elements have a length property)
		if (UNDEF === typeof items.length || (UNDEF !== typeof items.tagName && HTML_FORM === items.tagName)) {
			items = [items];
		}
		
		for (idx = 0, len = items.length; idx < len; ++idx) {
			func(items[idx]);
		}
		
		return items;
	}
	
	/**
	 * Determine if the element has the classname
	 * @private
	 * @param  object  el   DOM object
	 * @param  string  cls  Class name
	 * @return  boolean
	 */
	function hasClass(el, cls) {
		var classes, i, len;
		
		if (null === el) {
			return false;
		}
		
		classes = el.className.split(' ');
		
		for (i = 0, len = classes.length; i < len; ++i) {
			if (cls === classes[i]) {
				return true;
			}
		}
		
		return false;
	}
	
	/**
	 * Add a CSS class to any existing class names for an element or collection of elements
	 * @private
	 * @param  object|array  els  DOM object or array of DOM objects
	 * @param  string        cls  CSS class name
	 * @return void
	 */
	function addClass(els, cls) {
		map(function (el) {
			var classes;
			
			if (!hasClass(el, cls)) {
				el.className = el.className.trim();
				classes      = '' === el.className ? [] : el.className.split(' ');
				classes.push(cls);
				el.className = classes.join(' ');
			}
		}, els);
	}
	
	/**
	 * Remove a CSS class from an element or collection of elements
	 * @private
	 * @param  object|array  els  DOM object or array of DOM objects
	 * @param  string        cls  CSS class name (optional, if missing will remove all class names)
	 * @return void
	 */
	function removeClass(els, cls) {
		var remove;
		
		// optimize for the simple case
		if (UNDEF === typeof cls) {
			remove = function (el) {
				el.className = '';
			};
		}
		else {
			remove = function (el) {
				var oldClasses, newClasses, i, len;
				
				oldClasses = el.className.trim().split(' ');
				newClasses = [];
				
				for (i = 0, len = oldClasses.length; i < len; ++i) {
					if (oldClasses[i] !== cls) {
						newClasses.push(oldClasses[i]);
					}
				}
				
				el.className = newClasses.join(' ');
			};
		}
		
		map(remove, els);
	}
	
	/**
	 * Initialize SlideKit
	 * @private
	 * @return void
	 */
	function init() {
		slides  = document.querySelectorAll(SELECTOR_SLIDES);
		history = [];
	}
	
	document.addEventListener('DOMContentLoaded', init, false);
	
})(this, this.document);
