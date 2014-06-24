var casper = require('casper').create({
    clientScripts: ['jquery.min.js'],
    verbose: true,
    logLevel: 'debug'
});

casper.on('remote.message', function(message) {
    this.echo('Console: ' + message);
});

function getForms(){
    console.log("getForms: " + document.forms);
    var forms = Array.prototype.slice.call(document.forms, 0);
    return forms;
}

function getButtonTriggerElements(){    
    buttonTriggerElementsObject = document.getElementsByTagName('button');
    console.log("Length of buttonTriggerElements " + buttonTriggerElementsObject.length);    
    var buttonTriggerElements = [];
    for(i=0; i<buttonTriggerElementsObject.length; i++){   
        if(buttonTriggerElementsObject[i].type == "submit"){
            //console.log("BUTTON Type == Submit. Add to Array");
            buttonTriggerElements.push(buttonTriggerElementsObject[i]);
        }
    }
    return buttonTriggerElements;
}

function getInputTriggerElements(){        
    inputTriggerElementsObject = document.getElementsByTagName('input');
    console.log("Length of inputTriggerElements " + inputTriggerElementsObject.length);    
    var inputTriggerElements = [];
    for(i=0; i<inputTriggerElementsObject.length; i++){   
        if(inputTriggerElementsObject[i].type == "submit"){
            //console.log("INPUT Type == Submit. Add to Array");
            inputTriggerElements.push(inputTriggerElementsObject[i]);
        }
    }
    return inputTriggerElements;
}

casper.start(casper.cli.get("url"), function() {    
    //forms = this.evaluate(getForms);
    //console.log("We got " + forms.length + " forms " + forms);
    this.echo("Casper started");
});

casper.then(function(){
    buttonTriggerElements = this.evaluate(getButtonTriggerElements);
    inputTriggerElements  = this.evaluate(getInputTriggerElements);

    var triggerElements   = []
    if(buttonTriggerElements.length)
        triggerElements = buttonTriggerElements.concat(inputTriggerElements);
    else if(inputTriggerElements.length)
        triggerElements = inputTriggerElements.concat(buttonTriggerElements);    

    //console.log(Object.prototype.toString.call(triggerElements) === "[object Array]");
    this.each(triggerElements, function(self, triggerElement){        
        this.then(function(){
            this.evaluate(function(triggerElement){     
                var jQuerySelector = "";
                if(triggerElement.id){
                    jQuerySelector = "#" + triggerElement.id;
                }
                else if(triggerElement.name){
                    jQuerySelector = triggerElement.tagName.toLowerCase() + "[name='" + triggerElement.name + "']";
                }
                console.log("jQuerySelector " + jQuerySelector);
                $(jQuerySelector).click();
            }, triggerElement);
        });

        this.wait(1000, function(){
            this.evaluate(function(){
                console.log(document.getElementsByTagName('html')[0].innerHTML);
            });
        });
    });
});

casper.run(function() {
    this.exit();
});