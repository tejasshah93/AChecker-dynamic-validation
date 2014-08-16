#!/bin/bash

if [ "$#" -ne 1 ];
then
    echo "Pass firstArg => URL of the site to be verified"
else
    inputURL=$1
    echo "Given "$inputURL
    rm -rf HTMLSourceFiles dynamicDOMElements.html mergedSourceContent.html
    mkdir HTMLSourceFiles
    chmod -R 775 HTMLSourceFiles
    casperjs --proxy="proxy.iiit.ac.in:8080" casperFormValidation.js --url=$inputURL
    python mergeFiles.py $inputURL
    chmod -R 775 dynamicDOMElements.html HTMLSourceFiles
    sed -i 's/<\/body>/\n<\/body>\n/' HTMLSourceFiles/data0.html
    sed -i '/<\/body>/{
                s/<\/body>//g
                r dynamicDOMElements.html
            }' HTMLSourceFiles/data0.html
    cp HTMLSourceFiles/data0.html mergedSourceContent.html
fi
echo $?
