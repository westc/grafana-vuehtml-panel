# Changelog

- **v1.7.2**
  - Fixed `url.getTimeValues()` and `url.getTimeParams()` so that if they contain custom dates the dates will display correctly in the URL.

- **v1.7.1**
  - Fixed UTF-8 downloads which caused some characters to render incorrectly in Excel.

- **v1.7.0**
  - Added support for saving the content as a PNG.

- **v1.6.0**
  - Added support for time series.
  - Added `datasets` and `datasetsById` to the Vue scope.
  - Show VueJS errors instead of content if any occur.
  - Updated YourJS (`JS`) to v2.18.0.
  - Fixed the display of the Vue scope when editing.
  - Fixed bug where refresh rate is reduced after updating panel.

- **v1.5.0**
  - Added an option to define if `1em` will be the content height, the content width, the maximum of the content dimensions, the minimum of the content dimensions or the average of the content dimensions.

- **v1.4.0**
  - Added `url` functions:
    - `url.encode()` - Encodes a value so that it can appear correctly within the parameters of a URL.
    - `url.decode()` - Decodes a parameter value of a URL.
    - `url.toParams()` - Turns an object unto a string where the keys and values are encoded to be used a URL.
    - `url.getTimeValues()` - Gets an object for the specified time values.
    - `url.getTimeParams()` - Gets a URL encoded string indicating the specified time values.
    - `url.getVarValues()` - Gets an object indicating all or just the specified dashboard URL variables.
    - `url.getVarParams()` - Gets a URL encoded string indicating all or just the specified dashboard URL variables.
  - Added `themeType` to indicate the type of theme (light or dark) that is currently displaying.

- **v1.3.0**
  - Added an option to make `1em` equal to the panel's content height so that you can potentially size the content based on the size of the panel instead of the size of the window.
  - Fixed invalid initial HTML string.


- **v1.2.1**
  - Fixed faulty selector around disabling table downloads.
