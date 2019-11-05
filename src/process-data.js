const fs=require("fs-extra-promise");
const objectPath = require("object-path");
const Promise = require("bluebird");
const path = require("path");
var extend = require('util')._extend;

module.exports= processData;
var baseDir;
function processData(_config){
    config=extend({},_config);
    baseDir=path.parse(config.this);

    //roda funcoes de pos processamento
    return new Promise(function(end,err){
        try{
            
            if(config.process){
                var processArr=configProcess(_config.process);
               
                // for(var id in processArr){
                //     var process=processArr[id];
                //     process.function(config.data,process.args,config);
                // }

                recursivePromiseCall(config.data,processArr,0).then(data=>{
                    config.data=data;
                    end(config);
                });

                function recursivePromiseCall(data,processArr,id){
                    let process=processArr[id];
                    return Promise.resolve(
                        process.function(data,process.args,config)
                    ).then(newdata=>{
                        let x=data;
                        if(id<processArr.length-1){
                            return recursivePromiseCall(newdata,processArr,id+1);
                        }else{
                            return data;
                        }
                    });
                }
            }else{
                end(config);
            }
        }catch(e){
            err(e);
        }

    });
}

function configProcess(obj){
    if(!Array.isArray(obj)){
        obj=[obj];
    }
    return config(obj);
    function config(obj){
        var baseConfig={
            "file":"",
            "args":[]
        }
        if(typeof obj =="string"){
            baseConfig.file=obj;
        }else if(Array.isArray(obj)){
            var arr=[];
            for(var id in obj){
                arr.push(
                config(obj[id])
                );
            }   
            return arr
        }
        else if(typeof obj=="object"){
            for(var id in baseConfig){
                if(obj[id])
                    baseConfig[id]=obj[id];
            }

            if(!baseConfig.file){
                throw "Must specify a directory to import data!";
            }

            baseConfig.file=path.join(baseDir.dir,baseConfig.file);
            baseConfig.function=(require( baseConfig.file));
        }

        return baseConfig;
    }

}