


'use strict';

var url = require('url'),
    Q = require('q');

var utils = require('manifoldjs-lib').utils;

var constants = require('./constants');

//check to make sure there is a working W3C Manifest
function convertFromBase(manifestInfo, callback) {
  if (!manifestInfo || !manifestInfo.content) {
    return Q.reject(new Error('Manifest content is empty or not initialized.')).nodeify(callback);
  }
  
  //set the content of the W3C Manifest to local var
  var originalManifest = manifestInfo.content;
   
   //check for any required values for this platform.  In the case of office, we only "require" the start URL, all else is optional
  if (!originalManifest.start_url) {
    return Q.reject(new Error('Start URL is required.')).nodeify(callback);
  }

  //pull out the values that we need, then set them to our locals
  var manifest = {
    'name': originalManifest.short_name || originalManifest.name || "Office Add in",
    'description': originalManifest.name || 'Content from ' + originalManifest.start_url,
    'launch_path': url.parse(originalManifest.start_url).pathname,
    'scope': []
  };
  
  //add the scope in
  var tempArray = [];
   if(originalManifest.mjs_extended_scope){
      manifest.scope = tempArray.concat(originalManifest.mjs_extended_scope)
  }
  
   if(originalManifest.scope){
        manifest.scope.push(originalManifest.scope)
  }

  

  // map icons, pull all the icons from manifest that fit our dimentions into an array
  if (originalManifest.icons && originalManifest.icons.length) {
    var icons = {};

    for (var i = 0; i < originalManifest.icons.length; i++) {
      var icon = originalManifest.icons[i];
      var iconDimensions = icon.sizes.split('x');
      if (iconDimensions[0] === iconDimensions[1]) {
        icons[iconDimensions[0]] = icon.src;
      }
    }

    manifest.icons = icons;
  }
  
  //convert the manifest object into the XML to return
  //read base manifest from file
  //run replace to update the fields with the ones from the w3c manifest
  //generate the file
  

  // TODO: map permissions?

  var convertedManifestInfo = {
    'content': manifest,
    'format': constants.FIREFOX_MANIFEST_FORMAT
  };
  
  return Q.resolve(convertedManifestInfo).nodeify(callback);
}

module.exports = {
  convertFromBase: convertFromBase
}
