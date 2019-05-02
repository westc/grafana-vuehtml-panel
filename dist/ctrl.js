"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.VueHtmlPanelCtrl = void 0;

var _sdk = require("app/plugins/sdk");

var _lodash = _interopRequireDefault(require("lodash"));

var JS = _interopRequireWildcard(require("./external/YourJS.min"));

var _helperFunctions = require("./helper-functions");

var Vue = _interopRequireWildcard(require("./external/vue.min"));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

var DEFAULT_PANEL_SETTINGS = {
  html: '',
  css: '& {\n  overflow: auto;\n}'
};
var PANEL_PROP_KEYS = ['fullscreen', 'datasource', 'description', 'targets', 'timeFrom', 'timeShift', 'title', 'transparent'];

var VueHtmlPanelCtrl =
/*#__PURE__*/
function (_MetricsPanelCtrl) {
  _inherits(VueHtmlPanelCtrl, _MetricsPanelCtrl);

  function VueHtmlPanelCtrl($scope, $injector, $rootScope) {
    var _this;

    _classCallCheck(this, VueHtmlPanelCtrl);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(VueHtmlPanelCtrl).call(this, $scope, $injector));
    _this.$rootScope = $rootScope;

    _lodash.default.defaultsDeep(_this.panel, DEFAULT_PANEL_SETTINGS);

    _this.events.on('init-edit-mode', _this.onInitEditMode.bind(_assertThisInitialized(_this)));

    _this.events.on('data-received', _this.onDataReceived.bind(_assertThisInitialized(_this)));

    _this.events.on('data-snapshot-load', _this.onDataReceived.bind(_assertThisInitialized(_this)));

    _this.events.on('view-mode-changed', _this.onViewModeChanged.bind(_assertThisInitialized(_this)));

    _this.events.on('init-panel-actions', _this.onInitPanelActions.bind(_assertThisInitialized(_this))); // Additional events that we can hook into...
    // this.events.on('render', this.onRender.bind(this));
    // this.events.on('refresh', this.onRefresh.bind(this));
    // this.events.on('data-error', this.onDataError.bind(this));
    // this.events.on('panel-size-changed', this.onPanelSizeChanged.bind(this));


    return _this;
  }
  /**
   * Executed when panel actions should be loaded.
   * @param {*} actions Actions to be added.
   */


  _createClass(VueHtmlPanelCtrl, [{
    key: "onInitPanelActions",
    value: function onInitPanelActions(actions) {
      var datasetsSubmenu = this.dataset.reduce(function (carry, data, index) {
        var raw = data.raw;

        if (raw.type === 'table' && raw.columns.length) {
          carry.push({
            text: "Export Dataset \"".concat(raw.refId, "\" As CSV"),
            icon: 'fa fa-fw fa-download',
            click: "ctrl.csvifyDataset(".concat(index, ")")
          });
        }

        return carry;
      }, []);

      if (datasetsSubmenu.length === 1) {
        actions.push(datasetsSubmenu[0]);
      } else if (datasetsSubmenu.length > 1) {
        actions.push({
          text: 'Export Data As CSV\xA0\xA0\xA0',
          click: '',
          icon: 'fa fa-fw fa-database',
          submenu: datasetsSubmenu
        });
      }

      var tablesSubmenu = this.panelElement.find('table').toArray().map(function (table, index) {
        return {
          text: table.getAttribute('data-title') ? "Export \"".concat(table.getAttribute('data-title'), "\" As CSV") : "Export Table #".concat(index + 1, " As CSV"),
          icon: 'fa fa-fw fa-download',
          click: "ctrl.csvifyTable(".concat(index, ")")
        };
      });

      if (tablesSubmenu.length === 1) {
        actions.push(tablesSubmenu[0]);
      } else if (tablesSubmenu.length > 1) {
        actions.push({
          text: 'Export A Table As CSV\xA0\xA0\xA0',
          click: '',
          icon: 'fa fa-fw fa-table',
          submenu: tablesSubmenu
        });
      }
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
    key: "csvifyDataset",
    value: function csvifyDataset(datasetIndex) {
      var data = this.dataset[datasetIndex];
      var columnNames = data.columnNames,
          rows = data.rows;
      JS.dom({
        _: 'a',
        href: 'data:text/csv;charset=utf-8,' + encodeURIComponent((0, _helperFunctions.toCSV)(rows.map(function (row) {
          return columnNames.map(function (cName) {
            return row[cName];
          });
        }), {
          headers: columnNames
        })),
        download: this.panel.title + JS.formatDate(new Date(), " (YYYY-MM-DD 'at' H.mm.ss)") + ".dataset-".concat(data.raw.refId, ".csv")
      }).click();
    }
  }, {
    key: "csvifyTable",
    value: function csvifyTable(index) {
      var table = this.panelElement.find('table').toArray()[index];
      var title = table.getAttribute('data-title') || this.panel.title + " Table ".concat(index + 1);
      JS.dom({
        _: 'a',
        href: 'data:text/csv;charset=utf-8,' + encodeURIComponent((0, _helperFunctions.toCSV)((0, _helperFunctions.tableToArray)(table))),
        download: title + JS.formatDate(new Date(), " (YYYY-MM-DD 'at' H.mm.ss)") + ".csv"
      }).click();
    }
    /**
     * Adds the Vue scope to the console log if in editing mode.
     */

  }, {
    key: "logVueScope",
    value: function logVueScope() {
      // If in editing mode show the html scope.
      if (this.panel.isEditing) {
        console.debug('Data values available:', this.getVueScope());
      }
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
      var jElemPC = ctrl.panelElement;
      var elemPC = jElemPC[0];
      var elem = JS.dom({
        _: 'div'
      });
      var panel = ctrl.panel;
      var cls = ('_' + Math.random()).replace(/0\./, +new Date());
      jElemPC.html('').append(elem);
      elemPC.className = elemPC.className.replace(/(^|\s+)_\d+(?=\s+|$)/g, ' ').trim() + ' ' + cls; // Data available to the HTML code.

      var vueScope = ctrl.getVueScope();

      if (ctrl.vue) {
        ctrl.vue.$destroy();
      }

      ctrl.vue = new Vue({
        template: "<div>".concat(panel.html, "</div>"),
        el: elem,
        data: vueScope,
        mounted: function mounted() {
          // Remove the old stylesheet from the document if it exists.
          var stylesheet = ctrl.stylesheet;
          var styleParent = stylesheet && stylesheet.parentNode;

          if (styleParent) {
            styleParent.removeChild(stylesheet);
          } // Add the nested CSS to the panel.


          ctrl.stylesheet = JS.css(JSON.parse((0, _helperFunctions.pseudoCssToJSON)(panel.css)), '.' + cls);
        },
        methods: {
          onError: function onError(err, info) {
            console.error('VueHtmlPanelCtrl error:', {
              err: err,
              info: info
            });
          }
        }
      });
    }
    /**
     * Gets the object containing the variables available to the Vue HTML.
     * @returns {Object}
     *   The Vue scope that is made available to the Vue HTML.
     */

  }, {
    key: "getVueScope",
    value: function getVueScope() {
      return _lodash.default.cloneDeep({
        dataset: this.dataset,
        panel: _lodash.default.pick(this.panel, PANEL_PROP_KEYS)
      });
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
      if (dataList && dataList.length) {
        this.dataset = dataList.map(function (data) {
          var colNames = data.columns.map(function (c) {
            return 'string' === typeof c ? c : c.text;
          });
          return {
            columnNames: colNames,
            rows: data.rows.map(function (row) {
              return row.reduceRight(function (carry, cell, cellIndex) {
                carry[colNames[cellIndex]] = cell;
                return carry;
              }, {});
            }),
            raw: data
          };
        });
      } else {
        var EXTRA_COLS = 2;
        this.dataset = [{
          columns: [{
            text: "X"
          }, {
            text: "X * X"
          }, {
            text: "X + X"
          }].concat(_lodash.default.range(EXTRA_COLS).map(function (y) {
            return {
              text: "".concat(y, " / Math.random()")
            };
          })),
          rows: _lodash.default.range(150).map(function (x) {
            return [x, x * x, x + x].concat(_lodash.default.range(EXTRA_COLS).map(function (y) {
              return y / Math.random();
            }));
          }),
          isReal: false,
          type: 'table'
        }];
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
}(_sdk.MetricsPanelCtrl); // Allows for error handling in vueToHTML().


exports.VueHtmlPanelCtrl = VueHtmlPanelCtrl;

Vue.config.errorHandler = function (err, vm, info) {
  if (vm && vm.onError) {
    vm.onError(err, info);
  }
};

VueHtmlPanelCtrl.templateUrl = 'partials/module.html';
//# sourceMappingURL=ctrl.js.map
