import bs4
from bs4 import BeautifulSoup
from bs4 import SoupStrainer
import subprocess, sys, os
import urllib2

def getValidDifference(x):
    if x != "":
        if(x[0] == "+" and x[1] != "+"):
            return x[0]
    else:
        return

def getDoctype(soup):
    items = [item for item in soup.contents if isinstance(item, bs4.Doctype)]
    return items[0] if items else None        

rootPath = "HTMLSourceFiles/"
dynamicHTML = open("dynamicDOMElements.html", "w")

response = urllib2.urlopen(sys.argv[1])
html = response.read()
soup = BeautifulSoup(html)
doctype = getDoctype(soup)
if doctype:
    dynamicHTML.write('<!DOCTYPE ' + doctype + '>' + '\n')
HTMLHeadersDict = soup.find_all('html')[0].attrs
HTMLHeaders = '<html'
for attr in soup.find_all('html')[0].attrs:
    HTMLHeaders += ' ' + attr + '=' + '"' + HTMLHeadersDict[attr] + '"'
HTMLHeaders += '>'
dynamicHTML.write(HTMLHeaders)

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