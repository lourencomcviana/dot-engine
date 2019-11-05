#!/usr/bin/env node
const path = require('path');

// need to export only one function, this function will be called by dot-engine 
// tree parameters are sent to the function
// data: contains the data part of the configuration file, you can change its contents safelly
// args: args passed specific to this funcion in configuration file.
// config: the entire configuration file. Safe to read but not so safe to write.

module.exports = processData;

function processData(data,args,config){

    const regex = new RegExp(args.regex, args.regexop);

    return filterSqlFiles(path.resolve(config.this,args.gitpath))
        .then(tags=> tags
            .map(file=> getTagMessage(file,regex)))
        .then(tags =>  data.tags = tags)
        .catch(err=>{ console.error(err); return []});
    
}

function filterSqlFiles(giturl,regex){
    const simpleGit = require('simple-git/promise')(giturl);
    return simpleGit.tag(['-n'])
        .then(saida => saida.split("\n").filter(item =>item))
    
}

function getTagMessage(str,regex){
    let m = regex.exec(str)

    if(m.groups){
        return m.groups;
    }else{
        return str;
    }
}



//processData({tag:{old:'1.6.0-0259'}})