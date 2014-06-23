var forms = [];
var casper = require('casper').create({
    clientScripts: ['jquery.min.js'],
    verbose: true,
    logLevel: 'debug'
});

casper.on('remote.message', function(message) {
    this.echo('Console: ' + message);
});

function getLinks() {
    var links = document.querySelectorAll('h3.r a');
    return Array.prototype.map.call(links, function(e) {
        return e.getAttribute('href');
    });
}

function getForms() {
    console.log("getForms: " + document.forms);
    var forms = Array.prototype.slice.call(document.forms, 0);   
    return forms;
}

casper.start('https://github.com/join', function() {
    // search for 'casperjs' from google form
    forms = this.evaluate(getForms);    
    console.log("We got " + forms.length + " forms " + forms);
});

// casper.then(function() {
//   casper.page.injectJs('jquery.min.js');
// });

// casper.wait(500, function(){
//     this.evaluate(function(){
//         $('button').click();        
//     });
// });

casper.then(function(){
    this.evaluate(function(){
        $('button').click();        
    });
});

casper.then(function(){
    this.evaluate(function(forms){ 
        console.log(forms.length);        
        forms.forEach(function(form) {
            if(form){
                console.log("Processing " + form);
                // $('button').click();
                console.log(document.getElementsByTagName('html')[0].innerHTML);
            }
        });    
    }, forms);
});

casper.run(function() {
    this.exit();
});