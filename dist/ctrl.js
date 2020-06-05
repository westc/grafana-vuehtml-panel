"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.VueHtmlPanelCtrl = void 0;

var _sdk = require("app/plugins/sdk");

var _lodash = _interopRequireDefault(require("lodash"));

var saveAs = _interopRequireWildcard(require("./external/FileSaver.min.js"));

var JS = _interopRequireWildcard(require("./external/YourJS.JS.min"));

var html2canvas = _interopRequireWildcard(require("./external/html2canvas.min"));

var _helperFunctions = require("./helper-functions");

var Vue = _interopRequireWildcard(require("./external/vue.min"));

var _config = _interopRequireDefault(require("app/core/config"));

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; if (obj != null) { var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { if (!(Symbol.iterator in Object(arr) || Object.prototype.toString.call(arr) === "[object Arguments]")) { return; } var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

var SEL_DISABLE_DOWNLOAD_CSV = '<llow-csv><ble-csv><llow-download><ble-download>'.replace(/<(.+?)>/g, ':not([data-disa$1])');
var DEFAULT_PANEL_SETTINGS = {
  html: '<h2>Output of available datasets:</h2>\n<div><pre>{{ JSON.stringify(dataset, null, 2) }}</pre></div>',
  css: '& {\n  overflow: auto;\n}',
  canDownloadDatasets: true,
  emType: null,
  refreshRate: null
};
var REFRESH_RATE_OPTIONS = [{
  value: null,
  text: 'Never'
}, {
  value: 1,
  text: 'Every second'
}, {
  value: 60,
  text: 'Every minute'
}];
var EM_TYPES = [{
  value: null,
  text: 'Default'
}, {
  value: 'CONTENT-HEIGHT',
  text: 'Content Height'
}, {
  value: 'CONTENT-WIDTH',
  text: 'Content Width'
}, {
  value: 'CONTENT-MIN-DIM',
  text: 'Minimum Content Dimension'
}, {
  value: 'CONTENT-MAX-DIM',
  text: 'Maximum Content Dimension'
}, {
  value: 'CONTENT-AVG-DIM',
  text: 'Average of Content Dimensions'
}];

function normalizeHasher(hasher) {
  var hasherType = _typeof(hasher);

  return 'function' === hasherType ? hasher : 'string' === hasherType ? function (row) {
    return JSON.stringify(row[hasher]);
  } : function (row) {
    return JSON.stringify(hasher.map(function (item) {
      return row[item];
    }));
  };
}

var VueHtmlPanelCtrl =
/*#__PURE__*/
function (_MetricsPanelCtrl) {
  _inherits(VueHtmlPanelCtrl, _MetricsPanelCtrl);

  function VueHtmlPanelCtrl($scope, $injector, $rootScope) {
    var _this;

    _classCallCheck(this, VueHtmlPanelCtrl);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(VueHtmlPanelCtrl).call(this, $scope, $injector));
    _this.$rootScope = $rootScope;

    _lodash["default"].defaultsDeep(_this.panel, DEFAULT_PANEL_SETTINGS); // If panel.emIsContentHeight was used, convert it to panel.emType.


    var emIsContentHeight = _this.panel.emIsContentHeight;

    if (emIsContentHeight != null) {
      _this.panel.emType = emIsContentHeight ? 'CONTENT-HEIGHT' : null;
      delete _this.panel.emIsContentHeight;
    }

    _this.events.on('init-edit-mode', _this.onInitEditMode.bind(_assertThisInitialized(_this)));

    _this.events.on('data-error', _this.onDataError.bind(_assertThisInitialized(_this)));

    _this.events.on('data-received', _this.onDataReceived.bind(_assertThisInitialized(_this)));

    _this.events.on('data-snapshot-load', _this.onDataReceived.bind(_assertThisInitialized(_this)));

    _this.events.on('view-mode-changed', _this.onViewModeChanged.bind(_assertThisInitialized(_this)));

    _this.events.on('init-panel-actions', _this.onInitPanelActions.bind(_assertThisInitialized(_this))); // Additional events that we can hook into...
    // this.events.on('component-did-mount', this.onComponentDidMount.bind(this));
    // this.events.on('panel-size-changed', this.onPanelSizeChanged.bind(this));
    // this.events.on('panel-teardown', this.onPanelTeardown.bind(this));
    // this.events.on('refresh', this.onRefresh.bind(this));
    // this.events.on('render', this.onRender.bind(this));


    return _this;
  }

  _createClass(VueHtmlPanelCtrl, [{
    key: "renderError",
    value: function renderError(title, message, isMonospace) {
      this.panelElement.html('').append(JS.dom({
        _: 'div',
        style: {
          display: 'flex',
          alignItems: 'center',
          textAlign: 'center',
          height: '100%'
        },
        $: [{
          _: 'div',
          cls: 'alert alert-error',
          style: {
            margin: '0px auto'
          },
          $: {
            _: 'div',
            $: [{
              _: 'h2',
              style: {
                color: '#FFF'
              },
              text: title
            }, {
              _: isMonospace ? 'pre' : 'div',
              text: message
            }]
          }
        }]
      }));
    }
    /**
     * Executed when panel actions should be loaded.
     * @param {*} actions Actions to be added.
     */

  }, {
    key: "onInitPanelActions",
    value: function onInitPanelActions(actions) {
      var tablesSubmenu = this.panelElement.find('table').toArray().reduce(function (carry, table, index) {
        if (jQuery(table).is(SEL_DISABLE_DOWNLOAD_CSV)) {
          carry.push({
            text: table.getAttribute('data-title') ? "Export \"".concat(table.getAttribute('data-title'), "\" As CSV") : "Export Table #".concat(index + 1, " As CSV"),
            icon: 'fa fa-fw fa-table',
            click: "ctrl.csvifyTable(".concat(index, ")")
          });
        }

        return carry;
      }, []);

      if (tablesSubmenu.length) {
        actions.push.apply(actions, [{
          divider: true,
          role: 'Editor'
        }].concat(tablesSubmenu));
      }

      if (this.panel.canDownloadDatasets) {
        var datasetsSubmenu = this.dataset.reduce(function (carry, data, index) {
          var raw = data.raw;

          if (raw.type === 'table' && raw.columns.length) {
            carry.push({
              text: "Export Dataset \"".concat(raw.refId, "\" As CSV"),
              icon: 'fa fa-fw fa-database',
              click: "ctrl.csvifyDataset(".concat(index, ")")
            });
          }

          return carry;
        }, []);

        if (datasetsSubmenu.length) {
          actions.push.apply(actions, [{
            divider: true,
            role: 'Editor'
          }].concat(datasetsSubmenu));
        }
      }

      actions.push({
        text: 'Screenshot As PNG',
        icon: 'fa fa-fw fa-image',
        click: 'ctrl.downloadPNG()'
      });
    }
    /**
     * Executed before showing edit mode.
     */

  }, {
    key: "onInitEditMode",
    value: function onInitEditMode() {
      var path = 'public/plugins/westc-vuehtml-panel/partials/';
      this.addEditorTab('Editor', "".concat(path, "editor.html"), 1);
    }
    /**
     * Executed when the view mode of the panel changes between edit and view.
     */

  }, {
    key: "onViewModeChanged",
    value: function onViewModeChanged() {
      this.logVueScope();
    }
  }, {
    key: "downloadPNG",
    value: function downloadPNG() {
      var _this2 = this;

      html2canvas(this.panelElement.find('div')[0]).then(function (canvas) {
        JS.dom({
          _: 'a',
          href: canvas.toDataURL(),
          download: _this2.panel.title + JS.formatDate(new Date(), " (YYYY-MM-DD 'at' H.mm.ss)") + '.screenshot.png'
        }).click();
      });
    }
  }, {
    key: "csvifyDataset",
    value: function csvifyDataset(datasetIndex) {
      var data = this.dataset[datasetIndex];
      var columnNames = data.columnNames;
      var csvContent = (0, _helperFunctions.toCSV)(data.rows.map(function (row) {
        return columnNames.map(function (cName) {
          return row[cName];
        });
      }), {
        headers: columnNames
      });
      var blob = new Blob([csvContent], {
        type: 'text/csv;charset=utf-8'
      });
      var fileName = this.panel.title + JS.formatDate(new Date(), " (YYYY-MM-DD 'at' H.mm.ss)") + ".dataset-".concat(data.raw.refId, ".csv");
      saveAs(blob, fileName);
    }
  }, {
    key: "csvifyTable",
    value: function csvifyTable(index) {
      var table = this.panelElement.find('table').toArray()[index];
      var title = table.getAttribute('data-title') || this.panel.title + " Table ".concat(index + 1);
      var blob = new Blob([(0, _helperFunctions.toCSV)((0, _helperFunctions.tableToArray)(table))], {
        type: 'text/csv;charset=utf-8'
      });
      var fileName = title + JS.formatDate(new Date(), " (YYYY-MM-DD 'at' H.mm.ss)") + ".csv";
      saveAs(blob, fileName);
    }
    /**
     * Adds the Vue scope to the console log if in editing mode.
     */

  }, {
    key: "logVueScope",
    value: function logVueScope() {
      var _this3 = this;

      // If in editing mode show the html scope.
      if (this.panel.isEditing) {
        var interval = setInterval(function (_) {
          if (_this3.vue) {
            clearInterval(interval);
            console.log('Available data values:', _this3.vue.rawTemplate.data);
            console.log('Available methods:', _this3.vue.rawTemplate.methods);
          }
        }, 250);
      }
    }
  }, {
    key: "render",
    value: function render() {
      // If an `em` unit is supposed to be based on the size of the content area
      // make sure to recalculate it.
      var jElemPC = this.panelElement;
      var emType = this.panel.emType;
      var size = 'CONTENT-HEIGHT' === emType ? jElemPC.height() : 'CONTENT-WIDTH' === emType ? jElemPC.width() : 'CONTENT-MIN-DIM' === emType ? Math.min(jElemPC.height(), jElemPC.width()) : 'CONTENT-MAX-DIM' === emType ? Math.max(jElemPC.height(), jElemPC.width()) : 'CONTENT-AVG-DIM' === emType ? (jElemPC.height() + jElemPC.width()) / 2 : null;
      jElemPC.css('font-size', size != null ? size + 'px' : '');
    }
    /**
     * Should only be called when the panel should re-rendered fresh.  Not defined
     * as render because there is no need to re-render every time the window
     * resizes or the panel resizes.
     */

  }, {
    key: "updateView",
    value: function updateView() {
      var ctrl = this;
      var panel = ctrl.panel;
      var refreshRate = panel.refreshRate;
      var jElemPC = ctrl.element;
      var elemPC = jElemPC[0];
      var elem = JS.dom({
        _: 'div'
      });
      var cls = ('_' + Math.random()).replace(/0\./, +new Date());
      ctrl.render(); // Recalculates `em` size if it is supposed to.
      // Data available to the HTML code.

      var myVue = ctrl.vue;
      var vueScope = ctrl.getVueScope();
      var vueScopeData = JS.filter(vueScope, function (value) {
        return 'function' !== typeof value;
      });

      var vueScopeMethods = _lodash["default"].extend(JS.filter(vueScope, function (value) {
        return 'function' === typeof value;
      }), {
        getVue: function getVue() {
          return myVue;
        }
      });

      var templateValues = {
        template: "<div>".concat(panel.html, "</div>"),
        data: vueScopeData,
        methods: vueScopeMethods
      }; // Remove the old stylesheet from the document if it exists.

      var stylesheet = ctrl.stylesheet;
      var styleParent = stylesheet && stylesheet.parentNode;

      if (styleParent) {
        styleParent.removeChild(stylesheet);
      } // Add the nested CSS to the panel.


      ctrl.stylesheet = JS.css(JSON.parse((0, _helperFunctions.pseudoCssToJSON)(panel.css)), '.' + cls);
      elemPC.className = elemPC.className.replace(/(^|\s+)_\d+(?=\s+|$)/g, ' ').trim() + ' ' + cls; // Gets all dashboards via the API.

      getAllDashboards(function (data, isSuccess) {
        if (isSuccess) {
          myVue.rawTemplate.data.allDashboards = data;
        }
      });

      if (myVue) {
        _lodash["default"].extend(myVue.rawTemplate, templateValues);
      } else {
        jElemPC.html('').append(elem);
        myVue = ctrl.vue = new Vue({
          el: elem,
          template: "<div :is=\"template\"></div>",
          data: function data() {
            return {
              rawTemplate: templateValues
            };
          },
          computed: {
            template: function template() {
              var _this$rawTemplate = this.rawTemplate,
                  template = _this$rawTemplate.template,
                  _data = _this$rawTemplate.data,
                  methods = _this$rawTemplate.methods;
              return {
                template: template,
                data: function data() {
                  return _data;
                },
                methods: methods
              };
            }
          }
        });
      }

      if (refreshRate > 0 && ~~refreshRate === refreshRate) {
        // Make sure that panel only gets refreshed according to the specified
        // interval.
        if (ctrl.refreshTimeout) {
          clearTimeout(ctrl.refreshTimeout);
          ctrl.refreshTimeout = null;
        }

        ctrl.refreshTimeout = setTimeout(function () {
          // Only update if the refresh rate remains unchanged
          if (refreshRate === ctrl.panel.refreshRate) {
            ctrl.updateView();
          }
        }, refreshRate * 1e3);
      }
    }
    /**
     * Gets the object containing the variables available to the Vue HTML.
     * @returns {Object}
     *   The Vue scope that is made available to the Vue HTML.
     */

  }, {
    key: "getVueScope",
    value: function getVueScope() {
      var ctrl = this;

      var result = _lodash["default"].cloneDeep({
        allDashboards: [],
        dashboard: JS.filter(ctrl.dashboard, function (value) {
          return JS.isPrimitive(value);
        }),
        dataset: ctrl.dataset,
        datasets: ctrl.datasets,
        datasetsById: ctrl.datasetsById,
        panel: ctrl.panel.getOptionsToRemember(),
        JS: JS,
        themeType: _config["default"].theme.type,
        url: {
          encode: function encode(value) {
            return encodeURIComponent(value + '').replace(/%20/g, '+');
          },
          decode: function decode(value) {
            return decodeURIComponent((value + '').replace(/\+/g, '%20'));
          },
          toParams: function toParams(objValues, opt_prefixVar) {
            var _this4 = this;

            return Object.entries(objValues).reduce(function (arrParams, _ref) {
              var _ref2 = _slicedToArray(_ref, 2),
                  key = _ref2[0],
                  value = _ref2[1];

              return arrParams.concat(JS.toArray(value).map(function (value) {
                return _this4.encode((opt_prefixVar ? 'var-' : '') + key) + '=' + _this4.encode(value);
              }));
            }, []).join('&');
          },
          getTimeValues: function getTimeValues(opt_name) {
            var result = {};

            var _ctrl$timeSrv$timeRan = ctrl.timeSrv.timeRangeForUrl(),
                from = _ctrl$timeSrv$timeRan.from,
                to = _ctrl$timeSrv$timeRan.to;

            if (opt_name != 'to') {
              result.from = from;
            }

            if (opt_name != 'from') {
              result.to = to;
            }

            return result;
          },
          getTimeParams: function getTimeParams(opt_name) {
            return this.toParams(this.getTimeValues(opt_name));
          },
          getVarValues: function getVarValues(opt_filter, opt_negate) {
            if (opt_filter && 'function' !== typeof opt_filter) {
              var arrFilter = JS.toArray(opt_filter);

              opt_filter = function opt_filter(key) {
                return arrFilter.some(function (filter) {
                  return filter instanceof RegExp ? filter.test(key) : filter == key;
                });
              };
            }

            return ctrl.templateSrv.variables.reduce(function (values, variable) {
              // At times current.value is a string and at times it is an array.
              var key = variable.name;
              var varValues = JS.toArray(variable.current.value);
              var isAll = variable.includeAll && varValues.length === 1 && varValues[0] === '$__all';
              varValues = isAll ? [variable.current.text] : varValues;

              if (opt_filter) {
                varValues = varValues.filter(function (value) {
                  return !!opt_filter(key, value) === !opt_negate;
                });
              }

              if (varValues.length) {
                values[key] = varValues;
              }

              return values;
            }, {});
          },
          getVarParams: function getVarParams(opt_filter, opt_negate) {
            return this.toParams(this.getVarValues(opt_filter, opt_negate), true);
          }
        },
        offsetDateTZ: function offsetDateTZ(date, opt_tzOffset) {
          date = new Date(date);
          opt_tzOffset = opt_tzOffset == null ? date.getTimezoneOffset() : opt_tzOffset;
          return new Date(+date + opt_tzOffset * 6e4);
        },
        onError: function onError(err, info) {
          ctrl.renderError('VueJS Error', err.message, true);
          console.error('VueHtmlPanelCtrl error:', {
            err: err,
            info: info
          });
        },
        keyRows: function keyRows(rows, hasher) {
          hasher = normalizeHasher(hasher);
          return rows.reduce(function (carry, row) {
            var key = hasher(row);
            carry[key] = _lodash["default"].has(carry, key) ? carry[key].concat([row]) : [row];
            return carry;
          }, {});
        },
        indexRows: function indexRows(rows, hasher) {
          hasher = normalizeHasher(hasher);
          var keys = rows.map(function (row) {
            return hasher(row);
          });

          var uniqueKeys = _lodash["default"].uniq(keys);

          return rows.reduce(function (carry, row, rowIndex) {
            var realIndex = uniqueKeys.indexOf(keys[rowIndex]);
            carry[realIndex] = _lodash["default"].has(carry, realIndex) ? carry[realIndex].concat([row]) : [row];
            return carry;
          }, []);
        }
      });

      return result;
    }
  }, {
    key: "onDataError",
    value: function onDataError(event) {
      this.renderError(event.statusText, event.data.message, true);
    }
    /**
     * Executed whenever data is received from the database for this panel.
     * @param {Array} dataList 
     *   An array of objects containing the data that is collected from the
     *   database.
     */

  }, {
    key: "onDataReceived",
    value: function onDataReceived(dataList) {
      var _this5 = this;

      this.datasets = this.dataset = [];
      this.datasetsById = {};

      if (dataList) {
        var datasetNames = [];
        dataList.forEach(function (data) {
          var refId = data.refId,
              datapoints = data.datapoints,
              target = data.target,
              columns = data.columns,
              rows = data.rows;
          var datasetIndex = datasetNames.indexOf(refId);
          var dataset;

          if (data.type === 'table') {
            var colNames = columns.map(function (c) {
              return 'string' === typeof c ? c : c.text;
            });
            _this5.datasetsById[refId] = dataset = {
              columnNames: colNames,
              rows: rows.map(function (row) {
                return row.reduceRight(function (carry, cell, cellIndex) {
                  carry[colNames[cellIndex]] = cell;
                  return carry;
                }, {});
              }),
              raw: data
            };
          } else {
            dataset = _this5.datasetsById[refId] = _this5.datasetsById[refId] || {
              columnNames: ['value', 'time', 'metric'],
              rows: [],
              raw: [],
              refId: refId
            };
            datapoints.forEach(function (row) {
              dataset.rows.push(row.slice(0, 2).concat([target]));
            });

            if (JS.typeOf(dataset.raw) === 'Array') {
              dataset.raw.push(data);
            }
          }

          if (datasetIndex < 0) {
            datasetIndex = datasetNames.push(refId) - 1;
            _this5.datasets[datasetIndex] = _this5.dataset[datasetIndex] = dataset;
          }
        });
      }

      this.updateView();
      this.logVueScope();
    }
  }, {
    key: "link",
    value: function link(scope, elem, attrs, ctrl) {
      this.element = elem;
      this.panelElement = elem.find('.panel-content');
    }
  }]);

  return VueHtmlPanelCtrl;
}(_sdk.MetricsPanelCtrl);

exports.VueHtmlPanelCtrl = VueHtmlPanelCtrl;

function getAllDashboards(callback) {
  getApiData("search", callback);
}

function getApiData(id, callback) {
  jQuery.ajax("/api/".concat(id), {
    complete: function complete(result, statusText) {
      callback(result.responseJSON || result, statusText === 'success');
    }
  });
} // Allows for error handling in vueToHTML().


Vue.config.errorHandler = function (err, vm, info) {
  if (vm && vm.onError) {
    vm.onError(err, info);
  }
};

VueHtmlPanelCtrl.prototype.REFRESH_RATE_OPTIONS = REFRESH_RATE_OPTIONS;
VueHtmlPanelCtrl.prototype.EM_TYPES = EM_TYPES;
VueHtmlPanelCtrl.templateUrl = 'partials/module.html';
//# sourceMappingURL=ctrl.js.map
