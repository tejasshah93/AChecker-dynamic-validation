#!/bin/bash

# Pass first argument as the URL of the site to be verified
if [ "$#" -ne 1 ];
then
    echo "Pass firstArg => URL of the site to be verified"
else
    inputURL=$1
    # Deletes previously generated temporary files/folders
    rm -rf HTMLSourceFiles dynamicDOMElements.html mergedSourceContent.html
    mkdir HTMLSourceFiles
    chmod -R 775 HTMLSourceFiles
    casperjs --proxy="proxy.iiit.ac.in:8080" casperValidation.js --url=$inputURL
    python mergeFiles.py
    chmod -R 775 dynamicDOMElements.html HTMLSourceFiles

    # 'Selective merging' of original source code of the webpage with dynamicDOMElements
    sed -i 's/<\/body>//g' dynamicDOMElements.html
    sed -i 's/<\/html>//g' dynamicDOMElements.html
    echo "</body>" >> dynamicDOMElements.html
    sed -i 's/<\/body>/\n<\/body>\n/g' HTMLSourceFiles/data0.html
    sed -i '/<\/body>/{
                s/<\/body>//g
                r dynamicDOMElements.html
            }' HTMLSourceFiles/data0.html
    cp HTMLSourceFiles/data0.html mergedSourceContent.html
fi
echo $?
