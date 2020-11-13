import { MetricsPanelCtrl } from 'grafana/app/plugins/sdk';
import { cloneDeep, defaultsDeep, extend, has, uniq } from 'lodash';
import { saveAs } from './external/FileSaver.min.js';
import * as JS from './external/YourJS.JS.min';
import domtoimage from './external/dom-to-image.min';
import { pseudoCssToJSON, toCSV, tableToArray } from './helper-functions';
import * as Vue from './external/vue.min';
import config from 'grafana/app/core/config';
import jQuery from 'jquery';
import { DataFrame } from '@grafana/data';

const SEL_DISABLE_DOWNLOAD_CSV = '<llow-csv><ble-csv><llow-download><ble-download>'.replace(/<(.+?)>/g, ':not([data-disa$1])');

const DEFAULT_PANEL_SETTINGS = {
  html: '<h2>Output of available datasets:</h2>\n<div><pre>{{ JSON.stringify(dataset, null, 2) }}</pre></div>',
  css: '& {\n  overflow: auto;\n}',
  canDownloadDatasets: true,
  canDownloadAsJPEG: false,
  canDownloadAsPNG: true,
  canDownloadAsSVG: false,
  emType: null,
  refreshRate: null,
};

const REFRESH_RATE_OPTIONS = [
  { value: null, text: 'Never' },
  { value: 1, text: 'Every second' },
  { value: 60, text: 'Every minute' },
];

const EM_TYPES = [
  { value: null, text: 'Default' },
  { value: 'CONTENT-HEIGHT', text: 'Content Height' },
  { value: 'CONTENT-WIDTH', text: 'Content Width' },
  { value: 'CONTENT-MIN-DIM', text: 'Minimum Content Dimension' },
  { value: 'CONTENT-MAX-DIM', text: 'Maximum Content Dimension' },
  { value: 'CONTENT-AVG-DIM', text: 'Average of Content Dimensions' },
];

function normalizeHasher(hasher) {
  let hasherType = typeof hasher;
  return 'function' === hasherType
    ? hasher
    : 'string' === hasherType
    ? row => JSON.stringify(row[hasher])
    : row => JSON.stringify(hasher.map(item => row[item]));
}

function getAllDashboards(callback) {
  getApiData(`search`, callback);
}

function getApiData(id, callback) {
  jQuery.ajax(`/api/${id}`, {
    complete(result, statusText) {
      callback(result.responseJSON || result, statusText === 'success');
    },
  });
}

interface KeyValue {
  key: string;
  value: any;
}

export default class SimpleCtrl extends MetricsPanelCtrl {
  dataFormat!: string;
  dataset!: any[];
  datasets!: any[];
  datasetsById!: {};
  element!: any;
  panelElement!: any;
  vue!: any;
  stylesheet!: any;
  refreshTimeout?: any;
  $rootScope!: any;

  static templateUrl = 'partials/module.html';

  // Simple example showing the last value of all data
  firstValues: KeyValue[] = [];

  REFRESH_RATE_OPTIONS?: Array<{ value: null; text: string } | { value: number; text: string }>;
  EM_TYPES?: Array<{ value: null; text: string } | { value: string; text: string }>;

  /** @ngInject */
  constructor($scope, $injector, $rootScope) {
    super($scope, $injector);

    this.$rootScope = $rootScope;

    defaultsDeep(this.panel, DEFAULT_PANEL_SETTINGS);

    // If panel.emIsContentHeight was used, convert it to panel.emType.
    let { emIsContentHeight } = this.panel;
    if (emIsContentHeight != null) {
      this.panel.emType = emIsContentHeight ? 'CONTENT-HEIGHT' : null;
      delete this.panel.emIsContentHeight;
    }

    // Get results directly as DataFrames
    this.dataFormat = 'series';

    this.events.on('init-edit-mode', this.onInitEditMode.bind(this));
    this.events.on('render', this.onRender.bind(this));
    this.events.on('data-error', this.onDataError.bind(this));
    this.events.on('data-received', this.onDataReceived.bind(this));
    this.events.on('data-snapshot-load', this.onDataReceived.bind(this));
    this.events.on('view-mode-changed', this.onViewModeChanged.bind(this));
    this.events.on('init-panel-actions', this.onInitPanelActions.bind(this));
  }

  link(scope, elem, attrs, ctrl) {
    this.element = elem;
    this.panelElement = elem.find('grafana-panel > *:eq(0)');
  }

  onInitEditMode() {
    this.addEditorTab('Options', `public/plugins/${this.pluginId}/partials/options.html`, 2);
  }

  onRender() {
    if (!this.firstValues || !this.firstValues.length) {
      return;
    }

    // Tells the screen capture system that you finished
    this.renderingCompleted();
  }

  onDataError(err: any) {
    console.log('onDataError', err);
  }

  /**
   * Executed whenever data is received from the database for this panel.
   * @param {Array} dataList
   *   An array of objects containing the data that is collected from the
   *   database.
   */
  onDataReceived(dataList: any[]) {
    this.datasets = this.dataset = [];
    this.datasetsById = {};

    if (dataList) {
      let datasetNames: string[] = [];

      dataList.forEach(data => {
        let { refId, datapoints, target, columns, rows }: { refId: string; [key: string]: any } = data;
        let datasetIndex = datasetNames.indexOf(refId);
        let dataset;

        if (data.type === 'table') {
          let colNames = columns.map(c => ('string' === typeof c ? c : c.text));

          this.datasetsById[refId] = dataset = {
            columnNames: colNames,
            rows: rows.map(row => {
              return row.reduceRight((carry, cell, cellIndex) => {
                carry[colNames[cellIndex]] = cell;
                return carry;
              }, {});
            }),
            raw: data,
          };
        } else {
          dataset = this.datasetsById[refId] = this.datasetsById[refId] || {
            columnNames: ['value', 'time', 'metric'],
            rows: [],
            raw: [],
            refId,
          };

          datapoints.forEach(row => {
            dataset.rows.push(row.slice(0, 2).concat([target]));
          });

          if (JS.typeOf(dataset.raw) === 'Array') {
            dataset.raw.push(data);
          }
        }

        if (datasetIndex < 0) {
          datasetIndex = datasetNames.push(refId) - 1;
          this.datasets[datasetIndex] = this.dataset[datasetIndex] = dataset;
        }
      });
    }

    this.updateView();
    this.logVueScope();
  }

  /**
   * Executed when the view mode of the panel changes between edit and view.
   */
  onViewModeChanged() {
    this.logVueScope();
  }

  /**
   * Executed when panel actions should be loaded.
   * @param {Array} actions Actions to be added.
   */
  onInitPanelActions(actions: any[]) {
    let tablesSubmenu = this.panelElement
      .find('table')
      .toArray()
      .reduce((carry, table, index) => {
        if (jQuery(table).is(SEL_DISABLE_DOWNLOAD_CSV)) {
          carry.push({
            text: table.getAttribute('data-title') ? `Export "${table.getAttribute('data-title')}" As CSV` : `Export Table #${index + 1} As CSV`,
            icon: 'fa fa-fw fa-table',
            click: `ctrl.csvifyTable(${index})`,
          });
        }
        return carry;
      }, []);
    if (tablesSubmenu.length) {
      actions.push.apply(actions, [{ divider: true, role: 'Editor' }].concat(tablesSubmenu));
    }

    // if (this.panel.canDownloadDatasets) {
    //   let datasetsSubmenu = this.dataset.reduce((carry, data, index) => {
    //     let raw = data.raw;
    //     if (raw.type === 'table' && raw.columns.length) {
    //       carry.push({
    //         text: `Export Dataset "${raw.refId}" As CSV`,
    //         icon: 'fa fa-fw fa-database',
    //         click: `ctrl.csvifyDataset(${index})`
    //       });
    //     }
    //     return carry;
    //   }, []);
    //   if (datasetsSubmenu.length) {
    //     actions.push.apply(actions, [{ divider: true, role: 'Editor' }].concat(datasetsSubmenu));
    //   }
    // }

    if (this.panel.canDownloadAsJPEG) {
      actions.push({
        text: 'Screenshot As JPEG',
        icon: 'fa fa-fw fa-image',
        click: 'ctrl.downloadJPEG()',
      });
    }
    if (this.panel.canDownloadAsPNG) {
      actions.push({
        text: 'Screenshot As PNG',
        icon: 'fa fa-fw fa-image',
        click: 'ctrl.downloadPNG()',
      });
    }
    if (this.panel.canDownloadAsSVG) {
      actions.push({
        text: 'Screenshot As SVG',
        icon: 'fa fa-fw fa-image',
        click: 'ctrl.downloadSVG()',
      });
    }
  }

  /**
   * Should only be called when the panel should re-rendered fresh.  Not defined
   * as render because there is no need to re-render every time the window
   * resizes or the panel resizes.
   */
  updateView() {
    let ctrl = this;
    let { panel } = ctrl;
    let { refreshRate } = panel;

    let jElemPC = ctrl.panelElement;
    let elemPC = jElemPC[0];
    let elem = JS.dom({ _: 'div' });
    let cls = ('_' + Math.random()).replace(/0\./, +new Date() + '');

    ctrl.render(); // Recalculates `em` size if it is supposed to.

    // Data available to the HTML code.
    let myVue = ctrl.vue;
    let vueScope = ctrl.getVueScope();
    let vueScopeData = JS.filter(vueScope, value => 'function' !== typeof value);
    let vueScopeMethods = extend(
      JS.filter(vueScope, value => 'function' === typeof value),
      {
        getVue() {
          return myVue;
        },
      }
    );

    let templateValues = {
      template: `<div>${panel.html}</div>`,
      data: vueScopeData,
      methods: vueScopeMethods,
    };

    // Remove the old stylesheet from the document if it exists.
    let stylesheet = ctrl.stylesheet;
    let styleParent = stylesheet && stylesheet.parentNode;
    if (styleParent) {
      styleParent.removeChild(stylesheet);
    }

    // Add the nested CSS to the panel.
    ctrl.stylesheet = JS.css(JSON.parse(pseudoCssToJSON(panel.css)), '.' + cls);

    elemPC.className = elemPC.className.replace(/(^|\s+)_\d+(?=\s+|$)/g, ' ').trim() + ' ' + cls;

    // Gets all dashboards via the API.
    getAllDashboards((data, isSuccess) => {
      if (isSuccess) {
        myVue.rawTemplate.data.allDashboards = data;
      }
    });

    if (myVue) {
      extend(myVue.rawTemplate, templateValues);
    } else {
      jElemPC.html('').append(elem);

      myVue = ctrl.vue = new Vue({
        el: elem,
        template: `<div :is="template"></div>`,
        data() {
          return {
            rawTemplate: templateValues,
          };
        },
        computed: {
          template() {
            let { template, data, methods } = this.rawTemplate;
            return {
              template,
              data: function() {
                return data;
              },
              methods,
            };
          },
        },
      });
    }

    if (refreshRate > 0 && ~~refreshRate === refreshRate) {
      // Make sure that panel only gets refreshed according to the specified
      // interval.
      if (ctrl.refreshTimeout) {
        clearTimeout(ctrl.refreshTimeout);
        ctrl.refreshTimeout = undefined;
      }

      ctrl.refreshTimeout = setTimeout(function() {
        // Only update if the refresh rate remains unchanged
        if (refreshRate === ctrl.panel.refreshRate) {
          ctrl.updateView();
        }
      }, refreshRate * 1e3);
    }
  }

  downloadJPEG() {
    domtoimage.toJpeg(this.panelElement.find('div')[0], { quality: 0.85 }).then(uri => {
      JS.dom({
        _: 'a',
        href: uri,
        download: this.panel.title + JS.formatDate(new Date(), " (YYYY-MM-DD 'at' H.mm.ss)") + '.screenshot.jpeg',
      }).click();
    });
  }

  downloadPNG() {
    domtoimage.toPng(this.panelElement.find('div')[0]).then(uri => {
      JS.dom({
        _: 'a',
        href: uri,
        download: this.panel.title + JS.formatDate(new Date(), " (YYYY-MM-DD 'at' H.mm.ss)") + '.screenshot.png',
      }).click();
    });
  }

  downloadSVG() {
    domtoimage.toSvg(this.panelElement.find('div')[0]).then(uri => {
      JS.dom({
        _: 'a',
        href: uri,
        download: this.panel.title + JS.formatDate(new Date(), " (YYYY-MM-DD 'at' H.mm.ss)") + '.screenshot.svg',
      }).click();
    });
  }

  csvifyDataset(datasetIndex) {
    let data = this.dataset[datasetIndex];
    let { columnNames } = data;

    let csvContent = toCSV(
      data.rows.map(row => columnNames.map(cName => row[cName])),
      { headers: columnNames }
    );
    let blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
    let fileName = this.panel.title + JS.formatDate(new Date(), " (YYYY-MM-DD 'at' H.mm.ss)") + `.dataset-${data.raw.refId}.csv`;
    saveAs(blob, fileName);
  }

  csvifyTable(index) {
    let table = this.panelElement.find('table').toArray()[index];
    let title = table.getAttribute('data-title') || this.panel.title + ` Table ${index + 1}`;
    let blob = new Blob([toCSV(tableToArray(table))], { type: 'text/csv;charset=utf-8' });
    let fileName = title + JS.formatDate(new Date(), " (YYYY-MM-DD 'at' H.mm.ss)") + `.csv`;
    saveAs(blob, fileName);
  }

  /**
   * Adds the Vue scope to the console log if in editing mode.
   */
  logVueScope() {
    // If in editing mode show the html scope.
    if (this.panel.isEditing) {
      let interval = setInterval(_ => {
        if (this.vue) {
          clearInterval(interval);
          console.log('Available data values:', this.vue.rawTemplate.data);
          console.log('Available methods:', this.vue.rawTemplate.methods);
        }
      }, 250);
    }
  }

  /**
   * Gets the object containing the variables available to the Vue HTML.
   * @returns {Object}
   *   The Vue scope that is made available to the Vue HTML.
   */
  getVueScope() {
    let ctrl = this;

    let result = cloneDeep({
      allDashboards: [],
      dashboard: JS.filter(ctrl.dashboard, value => JS.isPrimitive(value)),
      dataset: ctrl.dataset,
      datasets: ctrl.datasets,
      datasetsById: ctrl.datasetsById,
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
          return Object.entries(objValues)
            .reduce((arrParams, [key, value]) => {
              return arrParams.concat(JS.toArray(value).map(value => this.encode((opt_prefixVar ? 'var-' : '') + key) + '=' + this.encode(value)));
            }, [])
            .join('&');
        },
        getTimeValues(opt_name) {
          let result: { from?: any; to?: any } = {};
          let { from, to } = ctrl.timeSrv.timeRangeForUrl();
          if (opt_name !== 'to') {
            result.from = from;
          }
          if (opt_name !== 'from') {
            result.to = to;
          }
          return result;
        },
        getTimeParams(opt_name) {
          return this.toParams(this.getTimeValues(opt_name));
        },
        getVarValues(opt_filter, opt_negate) {
          if (opt_filter && 'function' !== typeof opt_filter) {
            let arrFilter = JS.toArray(opt_filter);
            opt_filter = key => arrFilter.some(filter => (filter instanceof RegExp ? filter.test(key) : filter === key));
          }

          return ctrl.templateSrv.variables.reduce((values, variable) => {
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
          }, {});
        },
        getVarParams(opt_filter, opt_negate) {
          return this.toParams(this.getVarValues(opt_filter, opt_negate), true);
        },
      },
      offsetDateTZ(date, opt_tzOffset) {
        date = new Date(date);
        opt_tzOffset = opt_tzOffset == null ? date.getTimezoneOffset() : opt_tzOffset;
        return new Date(+date + opt_tzOffset * 6e4);
      },
      onError(err, info) {
        ctrl.renderError('VueJS Error', err.message, true);
        console.error('VueHtmlPanelCtrl error:', { err, info });
      },
      keyRows(rows, hasher) {
        hasher = normalizeHasher(hasher);
        return rows.reduce((carry, row) => {
          let key = hasher(row);
          carry[key] = has(carry, key) ? carry[key].concat([row]) : [row];
          return carry;
        }, {});
      },
      indexRows(rows, hasher) {
        hasher = normalizeHasher(hasher);
        let keys = rows.map(row => hasher(row));
        let uniqueKeys = uniq(keys);
        return rows.reduce((carry, row, rowIndex) => {
          let realIndex = uniqueKeys.indexOf(keys[rowIndex]);
          carry[realIndex] = has(carry, realIndex) ? carry[realIndex].concat([row]) : [row];
          return carry;
        }, []);
      },
    });

    return result;
  }

  renderError(title, message, isMonospace) {
    this.panelElement.html('').append(
      JS.dom({
        _: 'div',
        style: { display: 'flex', alignItems: 'center', textAlign: 'center', height: '100%' },
        $: [
          {
            _: 'div',
            cls: 'alert alert-error',
            style: { margin: '0px auto' },
            $: {
              _: 'div',
              $: [
                { _: 'h2', style: { color: '#FFF' }, text: title },
                { _: isMonospace ? 'pre' : 'div', text: message },
              ],
            },
          },
        ],
      })
    );
  }

  // 6.3+ get typed DataFrame directly
  handleDataFrame(data: DataFrame[]) {
    const values: KeyValue[] = [];

    for (const frame of data) {
      for (let i = 0; i < frame.fields.length; i++) {
        values.push({
          key: frame.fields[i].name,
          value: frame.fields[i].values,
        });
      }
    }

    this.firstValues = values;
  }
}

// Allows for error handling in vueToHTML().
Vue.config.errorHandler = (err, vm, info) => {
  if (vm && vm.onError) {
    vm.onError(err, info);
  }
};

SimpleCtrl.prototype.REFRESH_RATE_OPTIONS = REFRESH_RATE_OPTIONS;
SimpleCtrl.prototype.EM_TYPES = EM_TYPES;

export { SimpleCtrl as PanelCtrl };
