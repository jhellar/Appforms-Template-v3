//load browserified npm dependencies into global variables

window.async = require('async');
window.jQuery = window.$ = require('jquery');
window.Backbone = require('backbone');
window._ = require('underscore');
require('fh-js-sdk/dist/feedhenry-forms.js');
require('fh-js-sdk/dist/appForms-backbone.js');
window.moment = require('moment');

require('bootstrap');
require('bootstrap-tagsinput');
require('bootstrap-slider');
require('fastclick');