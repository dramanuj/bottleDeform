var cylinderMesh;
var cylinderMeshObject;

var cylinderGeometry; // vertices and faces
var cylinderMaterial; // material
var numSections = 50; // #cross-sections in cylinder
var sectionResolution = 314/2; // #vertices per cross-section
var radius = 50;// cylinder radius
var baseH = -100.0;// cylinder base (y coordinate of the center of the lowest section)
var topH = 100.0;// cylinder top (y coordinate of the center of the highest section)
var cylinderProfile = [];
var previousProfile = [];
var sectionHeights = [];
var selectedIndex = 1000;
var previousAmplitude = 0.0;
var colorFlag = true;// boolean flag specifying whether to color selected sections

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
    // Vertices and profile
	for(var i = 0;i < numSections;i+=1)
	{
		cylinderProfile.push(radius);
		previousProfile.push(radius);
		sectionHeights.push(baseH+ i*(topH-baseH)/numSections);
		for(var j = 0;j < sectionResolution;j+=1)
		{
			cylinderGeometry.vertices.push(new THREE.Vector3(-radius*Math.sin(2.0*j*Math.PI/(sectionResolution-1)),baseH+ i*(topH-baseH)/numSections,-radius*Math.cos(2.0*j*Math.PI/(sectionResolution-1))));
		}
	}
	
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
	cylinderMesh = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
    cylinderMeshObject = new THREE.Object3D();
	cylinderMeshObject.add(cylinderMesh);
    scene.add(cylinderMeshObject);
}

// Given a 3D point (var clickedVertex), &
// the range of sections (var width)
// this function computes a range of section indices
// that are "selected" by the 3D point
// and changes the vertex color of all sections
// within the selected section range
function colorSelection(clickedVertex, width, flatness)
{
	var sec = activeSection(clickedVertex);
	if(sec < 0 || sec > numSections-1)return;
	var def=[];
	for(var i = 0;i < numSections;i++)
	{
		x = (sectionHeights[sec]-sectionHeights[i])/(topH-baseH);
		def.push(Math.exp(-width*Math.pow(x,flatness)));
	}
	
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
        
        cylinderGeometry.faces[i].vertexColors[0].setRGB(1.0*def[sid1] + (1-def[sid1])*0.3,0.1*def[sid1] + (1-def[sid1])*0.75,0.1*def[sid1] + (1-def[sid1])*0.3);
        cylinderGeometry.faces[i].vertexColors[1].setRGB(1.0*def[sid2] + (1-def[sid2])*0.3,0.1*def[sid2] + (1-def[sid2])*0.75,0.1*def[sid2] + (1-def[sid2])*0.3);
        cylinderGeometry.faces[i].vertexColors[2].setRGB(1.0*def[sid3] + (1-def[sid3])*0.3,0.1*def[sid3] + (1-def[sid3])*0.75,0.1*def[sid3] + (1-def[sid3])*0.3);
		
//		if(def[sid1] > 0.005){cylinderGeometry.faces[i].vertexColors[0].setRGB(1.0,0.1,0.1);}
//		else {cylinderGeometry.faces[i].vertexColors[0].setRGB(0.3,0.75,0.3);}
//		
//		if(def[sid2] > 0.005){cylinderGeometry.faces[i].vertexColors[1].setRGB(1.0,0.1,0.1);}
//		else {cylinderGeometry.faces[i].vertexColors[1].setRGB(0.3,0.75,0.3);}
//		
//		if(def[sid3] > 0.005){cylinderGeometry.faces[i].vertexColors[2].setRGB(1.0,0.1,0.1);}
//		else {cylinderGeometry.faces[i].vertexColors[2].setRGB(0.3,0.75,0.3);}
		
		// if(sid1 >= sec-swidth && sid1 <= sec+swidth)
		// {cylinderGeometry.vertexColors[0].setRGB(1.0,0.1,0.1);}
		// else {cylinderGeometry.vertexColors[0].setRGB(0.3,0.75,0.3);}
		
		// if(sid2 >= sec-swidth && sid2 <= sec+swidth)
		// {cylinderGeometry.vertexColors[1].setRGB(1.0,0.1,0.1);}
		// else {cylinderGeometry.vertexColors[1].setRGB(0.3,0.75,0.3);}
		
		// if(sid3 >= sec-swidth && sid3 <= sec+swidth)
		// {cylinderGeometry.vertexColors[2].setRGB(1.0,0.1,0.1);}
		// else {cylinderGeometry.vertexColors[2].setRGB(0.3,0.75,0.3);}
	}
    cylinderGeometry.verticesNeedUpdate = true;
	cylinderGeometry.normalsNeedUpdate = true;
	cylinderGeometry.colorsNeedUpdate = true;
	while(def.length > 0)
	{
		def.pop();
	}
}

// This function deforms the cylinder
// Input Arguments
// 		clickedVertex: selected point on the cylinder (type THREE.Vector3 )
// 		width: float value that defines the extent of deformation along profile (try values between 1 and 20)
//		flatness: even number (try values between 2 and 8)
//		amplitude: amount of maximum deformation on profile
function deformCylinder(clickedVertex, width, flatness, amplitude)
{
	var sec = activeSection(clickedVertex);
	if(sec < 0 || sec > numSections-1)return;
	
	var def;
	for(var i = 0;i < numSections;i++)
	{
		x = (sectionHeights[sec]-sectionHeights[i])/(topH-baseH);
        def = amplitude*Math.exp(-width*Math.pow(x,flatness));
        //if(previousProfile[i] + def > radius/10)
            cylinderProfile[i] = previousProfile[i] + def;
        //else
            //cylinderProfile[i] = radius/10;
	}
    recreateCylinder(cylinderProfile);
    previousAmplitude = amplitude;
    if(sec != selectedIndex)
	{
        selectedIndex = sec;
        console.log('update');
		for(var i = 0;i < numSections;i++)
		{
			previousProfile[i] = cylinderProfile[i];
		}
	}
    
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
function activeSection(clickedVertex)
{
	return Math.floor(numSections*(clickedVertex.y-baseH)/(topH-baseH));
}

function getVertex(secID,resID)
{
	var id = secID*sectionResolution + resID;
	return new THREE.Vector3(cylinderGeometry.vertices[id].x,cylinderGeometry.vertices[id].y,cylinderGeometry.vertices[id].z);
}

function getSectionRadius(secID)
{
	var id = secID*sectionResolution;
	var x = cylinderGeometry.vertices[id].x;
	var z = cylinderGeometry.vertices[id].z;
	return Math.sqrt(x*x + z*z);
}

function modifySection(secID,newRad)
{
    var oldRad = getSectionRadius(secID);
	for(var i = 0;i < sectionResolution;i++)
	{
		var id = secID*sectionResolution+i;
		cylinderGeometry.vertices[id].x *= newRad/oldRad;
		cylinderGeometry.vertices[id].z *= newRad/oldRad;
	}
	cylinderGeometry.verticesNeedUpdate = true;
	cylinderGeometry.normalsNeedUpdate = true;
	cylinderGeometry.colorsNeedUpdate = true;
}

function recreateCylinder(radii)
{
    for(var i = 0;i < numSections;i+=1)
    {
        modifySection(i,radii[i]);
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
        previousProfile[i] = radius;
		cylinderProfile[i] = radius;
	}
    cylinderGeometry.verticesNeedUpdate = true;
	cylinderGeometry.normalsNeedUpdate = true;
	cylinderGeometry.colorsNeedUpdate = true;
    cylinderGeometry.computeFaceNormals();
	cylinderGeometry.computeVertexNormals();
	cylinderGeometry.computeBoundingSphere();
}

