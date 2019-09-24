/**
 * @preserve YourJS v2.21.0.gm - Your Very Own JS Library
 * Home Page - http://yourjs.com/
 * Download - http://yourjs.com/download/2.21.0.gm
 *
 * Copyright (c) 2015-2019 Christopher West
 * Licensed under the MIT license.
 */
(function(__VERSION, __VARIABLE_NAME, undefined) {
  var YourJS,
      __GLOBAL = this,
      __EMPTY_ARRAY = [],
      __EMPTY_OBJECT = {},
      __DOCUMENT = __GLOBAL.document,
      __callsAfterDefs = [];
  
  /**
   * Binds a context to a given function within that context.
   * @name alias
   * @memberof JS
   * @function
   * @see {@link http://yourjs.com/docs/view/alias/2.21.0}
   * @param {Object} context
   *   Context object containing the function to be called.
   * @param {string} name
   *   Name of the function to call within the context.
   * @returns {Function}
   *   Function that when called will execute the function with the given name
   *   under the given context.
   */
  function alias(context, name) { return context[name].bind(context); }
  
  /**
   * Confine a given number to a specific range.
   * @name clamp
   * @memberof JS
   * @function
   * @see {@link http://yourjs.com/docs/view/clamp/2.21.0}
   * @param {number} x
   *   The number to be confined to the specified range.
   * @param {number} min
   *   The minimum number that can be returned.
   * @param {number} max
   *   The maximum number that can be returned.
   * @returns {number}
   *   The closest number to <code>x</code> that is greater than or equal to <code>min</code> and less
   *   than or equal to <code>max</code>.
   */
  function clamp(x, min, max) {
    return x < min ? min : x > max ? max : x;
  }
  
  /**
   * Takes a number in any form and returns it as a string in its fullest form
   * (removing exponents).
   * @name fullNumber
   * @memberof JS
   * @function
   * @see {@link http://yourjs.com/docs/view/fullNumber/2.21.0}
   * @param {number} num
   *   Number to return in its fullest form.
   * @returns {string|undefined}
   *   If <code>num</code> is a finite number it will be returned as a number in its
   *   fullest form without exponents of any kind.  If <code>num</code> is not a finite
   *   number <code>undefined</code> will be returned.
   */
  function fullNumber(num) {
    var realNum = +num;
    if (isFinite(realNum)) {
      var match = /(\d)(?:\.(\d+))?e(\+|\-)(\d+)/.exec(realNum + '');
      if (match) {
        var end = match[2] || '';
        var startAndEnd = match[1] + end;
        var digits = +match[4];
        num = match[3] === '+'
          ? startAndEnd + Array(digits + 1 - end.length).join('0')
          : ('0.' + Array(digits).join('0') + startAndEnd);
      }
      return num + '';
    }
  }
  
  /**
   * Turns a number into a string in its fullest form with commas separating the
   * integral part at the thousands mark, millions mark, billions mark, etc.
   * @name commaNumber
   * @memberof JS
   * @function
   * @see {@link http://yourjs.com/docs/view/commaNumber/2.21.0}
   * @param {number|string} num
   *   Number that will be converted to a string and will have commas added to
   *   it to separate the hundreds from thousands, the thousands from the
   *   millions, etc.
   * @returns {string|undefined}
   *   A string representation of <code>num</code> with commas separating the hundreds from
   *   thousands, the thousands from the millions, etc.  If <code>num</code> is not a
   *   finite number <code>undefined</code> will be returned.
   */
  function commaNumber(num) {
    if (num = fullNumber(num)) {
      num = num.split('.');
      num[0] = num[0].replace(/\d(?=(\d{3})+$)/g, '$&,');
      return num.join('.');
    }
  }
  
  /**
   * Every object descended from Object inherits the hasOwnProperty method. This
   * method can be used to determine whether an object has the specified
   * property as a direct property of that object; unlike the in operator, this
   * method does not check down the object's prototype chain.
   * @name has
   * @memberof JS
   * @function
   * @see {@link http://yourjs.com/docs/view/has/2.21.0}
   * @param {Object} obj
   *   Object whose property will be tested.
   * @param {string} name
   *   Name of the property to test.
   * @returns {boolean}
   *   A boolean indicating whether the object has the specified property as own
   *   (not inherited) property.
   */
  var has = alias(__EMPTY_OBJECT.hasOwnProperty, 'call');
  
  /**
   * Gets the native type name of a primitive or an object.  Unlike
   * YourJS.typeOf(), the types are solely determined by the system.
   * @name nativeType
   * @memberof JS
   * @function
   * @see {@link http://yourjs.com/docs/view/nativeType/2.21.0}
   * @param {*} value
   *   Primitive or object whose native type name will be returned.
   * @returns {string}
   *   The native type name of the specified value.  All type names start with
   *   an uppercase character.
   */
  function nativeType(x) {
    return __EMPTY_OBJECT.toString.call(x).slice(8, -1);
  }
  
  /**
   * Determines if an object is an array or at least array-like.
   * @name isArrayLike
   * @memberof JS
   * @function
   * @see {@link http://yourjs.com/docs/view/isArrayLike/2.21.0}
   * @param {*} o
   *   A value to test and see if it array-like.
   * @returns {boolean}
   *   A boolean indicating if the object was an array or array-like.
   */
  function isArrayLike(o) {
    var l, i, t = nativeType(o);
    return t === 'Array'
        || (!!o
          && !o.nodeName
          && typeof(l = o.length) === 'number'
          && 'Function' !== t && 'String' !== t
          && (!l || (l > 0 && (i = l - 1) % 1 == 0 && i in o)));
  }
  
  /**
   * Creates a new object or a new array based on the specified object array.
   * This new array will only have the values which pass the test function.
   * @name filter
   * @memberof JS
   * @function
   * @see {@link http://yourjs.com/docs/view/filter/2.21.0}
   * @param {Array|Object} arrOrObj
   *   Array (or array-like object) or object which will be duplicated with only
   *   the values that pass the <code>test</code> function.
   * @param {Function} test
   *   Function that will be called for every value in <code>arrOrObj</code> and whose
   *   return value for each call will be coerced to a boolean and used to
   *   determine if the value will be kept in the resulting array or object
   *   returned by <code>filter()</code>.  Only return values that are <code>true</code>-ish will be
   *   kept. The first argument passed will be the value that is being tested.
   *   The second argument passed will be the index or key of the value that is
   *   being tested.  The third argument passed will be <code>arrOrObj</code>.  The <code>this</code>
   *   keyword will reference <code>opt_this</code>.
   * @param {*} [opt_this=global]
   *   If not given or <code>undefined</code> or <code>null</code>, the global object will be used.
   *   If given as a primitive, the object version of the value will be used.
   *   This object will be used as <code>this</code> within <code>test()</code>.
   * @returns {Array|Object}
   *   If <code>arrOrObj</code> is an array (or an array-like object) then an array with
   *   the filtered values will be returned.  Otherwise an object with the
   *   filtered values will be returned.
   */
  function filter(arrOrObj, test, opt_this) {
    var result;
    if (isArrayLike(arrOrObj = Object(arrOrObj))) {
      result = [];
      for (var i = 0, l = arrOrObj.length; i < l; i++) {
        if (has(arrOrObj, i) && test.call(opt_this, arrOrObj[i], i, arrOrObj)) {
          result.push(arrOrObj[i]);
        }
      }
    }
    else {
      result = {};
      for (var k in arrOrObj) {
        if (has(arrOrObj, k) && test.call(opt_this, arrOrObj[k], k, arrOrObj)) {
          result[k] = arrOrObj[k];
        }
      }
    }
    return result;
  }
  
  /**
   * Create a new array or object with all of the <code>false</code>-ish values removed.
   * @name compact
   * @memberof JS
   * @function
   * @see {@link http://yourjs.com/docs/view/compact/2.21.0}
   * @param {Array|Object} arrOrObj
   *   Array or object of values to comb through.
   * @returns {Array|Object}
   *   If <code>arrOrObj</code> is an array or is array-like then an array will be
   *   returned.  Otherwise an object will be returned.  The returned array or
   *   object will be similar to <code>arrOrObj</code> but will only have <code>true</code>-ish
   *   values.
   */
  function compact(arrOrObj) {
    return filter(arrOrObj, function(value) { return value; });
  }
  
  /**
   * Creates a CSS stylesheet from an JSON representation of a stylesheet.
   * @name css
   * @memberof JS
   * @function
   * @see {@link http://yourjs.com/docs/view/css/2.21.0}
   * @param {Object} objStyles
   *   An object representing the CSS rules to be inserted into the document.
   *   Property names will be used as media queries if they start with <code>"@media
   *   "</code>. Property names will be used as rule selectors if the value is an
   *   object. If a property name is to be used as a selector, if any selectors
   *   don't contain <code>&</code>, <code>"& "</code> will be prepended to it. For all selectors, <code>&</code>
   *   will be replaced recursively with the selectors found in the parent. CSS
   *   property names will be uncamelcased by inserting dashes before each
   *   uppercased character and lower casing all characters. If a value is
   *   <code>null</code> or <code>undefined</code>, it will be turned into <code>"none"</code>. If a value is a
   *   number other than <code>0</code>, <code>"px"</code> will be appended to it. If a value is an
   *   array all of the items will be concatenated together, using <code>","</code> to
   *   delimit the values. If a value ends with <code>!</code> it will be replaced with
   *   <code>"!important"</code>.
   * @param {HTMLElement|Array.<HTMLElement>|string} opt_ancestors
   *   This can be an element or an array of elements which will get another
   *   class added to target all rules to it and its children. This can
   *   alternatively be a CSS path (selector) specifying the root on which all
   *   CSS rules created should be based.
   * @returns {HTMLStyleSheet}
   *   The stylesheet that is created and appended to the document is returned.
   */
  var css;
  (function(RGX_UPPER, RGX_AMP, RGX_NO_COMMAS_OR_NOTHING, RGX_NO_AMP, RGX_IND_SEL, RGX_CLS, RGX_TRIM_SELS) {
    css = function(obj, selAncestors) {
      if (typeof selAncestors != 'string') {
        if (selAncestors) {
          var className = ('_' + Math.random()).replace(RGX_CLS, +new Date);
          selAncestors = nativeType(selAncestors) == 'Array' ? selAncestors : [selAncestors];
          for (var i = selAncestors.length; i--;) {
            selAncestors[i].className += ' ' + className;
          }
        }
        selAncestors = className ? '.' + className : '';
      }
  
      var code = getCssCode(obj, selAncestors);
      var style = __DOCUMENT.createElement('style');
      style.type = 'text/css';
      if (style.styleSheet && !style.sheet) {
        style.styleSheet.cssText = code;
      }
      else {
        style.appendChild(__DOCUMENT.createTextNode(code));
      }
      (__DOCUMENT.getElementsByTagName('head')[0] || __DOCUMENT.body).appendChild(style);
      return style;
    }
  
    function getCssCode(obj, selAncestors) {
      var rules = [];
      var rule = [];
      for (var key in obj) {
        if (has(obj, key)) {
          var value = obj[key];
          var typeName = nativeType(value);
          if (!key.indexOf('@media ')) {
            rules.push(key + '{' + getCssCode(value, selAncestors) + '}');
          }
          else if (typeName === 'Object') {
            // Trim selectors
            key = key.replace(RGX_TRIM_SELS, '$1');
            // Return all selectors
            key = key.replace(RGX_IND_SEL, function(sel) {
              sel = selAncestors ? sel.replace(RGX_NO_AMP, '& $&') : sel;
              return selAncestors.replace(RGX_NO_COMMAS_OR_NOTHING, function(selAncestor) {
                return sel.replace(RGX_AMP, selAncestor);
              });
            });
            rules.push(getCssCode(value, key));
          }
          else {
            value = typeName !== 'Array'
              ? value != undefined
                ? value && typeof value == 'number'
                  ? value + 'px'
                  : ((value + '').slice(-1) == '!' ? value + 'important' : value)
                : 'none'
              : value.join(',');
            key = key.replace(RGX_UPPER, '-$&').toLowerCase();
            rule.push(key + ':' + value + ';');
          }
        }
      }
      if (rule[0]) {
          rules.unshift(selAncestors + '{' + rule.join('') + '}');
      }
      return rules.join('');
    }
  })(
    /[A-Z]/g,                                       // RGX_UPPER
    /&/g,                                           // RGX_AMP
    /[^,]+|^$/g,                                    // RGX_NO_COMMAS_OR_NOTHING
    /^[^&]+$/,                                      // RGX_NO_AMP
    /[^\s\xa0,][^,]*/g,                             // RGX_IND_SEL
    /0(.|$)/,                                       // RGX_CLS
    /^[\s\xa0]+|[\s\xa0]*(,)[\s\xa0]*|[\s\xa0]+$/g  // RGX_TRIM_SELS
  );
  
  /**
   * Creates a throttled version of a function which will only be executable
   * once per every specified wait period.
   * @name throttle
   * @memberof JS
   * @function
   * @see {@link http://yourjs.com/docs/view/throttle/2.21.0}
   * @param {Function} fn
   *   The function which will esentially be rate-limited.
   * @param {number} msBetweenCalls
   *   The amount of time to wait between calls.
   * @param {boolean} [opt_leading=undefined]
   *   If <code>true</code> the <code>fn</code> function will only be invoked on the initial calls if
   *   the specified time has elapsed since the last invocation.  If <code>false</code> the
   *   <code>fn</code> function will only be invoked on the trailing calls.  If not
   *   specified or if specified as <code>null</code> or <code>undefined</code> the initial calls and
   *   the trailing calls will be used to invoke <code>fn</code>.
   * @returns {Function}
   *   The throttled version of <code>fn</code> function.
   */
  
  /**
   * Creates a debounced copy of the function which when called will delay the
   * execution until the specified amount of milliseconds have elapsed since the
   * last time it was called.
   * @name debounce
   * @memberof JS
   * @function
   * @see {@link http://yourjs.com/docs/view/debounce/2.21.0}
   * @param {Function} fnCallback
   *   The function to debounce. The context and parameters sent to the
   *   debounced function will be sent to this function.
   * @param {number} msWait
   *   The amount of milliseconds that must pass since the last call to this
   *   function before really invoking <code>fnCallback</code>.
   * @param {boolean} [opt_initialAndAfter=undefined]
   *   Specify <code>true</code> if both the initial calls and the trailing calls should
   *   invoke the <code>fnCallback</code> function.  Specify <code>false</code> if only the initial
   *   calls should invoke the <code>fnCallback</code> function.  If not specified or
   *   specified as <code>null</code> or <code>undefined</code> only the trailing calls will invoke
   *   <code>fnCallback</code>.
   * @returns {Function}
   *   The debounced copy of <code>fnCallback</code>.
   */
  eval('debounce231k=b;b=@;##b-k##@-b#throttle312#k=@,#k-b#b=k,#k-b#'.replace(
    /(\D+)(.)(.)(.)([^#]*)#([^#]*)#([^#]*)#([^#]*)#([^#]*)#/g,
    'function $1(h,c,a){var u,d,e,f,g,k,b=0;a=u==a?$2:a?$3:$4;return function(){d=0;e=arguments;f=this;$5a&1&&($6d=$7>=c)&&($8g=h.apply(f,e));!d&&a&2&&setTimeout(function(){k=@,k-b>=c&&(b=k,g=h.apply(f,e))},c);return g}}'
  ).replace(/@/g, '+new Date'));
  
  /**
   * Slice does not modify the original array, but instead returns a shallow
   * copy of elements from the original array.
   * @name slice
   * @memberof JS
   * @function
   * @see {@link http://yourjs.com/docs/view/slice/2.21.0}
   * @param {Array|Arguments|Object} array
   *   Array or array-like object to shallow copy.
   * @param {number} [begin=0]
   *   Zero-based index at which to begin extraction.  A negative index can be
   *   used, indicating an offset from the end of the sequence.
   *   <code>slice(array,-2)</code> extracts the last two elements in the sequence.  If
   *   <code>begin</code> is <code>undefined</code>, slice begins from index <code>0</code>.
   * @param {number} [end=array.length]
   *   Zero-based index before which to end extraction. slice extracts up to but
   *   not including <code>end</code>.  For example, <code>slice(array,1,4)</code> extracts the second
   *   element through the fourth element (elements indexed 1, 2, and 3).  A
   *   negative index can be used, indicating an offset from the end of the
   *   sequence. <code>slice(array,2,-1)</code> extracts the third element through the
   *   second-to-last element in the sequence.  If <code>end</code> is omitted, <code>slice</code>
   *   extracts through the end of the sequence (<code>array.length</code>).  If <code>end</code> is
   *   greater than the length of the sequence, slice extracts through the end
   *   of the sequence (<code>array.length</code>).
   * @returns {Array}
   *   A new array containing the extracted elements.
   */
  var slice = alias(__EMPTY_ARRAY.slice, 'call');
  
  /**
   * Turns anything into an array.
   * @name toArray
   * @memberof JS
   * @function
   * @see {@link http://yourjs.com/docs/view/toArray/2.21.0}
   * @param {*} [o]
   *   Any value to either convert to an array or wrap in an array.
   * @returns {Array}
   *   If no arguments were passed an empty array is returned.  If the argument
   *   passed was array-like it will be returned as an <code>Array</code>.  Otherwise the
   *   argument passed will simply be returned within an array.
   */
  function toArray(o) {
    return arguments.length ? isArrayLike(o) ? slice(o) : [o] : [];
  }
  
  /**
   * Determines if something is a primitive or not. If not a primitive it must
   * be some form of object.
   * @name isPrimitive
   * @memberof JS
   * @function
   * @see {@link http://yourjs.com/docs/view/isPrimitive/2.21.0}
   * @param {*} arg
   *   The argument which will be determined as being either a primitive (eg.
   *   boolean, number, string, etc.) or a non-primitive.
   * @returns {boolean}
   *   <code>true</code> will be returned if <code>arg</code> is simply a primitive, otherwise <code>false</code>
   *   will be returned.
   */
  function isPrimitive(arg) {
    var type = typeof arg;
    return arg == undefined || (type != "object" && type != "function");
  }
  
  /**
   * Determines if an object is a prototype object.
   * @name isPrototype
   * @memberof JS
   * @function
   * @see {@link http://yourjs.com/docs/view/isPrototype/2.21.0}
   * @param {*} obj
   *   Object to check to see if it is a prototype.
   * @returns {boolean}
   *   If <code>obj</code> is a prototype object <code>true</code> is returned, otherwise <code>false</code>.
   */
  function isPrototype(obj) {
    var c = obj && obj.constructor;
    return (c && 'function' === typeof c) ? c.prototype === obj : false;
  }
  
  /**
   * Retrieves all of the associated type names for a value.
   * @name kindsOf
   * @memberof JS
   * @function
   * @see {@link http://yourjs.com/docs/view/kindsOf/2.21.0}
   * @param {*} value
   *   Value for which to get all of the associated type names.
   * @returns {Array<string>}
   *   An array of all of the types that <code>value</code> is.
   */
  
  /**
   * Either gets the type of a value or adds a constructor registering its
   * custom type name.
   * @name typeOf
   * @memberof JS
   * @function
   * @see {@link http://yourjs.com/docs/view/typeOf/2.21.0}
   * @param {*} value
   *   A value whose type name will be returned.  Alternatively if
   *   <code>opt_typeNameToAdd</code> is passed this must be the constructor for the
   *   corresponding type name.
   * @param {string} [opt_typeNameToAdd]
   *   If specified, <code>value</code> will be looked for within an array of all known
   *   constructors and if not found a new entry will be added along with this
   *   given type name.
   * @returns {string|boolean}
   *   If <code>opt_typeNameToAdd</code> was omitted a string representation of <code>value</code>'s
   *   type usually capitalized unless <code>"null"</code> or <code>"undefined"</code> is returned.
   *   If <code>opt_typeNameToAdd</code> is given, the constructor passed as <code>value</code> will
   *   be searched and a boolean indicating whether or not it needed to be added
   *   will be returned.
   */
  var kindsOf, typeOf;
  (function (arrObjectTypes, arrLen) {
    kindsOf = function (value) {
      var isProto = isPrototype(value),
        result = [],
        typeName = __EMPTY_OBJECT.toString.call(value).slice(8, -1);
      if (isPrimitive(value)) {
        result.push('*primitive', typeName.toLowerCase());
      }
      else if (typeName !== 'Object') {
        result.push('Object');
      }
      if (value != undefined) {
        result.push(typeName);
      }
      if (typeName === 'Object') {
        value = value.constructor;
        typeName = (value && value.name) || '*unknown';
        for (i = 0; i < arrLen; i += 2) {
          if (value === arrObjectTypes[i]) {
            typeName = arrObjectTypes[i + 1];
            break;
          }
        }
        if (typeName !== 'Object') {
          result.push(typeName);
        }
      }
      if (isProto) {
        result.push('*prototype');
      }
      return result;
    };
    typeOf = function (value, opt_typeNameToAdd) {
      if (opt_typeNameToAdd) {
        for (var i = 0; i < arrLen; i += 2) {
          if (value === arrObjectTypes[i]) {
            return false;
          }
        }
        arrLen += 2;
        arrObjectTypes.push(value, opt_typeNameToAdd);
        return true;
      }
      value = kindsOf(value);
      return value[value.length - 1];
    };
  })([], 0);
  
  /**
   * Creates HTML DOM objects.
   * @name dom
   * @memberof JS
   * @function
   * @see {@link http://yourjs.com/docs/view/dom/2.21.0}
   * @param {string|Object} input
   *   The value that will be converted to DOM objects.  If a string, it will be
   *   interpreted as raw HTML.  Otherwise this must be an object specifying at
   *   least the <code>nodeName</code> (or <code>_</code>) property.  To represent an element with
   *   child nodes you can set the <code>children</code> (or <code>$</code>) property to an <code>input</code>
   *   object, <code>input</code> string, or array of <code>input</code> strings and/or objects that
   *   will be recursively interpreted.  The <code>html</code> property will be interpreted
   *   as the <code>innerHTML</code> property.  The <code>text</code> property will be interpreted ass
   *   the <code>innerText</code> and <code>textContent</code> properties.  The <code>cls</code> property will be
   *   interpreted as the element's class name.
   * @returns {Array.<Node>|HTMLElement}
   *   If <code>input</code> was a string an array of nodes represented in that string will
   *   be returned.  Otherwise the element represented by <code>input</code> will be
   *   returned.
   */
  var dom;
  (function(RGX_DASH, INNER_TEXT, TEXT_CONTENT, PROP_HASH) {
    function capAfterDash(m, afterDash) {
      return afterDash.toUpperCase();
    }
    dom = function(input) {
      var elem, realPropName, propName, propValue, i, l, j, c, style, stylePropName, kids;
      if (typeOf(input) == 'String') {
        elem = slice(dom({ _: 'DIV', html: input }).childNodes);
      }
      else {
        elem = __DOCUMENT.createElement(input.nodeName || input._);
        for (realPropName in input) {
          propValue = input[realPropName];
          if (has(input, realPropName) && (propName = has(PROP_HASH, realPropName) ? PROP_HASH[realPropName] : realPropName) != '_') {
            if (propName == 'style') {
              style = elem[propName];
              if (typeOf(propValue) == 'String') {
                style.cssText = propValue;
              }
              else {
                for (stylePropName in propValue) {
                  if (has(propValue, stylePropName)) {
                    style[stylePropName.replace(RGX_DASH, capAfterDash)] = propValue[stylePropName];
                  }
                }
              }
            }
            else if (propName == INNER_TEXT || propName == TEXT_CONTENT) {
              elem[TEXT_CONTENT] = elem[INNER_TEXT] = propValue;
            }
            else if (propName == '$') {
              propValue = toArray(propValue);
              for (i = 0, l = propValue.length; i < l;) {
                for (kids = toArray(dom(propValue[i++])), j = 0, c = kids.length; j < c;) {
                  elem.appendChild(kids[j++]);
                }
              }
            }
            else {
              elem[propName] = propValue;
              if (propName == realPropName && elem.getAttribute(propName) == undefined && 'function' != typeof propValue) {
                elem.setAttribute(propName, propValue);
              }
            }
          }
        }
      }
      return elem;
    };
  })(/-([^-])/g, 'innerText', 'textContent',
    {nodeName:'_',html:'innerHTML',text:'innerText',children:'$','for':'htmlFor','class':'className',cls:'className'});
  
  /**
   * Encodes a string to be used in a query part of a URL.
   * @name escape
   * @memberof JS
   * @function
   * @see {@link http://yourjs.com/docs/view/escape/2.21.0}
   * @param {string} str
   *   String to encode.
   * @returns {string}
   *   Encoded string that can be used in the query part of a URL.
   */
  function escape(str) {
    return encodeURIComponent(str)
      .replace(/!/g, '%21')
      .replace(/'/g, '%27')
      .replace(/\(/g, '%28')
      .replace(/\)/g, '%29')
      .replace(/\*/g, '%2A')
      .replace(/%20/g, '+');
  }
  
  /**
   * Creates a string representation of the date using the specified format
   * string.
   * @name formatDate
   * @memberof JS
   * @function
   * @see {@link http://yourjs.com/docs/view/formatDate/2.21.0}
   * @param {Date} date
   *   Date object to be formatted as a string.
   * @param {string} strFormat
   *   If part of the string is wrapped in single quotes, those single quotes
   *   will be removed, any groupings of 2 consecutive single quotes will be
   *   replaced with just one and the other characters will appear in the
   *   returned string as is.  <code>YYYY</code> will be replaced by the full year (eg.
   *   2018).  <code>YY</code> will be replaced by a 2-digit representation of the year
   *   (eg. 18).  <code>MMMM</code> will be replaced by the name of the month (eg.
   *   September).  <code>MMM</code> will be replaced by the 1st 3 characters of the name
   *   of the month (eg. Sep).  <code>MM</code> will be replaced by a 2-digit
   *   representation of the month (eg. 09).  <code>M</code> will be replaced by a numeric
   *   representation of the month (eg. 9).  <code>DDDD</code> will be replaced by the name
   *   of the day of the week (eg. Sunday).  <code>DDD</code> will be replaced by the 1st 3
   *   characters of the name of the day of the week (eg. Sun).  <code>DD</code> will be
   *   replaced by a 2-digit representation of the day of the month (eg. 02).
   *   <code>D</code> will be replaced by a numeric representation of the day of the month
   *   (eg. 2).  <code>HH</code> will be replaced with a 24-hour 2-digit representation of
   *   the hour (eg. 15).  <code>H</code> will be replaced with a 24-hour numeric
   *   representation of the hour (eg. 15).  <code>hh</code> will be replaced with a
   *   12-hour 2-digit representation of the hour (eg. 03).  <code>h</code> will be
   *   replaced with a 12-hour numeric representation of the hour (eg. 3).  <code>mm</code>
   *   will be replaced with a 2-digit representation of the minutes (eg. 26).
   *   <code>m</code> will be replaced with a numeric representation of the minutes (eg.
   *   26).  <code>ss</code> will be replaced with a 2-digit representation of the seconds
   *   (eg. 01).  <code>s</code> will be replaced with a numeric representation of the
   *   seconds (eg. 1).  <code>A</code> will be replaced with "AM" or "PM".  <code>a</code> will be
   *   replaced with "am" or "pm".  <code>SSS</code> will be replaced with a 3-digit
   *   representation of the milliseconds (eg. 000).  <code>S</code> will be replaced with
   *   a numeric representation of the milliseconds (eg. 0).  <code>Z</code> will be
   *   replaced with a representation of the timezone offset that starts off
   *   with "+" or "-", followed by 2 digits that represent the hours offset,
   *   followed by 2 digits that represent the minutes offset.
   * @param {Object} [opt_overrides]
   *   Object that can override the preset values.  If the <code>months</code> property is
   *   defined it should be an array of 12 month names starting with January.
   *   If the <code>days</code> property is defined it should be an array of the 7 days of
   *   the week starting with Sunday.
   * @returns {string}
   *   A string representation of <code>date</code> where all of the rules for <code>strFormat</code>
   *   are followed.
   */
  var formatDate = (function(arrMonths, arrDays) {
    function prefixZeroes(num, end) {
      return ((new Array(end)).join(0) + Math.abs(num)).slice(-end);
    }
    return function(date, strFormat, opt_options) {
      opt_options = opt_options || {};
      var arrCustomMonths = opt_options.months || arrMonths,
          arrCustomDays = opt_options.days || arrDays,
          YYYY = date.getFullYear(),
          M = date.getMonth(),
          MMMM = arrCustomMonths[M++],
          DDDD = arrCustomDays[date.getDay()],
          D = date.getDate(),
          H = date.getHours(),
          h = (H % 12) || 12,
          m = date.getMinutes(),
          s = date.getSeconds(),
          S = date.getMilliseconds(),
          tzOffset = date.getTimezoneOffset(),
          subs = {
            YYYY: YYYY,
            YY: YYYY % 100,
            MMMM: MMMM,
            MMM: MMMM.slice(0, 3),
            MM : prefixZeroes(M, 2),
            M: M,
            DDDD: DDDD,
            DDD: DDDD.slice(0, 3),
            DD: prefixZeroes(D, 2),
            D: D,
            HH: prefixZeroes(H, 2),
            hh: prefixZeroes(h, 2),
            H: H,
            h: h,
            mm: prefixZeroes(m, 2),
            m: m,
            ss: prefixZeroes(s, 2),
            s: s,
            a: H < 12 ? 'am' : 'pm',
            A: H < 12 ? 'AM' : 'PM',
            SSS: prefixZeroes(S, 3),
            S: S,
            Z: (tzOffset < 0 ? '+' : '-') + prefixZeroes(tzOffset / 60, 2) + prefixZeroes(tzOffset % 60, 2)
          };
      return strFormat.replace(
        /YY(?:YY)?|M{1,4}|D{1,4}|HH?|hh?|mm?|ss?|a|A|S(?:SS)?|Z|'((?:[^']+|'')+)'/g,
        function(m, quoted) {
          return quoted ? quoted.replace(/''/g, "'") : subs[m]
        }
      );
    };
  })(
    'January February March April May June July August September October November December'.split(' '),
    'Sunday Monday Tuesday Wednesday Thursday Friday Saturday'.split(' ')
  );
  
  /**
   * Formats the time (number of milliseconds) given based on a format string.
   * If you want to format time using a <code>Date</code> object with a timezone different
   * from UTC (GMT) you should use <code>formatDate()</code>.
   * @name formatTime
   * @memberof JS
   * @function
   * @see {@link http://yourjs.com/docs/view/formatTime/2.21.0}
   * @param {number} ms
   *   Number of milliseconds that will be represented in the returned string.
   * @param {string} format
   *   Format string where <code>W</code> (or <code>w</code>) will be replaced by the number of weeks,
   *   <code>D</code> (or <code>d</code>) by the number of days (maximum being 6), <code>H</code> (or <code>h</code>) by the
   *   number of hours (maximum being 23), <code>m</code> by the number of minutes (maximum
   *   being 59), <code>s</code> by the number of seconds (maximum being 59), and <code>S</code> by
   *   the number of milliseconds (maximum being 999).  Adding an exclamation
   *   point to the end of any of those characters (eg. <code>S!</code>) will result in the
   *   corresponding value not being truncated based on the next highest time
   *   increment.  Using <code>HH</code>, <code>hh</code>, <code>mm</code>, <code>ss</code> or <code>SSS</code> will result in leading
   *   zeroes for those corresponding values.  Instances of <code>-</code> will be removed
   *   only if <code>ms</code> is positive.  Instances of <code>+</code> will be replaced with <code>-</code>
   *   only if <code>ms</code> is negative, otherwise <code>+</code> will remain.  Wrapping a
   *   substring in single quotes or double quotes will cause that substring to
   *   be escaped and any instances of that same quote character being repeated
   *   once will be replaced with just one.  Wrapping a substring with the hash
   *   character (#) will result in a conditional string where any underlying
   *   substring wrapped in parentheses will only be returned if the preceding
   *   meta-group is not <code>1</code>.  If the the conditional substring is specified and
   *   the preceding meta-group is <code>1</code> then either nothing will be printed  or
   *   if the parenthesized group contains an unescaped vertical bar anything
   *   found thereafter will be printed.
   * @returns {string}
   *   The value of <code>ms</code> formatted based on <code>format</code>.
   */
  function formatTime(ms, format) {
    var lastNum, floor = Math.floor, isNegative = ms < 0 || 1 / ms < 0;
    ms = Math.abs(floor(ms));
    return format.replace(
      /(\\.)|'((?:[^']+|'')+)'|"((?:[^"]+|"")+)"|#((?:[^#]+|##)+)#|(\+)|(\-)|(([Ww])|([Dd])|(HH?|hh?)|(mm?)|(ss?)|(S(?:SS)?))(\!)?/g,
      function (all, escaped, inner, inner2, inner3, plus, minus, num, w, d, h, m, s, S, full) {
        if (escaped) {
          return escaped;
        }
        if (num) {
          lastNum = all = S
            ? !full ? ms % 1e3 : ms
            : s
              ? (all = floor(ms / 1e3), !full ? all % 60 : all)
              : m
                ? (all = floor(ms / 6e4), !full ? all % 60 : all)
                : h
                  ? (all = floor(ms / 36e5), !full ? all % 24 : all)
                  : d
                    ? (all = floor(ms / 864e5), !full ? all % 7 : all)
                    : floor(ms / 6048e5);
          num = num.length;
          return (full || num === 1) ? all : ('00' + all).slice(-num);
        }
  
        inner = inner || inner2 || inner3;
  
        var quote = inner3 ? '#' : inner2 ? '"' : "'";
  
        return quote
          ? (
              (quote === '#' && lastNum != undefined)
              ? inner.replace(/\(((?:[^\\\|\(\)]|\\.)*)(?:\|((?:[^\\\|\(\)]|\\.)*))?\)/g, lastNum === 1 ? '$2' : '$1')
              : inner
            ).split(quote + quote).join(quote)
          : isNegative ? '-' : plus ? '+' : '';
      }
    ).replace(/\\(.)/g, '$1');
  }
  
  /**
   * Gets the information for this version of YourJS.
   * @name toString
   * @memberof JS
   * @function
   * @see {@link http://yourjs.com/docs/view/toString/2.21.0}
   * @returns {string}
   *   A quick summary of the YourJS object simply indicating the version and
   *   the variable name.
   */
  function toString() {
    return 'YourJS v' + __VERSION + ' (' + __VARIABLE_NAME + ')';
  }
  
  /**
   * Gets the information for this version of YourJS.
   * @name info
   * @memberof JS
   * @function
   * @see {@link http://yourjs.com/docs/view/info/2.21.0}
   * @returns {Object}
   *   An object containing a <code>name</code> property and a <code>version</code> property.
   */
  function info() {
    return { name: __VARIABLE_NAME, version: __VERSION, toString: toString };
  }
  
  /**
   * Parses a URL to get the parameters specified in the query string.
   * @name parseQS
   * @memberof JS
   * @function
   * @see {@link http://yourjs.com/docs/view/parseQS/2.21.0}
   * @param {string} url
   *   The URL to parse.
   * @returns {Object}
   *   An object in which the keys are the keys of the parameters found in <code>url</code>
   *   and the values are the corresponding values found in <code>url</code>. If a
   *   parameter key is specified twice or ends in <code>"[]"</code>, that property will be
   *   an array of all of the found values for that key.
   */
  function parseQS(url) {
    var vars = {};
    url.replace(/\?[^#]+/, function(query) {
      query.replace(/\+/g, ' ').replace(/[\?&]([^=&#]+)(?:=([^&#]*))?/g, function(m, key, value, arrIndicator, alreadyDefined, lastValue) {
        key = decodeURIComponent(key);
        arrIndicator = key.slice(-2) == '[]';
        value = value && decodeURIComponent(value);
        alreadyDefined = has(vars, key);
        lastValue = vars[key];
        vars[key] = (arrIndicator || alreadyDefined)
          ? typeOf(lastValue) == 'Array'
            ? lastValue.concat([value])
            : alreadyDefined
              ? [lastValue, value]
              : [value]
          : value;
      });
    });
    return vars;
  }
  
  /**
   * Modify a URL.
   * @name modURL
   * @memberof JS
   * @function
   * @see {@link http://yourjs.com/docs/view/modURL/2.21.0}
   * @param {string} [opt_url=location.href]
   *   URL to modify and return.  If <code>undefined</code> or <code>null</code> is specified this
   *   will default to the page's location.
   * @param {Object} options
   *   An object indicating how to modify <code>opt_url</code>.  Each property name should
   *   correspond to a valid <code>URL</code> property name.  If a function is given as a
   *   property name it will be executed and the return value will be used as
   *   that property of the URL.  Specifying a function for the <code>"search"</code>
   *   property will cause the function to be called with an object representing
   *   the current search parameters and the return result will be used to
   *   indicate what the new search parameters will be.  Specifying an object
   *   for the <code>"search"</code> property will provide the ability to set individual
   *   search parameters with values or callback functions.  If <code>options.search</code>
   *   is an object and has any properties set to <code>undefined</code> or <code>null</code> this
   *   will indicate that those properties should be removed, but any search
   *   parameters that are not defined as properties of <code>options.search</code> will
   *   remain.
   * @returns {string}
   *   The modified form of <code>opt_url</code>.
   */
  function modURL(opt_url, options) {
    var URL = __GLOBAL.URL;
    var url = opt_url || __GLOBAL.location.href;
    try {
      url = new URL(url);
    }
    catch (a) {
      a = __DOCUMENT.createElement('a');
      a.href = url;
      url = new URL(a.href);
    }
    // Loop through input options...
    for (var optionKey in options) {
      if (has(options, optionKey)) {
        var optionValue = options[optionKey];  // input option
        if (optionKey === 'search') {
          var hasSearchFunc = 'function' === typeof optionValue;
          if (hasSearchFunc) {
            optionValue = optionValue(parseQS(url[optionKey]));
          }
          if ('object' === typeof optionValue) {
            var urlSearch = parseQS(url[optionKey]), arrNewSearch = [];
            // If options.search was not a function then loop through the search
            // params of the URL to be modified and only keep the ones that are
            // not specified to be changed via options.search.
            if (!hasSearchFunc) {
              for (var qsKey in urlSearch) {
                if (has(urlSearch, qsKey) && !has(optionValue, qsKey)) {
                  arrNewSearch.push([qsKey, urlSearch[qsKey]]);
                }
              }
            }
            // Loop through the search params that are to be added or modified and
            // add any that are not specified as null or undefined
            for (var searchKey in optionValue) {
              if (has(optionValue, searchKey)) {
                var searchValue = optionValue[searchKey];
                var newSearchValue = 'function' === typeof searchValue ? searchValue(urlSearch[searchKey], urlSearch) : searchValue;
                if (newSearchValue != undefined) {
                  (nativeType(newSearchValue) === 'Array' ? newSearchValue : [newSearchValue]).forEach(function(searchValue) {
                    arrNewSearch.push([searchKey, searchValue]);
                  });
                }
              }
            }
            optionValue = arrNewSearch.reduce(function(search, pair) {
              return search + (search ? '&' : '?') + escape(pair[0]) + '=' + escape(pair[1]);
            }, '');
          }
        }
        url[optionKey] = 'function' === typeof optionValue ? optionValue(url[optionKey]) : optionValue;
      }
    }
    return url.href;
  }
  
  /**
   * Reverts the global variable to which <code>YourJS</code> is initially assigned by the
   * library back to its value prior to defining YourJS.
   * @name noConflict
   * @memberof JS
   * @function
   * @see {@link http://yourjs.com/docs/view/noConflict/2.21.0}
   * @returns {Object}
   *   <code>YourJS</code> object.
   */
  var noConflict;
  (function(previousValue, alreadyRun) {
    noConflict = function() {
      if (!alreadyRun) {
        alreadyRun = 1;
        __GLOBAL[__VARIABLE_NAME] = previousValue;
      }
      return YourJS;
    };
  })(__GLOBAL[__VARIABLE_NAME]);
  
  /**
   * Gets the value at the specified position in an array or an array-like
   * object.
   * @name nth
   * @memberof JS
   * @function
   * @see {@link http://yourjs.com/docs/view/nth/2.21.0}
   * @param {Array|number} arrayOrN
   *   If an array or an array-like object is given this will be the object from
   *   which the value will be immediately retrieved.  If this is a number, this
   *   will be interpreted as <code>opt_n</code>, the position from which all values passed
   *   into the returned partial function will be retrieved.
   * @param {number} opt_n
   *   If given and <code>arrayOrN</code> is an array or an array-like object, this will be
   *   the position from which the value should be retrieved.  If this is a
   *   negative number the position will be calculated from the end of <code>arr</code>.
   *   If <code>arrayOrN</code> is a number this will become that value.
   * @returns {Function|*}
   *   If <code>arrayOrN</code> is an array or an array-like object the value at position
   *   <code>n</code> will be returned.  Otherwise if <code>arrayOrN</code> is a number a partial
   *   function that will already have the value of <code>opt_n</code> and will be awaiting
   *   the array will be returned.
   */
  function nth(arrayOrN, opt_n) {
    return opt_n != undefined
      ? arrayOrN[opt_n < 0 ? arrayOrN.length + opt_n : opt_n]
      : function(array) {
        return array[arrayOrN < 0 ? array.length + arrayOrN : arrayOrN];
      };
  }
  
  /**
   * Get the ordinal for an integer (<code>st</code>, <code>nd</code>, <code>rd</code>, or <code>th</code>).
   * @name ordinalize
   * @memberof JS
   * @function
   * @see {@link http://yourjs.com/docs/view/ordinalize/2.21.0}
   * @param {number} num
   *   Number for which to get the ordinal.
   * @param {boolean} [opt_excludeNum=false]
   *   Indicates whether or not to exclude <code>num</code> from the return value.
   * @returns {string}
   *   If <code>opt_excludeNum</code> is <code>false</code>-ish a string version of <code>num</code> with the
   *   appropriate ordinal string will be returned.  If <code>opt_excludeNum</code> is
   *   <code>true</code>-ish just the ordinal corresponding to <code>num</code> will be returned.
   */
  function ordinalize(num, opt_excludeNum) {
    var abs = num < -num ? -num : num, ones = abs % 10;
    return (opt_excludeNum ? '' : num) + ((abs % 100 - ones - 10 ? [0,'st','nd','rd'][ones] : 0) || 'th');
  }
  
  /**
   * Confines a number to a specified range by looping number that are too large
   * back to the beginning of the range and numbers that are too small back to
   * the end of the range (just like in Pacman).
   * @name pacman
   * @memberof JS
   * @function
   * @see {@link http://yourjs.com/docs/view/pacman/2.21.0}
   * @param {number} x
   *   The number that you want to confine to the specified range.
   * @param {number} inclusive
   *   An extreme of the range to which to confine <code>x</code>.  This number IS included
   *   in the range of valid numbers.
   * @param {number} exclusive
   *   An extreme of the range to which to confine <code>x</code>.  This number IS NOT
   *   included in the range of valid numbers.  If <code>x</code> is equal to this number,
   *   <code>inclusive</code> will be returned from this function.
   * @returns {number}
   *   A number representing <code>x</code> within the range <code>inclusive</code> and <code>exclusive</code>
   *   where <code>x</code> can be <code>inclusive</code> but cannot be <code>exclusive</code>.
   */
  function pacman(x, inclusive, exclusive) {
    exclusive -= inclusive;
    return ((x - inclusive) % exclusive + exclusive) % exclusive + inclusive;
  }
  
  /**
   * Either generates a random number or pulls a random value from an array.
   * @name random
   * @memberof JS
   * @function
   * @see {@link http://yourjs.com/docs/view/random/2.21.0}
   * @param {Array|number} arrOrMinOrMax
   *   If an array, a random item from it will be returned.  If this is a number
   *   and <code>opt_max</code> is either not given or boolean this will be seen as the
   *   maximum value.  Otherwise this will be seen as the minimum value that can
   *   be returned.
   * @param {number|boolean} [opt_max]
   *   If this is a number it will be interpreted as the maximum value.  The
   *   maximum value will never be returned because a random number between the
   *   minimum value (inclusive) and the maximum value (exclusive) is always
   *   returned.  If this is a boolean it will be used as <code>opt_truncate</code> and the
   *   maximum will come from <code>arrOrMinOrMax</code> thus setting <code>0</code> to
   *   <code>arrOrMinOrMax</code>.
   * @param {boolean} [opt_truncate=false]
   *   If <code>true</code>-ish and <code>arrOrMinOrMax</code> wasn't an array the returned value will
   *   be truncated.
   * @returns {*}
   *   If <code>arrOrMinOrMax</code> is an array a random value from the array will be
   *   returned, otherwise a random number in the given range will be returned.
   */
  function random(arrOrMinOrMax, opt_max, opt_round) {
    if ('number' == typeof arrOrMinOrMax) {
      if ('boolean' == typeof opt_max) {
        opt_round = opt_max;
        opt_max = undefined;
      }
      if (opt_max === undefined) {
        opt_max = arrOrMinOrMax;
        arrOrMinOrMax = 0;
      }
      arrOrMinOrMax = Math.random() * (opt_max - arrOrMinOrMax) + arrOrMinOrMax;
      return opt_round ? Math.trunc(arrOrMinOrMax) : arrOrMinOrMax;
    }
    return arrOrMinOrMax[random(0, arrOrMinOrMax.length, 1)];
  }
  
  /**
   * Creates an array of numbers within a given range.
   * @name range
   * @memberof JS
   * @function
   * @see {@link http://yourjs.com/docs/view/range/2.21.0}
   * @param {number} startOrStop
   *   The starting point of the range to return.  If this is the argument
   *   argument passed the value will be used as <code>opt_stop</code> and this will become
   *   <code>0</code>.
   * @param {number} [opt_stop=startOrStop]
   *   The non-inclusive boundary of the range.  This value will not be included
   *   in the returned array.  The value is pulled from <code>startOrStop</code> if not
   *   specified.
   * @param {number} [opt_step=1]
   *   The difference between each subsequent number in the range.
   * @returns {Array.<number>}
   *   Returns an array of all of the numbers in the range. If <code>opt_step</code> >= <code>0</code>
   *   but <code>startOrStop</code> >= <code>opt_stop</code>, an empty array will be returned. Also,
   *   if <code>opt_step</code> <= <code>0</code>, but <code>startOrStop</code> <= <code>opt_stop</code>, an empty array
   *   will be returned.
   */
  function range(startOrStop, opt_stop, opt_step) {
    if (arguments.length < 2) {
      opt_stop = startOrStop;
      startOrStop = 0;
    }
    for (var ret = [], t = (opt_step = opt_step || 1) > 0; t ? startOrStop < opt_stop : startOrStop > opt_stop; startOrStop += opt_step) {
      ret.push(startOrStop);
    }
    return ret;
  }
  
  /**
   * Scales a number using an input range and and an output range to give a
   * proportional output.
   * @name scale
   * @memberof JS
   * @function
   * @see {@link http://yourjs.com/docs/view/scale/2.21.0}
   * @param {number} x
   *   The value to be scaled.
   * @param {number} minX
   *   The lower bound of <code>x</code>.
   * @param {number} maxX
   *   The upper bound of <code>x</code>.
   * @param {number} minReturn
   *   The lower bound of the return value which directly corresponds to <code>minX</code>.
   * @param {number} maxReturn
   *   The upper bound of the return value which directly corresponds to <code>maxX</code>.
   * @returns {number}
   *   Returns <code>x</code> scaled based on the range of <code>minX</code> to <code>maxX</code> being
   *   proportional to <code>minReturn</code> to <code>maxReturn</code>.  If <code>x</code> is within the range
   *   of <code>minX</code> and <code>maxX</code> the return value will be within the range of
   *   <code>minReturn</code> and <code>maxReturn</code>.  If <code>x</code> is outside of the range of <code>minX</code> to
   *   <code>maxX</code> then the return value will also be outside of the <code>minReturn</code> to
   *   <code>maxReturn</code> range.  If <code>minReturn</code> and <code>maxReturn</code> are the same
   *   <code>minReturn</code> will be returned.
   */
  function scale(x, minX, maxX, minReturn, maxReturn) {
    return (x - minX) * (maxReturn - minReturn) / (maxX - minX) + minReturn;
  }
  
  /**
   * Creates a new array with the items in a random order.
   * @name shuffle
   * @memberof JS
   * @function
   * @see {@link http://yourjs.com/docs/view/shuffle/2.21.0}
   * @param {Array} arr
   *   Array to copy and shuffle.
   * @returns {Array}
   *   Shuffled copy of <code>arr</code>.
   */
  // Done this way to account for partially or fully empty arrays
  function shuffle(arr) {
    for (var t, j, result = [], l = arr.length, i = l; i--, result[i] = i;);
    for (i = l; i; ) {
      j = Math.round(Math.random() * --i);
      if (i && i != j) {
        t = result[i];
        result[i] = result[j];
        result[j] = t;
      }
      if (has(arr, result[i])) {
        result[i] = arr[result[i]];
      }
      else {
        delete result[i];
      }
    }
    return result;
  }
  
  /**
   * Creates an array with the span of numbers going from <code>first</code> and ending at
   * <code>last</code> if possible depending on the specified step value.
   * @name span
   * @memberof JS
   * @function
   * @see {@link http://yourjs.com/docs/view/span/2.21.0}
   * @param {number} first
   *   First number to be processed for the returned array.
   * @param {number} last
   *   Last number to be processed for the returned array.
   * @param {number} [opt_step=1]
   *   Defaults to <code>1</code> if not given or if <code>0</code> or <code>NaN</code> is specified.  The
   *   difference between each subsequent number to be processed for the
   *   returned array.
   * @param {Function} [opt_mapper]
   *   Function to call for each number in the sequence and whose return value
   *   will be used as the value added to the returned array.  If specified this
   *   function will be called for every number in the span, receiving it as the
   *   one and only argument.
   * @returns {Array}
   *   An array containing the sequence of numbers starting at <code>first</code> and
   *   ending at <code>last</code>.  If <code>first</code> is less than <code>last</code> and <code>opt_step</code> is less
   *   than <code>0</code> or if <code>last</code> is less than <code>first</code> and <code>opt_step</code> is greater than
   *   <code>0</code> an empty array will be returned.  If <code>opt_mapper</code> is given the array
   *   will contain the sequence of mapped.
   */
  function span(first, last, opt_step, opt_mapper) {
    opt_step = +opt_step || 1;
    for (var result = [], mult = opt_step < 0 ? -1 : 1; mult * (last - first) >= 0; first += opt_step) {
      result.push(opt_mapper ? opt_mapper(first) : first);
    }
    return result;
  }
  
  /**
   * Substitute values into strings where the corresponding placeholders have
   * been entered.
   * @name sub
   * @memberof JS
   * @function
   * @see {@link http://yourjs.com/docs/view/sub/2.21.0}
   * @param {string} template
   *   The string containing placeholders to be filled in and returned. A
   *   placeholder must correspond to a value in <code>opt_subs</code> and its name must be
   *   surrounded in curly braces (eg. <code>"Hello {name}!"</code> contains the <code>name</code>
   *   placeholder). If a placeholder refers to a number, a ternary operator can
   *   be used (eg. <code>"You have {apples} apple{apples?s:}"</code>). What appears
   *   between the <code>?</code> and the <code>:</code> will replace the placeholder if the variable
   *   before the <code>?</code> is not <code>1</code>. What appears after the <code>:</code> will replace the
   *   placeholder if the variable before the <code>?</code> is <code>1</code>. A 4-ary (AKA
   *   quaterary) operator can also be used if a placeholder refers to a number
   *   (eg. <code>"You have {apples?{apples}:one:no} apple{apples?s:}"</code>). When using
   *   a 4-ary operator, whatever appears after the second <code>:</code> will replace the
   *   placeholder if the variable before the <code>?</code> is <code>0</code>.  If a placeholder is
   *   not ternary or 4-ary but ends with <code>#</code>, <code>opt_funcs</code> will be called on the
   *   value and the return value will be used.  If a placeholder is not ternary
   *   or 4-ary but ends with <code>#</code> followed by a name (eg. <code>#ordinalize</code>), the
   *   function with that property name under <code>opt_funcs</code> will be called for the
   *   value and the return value will replace the placeholder.  If a
   *   placeholder evaluates to a function the function will be called all of
   *   the ternary or 4-ary values as arguments.  Nested expressions are
   *   supported.
   * @param {Array|Object} [opt_subs=global]
   *   Array or object from which to pull the values to be inserted into
   *   <code>template</code>.
   * @param {Array.<Function>|Object.<Function>|Function} [opt_funcs=YourJS]
   *   If this is a function it can be used to modify the values filled in
   *   within <code>template</code>.  If this is an object or an array its properties or
   *   array items can be referenced to modify the values filled in within
   *   <code>template</code>.
   * @returns {string}
   *   Returns <code>template</code> with all of the valid placeholders filled in with
   *   their substitutions as found in <code>opt_subs</code>.
   */
  function sub(template, opt_subs, opt_funcs) {
    opt_subs = opt_subs || __GLOBAL;
    opt_funcs = opt_funcs || YourJS;
    for (
      var result;
      result !== template;
      template = template.replace(
        /\{([\w\$]+)(?:\?((?:\\.|[^\\\{\}:])*):((?:\\.|[^\\\{\}:])*)(?::((?:\\.|[^\\\{\}:])*))?|#([\w\$]+))?\}/ig,
        function(match, arg, multi, one, none, fn) {
          if (has(opt_subs, arg)) {
            arg = opt_subs[arg];
            if ('function' == typeof arg) {
              arg = arg(multi, one, none, match);
            }
            match = multi === undefined ? arg : (arg == 1 ? one : ((!arg && none !== undefined) ? none : multi));
            if (fn != undefined) {
              fn = fn ? opt_funcs[fn] : opt_funcs;
              if ('function' == typeof fn) {
                match = fn(match);
              }
            }
          }
          return match;
        }
      )
    ) {
      result = template;
    }
    return result.replace(/\\(\W)/g, '$1');
  }
  
  /**
   * Used to make a file size human readable.  Takes the number of bytes or bits
   * and converts it into a string indicating the number in the appropriate
   * range (eg. KB, MB, etc.).
   * @name suffixFileSize
   * @memberof JS
   * @function
   * @see {@link http://yourjs.com/docs/view/suffixFileSize/2.21.0}
   * @param {number} count
   *   Number of bytes or bits to represent as a string.
   * @param {boolean} [opt_countInBits=false]
   *   Specifies whether <code>count</code> is given in bits instead of bytes.
   * @returns {string}
   *   A string indicating <code>count</code> with the appropriate measure (eg. kb, Mb,
   *   etc.).
   */
  var suffixFileSize;
  (function(Math, SUFFIXES) {
    suffixFileSize = function(count, opt_countInBits) {
      var div = opt_countInBits ? 3 : 10,
          base = opt_countInBits ? 10 : 2,
          level = ~~Math.min(Math['log' + base](count < 0 ? -count : count) / div, 8);
      count = (count / Math.pow(base, div * level)).toFixed(2).replace(/\.?0+$/, '')
        + ' ' + SUFFIXES[level];
      return opt_countInBits ? count : count.toUpperCase();
    };
  })(Math, ['b','kb','Mb','Gb','Tb','Pb','Eb','Zb','Yb']);
  
  /**
   * Gets a string indicating how long ago a given date was in the largest unit
   * possible.
   * @name timeAgo
   * @memberof JS
   * @function
   * @see {@link http://yourjs.com/docs/view/timeAgo/2.21.0}
   * @param {Date} dateTime
   *   Date in the past.
   * @param {Date} [opt_currDateTime=new Date()]
   *   Current date.  If not given defaults to the current date and time.
   * @returns {string}
   *   A string indicating in the largest unit possible how long ago <code>dateTime</code>
   *   happened compared to <code>opt_currDateTime</code>.
   */
  function timeAgo(dateTime, opt_currDateTime) {
    opt_currDateTime = new Date(opt_currDateTime || new Date) - new Date(dateTime);
    return '31536e6year2592e6month864e5day36e5hour6e4minute1e3second'.replace(/(\d+e\d)([a-z]+)/g, function(m, ms, interval) {
      if (dateTime != undefined) {
        ms = opt_currDateTime / +ms;
        if (ms >= 1 || interval == 'second') {
          dateTime = undefined;
          return ~~ms + ' ' + interval + (~~ms - 1 ? 's' : '') + ' ago';
        }
      }
      return '';
    }) || undefined;
  }
  
  /**
   * Capitalizes the first letter of each word in a string. Also commonly known
   * as <code>toProperCase()</code>.
   * @name titleCase
   * @memberof JS
   * @function
   * @see {@link http://yourjs.com/docs/view/titleCase/2.21.0}
   * @param {string} str
   *   The string which will be title cased.
   * @param {function(string, number, string)} [opt_fnFilter]
   *   If specified, this function will be passed every word (along with the
   *   position and the original string) and should return <code>true</code> if the word
   *   should be title cased, otherwise <code>false</code> should be returned.
   * @returns {string}
   *   <code>str</code> with all of the 1st letter of each word capitalized (unless
   *   filtered out by <code>opt_fnFilter</code>).
   */
  var titleCase;
  (function(RGX_WORD) {
    titleCase = function (str, opt_fnFilter) {
      return str.replace(RGX_WORD, function(word, start, rest, index) {
        return (!opt_fnFilter || opt_fnFilter(word, index, str) ? start.toUpperCase() : start) + rest;
      });
    };
  })(/(\S)((?:\B\S)*)/g);

  /**
   * YourJS object.
   * @name JS
   * @namespace
   * @global
   */
  YourJS = {alias:alias,clamp:clamp,commaNumber:commaNumber,compact:compact,css:css,debounce:debounce,dom:dom,escape:escape,filter:filter,formatDate:formatDate,formatTime:formatTime,fullNumber:fullNumber,has:has,info:info,isArrayLike:isArrayLike,isPrimitive:isPrimitive,isPrototype:isPrototype,kindsOf:kindsOf,modURL:modURL,nativeType:nativeType,noConflict:noConflict,nth:nth,ordinalize:ordinalize,pacman:pacman,parseQS:parseQS,random:random,range:range,scale:scale,shuffle:shuffle,slice:slice,span:span,sub:sub,suffixFileSize:suffixFileSize,throttle:throttle,timeAgo:timeAgo,titleCase:titleCase,toArray:toArray,toString:toString,typeOf:typeOf};

  __callsAfterDefs.forEach(function(fn) { fn(); });

  // Add to browser/node environment correctly.
  if(typeof exports !== 'undefined') {
    if(typeof module !== 'undefined' && module.exports) {
      exports = module.exports = YourJS;
    }
    (exports[__VARIABLE_NAME] = YourJS)[__VARIABLE_NAME] = undefined;
  } 
  else {
    __GLOBAL[__VARIABLE_NAME] = YourJS;
  }
})("2.21.0.gm", "JS");
