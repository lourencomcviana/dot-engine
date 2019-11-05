#!/usr/bin/env node 
//TODO: refatorar todo o schema de leitura de paths!

if(!process.argv[2]){
    console.error("Must especify a config file!");
    process.exit(1);
}

const Promise = require("bluebird");
const objectPath = require("object-path");
const importData=require('./src/import-data');
const processData=require('./src/process-data');
const gen=process.argv[2].endsWith(".json")?process.argv[2].substring(0,process.argv[2].length-5):process.argv[2];
const  doT = require("dot");
const fs= require("fs");
const path= require("path");
const glob = require("glob-promise");

function getConfig(gen){
    try{
        return require(gen+'.json');
    }catch(err){
        if(!gen.startsWith("./")){
            return getConfig("./"+gen);
        }else{
            throw err;
        }
    }
}
const config = getConfig(gen);



doT.templateSettings.strip= false;

config.this = path.resolve(gen+'.json');

if(config.jst){
    config.jst = (relativeToConfig(config.jst,config));
} else{
    config.jst = (relativeToConfig("./*.jst",config));
}

if(config.outDir){
    config.outDir = relativeToConfig(config.outDir,config);
}

var x=doT.process({ path: path.parse(config.jst).dir});

processArgv(config);

glob(config.jst)
.then( files =>{
    if(files.length==0){
        throw new Error(`no file found for '${config.jst}'`);
    }
    config.templates=files;
    return importData(config)
})

.then(impData=>{
    return processData(config,impData)
})
.then(config=>{
   
    config.templates.forEach(function(item,id){
        config.template=item;
        run(config);
    })
}).catch(err => console.error(err));


function run(config){
    var parsed=path.parse(config.template);
    var template=require(parsed.dir+"/"+parsed.name+".js");

    if(config.multipleFiles && Array.isArray(config.data)){
        for(var id in config.data){
            
            var fileName=genFilaName(config.name,config.data[id],config)// objectPath.get(config.data[id],config.multipleFiles.name);

            runTemplate(config.data[id],fileName);
        }
    }else{
        runTemplate(config.data,genFilaName(config.name,config.data,config));
    }

    function runTemplate(data,fileName){
        
        var result=template(data);

        if(result){
            result=result.trim();
        }

        if(config.outDir){
            var filePath=path.join(config.outDir,fileName);
            createDir(path.parse(filePath).dir);


            fs.writeFile(filePath,result,function(err){
                if(err)
                    console.log(err);
                else
                    console.log("Created in: \x1b[32m"+filePath+"\x1b[0m");
            })

        } else {
            console.log(result);
        }
        return result;
    }
}


function createDir(dir, err, callback) {
    let dirParsed = dir.split(/[\\/]/);

    if(dirParsed[0]===""){
        dirParsed[0]="/";
    }
    let newDir = '';
    dirParsed.forEach(node => {
        newDir = path.join(newDir, node);
        if (!fs.existsSync(newDir)) {
            fs.mkdirSync(newDir);
        }

    })
}

function genFilaName(name,data,config){
    baseDir=path.parse(config.this);
    if(config.fileName){
        return require(path.join(baseDir.dir,config.fileName))(name,data,config);
    }else{
        let filename= config.outExtension?name+"."+config.outExtension:name
        return filename;
    }
    
}

function relativeToConfig(file,config){
    return path.resolve(path.parse(config.this).dir,file);
}


function processArgv(config){
    process.argv.forEach(arg=>{
        if(arg.startsWith("-")){
            let keyvalue = arg.split("=");
            if(keyvalue.length>0 && keyvalue[0]!=''){
                if(keyvalue.length==1){
                    keyvalue.push("");
                }
                let key = keyvalue[0].trim().replace(/^-/,'');
                let value = keyvalue[1].trim();
                objectPath.set(config.data,key,value);
            }
            
        }
    })
}