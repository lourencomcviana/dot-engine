const glob = require("glob-promise");

console.log("resolvendo ->"+process.argv[2])
glob(process.argv[2]).then(files =>{
    for(var id in files){
        console.log(files[id]);
    }
})