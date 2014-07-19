var casper = require('casper').create({
    clientScripts: ['jquery.min.js'],
    verbose: true,
    logLevel: 'debug'
});
var fs = require('fs');
var triggerElementsCounter = 0;

// Capturing the output of casper i.e. phantomJS browser onto the console
casper.on('remote.message', function(message) {
    this.echo('Console: ' + message);
});

// Loads onload() functions, if any
function runOnloadFunction(){
    if($('[onload]').length)
        $('[onload]').load();
    return document.getElementsByTagName('html')[0].outerHTML;;
}

// Getting all the button elements with type == "submit"
function getButtonTriggerElements(){    
    buttonTriggerElementsObject = document.getElementsByTagName('button');    
    var buttonTriggerElements = [];
    for(i=0; i<buttonTriggerElementsObject.length; i++){   
        if(buttonTriggerElementsObject[i].type == "submit"){            
            buttonTriggerElements.push(["click", i, buttonTriggerElementsObject[i].tagName, buttonTriggerElementsObject[i].id, buttonTriggerElementsObject[i].name, buttonTriggerElementsObject[i].value]);
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
            inputTriggerElements.push(["click", i, inputTriggerElementsObject[i].tagName, inputTriggerElementsObject[i].id, inputTriggerElementsObject[i].name, inputTriggerElementsObject[i].value]);
        }
    }
    console.log("Length of inputTriggerElements " + inputTriggerElements.length);    
    return inputTriggerElements;
}

// Getting all the onmouseover elements
function getMouseoverTriggerElements(){
    mouseoverTriggerElementsObject = $('[onmouseover]');
    var mouseoverTriggerElements = [];
    for(i=0; i<mouseoverTriggerElementsObject.length; i++){            
        mouseoverTriggerElements.push(["mouse", i, mouseoverTriggerElementsObject[i].tagName, mouseoverTriggerElementsObject[i].id, null, null]);
    }
    console.log("Length of mouseoverTriggerElements " + mouseoverTriggerElements.length);
    return mouseoverTriggerElements;
}

// Getting all the onclick elements
function getOnclickTriggerElements(){
    onclickTriggerElementsObject = $('[onclick]');
    var onclickTriggerElements = [];
    for(i=0; i<onclickTriggerElementsObject.length; i++){ 
        if(!(onclickTriggerElementsObject[i].tagName == "button" && onclickTriggerElementsObject[i].type == "submit")){
            onclickTriggerElements.push(["click", i, onclickTriggerElementsObject[i].tagName, onclickTriggerElementsObject[i].id, null, null]);
        }
    }
    console.log("Length of onclickTriggerElements " + onclickTriggerElements.length);
    return onclickTriggerElements;
}

// start Casper
casper.start(casper.cli.get("url"), function(){
    this.echo("Casper started");
    HTMLSource = this.evaluate(runOnloadFunction);    
    var save = fs.pathJoin(fs.workingDirectory, 'HTMLSourceFiles', 'data' + triggerElementsCounter + '.html');
    fs.write(save, HTMLSource, 'w');
});

// Get triggerElements using the above functions by evaluating them
casper.then(function(){

    buttonTriggerElements = this.evaluate(getButtonTriggerElements);
    inputTriggerElements = this.evaluate(getInputTriggerElements);
    mouseoverTriggerElements = this.evaluate(getMouseoverTriggerElements);    
    onclickTriggerElements = this.evaluate(getOnclickTriggerElements);    

    //console.log(Object.prototype.toString.call(inputTriggerElements) === "[object Array]");    
    // Concatenating all the triggerElements into one array
    var triggerElements = []
    triggerElements = [].concat.apply([], [buttonTriggerElements, inputTriggerElements, mouseoverTriggerElements, onclickTriggerElements])

    console.log("Total triggerElements " + triggerElements.length);    
    // For each triggerElement of triggerElements, we form a jQuerySelector to select that particular element and then execute it accordingly
    this.each(triggerElements, function(self, triggerElement){
        console.log("Processing each " + triggerElement);
        this.then(function(){
            console.log("Processing then " + triggerElement);
            this.evaluate(function(triggerElement){
                console.log("Processing evaluate " + triggerElement);
                // Each triggerElement contains 5/6 values viz. <triggerType>, i, tagName, id, name, value  in respective order in respective order
                var jQuerySelector = "";
                if(triggerElement[0] == "click"){
                    // Checking if 'id' attribute exists
                    if(triggerElement[3]){                          
                        //document.getElementById(triggerElement[3]).click();
                        jQuerySelector = "#" + triggerElement[3];
                    }
                    // Else checking for name attribute
                    else if(triggerElement[4]){
                        //document.getElementsByName(triggerElement[4])[0].click();
                        jQuerySelector = triggerElement[2].toLowerCase() + "[name='" + triggerElement[4] + "']";
                    }
                    else{                        
                        $('[onclick]')[triggerElement[1]].click();
                    }
                    if(jQuerySelector){
                        console.log("jQuerySelector click " + jQuerySelector);
                        $(jQuerySelector).click();
                    }
                }                
                else if(triggerElement[0] == "mouse"){
                    if(triggerElement[3]){
                        // document.getElementById(triggerElement[2]).onmouseover();
                        jQuerySelector = "#" + triggerElement[3];
                    }
                    else if(triggerElement[4]){
                        // document.getElementsByName(triggerElement[4])[0].onmouseover();
                        jQuerySelector = triggerElement[2].toLowerCase() + "[name='" + triggerElement[4] + "']";
                    }
                    else{                     
                        $('[onmouseover]')[triggerElement[1]].onmouseover();         
                    }
                    if(jQuerySelector){
                        console.log("jQuerySelector mouseover " + jQuerySelector);
                        $(jQuerySelector)[0].onmouseover();
                    }
                }
            }, triggerElement);
        });

        // wait for approx. 1000 ms to load the DOM
        this.wait(1000, function(){
            HTMLSource = this.evaluate(function(){
                // Get the innerHTML contents of the dynamically obtained HTML                                
                return document.getElementsByTagName('html')[0].outerHTML;
            });            
            triggerElementsCounter++;
            var save = fs.pathJoin(fs.workingDirectory, 'HTMLSourceFiles', 'data' + triggerElementsCounter + '.html');
            fs.write(save, HTMLSource, 'w');
        });
    });
});

casper.run(function() {
    this.exit();
});