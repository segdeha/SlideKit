/*	SlideKit behaviors
	Andrew Hedges, andrew@hedges.name
	2010-04-14 17:07

	Copyright (c) 2010 Andrew Hedges, http://github.com/segdeha/SlideKit

	Permission is hereby granted, free of charge, to any person obtaining
	a copy of this software and associated documentation files (the
	"Software"), to deal in the Software without restriction, including
	without limitation the rights to use, copy, modify, merge, publish,
	distribute, sublicense, and/or sell copies of the Software, and to
	permit persons to whom the Software is furnished to do so, subject to
	the following conditions:

	The above copyright notice and this permission notice shall be
	included in all copies or substantial portions of the Software.

	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
	EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
	NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
	LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
	OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
	WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

*/

/**
 * Trim whitespace from the beginning and end of a string, from: http://snippets.dzone.com/posts/show/701
 */
''.trim || (String.prototype.trim = function () {
	return this.replace(/^\s+|\s+$/, '');
});

// Keep our crap out of the global scope
(function (window, document, undefined) {

	// Bail if this ain't WebKit
	if (navigator.userAgent.indexOf('WebKit') < 0) {
		alert('SlideKit only works in WebKit browsers.');
		return;
	}

	const
		EVENT_WEBKITTRANSITIONEND = 'webkitTransitionEnd',
		EVENT_WEBKITANIMATIONEND  = 'webkitAnimationEnd',

		DATA_TRANSITION      = 'data-transition',
		DATA_DELAY           = 'data-delay',
		DATA_TITLE           = 'data-title',
		DATA_ONTRANSITIONEND = 'data-ontransitionend',
		DATA_ONUNLOAD        = 'data-onunload',

		DEFAULT_DELAY      = 500,
		DEFAULT_TRANSITION = 'dissolve',

		SELECTOR_SLIDES = '.slidekit > li',
		CURRENT_SLIDE   = '.slidekit > li.current',

		HTML_FORM = 'FORM',

		UNDEF = 'undefined'
	;

	var
		slides,
		history,
		isMidTrans
	;

	/**
	 * Apply a function to an item or collection of items
	 * @private
	 * @param  function                    func   Function
	 * @param  object|string|number|array  items  Item or array of items to which to iterate over and apply the function
	 * @return array
	 */
	function map(func, items) {
		var idx, len;

		// if this isn't an array, put it in one (form elements have a length property)
		if (UNDEF === typeof items.length || (UNDEF !== typeof items.tagName && HTML_FORM === items.tagName)) {
			items = [items];
		}

		for (idx = 0, len = items.length; idx < len; ++idx) {
			func(items[idx], idx);
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
		if (null === el) {
			return false;
		}

		if (el.className.split(' ').indexOf(cls) === -1) {
			return false
		} else {
			return true;
		}
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
	 * Find the index of the current slide in the slidelist
	 * Returns -1 when the item isn't found
	 * Looks for the current slide by default
	 * @private
	 * @param object el The currently displayed slide
	 * @return integer
	 */
	function slideIdx(el) {
		var i, len;

		if (UNDEF === typeof el) {
			el = document.querySelector(CURRENT_SLIDE);
		}

		for (i = 0, len = slides.length; i < len; ++i) {
			if (slides[i] === el) {
				return i;
			}
		}

		// Not found
		return -1
	}

	/**
	 * Run some code before the transition starts (from data-onunload attr of 'current' slide)
	 * @private
	 * @param object el DOM object
	 * @return void
	 */
	function onUnload(el) {
		doCallback(el, DATA_ONUNLOAD);
	}

	/**
	 * Run some code when the transition ends (from data-ontransitionend attr of 'next' slide)
	 * @private
	 * @param object el DOM object
	 * @return void
	 */
	function onTransitionEnd(el) {
		doCallback(el, DATA_ONTRANSITIONEND);
	}

	/**
	 * Run the code stuffed in the element's attribute
	 * @private
	 * @param object el DOM object
	 * @param string attr Attribute name
	 * @return void
	 */
	function doCallback(el, attr) {
		var js;
		js = el.getAttribute(attr);
		if (null !== js) {
			eval(js);
		}
	}

	/**
	 * Add event listeners to slides (and the window?)
	 * @private
	 * @return void
	 */
	function addEventListeners() {
		var i, len, delay, trans;

		// Watch for both events so we handle both simple transforms and keyframe animations
		for (i = 0, len = slides.length; i < len; ++i) {
			// Set up animation delays / transitions
			delay = slides[i].getAttribute(DATA_DELAY) || DEFAULT_DELAY;
			trans = slides[i].getAttribute(DATA_TRANSITION) || DEFAULT_TRANSITION;
			slides[i].style.webkitTransitionDuration = delay + "ms";
			if (trans) {
				addClass(slides[i], trans);
			}

			// Bind the events
			slides[i].addEventListener(EVENT_WEBKITTRANSITIONEND, function (evt) {
				onTransitionEnd(this);
			}, false);

			slides[i].addEventListener(EVENT_WEBKITANIMATIONEND, function (evt) {
				onTransitionEnd(this);
			}, false);
		}

		// Listen for keys on the document
		document.addEventListener('keyup', function (evt) {
			// Ignore all keystrokes if we're mid-transition
			// This feels inelegant -- need to think about it
			if (isMidTrans) {
				return true;
			}

			switch(evt.keyCode) {
				case 37: // Left Arrow
					prevSlide();
					break;
				case 39: // Right Arrow
					nextSlide();
					break;
			}
		}, false);

	}

	/**
	 * Go to the next slide in the document order
	 * @private
	 * @return void
	 */
	function nextSlide() {
		var idx;

		// Get the index of the current slide and increment up
		idx = slideIdx() + 1;

		// Dump out if we'd be going past the end
		if (idx >= slides.length) {
			return;
		}

		gotoSlide(idx);
	}

	/**
	 * Go to the previous slide in the document order
	 * @private
	 * @return void
	 */
	function prevSlide() {
		var idx;

		// Get the index of the current slide and decrement
		idx = slideIdx() - 1;

		// Dump out if we'd be going past the first
		if (idx < 0) {
			return;
		}

		gotoSlide(idx);
	}

	/**
	 * Transition from slide to slide
	 * @private
	 * @param object prevEl  The previous slide
	 * @param object nextEl  The next slide
	 * @return void
	 */
	function transSlide(prevEl, nextEl) {
		var prevDelay, nextDelay;


		// Had to parseInt -- for some reason, the second *always* came back string
		prevDelay = parseInt(prevEl.getAttribute(DATA_DELAY)) || DEFAULT_DELAY;
		nextDelay = parseInt(nextEl.getAttribute(DATA_DELAY)) || DEFAULT_DELAY;

		// Run the prev callback
		onUnload(prevEl);

		// Transition: Start
		isMidTrans = true;
		addClass(prevEl, 'out');

		// Transition: Midpoint
		setTimeout(function() {
			removeClass(prevEl, 'out');
			removeClass(prevEl, 'current');
			addClass(nextEl, 'current');
			addClass(nextEl, 'in');
		}, prevDelay);

		// Transition: End
		setTimeout(function() {
			removeClass(nextEl, 'in');
			isMidTrans = false;
		}, prevDelay + nextDelay);

		// Run the next callback
		onTransitionEnd(nextEl);
	}

	/**
	 * Go to an arbitrary slide in the deck
	 * @private
	 * @param integer idx Index of the slide to go to
	 * @return void
	 */
	function gotoSlide(idx) {
		var curEl, nextEl;

		curEl  = document.querySelector(CURRENT_SLIDE);
		nextEl = slides[idx];

		// Swap slides
		transSlide(curEl, nextEl);

		// Put it on the history stack
		history.push(curEl);
	}

	/**
	 * Go back in the history
	 * @private
	 * @return void
	 */
	function goHistBack() {
		var curEl, nextEl;

		curEl  = document.querySelector(CURRENT_SLIDE);
		nextEl = history.pop();

		// Swap slides
		transSlide(curEl, nextEl);
	}

	/**
	 * Initialize SlideKit
	 * @private
	 * @return void
	 */
	function init() {
		slides  = document.querySelectorAll(SELECTOR_SLIDES);
		history = [];
		isMidTrans = false;

		addEventListeners();
	}

	// Load it up!
	document.addEventListener('DOMContentLoaded', init, false);

})(this, this.document);
