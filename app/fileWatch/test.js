'use strict';

var _changeFinder = require('../fileWatch/changeFinder');

var cf = _interopRequireWildcard(_changeFinder);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

cf.refreshDB();