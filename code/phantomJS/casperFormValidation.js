var casper = require('casper').create({
    clientScripts: ['jquery.min.js'],
    verbose: true,
    logLevel: 'debug'
});

// Capturing the output of casper i.e. phantomJS browser onto the console
casper.on('remote.message', function(message) {
    this.echo('Console: ' + message);
});

// Get all the forms. Function not used still if required in case
function getForms(){
    console.log("getForms: " + document.forms);
    var forms = Array.prototype.slice.call(document.forms, 0);
    return forms;
}

// Getting all the button elements with type == "submit"
function getButtonTriggerElements(){    
    buttonTriggerElementsObject = document.getElementsByTagName('button');    
    var buttonTriggerElements = [];
    for(i=0; i<buttonTriggerElementsObject.length; i++){   
        if(buttonTriggerElementsObject[i].type == "submit"){            
            buttonTriggerElements.push([buttonTriggerElementsObject[i].tagName, buttonTriggerElementsObject[i].id, buttonTriggerElementsObject[i].name, buttonTriggerElementsObject[i].value]);
        }
    }
    console.log("Length of buttonTriggerElements " + buttonTriggerElements.length);    
    return buttonTriggerElements;
}

// Getting all the input elements with type == "submit"
function getInputTriggerElements(){
    inputTriggerElementsObject = document.getElementsByTagName('input');    
    var inputTriggerElements = [];
    for(i=0; i<inputTriggerElementsObject.length; i++){   
        if(inputTriggerElementsObject[i].type == "submit"){            
            inputTriggerElements.push([inputTriggerElementsObject[i].tagName, inputTriggerElementsObject[i].id, inputTriggerElementsObject[i].name, inputTriggerElementsObject[i].value]);
        }
    }
    console.log("Length of inputTriggerElements " + inputTriggerElements.length);    
    return inputTriggerElements;
}

// start Casper
casper.start(casper.cli.get("url"), function(){
    this.echo("Casper started");
});

// Get triggerElements using the above functions by evaluating them
// Each triggerElement contains 4 values viz., tagName, id, name, value in respective order
casper.then(function(){
    buttonTriggerElements = this.evaluate(getButtonTriggerElements);
    inputTriggerElements = this.evaluate(getInputTriggerElements);
    console.log(Object.prototype.toString.call(inputTriggerElements) === "[object Array]");

    // Concatenating all the triggerElements into one array
    var triggerElements = []
    if(buttonTriggerElements.length)
        triggerElements = buttonTriggerElements.concat(inputTriggerElements);
    else if(inputTriggerElements.length)
        triggerElements = inputTriggerElements.concat(buttonTriggerElements);    

    console.log("Total triggerElements " + triggerElements.length);    
    // For each triggerElement of triggerElements, we form a jQuerySelector to select that
    // particular element and then click it accordingly
    this.each(triggerElements, function(self, triggerElement){
        console.log("Processing each " + triggerElement);
        this.then(function(){
            console.log("Processing then " + triggerElement);
            this.evaluate(function(triggerElement){
                console.log("Processing evaluate " + triggerElement);
                                
                var jQuerySelector = "";
                // if 'id' attribute exists else check for 'name' attribute
                if(triggerElement[1]){
                    jQuerySelector = "#" + triggerElement[1];
                }                
                else if(triggerElement[2]){
                    jQuerySelector = triggerElement[0].toLowerCase() + "[name='" + triggerElement[2] + "']";
                }
                console.log("jQuerySelector " + jQuerySelector);
                $(jQuerySelector).click();
            }, triggerElement);
        });

        // wait for approx. 1000 ms to load the DOM
        this.wait(1000, function(){
            this.evaluate(function(){
                // Get the innerHTML contents of the dynamically obtained HTML
                console.log(document.getElementsByTagName('html')[0].innerHTML);                
            });
        });
    });
});

casper.run(function() {
    this.exit();
});