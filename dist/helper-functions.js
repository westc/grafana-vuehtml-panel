"use strict";

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
  strLess = strLess.replace(/\/\*[^]*?\*\//g, '').replace(/([^\{\};]+)\{|([^:\{\}]+):([^;]+);|\}/g, function (match, ruleName, styleName, styleValue) {
    if (ruleName) {
      openCount++;
      return JSON.stringify(ruleName.trim()) + ":{";
    }

    if (styleName) {
      return JSON.stringify(styleName.trim()) + ":" + JSON.stringify(styleValue.trim()) + ",";
    }

    closeCount++;
    return "},";
  }).replace(/,\s*(\}|$)/g, '$1');

  try {
    return JSON.stringify(JSON.parse("{" + strLess + "}"), null, 2);
  } catch (e) {
    throw new Error(openCount !== closeCount ? "Pseudo-CSS contains too many " + (openCount > closeCount ? "open" : "clos") + "ing braces." : "Pseudo-CSS couldn't be parsed correctly.");
  }
}
/**
 * Converts an array of arrays of values to a CSV string.
 * @param rows {Array<Array>}
 *     An array of arrays of values that should be converted to a CSV string.
 * @param opt_options {Object=}
 *     Optional.  If this contains a `nullString` property the value will be used
 *     as the string that will appear whenever `null` or `undefined` is found.
 *     If this contains a `headers` property the value should be an array
 *     indicating the headers to be included as the first row.
 * @returns {string}
 *     The CSV version of `rows` with any specified options.
 */


function toCSV(rows, opt_options) {
  opt_options = Object(opt_options);

  if (opt_options.headers) {
    rows = [opt_options.headers].concat(rows);
  }

  var nullString = opt_options.hasOwnProperty('nullString') ? opt_options.nullString : '(NULL)';
  return rows.map(function (row) {
    return row.map(function (cell) {
      cell = cell != null ? 'function' === typeof cell.toString ? cell + "" : Object.prototype.toString.call(cell) : nullString;
      return /[",\n\r]/.test(cell) ? '"' + cell.replace(/"/g, '""') + '"' : cell;
    }).join(',');
  }).join('\n');
} // Based on https://gist.github.com/westc/0fa021ae5e66004c60e07c967e0b747f


function tableToArray(tbl, opt_cellValueGetter) {
  opt_cellValueGetter = opt_cellValueGetter || function (td) {
    return td.textContent || td.innerText;
  };

  var twoD = [];

  for (var rowCount = tbl.rows.length, rowIndex = 0; rowIndex < rowCount; rowIndex++) {
    twoD.push([]);
  }

  for (var rowIndex = 0, tr; rowIndex < rowCount; rowIndex++) {
    var tr = tbl.rows[rowIndex];

    for (var colIndex = 0, colCount = tr.cells.length, offset = 0; colIndex < colCount; colIndex++) {
      var td = tr.cells[colIndex],
          text = opt_cellValueGetter(td, colIndex, rowIndex, tbl);

      while (twoD[rowIndex].hasOwnProperty(colIndex + offset)) {
        offset++;
      }

      for (var i = 0, colSpan = parseInt(td.colSpan, 10) || 1; i < colSpan; i++) {
        for (var j = 0, rowSpan = parseInt(td.rowSpan, 10) || 1; j < rowSpan; j++) {
          twoD[rowIndex + j][colIndex + offset + i] = i === 0 && j === 0 ? text : '';
        }
      }
    }
  }

  return twoD;
}

module.exports = {
  pseudoCssToJSON: pseudoCssToJSON,
  toCSV: toCSV,
  tableToArray: tableToArray
};
//# sourceMappingURL=helper-functions.js.map
