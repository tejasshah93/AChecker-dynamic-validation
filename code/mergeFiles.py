import subprocess, os
import urllib2

# getValidDifference() takes input a probable diff string
# and returns trimmed valid difference if applicable
def getValidDifference(x):    
    if x != "":
        if(x[0] == "+" and x[1] != "+"):
            return x[0]
    else:
        return

rootPath = "HTMLSourceFiles/"
dynamicHTML = open("dynamicDOMElements.html", "w")

totalFiles = 0
for path, dirs, files in os.walk(rootPath):
    totalFiles = len(files)

# Get the difference between two adjacent files using diff -u
# Then for each valid line of difference, trim initial '+' sign and return rest of the string
# Merged content of all files is written in dynamicDOMElements.html file
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
    # print rawDiff
    for j in range(len(rawDiff)):
        diff = rawDiff[j][1:]    
        dynamicHTML.write(diff + "\n")
dynamicHTML.write("</body>\n")
