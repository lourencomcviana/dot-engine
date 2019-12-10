#!/usr/bin/env node
const path = require('path');
const moment = require('moment');
// need to export only one function, this function will be called by dot-engine 
// tree parameters are sent to the function
// data: contains the data part of the configuration file, you can change its contents safelly
// args: args passed specific to this funcion in configuration file.
// config: the entire configuration file. Safe to read but not so safe to write.

module.exports = processData;

function processData(data,args,config){

    const regex = new RegExp(args.regex, args.regexop);

    const gitUrl = path.resolve(config.this,args.gitpath);
    return filterSqlFiles(gitUrl)
        .then(tags=> tags
            .map(file=> getTagMessage(file,regex)))
        .then(tags =>  data.tags = tags)
        .then(tags => args.detailed ? insertCommitOnTags(tags,gitUrl) : tags.commits=[])
        .catch(err=>{ console.error(err); return []});
    
}

async function insertCommitOnTags(tags,gitUrl){
    if(tags.length>0){
        oldTag = await getFirstCommit(gitUrl);
        oldTag = oldTag.hash;
        let boundary = "--boundary";
        for(var id in tags){
            let tag = tags[id];
            tag.commits = await commitsBetweenTags(oldTag,tag.version,gitUrl,boundary )
            oldTag =tag.version;
            boundary='';
        }
        
    }
    else{
        tags.commits = [];
    }
    return tags;
}

async function getFirstCommit(gitUrl){
    const simpleGit = require('simple-git/promise')(gitUrl);
    return simpleGit.log()
    .then(saida =>saida.all[saida.all.length-1])
}
async function commitsBetweenTags(startTag,endTag,gitUrl,boundary){
    //git log 1.7.53...1.7.54 --pretty=format:'|| %C(yellow)%h || %Cred%ad || %Cblue%an || %Cgreen%d || %Creset%s ||' 
    
    
    const opts = [startTag+'...'+endTag];

    if(boundary){
        opts.push(boundary);
    }

    const simpleGit =  require('simple-git/promise')(gitUrl);
    return simpleGit.log(opts)
    .then(saida =>parseCommitLine(saida));
}

async function parseCommitLine(commit){
    commit.all.forEach(element => {
        element.dateFormated = moment(commit.date).format('DD/MM/YYYY hh:mm:ss')
    });
    return Promise.resolve(commit);

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