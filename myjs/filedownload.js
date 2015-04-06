function writeDataToFile(){

var metaString = $("textarea#metaDataTextArea").val();
var noVertexSelected = false;
if(metaString.length!=0 && selectedSphereId!=null && isScalePressed == true){    
     var id = Math.floor((Math.random() * 999999999) + 100000000) ;
  //  var downloadLink = document.getElementById('downloadlink');
    var thisTime = new Date().getTime();    
    var delTime = Math.round((thisTime/1000) - startSeconds);
    var nameString = "bottleData_"+thisTime+"_"+id+".xml"    
   // downloadLink.setAttribute("download",nameString);
   // downloadLink.href = makeTextFile(generateFileData(thisTime,delTime,id));
    // downloadLink.href =
    saveTextAsFile(nameString,generateFileData(thisTime,delTime,id))
  //  downloadLink.style.display = 'block';}
}
    
else if( selectedSphereId==null){
noVertexSelected == true;    
alert('Please select a blue vertex and proceed to deform the model before downloading the file');
}

else if(metaString.length==0 && noVertexSelected==false){
    alert('Please enter at least 5 keywords in the text area before downloading the file');
}

else if(isScalePressed==false && metaString.length > 0 && noVertexSelected==false){
    
    alert('Please press the Show/Hide Hand button to verify the scale of your design');
}
    
    
}


function makeTextFile(text){
    var textFile = null;
    var data = new Blob([text], {type: 'text/plain'});
    if (textFile !== null) {
      window.URL.revokeObjectURL(textFile);
    }
    textFile = window.URL.createObjectURL(data);
    return textFile;
  }


function generateFileData(thisTime,delTime,thisId){
    //Header
    var fString ="<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n";
    //DataSpec
        fString +="<!-- data: sphereID, cylinderProfile[50x1],cameraX, cameraY, cameraZ-->\n";
    //Object Type
    fString +="<model>\n";
    //ID
    fString +="<id>\n";
    fString += thisId;
    fString+="\n"
    fString +="</id>\n";
    //Timestamp of file
    fString +="<timeStamp>\n";
    fString += thisTime;
    fString+="\n"
    fString +="</timeStamp>\n";
    //Add time taken to deform model
    fString +="<totalSeconds>\n";
    fString += delTime;
    fString+="\n"
    fString +="</totalSeconds>\n";
    //Add deformation matrix
    fString += "<data>\n"
    fString += histsphereMorphVals.toString();
    fString += "\n"
    fString += "</data>\n"
    //Add textbox values
     fString += "<tags>\n"
    fString += $("textarea#metaDataTextArea").val();
    fString += "\n"
    fString += "</tags>\n"
    //End xml File
    fString +="</model>";
    
    return fString;
}

function hideDownloadLink(){
    var downloadLink = document.getElementById('downloadlink');
    downloadLink.style.display = 'none';
    
}

function writeStateValues(){
    
 var histVal = [];
    histVal.push(selectedSphereId);
    histVal.push(cylinderProfile);
    histVal.push(Math.round(camera.rotation.x * 1000) / 1000);
    histVal.push(Math.round(camera.rotation.y * 1000) / 1000);
    histVal.push(Math.round(camera.rotation.z * 1000) / 1000);
  var tmpHistVal =  $.extend(true, {}, histVal);   
    histsphereMorphVals.push(tmpHistVal[0].toString());   
    histsphereMorphVals.push(tmpHistVal[1].toString());  
    histsphereMorphVals.push(tmpHistVal[2].toString());  
    histsphereMorphVals.push(tmpHistVal[3].toString());  
    histsphereMorphVals.push(tmpHistVal[4].toString());  
    hideDownloadLink();
    
    
}

function saveTextAsFile(fileNameToSaveAs, textToWrite) {
    var ie = navigator.userAgent.match(/MSIE\s([\d.]+)/),
        ie11 = navigator.userAgent.match(/Trident\/7.0/) && navigator.userAgent.match(/rv:11/),
        ieVer=(ie ? ie[1] : (ie11 ? 11 : -1));

    if (ie && ieVer<10) {
        console.log("No blobs on IE ver<10");
        return;
    }

    var textFileAsBlob = new Blob([textToWrite], {
        type: 'text/plain'
    });

    if (ie || ie11) {
        window.navigator.msSaveBlob(textFileAsBlob, fileNameToSaveAs);
    } else {
        var downloadLink = document.getElementById('downloadlink');
        downloadLink.download = fileNameToSaveAs;
        downloadLink.innerHTML = "Download File";

       // if (window.webkitURL !== null) {
            // Chrome allows the link to be clicked
            // without actually adding it to the DOM.
            //downloadLink.href = window.webkitURL.createObjectURL(textFileAsBlob);
         downloadLink.setAttribute("download",fileNameToSaveAs);
         downloadLink.href = makeTextFile(textToWrite);
         downloadLink.style.display = 'block';
       // } 
//        else {
//            // Firefox requires the link to be added to the DOM
//            // before it can be clicked.
//            downloadLink.href = window.URL.createObjectURL(textFileAsBlob);
//            downloadLink.style.display = 'block';
//        }

        downloadLink.click();
    }
}