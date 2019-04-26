"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.VueHtmlPanelCtrl = void 0;

var _sdk = require("app/plugins/sdk");

var _lodash = _interopRequireDefault(require("lodash"));

var JS = _interopRequireWildcard(require("./external/YourJS.min"));

var _helperFunctions = require("./helper-functions");

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

    _this.events.on('view-mode-changed', _this.onViewModeChanged.bind(_assertThisInitialized(_this))); // Additional events that we can hook into...
    // this.events.on('render', this.onRender.bind(this));
    // this.events.on('data-error', this.onDataError.bind(this));
    // this.events.on('init-panel-actions', this.onInitPanelActions.bind(this));
    // this.events.on('panel-size-changed', this.onPanelSizeChanged.bind(this));


    return _this;
  }
  /**
   * Executed before showing edit mode.
   */


  _createClass(VueHtmlPanelCtrl, [{
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
      var _this2 = this;

      var jElem = this.panelElement;
      var panel = this.panel; // Data available to the HTML code.

      var vueScope = this.getVueScope();
      (0, _helperFunctions.vueToHTML)(panel.html, vueScope, function (html) {
        var elem = jElem[0]; // Adds the HTML that the user entered onto the panel after interpreting
        // any Vue.js syntax.

        jElem.html(html); // Remove the old stylesheet from the document if it exists.

        var stylesheet = _this2.stylesheet;
        var styleParent = stylesheet && stylesheet.parentNode;

        if (styleParent) {
          styleParent.removeChild(stylesheet);
        } // Remove the old class names added by YourJS.css().


        elem.className = elem.className.replace(/(^|\s+)_\d+(?=\s+|$)/g, ' ').trim(); // Add the nested CSS to the panel.

        _this2.stylesheet = JS.css(JSON.parse((0, _helperFunctions.pseudoCssToJSON)(panel.css)), elem);
      }, // If an error occurs then it should be logged as such.
      function (err, info) {
        console.error('VueHtmlPanelCtrl error:', {
          err: err,
          info: info
        });
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
        dataset: this.dataList,
        panel: this.panel
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
        this.dataList = dataList.map(function (data) {
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
        this.dataList = [{
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
}(_sdk.MetricsPanelCtrl);

exports.VueHtmlPanelCtrl = VueHtmlPanelCtrl;
VueHtmlPanelCtrl.templateUrl = 'partials/module.html';
//# sourceMappingURL=ctrl.js.map
