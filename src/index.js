const _q_tags = ["a", "abbr", "acronym", "address", "area", "article", "aside", "audio", "b", "base", "bdi", "bdo", "big", "blockquote", "body", "br", "button", "canvas", "caption", "center", "cite", "code", "col", "colgroup", "data", "datalist", "dd", "del", "details", "dfn", "dialog", "dir", "div", "dl", "dt", "em", "embed", "fencedframe", "fieldset", "figcaption", "figure", "font", "footer", "form", "frame", "frameset", "h1", "head", "header", "hgroup", "hr", "html", "i", "iframe", "img", "input", "ins", "kbd", "label", "legend", "li", "link", "main", "map", "mark", "marquee", "menu", "meta", "meter", "nav", "nobr", "noembed", "noframes", "noscript", "object", "ol", "optgroup", "option", "output", "p", "param", "picture", "plaintext", "pre", "progress", "q", "rb", "rp", "rt", "rtc", "ruby", "s", "samp", "script", "search", "section", "select", "selectedcontent", "slot", "small", "source", "span", "strike", "strong", "style", "sub", "summary", "sup", "table", "tbody", "td", "template", "textarea", "tfoot", "th", "thead", "time", "title", "tr", "track", "tt", "u", "ul", "var", "video", "wbr", "xmp"]
const _q_element_nesting_limit = 1024

// Initialization function
function Q() {
    function configProcess(config) {
        return (config ? ' ' : '') + config
    }

    function implementTag(tag, givenConfig = {}) {
        // default configuration and generator
        // for now config is only generator
        let tagConfig = {
            generator: (config, innerHTML) => `<${tag}${config}>${innerHTML}</${tag}>\n`,
            ...givenConfig
        }
        // Add element to current container
        window['$' + tag] = (innerHTML = '', config = '') => {
            let latest = _q_element_stack[_q_element_stack.length - 1]
            latest.insertAdjacentHTML('beforeend', tagConfig.generator(configProcess(config), innerHTML))
            let newElement = latest.children[latest.childElementCount - 1]

            return newElement
        }
        // Add element to current container and make it the current container
        window['$$' + tag] = (innerHTML = '', config = '') => {
            if (_q_element_stack.length >= _q_element_nesting_limit) throw new Error("Element Stack Overflow: missed an `out` somewhere");

            let latest = _q_element_stack[_q_element_stack.length - 1]
            latest.insertAdjacentHTML('beforeend', tagConfig.generator(configProcess(config), innerHTML))
            let newElement = latest.children[latest.childElementCount - 1]

            _q_element_stack.push(newElement)
            return newElement
        }
        // Return element, no adding
        window['$_' + tag] = (innerHTML = '', config = '') => {
            let string = tagConfig.generator(configProcess(config), innerHTML)
            return new DOMParser().parseFromString(string, "text/html");
        }
    }

    window._q_element_stack = [document.body]
    for (let tag of _q_tags) {
        implementTag(tag)
    }

    // Exit current container by simply mentioning the variable 'end' or calling end()
    Object.defineProperty(window, 'end', {
        get: ()=>(_q_element_stack.pop(), ()=>{})
    });

    // Couple utilities
    window.$ImplementTag = implementTag
    window.$EveryFrame = (fn) => {
        let f2 = () => {
            fn()
            window.requestAnimationFrame(f2)
        }
        f2()
    }
    window.$Container = () => _q_element_stack[_q_element_stack.length - 1]

    // Layout utilities, simple flex layouts
    implementTag('horizontal', {
        generator: (config, innerHTML) => `<div style='display:flex;width:100%;justify-content: space-evenly' ${config}>${innerHTML}</div>\n`
    })
    implementTag('fullvertical', {
        generator: (config, innerHTML) => `<div style='display:flex;height:100vh;flex-direction:column;justify-content: space-evenly' ${config}>${innerHTML}</div>\n`
    })
    implementTag('vertical', {
        generator: (config, innerHTML) => `<div style='display:flex;flex-direction:column;justify-content: space-evenly' ${config}>${innerHTML}</div>\n`
    })

    // Selectors, more utility functions
    // Adapted from AJQuery (https://github.com/coolaj86/ajquery.js/)
    window.$ = function (sel, $parent = document) {
        return $parent.querySelector(sel);
    }
    window.$$ = function (sel, $parent = document) {
        return Array.from($parent.querySelectorAll(sel));
    }
    // Set given element as current container
    window.$Enter = (element) => _q_element_stack.push(element)

}