import * as Vue from './external/vue.min';

// Allows for error handling in vueToHTML().
Vue.config.errorHandler = (err, vm, info) => {
  if (vm && vm.onError) {
    vm.onError(err, info);
  }
};

/**
 * Takes an HTML string containing Vue Syntax and converts it to a regular HTML
 * string.
 * @param {string} vueHTML
 *   The HTML string containing Vue Syntax that is to be converted to a
 *   regular HTML string.
 * @param {Object} data
 *   The data object that can be referenced in order to render vueHTML with
 *   the specified data. If null is given a blank object will be used as the
 *   data source.
 * @param {function(html)} onRender
 *   The callback function to be called with the resulting rendered HTML
 *   string. This is called 1st when the function is called and vueHTML is
 *   rendered. It is also called if data is changed thusly triggering an
 *   update of the rendered HTML.
 * @param {Function} opt_onError
 *   The callback function to be called when an error occurs.
 * @returns {Vue}
 *   A Vue instance.
 */
function vueToHTML(vueHTML, data, onRender, opt_onError) {
  function onUpdated() {
    this.$nextTick(function () {
      onRender(this.$el.innerHTML);
    });
  }

  return new Vue({
    template: '<div>' + vueHTML + '</div>',
    el: document.createElement('div'),
    data: Object(data),
    mounted: onUpdated,
    updated: onUpdated,
    methods: {
      onError() {
        opt_onError && opt_onError.apply(this, arguments);
      }
    }
  });
}

/**
 * Takes a nested CSS stylesheet string and converts it to JSON to be used by
 * YourJS.css() to make a stylesheet.
 * @param {string} strLess 
 *   The nested CSS stylesheet string that should be converted to JSON that
 *   can be used by YourJS.css().
 * @returns {string}
 *   The JSON equivalent of the nested CSS stylesheet string that was passed
 *   in.
 */
function pseudoCssToJSON(strLess) {
  var openCount = 0;
  var closeCount = 0;

  strLess = strLess
    .replace(/\/\*[^]*?\*\//g, '')
    .replace(
      /([^\{\};]+)\{|([^:\{\}]+):([^;]+);|\}/g,
      function (match, ruleName, styleName, styleValue) {
        if (ruleName) {
          openCount++;
          return JSON.stringify(ruleName.trim()) + ":{";
        }
        if (styleName) {
          return JSON.stringify(styleName.trim()) + ":" + JSON.stringify(styleValue.trim()) + ",";
        }
        closeCount++;
        return "},";
      }
    )
    .replace(/,\s*(\}|$)/g, '$1');

  try {
    return JSON.stringify(JSON.parse("{" + strLess + "}"), null, 2);
  }
  catch (e) {
    throw new Error(
      openCount !== closeCount
        ? "Pseudo-CSS contains too many " + (openCount > closeCount ? "open" : "clos") + "ing braces."
        : "Pseudo-CSS couldn't be parsed correctly."
    );
  }
}

module.exports = { vueToHTML, pseudoCssToJSON, Vue };