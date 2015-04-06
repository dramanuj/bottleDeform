function makeSlider(){
    //Bandwidth
        $("#sliderOne").ionRangeSlider({
            min: 1,
            max: 100,
            from:50,
           // postfix: "%",
            type: 'single',
            step: 5,
            prettify: true,
            hasGrid: true,
            hideMinMax: true,
		onChange: function (obj) {if(cylContextSet){bandWidthMorphVals[selectedSphereId]=100-obj.fromNumber; updateCylDefVals(0);}},
        onFinish: function (obj) {if(cylContextSet){updatehumanLocation();  writeStateValues();}},    
	  });

    
    $("#sliderTwo").ionRangeSlider({
            //Ampltiude
            min: -50,
            max: 150,
            from:0,
            //postfix: "%",
            type: 'single',
            step: 5,
            prettify: true,
            hasGrid: true,
            hideMinMax: true,
            
        
		onChange: function (obj) {if(cylContextSet){amplitudeMorphVals[selectedSphereId]=obj.fromNumber+50;updateCylDefVals(1);}},
        onFinish: function (obj) {if(cylContextSet){updatehumanLocation(); writeStateValues();}}, 
	  });
    
    $("#sliderThree").ionRangeSlider({
        //Flatness
            min: 2,
            max: 8,
            from:2,
            //postfix: "%",
            type: 'single',
            step: 2,
            prettify: true,
            hasGrid: true,
            hideMinMax: true,
		onChange: function (obj) {if(cylContextSet){flatnessMorphVals[selectedSphereId]=obj.fromNumber;updateCylDefVals(0);}},
         onFinish: function (obj) {if(cylContextSet){writeStateValues();}}, 
	  });
    
    
    };	




function updateCylDefVals(index){

//var defFlat = cylinderMorphVals[2];
//var inter;
//if(defFlat == 2)inter = 1.9;
//else if(defFlat == 4)inter = 1.5;
//else inter = 1.0;
//var defWidth = (200-inter*cylinderMorphVals[0])*defFlat//100*defFlat + (100-cylinderMorphVals[0])*defFlat;
//var defAmp = (cylinderMorphVals[1]/100)*radius/2;
var defAmp = amplitudeMorphVals[selectedSphereId];

switch(index){

    case 0:        
        //colorSelection(cylinderIntersectPoint);//,defWidth,defFlat);
        computeWeights();
        deformCylinder(cylinderIntersectPoint,defAmp);
        updateBoxSpheres(); 
        //makeAmplitudeZero();   
    break;

    case 1:
        deformCylinder(cylinderIntersectPoint,defAmp);//,defWidth,defFlat,defAmp);
        updateBoxSpheres(); 
        
    break;
    
    default: 
  }}


function makeAmplitudeZero(){
 $("#sliderTwo").ionRangeSlider("update",{from:0}); 
    
}

function setSliderContext(id){
    $("#sliderOne").ionRangeSlider("update",{from:100-bandWidthMorphVals[id]});
    $("#sliderTwo").ionRangeSlider("update",{from:amplitudeMorphVals[id]-50});
    $("#sliderThree").ionRangeSlider("update",{from:flatnessMorphVals[id]});
     
}

