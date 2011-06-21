/*  SlideKit behaviors
    Andrew Hedges, andrew@hedges.name
    @created 2010-04-14 17:07
    @updated 2011-06-20 10:10

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

(function () {
    var regex, slides, idx

    regex  = /\bhidden\b/
    slides = document.querySelectorAll('section')
    idx    = slides.length - 1

    function isHidden(name) {
        return regex.test(name)
    }

    function hide(el) {
        if (!isHidden(el.className)) {
            el.className = el.className + ' hidden'
        }
    }

    function show(el) {
        if (isHidden(el.className)) {
            el.className = el.className.replace('hidden', '')
        }
    }

    function next() {
        hide(slides[idx])
        idx -= 1
        if (idx < 0) {
            setTimeout(function () {
                if (confirm('Start over?')) {
                    location.reload()
                }
                else {
                    idx = 0
                }
            }, 2000)
        }
    }

    function prev() {
        idx += 1
        if (idx > slides.length - 1) {
            idx = slides.length - 1
        }
        show(slides[idx])
    }

    document.addEventListener('keyup', function (evt) {
        // left
        if (37 === evt.keyCode) {
            prev()
        }
        // right
        else if (39 === evt.keyCode) {
            next()
        }
    })
})()
