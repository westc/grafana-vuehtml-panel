import {MetricsPanelCtrl} from 'app/plugins/sdk';
import _ from 'lodash';
import * as JS from './external/YourJS.min';
import { vueToHTML, pseudoCssToJSON } from './helper-functions';

const DEFAULT_PANEL_SETTINGS = {
  html: '',
  css: '& {\n  overflow: auto;\n}'
};

export class VueHtmlPanelCtrl extends MetricsPanelCtrl {
  constructor($scope, $injector, $rootScope) {
    super($scope, $injector);

    this.$rootScope = $rootScope;

    _.defaultsDeep(this.panel, DEFAULT_PANEL_SETTINGS);

    this.events.on('init-edit-mode', this.onInitEditMode.bind(this));
    this.events.on('data-received', this.onDataReceived.bind(this));
    this.events.on('data-snapshot-load', this.onDataReceived.bind(this));
    this.events.on('view-mode-changed', this.onViewModeChanged.bind(this));
    
    // Additional events that we can hook into...
    // this.events.on('render', this.onRender.bind(this));
    // this.events.on('data-error', this.onDataError.bind(this));
    // this.events.on('init-panel-actions', this.onInitPanelActions.bind(this));
    // this.events.on('panel-size-changed', this.onPanelSizeChanged.bind(this));
  }

  /**
   * Executed before showing edit mode.
   */
  onInitEditMode() {
    let path = 'public/plugins/westc-vuehtml-panel/partials/';
    this.addEditorTab('Editor', `${path}editor.html`, 1);
  }

  /**
   * Executed when the view mode of the panel changes between edit and view.
   */
  onViewModeChanged() {
    this.logVueScope();
  }

  /**
   * Adds the Vue scope to the console log if in editing mode.
   */
  logVueScope() {
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
  updateView() {
    let jElem = this.panelElement;
    let panel = this.panel;

    // Data available to the HTML code.
    let vueScope = this.getVueScope();

    vueToHTML(
      panel.html,
      vueScope,
      html => {
        let elem = jElem[0];

        // Adds the HTML that the user entered onto the panel after interpreting
        // any Vue.js syntax.
        jElem.html(html);

        // Remove the old stylesheet from the document if it exists.
        let stylesheet = this.stylesheet;
        let styleParent = stylesheet && stylesheet.parentNode;
        if (styleParent) {
          styleParent.removeChild(stylesheet);
        }

        // Remove the old class names added by YourJS.css().
        elem.className = elem.className.replace(/(^|\s+)_\d+(?=\s+|$)/g, ' ').trim();

        // Add the nested CSS to the panel.
        this.stylesheet = JS.css(JSON.parse(pseudoCssToJSON(panel.css)), elem);
      },
      // If an error occurs then it should be logged as such.
      (err, info) => {
        console.error('VueHtmlPanelCtrl error:', { err, info });
      }
    );
}

  /**
   * Gets the object containing the variables available to the Vue HTML.
   * @returns {Object}
   *   The Vue scope that is made available to the Vue HTML.
   */
  getVueScope() {
    return _.cloneDeep({
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
  onDataReceived(dataList) {
    if (dataList && dataList.length) {
      this.dataList = dataList.map(data => {
        let colNames = data.columns.map(c => 'string' === typeof c ? c : c.text);
        return {
          columnNames: colNames,
          rows: data.rows.map(row => {
            return row.reduceRight((carry, cell, cellIndex) => {
              carry[colNames[cellIndex]] = cell;
              return carry;
            }, {});
          }),
          raw: data
        };
      });
    }
    else {
      let EXTRA_COLS = 2;
      this.dataList = [
        {
          columns: [{ text: "X" }, { text: "X * X" }, { text: "X + X" }].concat(_.range(EXTRA_COLS).map(y => ({ text: `${y} / Math.random()` }))),
          rows: _.range(150).map(x => [x, x * x, x + x].concat(_.range(EXTRA_COLS).map(y => y / Math.random()))),
          isReal: false,
          type: 'table'
        }
      ];
    }

    this.updateView();
    this.logVueScope();
  }

  link(scope, elem, attrs, ctrl) {
    this.element = elem;
    this.panelElement = elem.find('.panel-content');
  }
}

VueHtmlPanelCtrl.templateUrl = 'partials/module.html';
