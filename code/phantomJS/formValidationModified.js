var system = require('system');
var page = require('webpage').create(), testindex = 0, loadInProgress = false;
var url = system.args[1];
var button_clicked = false;

page.onConsoleMessage = function(msg) {
  console.log(msg);
};
 
page.onLoadStarted = function() {
  loadInProgress = true;
  console.log("load started");
 
};
 
page.onLoadFinished = function() {
  loadInProgress = false;
  console.log("load finished");
  console.log(button_clicked);
 
  if(button_clicked)
        {
            console.log("OUTPUT");
            page.evaluate(function() {
                console.log(document.getElementsByTagName('html')[0].innerHTML);
            });
            //phantom.exit();
        } 
};

page.onError = function(msg, trace) {
    var msgStack = ['ERROR: ' + msg];
    if (trace && trace.length) {
        msgStack.push('TRACE:');
        trace.forEach(function(t) {
            msgStack.push(' -> ' + t.file + ': ' + t.line + (t.function ? ' (in function "' + t.function + '")' : ''));
        });
    }
    //console.error(msgStack.join('\n'));
};
 
 
phantom.onError = function(msg, trace) {
    var msgStack = ['PHANTOM ERROR: ' + msg];
    if (trace && trace.length) {
        msgStack.push('TRACE:');
        trace.forEach(function(t) {
            msgStack.push(' -> ' + (t.file || t.sourceURL) + ': ' + t.line + (t.function ? ' (in function ' + t.function + ')' : ''));
                });
            }
            console.error(msgStack.join('\n'));
            phantom.exit(1);
            };
 
var steps = [    
    function()
    {
        page.open(url, function (status) {
            if (status !== 'success') {
                console.log('Unable to access network');
            }
            else {
                console.log("Page Opened Successfully");
                page.includeJs("https://ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js", function() {
                });
 
                button_clicked = page.evaluate(function () {
                        console.log("JS included. Now evaluating");                                            
                        // console.log(document.getElementsByTagName('html')[0].innerHTML);
                       
                        var forms = Array.prototype.slice.call(document.forms, 0);
                        console.log("We got " + forms.length + " forms " + forms);
                        forms.forEach(function(form) {
                            console.log("Processing " + form);
                            form.submit();
                            console.log("After clicking form ");
                            //console.log(document.getElementsByTagName('html')[0].innerHTML);
                        });
                        return true;
                });
            }
        });
    },
    function()
    {
        // Output content of page to stdout after form has been submitted
        page.evaluate(function() {
            console.log("In output");
            // console.log(document.querySelectorAll('html')[0].outerHTML);
        });
    }
];
 
steps[0]();