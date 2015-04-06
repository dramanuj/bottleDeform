var cylinderMesh;
var cylinderMeshObject;

var cylinderGeometry; // vertices and faces
var cylinderMaterial; // material
var numSections = 50; // #cross-sections in cylinder
var sectionResolution = 157; // #vertices per cross-section
var radius = 50;// cylinder radius
var baseH = -100.0;// cylinder base (y coordinate of the center of the lowest section)
var topH = 100.0;// cylinder top (y coordinate of the center of the highest section)
var cylinderProfile = [];
var sectionHeights = [];

var numControlPoints = numSections/5;
var controlRadii = [];
var controlHeights = [];
var controlSpheres=[];
var controlGroup;
//var bandWidth = [];
//var exponent = [];
var weightMatrix;
var controlLines = [];
var lineGroup;
var selectedIndex = 1000;

// Initialize variables for each control point
var bandWidthMorphVals = [50,50,50,50,50,50,50,50,50,50];
var flatnessMorphVals =  [2,2,2,2,2,2,2,2,2,2];
var amplitudeMorphVals =  [50,50,50,50,50,50,50,50,50,50];

// This function performs the following operations:
// 1) Initializes the geometry (vert, faces) of a cylinder (var cylinderGeometry)
// 2) Initializes the material of a cylinder (var cylinderMaterial)
// 3) Creates a new mesh with the geometry and material (var cylinderMesh)
// 4) Associates the mesh to a THREE.Object (var cylinderMeshObject)
// NOTE:
// The function only creates the geometry and nothing more.
// Please add the relevant variables to the scene manually.
function initializeCylinder()
{
	// Geometry
	cylinderGeometry = new THREE.Geometry();
	cylinderGeometry.dynamic = true;
	
	// Control Points
	for(var i = 0;i < numControlPoints;i+=1)
	{
		controlRadii.push(radius);
		controlHeights.push(baseH+ i*(topH-baseH)/numControlPoints);
		//bandWidth.push(50.0);
		//exponent.push(2);
	}
    
	
    // Vertices and profile
	for(var i = 0;i < numSections;i+=1)
	{
		cylinderProfile.push(radius);
		sectionHeights.push(baseH+ i*(topH-baseH)/numSections);
		for(var j = 0;j < sectionResolution;j+=1)
		{
			cylinderGeometry.vertices.push(new THREE.Vector3(-radius*Math.sin(2.0*j*Math.PI/(sectionResolution-1)),baseH+ i*(topH-baseH)/numSections,-radius*Math.cos(2.0*j*Math.PI/(sectionResolution-1))));
		}
	}
	
	// Compute Weight Matrix
	computeWeights();
	
	// Faces
	// The quad face is constructed between 
	// four vertices of two consecutive section
	// For sections i-1 and i, we have
	// (i-1,j) <---- (i-1,j+1)
	//    |             /\
	//    |             |
	//    |             |
	//    \/            |
	//  (i,j) -----> (i,j+1)
	// This quad is further sub-divided into two triangles
	for(var i = 1;i < numSections;i+=1)
	{
		for(var j = 0;j < sectionResolution;j+=1)
		{
			var i1 = (i-1)*sectionResolution + j;
			var i2 = i*sectionResolution + j;
			var i3 = i*sectionResolution + (j+1)%sectionResolution;
			var i4 = (i-1)*sectionResolution + (j+1)%sectionResolution;
			
			cylinderGeometry.faces.push(new THREE.Face3(i4,i2,i1));
			cylinderGeometry.faces.push(new THREE.Face3(i4,i3,i2));
		}
	}
	
	// Vertex Color
	for(var i = 0;i < cylinderGeometry.faces.length;i++)
	{
		cylinderGeometry.faces[i].vertexColors[0] = new THREE.Color(0.3,0.75,0.3);
		cylinderGeometry.faces[i].vertexColors[1] = new THREE.Color(0.3,0.75,0.3);
		cylinderGeometry.faces[i].vertexColors[2] = new THREE.Color(0.3,0.75,0.3);
	}
	
	// Normals and general flags
	cylinderGeometry.name = 'cylinderMesh';
	cylinderGeometry.verticesNeedUpdate = true;
	cylinderGeometry.normalsNeedUpdate = true;
	cylinderGeometry.colorsNeedUpdate = true;
	cylinderGeometry.computeFaceNormals();
	cylinderGeometry.computeVertexNormals();
	cylinderGeometry.computeBoundingSphere();
	
	// Material
	cylinderMaterial = new THREE.MeshPhongMaterial({ ambient: 0x030303, vertexColors: THREE.VertexColors});
    cylinderMaterial.side = THREE.DoubleSide;
	cylinderMaterial.transparent = true;
    cylinderMesh = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
    cylinderMeshObject = new THREE.Object3D();
	cylinderMeshObject.add(cylinderMesh);
    cylinderMesh.material.opacity = 0.975;
    scene.add(cylinderMeshObject);
}

// Given a 3D point (var clickedVertex), &
// the range of sections (var width)
// this function computes a range of section indices
// that are "selected" by the 3D point
// and changes the vertex color of all sections
// within the selected section range
function colorSelection(clickedVertex)
{
	var sec = activeSection(clickedVertex);
    selectedIndex =  controlSection(clickedVertex);
	if(sec < 0 || sec > numSections-1)return;
	
	var swidth = 1;
    var id1,id2,id3;
	var sid1,sid2,sid3;
	for(var i = 0;i < cylinderGeometry.faces.length;i++)
	{
		id1 = cylinderGeometry.faces[i].a;
		id2 = cylinderGeometry.faces[i].b;
		id3 = cylinderGeometry.faces[i].c;
		
		sid1 = (id1-(id1%sectionResolution))/sectionResolution;
		sid2 = (id2-(id2%sectionResolution))/sectionResolution;
		sid3 = (id3-(id3%sectionResolution))/sectionResolution;
        
		if(sid1 >= sec-swidth && sid1 <= sec+swidth)
		{cylinderGeometry.faces[i].vertexColors[0].setRGB(1.0,0.1,0.1);}
		else {cylinderGeometry.faces[i].vertexColors[0].setRGB(0.3,0.75,0.3);}
		
		if(sid2 >= sec-swidth && sid2 <= sec+swidth)
		{cylinderGeometry.faces[i].vertexColors[1].setRGB(1.0,0.1,0.1);}
		else {cylinderGeometry.faces[i].vertexColors[1].setRGB(0.3,0.75,0.3);}
		
		if(sid3 >= sec-swidth && sid3 <= sec+swidth)
		{cylinderGeometry.faces[i].vertexColors[2].setRGB(1.0,0.1,0.1);}
		else {cylinderGeometry.faces[i].vertexColors[2].setRGB(0.3,0.75,0.3);}
	}
    cylinderGeometry.verticesNeedUpdate = true;
	cylinderGeometry.normalsNeedUpdate = true;
	cylinderGeometry.colorsNeedUpdate = true;
}

function computeWeights()
{
	weightMatrix = new Array(numSections);
	for(var i = 0;i < numSections;i++)
	{
		weightMatrix[i] = new Array(numControlPoints);
	}
	
	var sum;
	for(var i = 0;i < numSections;i++)
	{
		sum = 0.0;
		for(var j = 0;j < numControlPoints;j++)
		{
			x = (sectionHeights[i]-controlHeights[j])/(topH-baseH);
			//x = sectionHeights[i]-controlHeights[j];
			if(!cylContextSet) weightMatrix[i][j] = Math.exp(-Math.abs(50*Math.pow(x,2)));
			else weightMatrix[i][j] = Math.exp(-bandWidthMorphVals[j]*Math.pow(x,flatnessMorphVals[j]));
            sum += weightMatrix[i][j];
		}
		
		for(var j = 0;j < numControlPoints;j++)
		{
			weightMatrix[i][j] /= sum;
		}
	}
    //console.log(weightMatrix);
}

// This function deforms the cylinder
// Input Arguments
// 		clickedVertex: selected point on the cylinder (type THREE.Vector3 )
//		amplitude: amount of maximum deformation on profile
function deformCylinder(clickedVertex, amplitude)
{
	var sec = controlSection(clickedVertex);
	if(sec < 0 || sec > numControlPoints-1)return;
	
	controlRadii[sec] = amplitude;
	for(var i = 0;i < numSections;i++)
	{
		cylinderProfile[i] = 0.0;
		for(var j = 0;j < numControlPoints;j++)
		{
			cylinderProfile[i] += controlRadii[j]*weightMatrix[i][j];
		}
	}
    recreateCylinder(cylinderProfile);
    
	cylinderGeometry.computeFaceNormals();
	cylinderGeometry.computeVertexNormals();
	cylinderGeometry.computeBoundingSphere();
    cylinderGeometry.computeFaceNormals();
	cylinderGeometry.computeVertexNormals();
	cylinderGeometry.computeBoundingSphere();
}

// Auxiliary functions

// Given a 3D point (var clickedVertex),
// this function returns an integer specifying
// the section index on the cylinder.
// The returned value will be outside the bounds [0, numSections-1]
// if the 3D point is not on the cylinder.
function controlSection(clickedVertex)
{
	return Math.round(numControlPoints*(clickedVertex.y-baseH)/(topH-baseH));
}

function activeSection(clickedVertex)
{
	return Math.floor(numSections*(clickedVertex.y-baseH)/(topH-baseH));
}


function getVertex(secID,resID)
{
	var id = secID*sectionResolution + resID;
	return new THREE.Vector3(cylinderGeometry.vertices[id].x,cylinderGeometry.vertices[id].y,cylinderGeometry.vertices[id].z);
}

function recreateCylinder(radii)
{
    var id;
    for(var i = 0;i < numSections;i+=1)
	{
		for(var j = 0;j < sectionResolution;j+=1)
		{
            id = i*sectionResolution+j; 
			cylinderGeometry.vertices[id].x = -radii[i]*Math.sin(2.0*j*Math.PI/(sectionResolution-1));
            cylinderGeometry.vertices[id].z = -radii[i]*Math.cos(2.0*j*Math.PI/(sectionResolution-1));
		}
 	}
    cylinderGeometry.verticesNeedUpdate = true;
	cylinderGeometry.normalsNeedUpdate = true;
	cylinderGeometry.colorsNeedUpdate = true;
    cylinderGeometry.computeFaceNormals();
	cylinderGeometry.computeVertexNormals();
	cylinderGeometry.computeBoundingSphere();
}

function resetCylinder()
{
    var id;
    for(var i = 0;i < numSections;i+=1)
	{
		for(var j = 0;j < sectionResolution;j+=1)
		{
            id = i*sectionResolution+j; 
			cylinderGeometry.vertices[id].x = -radius*Math.sin(2.0*j*Math.PI/(sectionResolution-1));
            cylinderGeometry.vertices[id].z = -radius*Math.cos(2.0*j*Math.PI/(sectionResolution-1));
		}
		cylinderProfile[i] = radius;
	}
    
    for(var i = 0;i < numControlPoints;i+=1) controlRadii[i] = radius;

    cylinderGeometry.verticesNeedUpdate = true;
	cylinderGeometry.normalsNeedUpdate = true;
	cylinderGeometry.colorsNeedUpdate = true;
    cylinderGeometry.computeFaceNormals();
	cylinderGeometry.computeVertexNormals();
	cylinderGeometry.computeBoundingSphere();
    updatehumanLocation();

}




