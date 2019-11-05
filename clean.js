#!/usr/bin/env node 
const glob = require("glob-promise");
const path = require("path");
const readline = require('readline');
var fs = require('fs');

const basePath='../../../';
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

console.log("resolvendo ->"+process.argv[2])
var efetivar=undefined;
var toDo=[];
glob(`output/java/**/processo/**/*RestController.java`).then(files =>{

    for(var id in files){
        var destArr=files[id].split('/');
        destArr.splice(0,3)
        destArr.unshift('src/main/java/')
        destArr.unshift('..')
        destArr.unshift('..')
        

       var modified=""
        if(process.argv[3] && path.parse(files[id]).name.endsWith('Repository')){
            let tempRep=fs.readFileSync(files[id],'UTF-8');
            tempRep=tempRep.replace(/private static final String packageInterface="(.+)"/,`private static final String packageInterface="${process.argv[3]}"`);
            tempRep=tempRep.replace(/private static final boolean checkInterfaceName="(.+)"/,`private static final boolean checkInterfaceName=false`);
            
            fs.writeFileSync(files[id],tempRep,'UTF-8')
            modified="(modified)"
        }
        console.log("\x1b[31m"+path.parse(files[id]).name+modified +'\x1b[0m -> \x1b[32m'+destArr.join("/")+"\x1b[0m")

        toDo.push({
            data:files[id],
            to:destArr.join("/"),
            id:path.parse(files[id]).name,
            modified:modified=="(modified)"
        })
        // if(!process.argv[4]){
        //     //fs.createReadStream(files[id]).pipe(fs.createWriteStream(destArr.join("/")));
        // }
    }

    askQuestion();

})

function showToDo(){
    for(var id in toDo){
        item =toDo[id];
        console.log("\x1b[31m"+item.id+(item.modified?'(modfied)':'') +'\x1b[0m -> \x1b[32m'+item.to+"\x1b[0m")
    }
   
}
function askQuestion(){

        
    rl.question(`o que você deseja fazer?
- \x1b[1m\x1b[34mTecle ENTER\x1b[0m para sair
- \x1b[1m\x1b[34mNome Objeto\x1b[0m para remover objeto da cópia
- \x1b[1m\x1b[34mok\x1b[0m para efetivar
` , (answer) => {
        // TODO: Log the answer in a database

        if(!answer){
            rl.close();
        } else if(answer.toUpperCase()==='OK') {
            toDo.forEach(item=>{
                createDir(path.parse(item.to).dir)
                fs.createReadStream(item.data).pipe(fs.createWriteStream(item.to));
            });
            console.log("arquivos sendo copiados")
            console.log('done!')
            rl.close();
        } else {
            var toRemove=toDo.findIndex(item=>{
                return item.id== answer
            })
            if(toRemove>=0){
                toDo.splice(toRemove,1);
                showToDo();
            }else{
                console.log(`Objeto '${answer} não encontrado!`);
            }
            askQuestion()

        }
        
        
    });
}

function createDir(dir, err, callback) {
    let dirParsed = dir.split(/[\\/]/);

    let newDir = '';
    dirParsed.forEach(node => {
        newDir = path.join(newDir, node);
        if (!fs.existsSync(newDir)) {
            fs.mkdirSync(newDir);
        }

    })
}