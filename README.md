# Dot Engine
a template engine that gives more functionality and logic to [doT.js](https://olado.github.io/doT/index.html) templates

# Why not a fork of doT.js?
It extends the template engine functionality by enabling programing the interpretation of your data. For example with Dot Engine you could pull your data from a csv file and them parse it to json. You can multiply your attributes from one name and creating its variations for reusability. You can even make validations for your data before the generation itself
- with it you can simply generate documents for your code based on other documents, like changelogs from git logs
- gerate scaffoldable code
- generate your own fan mobi book from whatever has an api on the internet like got (https://anapioficeandfire.com)

Summing it up. It is a **tool**

# How do you do it?
1. ou need to create your jst model document based on [doT.js](https://olado.github.io/doT/index.html) documentation. It is easy and if you ever programed something that has HTML on it you should have no trouble
2. create a dot engine configuration file (it is a json file) there you should include: *Todo include here, it you change soon because it is overly complex so not documented*
3. run the gem.js file passing as parameter the directory of your config
   - the gen.js you create a js file for earch jst file create. This is a compiled javascript that you can use single alone to pass data and generate templates, you can export it or ignore it. see [doT.js](https://olado.github.io/doT/index.html) for details
4. your template will be generated at output path configured in your config file
