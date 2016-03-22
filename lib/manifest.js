


'use strict';

var url = require('url'),
    Q = require('q'),
    path = require('path'),
    fs = require('fs');

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
  var manifest = {};
  manifest.scopeArray = [];
  //add the scope in
  var tempArray = [];
  

  
   if(originalManifest.mjs_extended_scope){
      manifest.scopeArray = tempArray.concat(originalManifest.mjs_extended_scope)
  }
      if(originalManifest.scope){
        manifest.scopeArray.push(originalManifest.scope)
  } 

//set a string of the images you want to include in your final project, if they are in the manifest they will be copied down and into your porject
//you should have a default version of each of the required ones
  var platformIamges = '32x32';
  //set flag to require a default image, require by default
  manifest.requireDefaultImg = true

  // map icons, pull all the icons from manifest that fit our dimentions into an array
  if (originalManifest.icons && originalManifest.icons.length) {
    var icons = {};

    for (var i = 0; i < originalManifest.icons.length; i++) {
      var icon = originalManifest.icons[i];
      var patt = new RegExp(icon.sizes);
        if(patt.test(platformIamges)){
            //update flag to require default
            if(icon.sizes == '32x32') manifest.requireDefaultImg = false;
                var iconDimensions = icon.sizes.split('x');
                if (iconDimensions[0] === iconDimensions[1]) {
                    
                    icons[iconDimensions[0]] = icon.src;
                }
                }
        }
    manifest.icons = icons;

  }
  
  
  //convert the manifest object into the XML to return
  //read base manifest from file
  //run replace to update the fields with the ones from the w3c manifest
  //generate the file
 
  var manifestTemplatePath = path.join(__dirname, 'assets', 'manifest.xml');
    return Q.nfcall(fs.readFile, manifestTemplatePath).then(function (data) {

//console.log(data.toString())
    manifest.rawManifest = data.toString();
    
    //gen a new GUID
      var guid = utils.newGuid();
   // console.log(manifest.icons[0])
      manifest.rawManifest  = manifest.rawManifest.replace(/{GUID}/g, guid)
                                    .replace(/{providerName}/g, "Microsoft")
                                    .replace(/{sourceLocation}/g, originalManifest.start_url)
                                    .replace(/{defaultLocale}/g, originalManifest.lang || 'EN-US')
                                    .replace(/{displayName}/g, originalManifest.short_name ||  originalManifest.name)
                                    .replace(/{description}/g, originalManifest.name || 'no description provided')
                                    .replace(/{iconURL}/g,manifest.icons&&manifest.icons[32]?'<IconUrl DefaultValue="'+manifest.icons[32]+'" />': '<IconUrl DefaultValue="defaultIcon32x32.png" />') //only one image can be used
    
    
    //build sorce location URLs
    //<AppDomain>{appDomain}</AppDomain> 
    var tempURL = ''
    var scopeString = '';
    if(manifest.scopeArray){
        for(var i=0;manifest.scopeArray.length > i;i++){
        tempURL = manifest.scopeArray[i];
        var srcString = '<AppDomain>'+tempURL+'</AppDomain>  ';
        scopeString+=srcString;
        }
        manifest.rawManifest = manifest.rawManifest.replace(/{appDomain}/g, scopeString)
    }else{
        manifest.rawManifest = manifest.rawManifest.replace(/{appDomain}/g, '')
    }
    //run the repace code to add in new values
    


  var convertedManifestInfo = {
    'content': manifest,
    'format': constants.OFFICE_MANIFEST_FORMAT
  };
  
  return Q.resolve(convertedManifestInfo).nodeify(callback);

    })
        
    
}

module.exports = {
  convertFromBase: convertFromBase
}
