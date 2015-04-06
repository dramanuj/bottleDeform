	//Loading Manager
function objLoader(){
                    
                    // Initialize and add cylinder to the scene
                    initializeCylinder();
    
                    // Create spheres and lines
                    createControlSpheres();
    
                    //Add arrow Helper
                    //addAxisHelper();
                   
              
}


function objLoader2(objPath){
            
			var manager = new THREE.LoadingManager();
				manager.onProgress = function ( item, loaded, total ) {
					console.log( item, loaded, total );
				};
			 
            var handMaterial = new THREE.MeshLambertMaterial({color: 0xEECEB3, transparent: true, opacity: 0.65});
            var loader = new THREE.OBJLoader( manager );
				loader.load(objPath, function ( object ) {
					object.traverse( function ( child ) {
						if ( child instanceof THREE.Mesh ) {
				        child.material = handMaterial;
                        child.geometry.computeFaceNormals();    
                       
                        
						}
				});
                
                object.name =  'cuppedhand';
                object.position.setX(-50);
                object.position.setZ(-75);    
                scene.add(object);
                object.visible = false;
                });

//    var ground = new THREE.Mesh(new THREE.PlaneGeometry(1000,1000), new THREE.MeshLambertMaterial({color: 0xFFF5EE, transparent: false, opacity: 0.25})); 
// ground.position.y = -100; //lower it 
// ground.rotation.x = -Math.PI/2; //-90 degrees around the xaxis 
// ground.doubleSided = true;
// ground.material.side = THREE.DoubleSide;;    
// scene.add(ground);
//    
}


function toggleHuman(){
    humanVisible = !humanVisible;
      scene.traverse (function (object){
        if (object.name == 'cuppedhand') object.visible = humanVisible;
          
      });
   
 isScalePressed = true;
    
}



function updatehumanLocation(){
    
  // Distance to move is along y and Z after deformation
    
    var dist = Math.max(controlRadii[1], controlRadii[2], controlRadii[3], controlRadii[4], controlRadii[5], controlRadii[6], controlRadii[7], controlRadii[8]);
        scene.traverse (function (object){
        if (object.name == 'cuppedhand'){ object.position.setZ(-dist);
      
          }});
    console.log(dist);

}



// Auxulary geometry containing spheres and lines for visualization reasons


function drawSphere(x,y,z,r){
 var sphGeom = new THREE.SphereGeometry(r,64,64)
 var sphere = new THREE.Mesh(sphGeom);
 sphere.position.x = x;
 sphere.position.y = y;
 sphere.position.z = z;  
 sphere.material.transparent = true;
 sphere.material.opacity = 0.75;    
 sphere.material.color.setRGB (0.25, 0.75, 1);  
 sphere.geometry.computeFaceNormals();    
 return sphere;
}

function createControlSpheres()
{
    controlGroup = new THREE.Object3D();
    for(var i = 0;i < numControlPoints;i++)
    {
       var sph1 = drawSphere( 2*radius+controlRadii[i]*0.5,controlHeights[i],0,4);
       var strname = i; sph1.name = strname;
       var sph2 = drawSphere( -2*radius-controlRadii[i]*0.5,controlHeights[i],0,4);    
       strname = i; sph2.name = strname;
       controlSpheres.push(sph1);
       controlSpheres.push(sph2);    
    }
    
    for(var i = 0;i < controlSpheres.length;i++)controlGroup.add(controlSpheres[i]);
    scene.add(controlGroup);
    createBoxLines();
}

function setMorphSphere(sphName){

    controlGroup.traverse(function(child){ 
    if (child instanceof THREE.Mesh){     
        child.material.color.setRGB(0.25, 0.75, 1);
        if (child.name == sphName){            
          child.material.color.setRGB(1,0,0);
          
        }
    }
        
    });

}

function updateBoxSpheres(){

    controlGroup.traverse( function (sphere){
    var sphID = parseInt(sphere.name);
    if(isNaN(sphID) == false){   
    //console.log(cylinderProfile[sphID]);
     if(sphere.position.x <0) sphere.position.x = -2*radius-controlRadii[sphID]*0.5;
     else  sphere.position.x = 2*radius+controlRadii[sphID]*0.5;
        
    }});
    
    for(var i=0;i< controlSpheres.length-2;i++){
        var line = controlLines[i];
        line.geometry.vertices[0] = controlSpheres[i].position;
        line.geometry.vertices[1] = controlSpheres[i+2].position;
        line.geometry.verticesNeedUpdate = true; 
    }
        

}



function createBoxLines(){

//Create line group
lineGroup = new THREE.Object3D();
for(var i=0;i< controlSpheres.length-2;i++){
    
    var material = new THREE.LineBasicMaterial({
        color: 0x000000
    });  
    var geometry = new THREE.Geometry();
    geometry.vertices.push(new THREE.Vector3(controlSpheres[i].position.x,controlSpheres[i].position.y,0));
    //console.log(controlSpheres[i+2].name);
    geometry.vertices.push(new THREE.Vector3(controlSpheres[i+2].position.x,controlSpheres[i+2].position.y,0));
    var line = new THREE.Line(geometry, material);    
    var lNameStr = i.toString();
    var toI = i+2;
    line.name = lNameStr.concat(toI.toString());
    line.geometry.dynamic = true; 
    lineGroup.add(line);
    controlLines.push(line);
}
scene.add(lineGroup);
    
}


function resetSpheres(){

// Initialize variables for each control point
bandWidthMorphVals = [50,50,50,50,50,50,50,50,50,50];
flatnessMorphVals =  [2,2,2,2,2,2,2,2,2,2];
amplitudeMorphVals =  [50,50,50,50,50,50,50,50,50,50];
updateBoxSpheres(); 
    
}





function resetMorphData(){
    
   if(confirm("Do you really want to reset? All changes will be lost!")){
          $("#sliderOne").ionRangeSlider("update",{from:50});
          $("#sliderTwo").ionRangeSlider("update",{from:0});
          $("#sliderThree").ionRangeSlider("update",{from:2});
          resetCylinder();  
          resetSpheres();
          var downloadLink = document.getElementById('downloadlink');
          downloadLink.style.display = 'none';
   
   }
    
    
}




function addAxisHelper(){
  
var origin = new THREE.Vector3( 0,baseH-35,0 );
var dir = new THREE.Vector3( 0, 1, 0 );
var length = topH-baseH+70;    
var headlength= 35*(2/3);
var headwidth = 35*(1/3);
var hex = 0x3d3d3d;
var axis = new THREE.ArrowHelper( dir, origin, length, hex, headlength,headwidth );  
scene.add( axis );
    
}






// Helper functions

function multiplyMatrices(first, second) {
    var newMatrix = [],
        newWidth = second[0].length,
        newHeight = first.length;
    //iterating through first matrix rows
    for (var row = 0; row < newHeight; row++) {
        newMatrix[row] = [];
        //iterating through second matrix columns
        for (var column = 0; column < newWidth; column++) { 
            var sum = 0;
            //calculating sum of pairwise products
            for (var index = 0; index < first[0].length; index++) {
                sum += first[row][index] * second[index][column];
            }
            newMatrix[row][column] = sum;
        }
    }
    return newMatrix;
}

// Helper functions

function zeros(dimensions) {
    var array = [];

    for (var i = 0; i < dimensions[0]; ++i) {
        array.push(dimensions.length == 1 ? 0 : zeros(dimensions.slice(1)));
    }

    return array;
}


function getMaxOfArray(numArray) {
    return Math.max.apply(null, numArray);
}
