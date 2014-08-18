/* 
This file contains scripts to trigger dynamic HTML contents of a webpage,
render them in PhantomJS (headless browser), and then fetch the contents of the webpage
at such appropriate snapshots of triggering.

To setup the required environment, 
For installing PhantomJS:
Using the native package manager (apt-get for Ubuntu and Debian, pacman for Arch Linux, pkg_add for OpenBSD, etc).
For more information, refer: http://phantomjs.org/download.html

For installing CasperJS:
$ npm install -g casperjs
Detailed installation instructions: http://docs.casperjs.org/en/latest/installation.html

*/

// Since this script makes use of jQuery functionalites, we inject jQuery into the PhantomJS manually
// triggerElementsCounter represents the count of the dynamic HTML element being triggered
var casper = require('casper').create({
    clientScripts: ['jquery.min.js'],
    verbose: true,
    logLevel: 'debug'
});
var fs = require('fs');
var triggerElementsCounter = 0;
var doctypeDeclaration;

// Capturing the output of console.log() to terminal from PhantomJS browser console
casper.on('remote.message', function(message) {
    this.echo('Console: ' + message);
});

// Loads onload() function of the webpage, if any
// Stores DOCTYPE declaration of the webpage in the doctypeDeclaration variable
function runOnloadFunction(){
    if($('[onload]').length)
        $('[onload]').load();
    
    var node = document.doctype;
    if(node){        
        doctypeDeclaration = "<!DOCTYPE "
                                + node.name
                                + (node.publicId ? ' PUBLIC "' + node.publicId + '"' : '')
                                + (!node.publicId && node.systemId ? ' SYSTEM' : '') 
                                + (node.systemId ? ' "' + node.systemId + '"' : '')
                                + '>\n';
    }
    else if(node == null){
        doctypeDeclaration = "";
    }
    return doctypeDeclaration + document.getElementsByTagName('html')[0].outerHTML;;
}

// Getting all the button elements with type == "submit"
// buttonTriggerElements array to be returned contains fields such as:
// <triggerType="click">, iterator count, tagName, ID, Name, Value of the button being processed in respective order
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

// Getting all the input elements with type == "submit" (Form submissions)
// inputTriggerElements array to be returned contains fields such as:
// <triggerType="click">, iterator count, tagName, ID, Name, Value of the input being processed in respective order
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
// mouseoverTriggerElements array to be returned contains fields such as:
// <triggerType="mouse">, iterator count, tagName, ID, Name=null, Value=null of the mouse triggered element being processed in respective order
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
// onclickTriggerElements array to be returned contains fields such as:
// <triggerType="click">, iterator count, tagName, ID, Name=null, Value=null of the onclick triggered element being processed in respective order
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

// Start CasperJS and get the URL of the webpage to be processed from --url parameter
// Evaluates runOnloadFunction, and writes static source code of webpage into HTMLSourceFiles/data0.html
casper.start(casper.cli.get("url"), function(){
    this.echo("Casper started");
    HTMLSource = this.evaluate(runOnloadFunction);    
    var save = fs.pathJoin(fs.workingDirectory, 'HTMLSourceFiles', 'data' + triggerElementsCounter + '.html');
    fs.write(save, HTMLSource, 'w');
});

// Gets triggerElements using respective functions by evaluating them
casper.then(function(){

    // Evaluating respective functions to get event triggering elements into an array
    buttonTriggerElements = this.evaluate(getButtonTriggerElements);
    inputTriggerElements = this.evaluate(getInputTriggerElements);
    mouseoverTriggerElements = this.evaluate(getMouseoverTriggerElements);    
    onclickTriggerElements = this.evaluate(getOnclickTriggerElements);    

    // Concatenating all the returned trigger elements into one array: triggerElements
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

                // If event is triggered by clicking the HTML element
                if(triggerElement[0] == "click"){

                    // Checks if 'ID' attribute exists else checks for "name" attribute
                    if(triggerElement[3]){                          
                        jQuerySelector = "#" + triggerElement[3];
                    }                    
                    else if(triggerElement[4]){
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
                // Else if event is triggered by some mouse action over the HTML element
                else if(triggerElement[0] == "mouse"){

                    // Checks if 'ID' attribute exists else checks for "name" attribute
                    if(triggerElement[3]){
                        jQuerySelector = "#" + triggerElement[3];
                    }
                    else if(triggerElement[4]){
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

        // wait for approx. 1000 ms to load the DOM after triggering the HTML element
        this.wait(1000, function(){
            // Get the innerHTML contents of the dynamically obtained HTML webpage at that instant
            HTMLSource = this.evaluate(function(){
                return doctypeDeclaration + document.getElementsByTagName('html')[0].outerHTML;
            });            
            triggerElementsCounter++;

            // After triggering each element, HTML source code of webpage at that instant is stored in HTMLSourceFiles/data<i>.html
            var save = fs.pathJoin(fs.workingDirectory, 'HTMLSourceFiles', 'data' + triggerElementsCounter + '.html');
            fs.write(save, HTMLSource, 'w');
        });
    });
});

casper.run(function() {
    this.exit();
});
