var system = require('system');
var page = require('webpage').create();
var url = system.args[1];
//console.log('The default user agent is ' + page.settings.userAgent);

page.open(url, function (status) {
    if (status !== 'success') {
        console.log('Unable to access network');
    } 
    else {
        page.includeJs("https://ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js", function() {
            page.evaluate(function () {
                console.log(document.getElementById('signup_button').textContent);
                //$("button").click();
                console.log(document.getElementsByTagName('html')[0].innerHTML);
                
                var forms = Array.prototype.slice.call(document.forms, 0);
                console.log("We got " + forms.length + " forms " + forms);
                forms.forEach(function(form) {
                    console.log("Processing " + form);
                    console.log(form.getElementsByTagName('button')[0]);
                    form.submit();
                    console.log("After clicking form ");
                    //console.log(document.getElementsByTagName('html')[0].innerHTML);
                });
            });
            phantom.exit();
        });
    }
});


page.onConsoleMessage = function(msg){
    console.log(msg);
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
