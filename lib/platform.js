'use strict';

var path = require('path'),
    url = require('url'),
    util = require('util');;
var fs = require('fs'); 

var Q = require('q');

var manifoldjsLib = require('manifoldjs-lib');


var PlatformBase = manifoldjsLib.PlatformBase,
    manifestTools = manifoldjsLib.manifestTools,
    CustomError = manifoldjsLib.CustomError,
    fileTools = manifoldjsLib.fileTools,
    iconTools = manifoldjsLib.iconTools;

var constants = require('./constants'),
    manifest = require('./manifest');

function Platform (packageName, platforms) {

  var self = this;
  
  PlatformBase.call(this, constants.platform.id, constants.platform.name, packageName, __dirname);
 
  // save platform list
  self.platforms = platforms;

  // override create function
  self.create = function (w3cManifestInfo, rootDir, options, callback) {

    self.info('Generating the ' + constants.platform.name + ' app...')
    
    var platformDir = path.join(rootDir, constants.platform.id);
   // var  manifestDir = path.join(platformDir, 'manifest');

    // convert the W3C manifest to a platform-specific manifest
    var platformManifestInfo;
    return manifest.convertFromBase(w3cManifestInfo)
      // if the platform dir doesn't exist, create it
      .then(function (manifestInfo) {
        platformManifestInfo = manifestInfo;         
        self.debug('Creating the ' + constants.platform.name + ' app folder...');
      //  return fileTools.mkdirp(platformDir);
      })
      // persist the platform-specific manifest
      .then(function () {

        return fileTools.mkdirp(platformDir).then(function () {
          self.debug('Copying the ' + constants.platform.name + ' manifest to the app folder...');
          var manifestFilePath = path.join(platformDir, 'manifest.xml');

          return Q.nfcall(fs.writeFile, manifestFilePath, platformManifestInfo.content.rawManifest)
                  .catch(function (err) {
                    return Q.reject(new CustomError('Failed to copy the manifest to the platform folder.', err));
                  });
        })
      })     
    
    .then(function(){
        
                return self.downloadIcons(platformManifestInfo.content, w3cManifestInfo.content.start_url, platformDir); 
    })
    
      // copy the documentation
      .then(function () {
        return self.copyDocumentation(platformDir);
      })        
      // write generation info (telemetry)
      .then(function () {
        return self.writeGenerationInfo(w3cManifestInfo, platformDir);
      })    
      .nodeify(callback);
  };
}

util.inherits(Platform, PlatformBase);

module.exports = Platform;
