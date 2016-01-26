'use strict';

var manifoldjsLib = require('manifoldjs-lib');

var validationConstants = manifoldjsLib.constants.validation,
    imageValidation =  manifoldjsLib.manifestTools.imageValidation;

var constants = require('../constants');

module.exports = function (manifestContent, callback) {
  var description = 'A 32x32 icon is required for the Office Add on Marketplace, a default icon will be generated',
  platform = constants.platform.id,
  level = validationConstants.levels.warning,
  requiredIconSizes = ['32x32'];

  imageValidation(manifestContent, description, platform, level, requiredIconSizes, callback);
};
