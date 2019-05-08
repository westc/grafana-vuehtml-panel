import {MetricsPanelCtrl} from 'app/plugins/sdk';
import _ from 'lodash';
import * as JS from './external/YourJS.min';
import { pseudoCssToJSON, toCSV, tableToArray } from './helper-functions';
import * as Vue from './external/vue.min';

const SEL_DISABLE_DOWNLOAD = '<llow-csv>, <ble-csv>, <llow-download>, <ble-download>'.replace(/<(.+?)>/g, ':not([data-disa$1]');

const DEFAULT_PANEL_SETTINGS = {
  html: '<h2>Output of available datasets:</h2>\n<div><pre>{{ JSON.stringify(dataset, null, 2); }}</pre>',
  css: '& {\n  overflow: auto;\n}',
  canDownloadDatasets: true
};

function normalizeHasher(hasher) {
  let hasherType = typeof hasher;
  return 'function' === hasherType
    ? hasher
    : 'string' === hasherType
      ? row => JSON.stringify(row[hasher])
      : row => JSON.stringify(hasher.map(item => row[item]));
}

export class VueHtmlPanelCtrl extends MetricsPanelCtrl {
  constructor($scope, $injector, $rootScope) {
    super($scope, $injector);

    this.$rootScope = $rootScope;

    _.defaultsDeep(this.panel, DEFAULT_PANEL_SETTINGS);

    this.events.on('init-edit-mode', this.onInitEditMode.bind(this));
    this.events.on('data-received', this.onDataReceived.bind(this));
    this.events.on('data-snapshot-load', this.onDataReceived.bind(this));
    this.events.on('view-mode-changed', this.onViewModeChanged.bind(this));
    this.events.on('init-panel-actions', this.onInitPanelActions.bind(this));
    
    // Additional events that we can hook into...
    // this.events.on('render', this.onRender.bind(this));
    // this.events.on('refresh', this.onRefresh.bind(this));
    // this.events.on('data-error', this.onDataError.bind(this));
    // this.events.on('panel-size-changed', this.onPanelSizeChanged.bind(this));
  }

  /**
   * Executed when panel actions should be loaded.
   * @param {*} actions Actions to be added.
   */
  onInitPanelActions(actions) {
    let tablesSubmenu = this.panelElement.find('table').toArray().reduce(
      (carry, table, index) => {
        if (jQuery(table).is(SEL_DISABLE_DOWNLOAD)) {
          carry.push({
            text: table.getAttribute('data-title') ? `Export "${table.getAttribute('data-title')}" As CSV` : `Export Table #${index + 1} As CSV`,
            icon: 'fa fa-fw fa-table',
            click: `ctrl.csvifyTable(${index})`
          });
        }
        return carry;
      },
      []
    );
    if (tablesSubmenu.length) {
      actions.push.apply(actions, [{ divider: true, role: 'Editor' }].concat(tablesSubmenu));
    }

    if (this.panel.canDownloadDatasets) {
      let datasetsSubmenu = this.dataset.reduce((carry, data, index) => {
        let raw = data.raw;
        if (raw.type === 'table' && raw.columns.length) {
          carry.push({
            text: `Export Dataset "${raw.refId}" As CSV`,
            icon: 'fa fa-fw fa-database',
            click: `ctrl.csvifyDataset(${index})`
          });
        }
        return carry;
      }, []);
      if (datasetsSubmenu.length) {
        actions.push.apply(actions, [{ divider: true, role: 'Editor' }].concat(datasetsSubmenu));
      }
    }
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

  csvifyDataset(datasetIndex) {
    let data = this.dataset[datasetIndex];
    let { columnNames, rows } = data;

    JS.dom({
      _: 'a',
      href: 'data:text/csv;charset=utf-8,' + encodeURIComponent(
        toCSV(
          rows.map(row => columnNames.map(cName => row[cName])),
          { headers: columnNames }
        )
      ),
      download: this.panel.title + JS.formatDate(new Date, " (YYYY-MM-DD 'at' H.mm.ss)") + `.dataset-${data.raw.refId}.csv`
    }).click();
  }

  csvifyTable(index) {
    let table = this.panelElement.find('table').toArray()[index];
    let title = table.getAttribute('data-title') || (this.panel.title + ` Table ${index + 1}`);

    JS.dom({
      _: 'a',
      href: 'data:text/csv;charset=utf-8,' + encodeURIComponent(toCSV(tableToArray(table))),
      download: title + JS.formatDate(new Date, " (YYYY-MM-DD 'at' H.mm.ss)") + `.csv`
    }).click();
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
    let ctrl = this;
    let jElemPC = ctrl.panelElement;
    let elemPC = jElemPC[0];
    let elem = JS.dom({ _: 'div' });
    let panel = ctrl.panel;
    let cls = ('_' + Math.random()).replace(/0\./, +new Date);

    jElemPC.html('').append(elem);

    elemPC.className = elemPC.className.replace(/(^|\s+)_\d+(?=\s+|$)/g, ' ').trim() + ' ' + cls;

    // Data available to the HTML code.
    let vueScope = ctrl.getVueScope();

    if (ctrl.vue) {
      ctrl.vue.$destroy();
    }

    ctrl.vue = new Vue({
      template: `<div>${panel.html}</div>`,
      el: elem,
      data: vueScope,
      mounted() {
        // Remove the old stylesheet from the document if it exists.
        let stylesheet = ctrl.stylesheet;
        let styleParent = stylesheet && stylesheet.parentNode;
        if (styleParent) {
          styleParent.removeChild(stylesheet);
        }

        // Add the nested CSS to the panel.
        ctrl.stylesheet = JS.css(JSON.parse(pseudoCssToJSON(panel.css)), '.' + cls);
      },
      methods: {
        onError(err, info) {
          console.error('VueHtmlPanelCtrl error:', { err, info });
        },
        keyRows(rows, hasher) {
          hasher = normalizeHasher(hasher);
          return rows.reduce((carry, row) => {
            let key = hasher(row);
            carry[key] = _.has(carry, key) ? carry[key].concat([row]) : [row];
            return carry;
          }, {});
        },
        indexRows(rows, hasher) {
          hasher = normalizeHasher(hasher);
          let keys = rows.map(row => hasher(row));
          let uniqueKeys = _.uniq(keys);
          return rows.reduce((carry, row, rowIndex) => {
            let realIndex = uniqueKeys.indexOf(keys[rowIndex]);
            carry[realIndex] = _.has(carry, realIndex) ? carry[realIndex].concat([row]) : [row];
            return carry;
          }, []);
        }
      }
    });
  }

  /**
   * Gets the object containing the variables available to the Vue HTML.
   * @returns {Object}
   *   The Vue scope that is made available to the Vue HTML.
   */
  getVueScope() {
    return _.cloneDeep({
      dataset: this.dataset,
      panel: this.panel.getOptionsToRemember(),
      JS
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
      this.dataset = dataList.map(data => {
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
      this.dataset = [
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

// Allows for error handling in vueToHTML().
Vue.config.errorHandler = (err, vm, info) => {
  if (vm && vm.onError) {
    vm.onError(err, info);
  }
};

VueHtmlPanelCtrl.templateUrl = 'partials/module.html';
