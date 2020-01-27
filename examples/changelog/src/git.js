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
    config.outDir = gitUrl; 

    return getBranchInfo(gitUrl)
        .then(item => data.branch=item)
        .then(()=>{
            return filterSqlFiles(gitUrl)
                .then(tags=> { 
                        return tags.map(file=> getTagMessage(file,regex))
                         .filter(tag => tag !=null)
                    }
                )
                    
                .then(tags =>  data.tags = tags.sort(orderByTag))
                .then(tags => args.detailed ? insertCommitOnTags(tags,gitUrl) : tags.commits=[])
                .catch(err=>{ console.error(err); return []});
        }).catch(err=>{ console.error(err); return []});
    

  
    
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
        element.dateFormated = moment(element.date,'YYYY-MM-DD hh:mm:ss').format('DD/MM/YYYY hh:mm:ss')
    });
    return Promise.resolve(commit);

}

function filterSqlFiles(giturl,regex){
    const simpleGit = require('simple-git/promise')(giturl);

    return simpleGit.tag(['-n'])
        .then(saida => saida.split("\n").filter(item =>item))
    
}

function getBranchInfo(giturl){
    const simpleGit = require('simple-git/promise')(giturl);

    return simpleGit.branch(["-vv"])
        .then(item => {
            const currentItem =  item.branches[item.current];
            setBranchRemoteData(currentItem);
            return currentItem;
        })
        .then(branch =>{
            return simpleGit.remote(["get-url",branch.remote.name]).then(remotes =>{
                remotes = remotes.trim();
                remotes = remotes.substring(0,remotes.length-4)
                branch.remote.url = remotes;
                return branch;
            });
        })
    ;
}

function setBranchRemoteData(branch){
    const regex = /\[(.+)\/(.+)\] *(.+)/gm;
    const str = branch.label;

    let m = regex.exec(str);

    if(m.length>=3){
        branch.remote ={
            name: m[1],
            branch: m[2]
        } 
    } else {
        branch.remote ={
            name: undefined,
            branch: undefined
        } 
    }



}

function getTagMessage(str,regex){
    try{
        let m = regex.exec(str)

        if(m.groups){
            return m.groups;
        }
    }catch(err){
        console.warn("versão "+str+" não pode ser interpretada pois não coincide com a regex, será desconsiderada",err);   
    }

    return null;
}



function orderByTag(a,b){
    const aVersion =  a.version.split(/[.\-/#]/g);
    const bVersion =  b.version.split(/[.\-/#]/g);

    return compareArrays(aVersion,bVersion);
}

function compareArrays(a,b){
    const aCompare = a.shift().replace(/\D/,'') * 1;
    const bCompare = b.shift().replace(/\D/,'') * 1;
    
    if(aCompare !== bCompare){
        return aCompare - bCompare;
    } else if(a.length>0 && b.length>0){
        return compareArrays(a,b);
    } else if(a.length>0 && b.length===0){ 
        return 1;
    } else if(a.length===0 && b.length>0){ 
        return -1;
    }else {
        return 0;
    }
}