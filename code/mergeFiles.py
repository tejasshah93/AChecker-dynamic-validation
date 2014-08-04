import subprocess, os

def getValidDifference(x):
    if x != "":
        if(x[0] == "+" and x[1] != "+"):
            return x[0]
    else:
        return

rootPath = "HTMLSourceFiles/"
dynamicHTML = open(os.path.join("dynamicDOMElements.html"), "w")
dynamicHTML.write('<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"><html xmlns="http://www.w3.org/1999/xhtml" xml:lang="eng" lang="eng">')
totalFiles = 0
for path, dirs, files in os.walk(rootPath):
    totalFiles = len(files)

for i in range(totalFiles-1):
    processFile1 = os.path.join(rootPath, "data" + str(i) + ".html")
    processFile2 = os.path.join(rootPath, "data" + str(i+1) + ".html")
    #print processFile1 + " " + processFile2
    p1 = subprocess.Popen(["diff", "-u", processFile1, processFile2], stdout=subprocess.PIPE)
    p2 = subprocess.Popen(["grep", "+"], stdin=p1.stdout, stdout=subprocess.PIPE)
    p1.stdout.close()
    output = p2.communicate()[0]
    outputList = output.split("\n")
    rawDiff = filter(lambda x: getValidDifference(x), outputList)
    #print rawDiff
    for j in range(len(rawDiff)):
        diff = rawDiff[j][1:]    
        dynamicHTML.write(diff + "\n")
dynamicHTML.write("</html>")