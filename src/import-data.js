const fs=require("fs-extra-promise");
const objectPath = require("object-path");
const Promise = require("bluebird");
const path = require("path");
var extend = require('util')._extend;
const glob= require('glob-promise');
const Hjson= require('hjson');


module.exports= importDataRecursive;
var baseDir;
function importDataRecursive(_config){

    config=extend({},_config);
    baseDir=path.parse(config.this);

    return importData(config).then(x=>{
      return x;  
    });
    //ToDo:
    //implementar recursividade depois!!!


    // return new Promise(function(err,end){
    //     // end();

    //     importData(configImport.import)
    //     .then(importedDataArray=>{

    //         var promisses=[]
    //         for(var id in importedDataArray){
    //             var importedData=importedDataArray[id];
    //             if(importedData.importData!=undefined){
    //                 promisses.push(importDataRecursive(importedData));
    //             }else{
    //                 promisses.push(importedData)
    //             }
    //         }
    //     })
       
    // })
}
function importData(config){
    var imports=config.import;
    return new Promise(function(end,err){
        if(imports){
            var promisses=[];
            for(var id in imports){
                var imp=configImport(imports[id],id);
                config.import[id]=imp;
                promisses.push(
                    genPromise(imp,config)
                );
            }

            function genPromise(imp,config){
               
                return glob(imp.file).then(fileNames =>{
                    imp.files=fileNames;
                    if(fileNames.length>0){
                        let promisses=[]
                        for(var id in fileNames){
                            promisses.push(
                                readFile(fileNames[id])
                            );
                        }
                        return Promise.all(promisses).then(function(data){
                            if(data.length==1) data=data[0];
        
                            console.log(fileNames);
                            return objectPath.get(data,imp.outPath);
                        })
                    }else{
                        return null;
                    }
                });

                function readFile(fileDir){
                    console.log(fileDir);
                    return fs.readFileAsync(fileDir,'UTF-8')
                    .then(file=>{
                        return Hjson.parse(file)
                    })
                    .catch(err=>{
                        err.file=fileDir;
                        return err;
                    })
                }
                // return  fs.readFileAsync(imp.file)
                // .then(function(data){
                //     data=Hjson.parse(data);
                //     let tempData=objectPath.get(data,imp.outPath);
                //     objectPath.set(config.data,imp.inPath,tempData);
                    
                //     return config;
                // }).catch(err=>{
                //     console.error("Could not import "+imp.file);
                //     console.error(err)
                // })
            }
            Promise.all(promisses).then((data)=>{
                let i=0;
                for(var id in imports){
                    let imp=imports[id];
                    let tempData=data[i];
                    let toInsertObj=objectPath.get(config.data,imp.inPath);
                    if(Array.isArray(toInsertObj) && !Array.isArray(tempData)){
                        objectPath.insert(config.data,imp.inPath,tempData);
                       
                    }else{
                        objectPath.set(config.data,imp.inPath,tempData);
                    }
                    i++;
                }
                
                end(config);
            })
        
        }else{
            end(config);
        }
    })
}

function configImport(obj,objName){
    var baseConfig={
        inPath:"",
        outPath:"",
        file:""
    }
    if(typeof obj =="string"){
        baseConfig.file=obj;
        baseConfig.inPath=objName;
    }else if(typeof obj=="object"){
        for(var id in baseConfig){
            if(obj[id])
                baseConfig[id]=obj[id];
        }
        if(objName.inPath==undefined){
            baseConfig.intPath=objName;
        }
    }

    if(!baseConfig.file){
        throw "Must specify a directory to import data!";
    }
    
    baseConfig.file=path.join(baseDir.dir,baseConfig.file);
    return baseConfig;
}