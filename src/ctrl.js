import {MetricsPanelCtrl} from 'app/plugins/sdk';
import _ from 'lodash';
import * as JS from './external/YourJS.min';
import { pseudoCssToJSON, toCSV, tableToArray } from './helper-functions';
import * as Vue from './external/vue.min';
import config from 'app/core/config';

const SEL_DISABLE_DOWNLOAD_CSV = '<llow-csv><ble-csv><llow-download><ble-download>'.replace(/<(.+?)>/g, ':not([data-disa$1])');

const DEFAULT_PANEL_SETTINGS = {
  html: '<h2>Output of available datasets:</h2>\n<div><pre>{{ JSON.stringify(dataset, null, 2) }}</pre></div>',
  css: '& {\n  overflow: auto;\n}',
  canDownloadDatasets: true,
  emIsContentHeight: false
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
    // this.events.on('component-did-mount', this.onComponentDidMount.bind(this));
    // this.events.on('data-error', this.onDataError.bind(this));
    // this.events.on('panel-size-changed', this.onPanelSizeChanged.bind(this));
    // this.events.on('panel-teardown', this.onPanelTeardown.bind(this));
    // this.events.on('refresh', this.onRefresh.bind(this));
    // this.events.on('render', this.onRender.bind(this));
  }

  /**
   * Executed when panel actions should be loaded.
   * @param {*} actions Actions to be added.
   */
  onInitPanelActions(actions) {
    let tablesSubmenu = this.panelElement.find('table').toArray().reduce(
      (carry, table, index) => {
        if (jQuery(table).is(SEL_DISABLE_DOWNLOAD_CSV)) {
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

  render() {
    // If an `em` unit is supposed to be the height of the panel then
    // recalculate it.
    let jElemPC = this.panelElement;
    jElemPC.css('font-size', this.panel.emIsContentHeight ? jElemPC.height() + 'px' : '');
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

    this.render(); // Recalculates `em` size if it is supposed to.

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
    let ctrl = this;
    return _.cloneDeep({
      dataset: ctrl.dataset,
      panel: ctrl.panel.getOptionsToRemember(),
      JS,
      themeType: config.theme.type,
      url: {
        encode(value) {
          return encodeURIComponent(value + '').replace(/%20/g, '+');
        },
        decode(value) {
          return decodeURIComponent((value + '').replace(/\+/g, '%20'));
        },
        toParams(objValues, opt_prefixVar) {
          return Object.entries(objValues).reduce((arrParams, [key, value]) => {
            return arrParams.concat(
              JS.toArray(value).map(
                value => this.encode((opt_prefixVar ? 'var-' : '') + key) + '=' + this.encode(value)
              )
            );
          }, []).join('&');
        },
        getTimeValues(opt_name) {
          let result = {};
          let { time } = ctrl.timeSrv;
          if (opt_name != 'to') {
            result.from = time.from;
          }
          if (opt_name != 'from') {
            result.to = time.to;
          }
          return result;
        },
        getTimeParams(opt_name) {
          return this.toParams(this.getTimeValues(opt_name));
        },
        getVarValues(opt_filter, opt_negate) {
          if (opt_filter && 'function' !== typeof opt_filter) {
            let arrFilter = JS.toArray(opt_filter);
            opt_filter = key => arrFilter.some(
              filter => filter instanceof RegExp ? filter.test(key) : (filter == key)
            );
          }
          
          return ctrl.templateSrv.variables.reduce(
            (values, variable) => {
              // At times current.value is a string and at times it is an array.
              let key = variable.name;
              let varValues = JS.toArray(variable.current.value);
              let isAll = variable.includeAll && varValues.length === 1 && varValues[0] === '$__all';
              varValues = isAll ? [variable.current.text] : varValues;
              if (opt_filter) {
                varValues = varValues.filter(value => !!opt_filter(key, value) === !opt_negate);
              }
              if (varValues.length) {
                values[key] = varValues;
              }
              return values;
            },
            {}
          );
        },
        getVarParams(opt_filter, opt_negate) {
          return this.toParams(this.getVarValues(opt_filter, opt_negate), true);
        }
      }
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
      this.dataset = [];
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
