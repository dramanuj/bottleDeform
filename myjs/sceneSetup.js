function init() {
                
                var containerBounds = Math.min(window.innerHeight*(2/3), window.innerWidth*(2/3));
                
				container = document.createElement( 'div' );
                container.style.width= containerBounds.toString()+"px";
                container.style.boxShadow = "5px 5px 1.2em black";
				var renderDiv = document.getElementById('renderArea');
                renderDiv.appendChild(container);
				
				scene = new THREE.Scene();                
                camera = new THREE.PerspectiveCamera( 45, 1, 1, 15000 );
				camera.position.z = 400;
                camera.lookAt( new THREE.Vector3( 0, 0, 0 ) );
                scene.add(camera);
                
                var lightP1 = new THREE.PointLight( 0xffffff, 0.75); //0x00ff00
                lightP1.position.set( -50, 50, 50 );
                camera.add(lightP1);
    
                var lightP2 = new THREE.PointLight(0x333300, 0.75);
                lightP1.position.set( 50, 50, 50 );
                camera.add(lightP2);
                
                projector = new THREE.Projector();    
                
				renderer = new THREE.WebGLRenderer();
				renderer.setClearColor( 0xf0f0f0, 1 ); //0xf0f0f0
				renderer.setSize( containerBounds, containerBounds );
				renderer.sortObjects = false;
				container.appendChild( renderer.domElement );

                renderer.domElement.addEventListener( 'mousedown', onDocumentMouseDown, false );
                renderer.domElement.addEventListener( 'mousemove', onDocumentMouseMove, false );
    

                // Load Object

				objLoader();
                objLoader2('./objs/cuppedhand.obj');
                
                window.addEventListener( 'resize', onWindowResize, false );
                onWindowResize() ;
                
                // Load controls
                controls = new THREE.TrackballControls( camera, container );
				controls.rotateSpeed = 1.0;
				controls.zoomSpeed = 1.2;
				controls.panSpeed = 1.25;
				controls.noZoom = false;
				controls.noPan = false;
                controls.noRotate = false;
				controls.staticMoving = true;
				controls.dynamicDampingFactor = 0.3;
				controls.keys = [ 65, 83, 68 ];
				controls.addEventListener( 'change', render );

			}

			function onWindowResize() {
                var containerBounds = Math.min(window.innerHeight*(2/3), window.innerWidth*(2/3));
				camera.aspect = 1;
				camera.updateProjectionMatrix();
                var renderDiv = document.getElementById('renderArea');
                renderDiv.style.width = containerBounds;
                renderDiv.style.height = containerBounds;
                container.style.width = containerBounds.toString()+"px";
                container.style.height = containerBounds.toString()+"px";
				renderer.setSize( containerBounds, containerBounds );
                
                var sliderDiv = document.getElementById('sliderGroup');
                var sliderLeft = containerBounds+Number(renderDiv.style.left)+100;
                sliderDiv.style.left = sliderLeft.toString()+"px";
                var buttonDiv = document.getElementById('buttonGroup');
                var buttonLeft = containerBounds+Number(renderDiv.style.left)+100;
                buttonDiv.style.left = buttonLeft.toString()+"px";
                
                var linkDiv = document.getElementById('linkArea');
                var linkLeft = buttonLeft+175;
                linkDiv.style.left = linkLeft.toString()+"px"
             
                
                 var metaDataDiv = document.getElementById('metaDataBox');
                var metaDataLeft = containerBounds+Number(renderDiv.style.left)+100;
                metaDataDiv.style.left = metaDataLeft.toString()+"px"
                
                var mouseDataDiv = document.getElementById('mouseDataBox');
                var mouseDataTop = containerBounds+Number(renderDiv.style.top)+75;
                mouseDataDiv.style.top = mouseDataTop.toString()+"px";
                mouseDataDiv.style.width = containerBounds.toString()+"px";

			}


            


			function onDocumentMouseMove(event) {
                var containerBounds = Math.min(window.innerHeight*(2/3), window.innerWidth*(2/3));
                windowHalfX = containerBounds/ 2;
				windowHalfY = containerBounds/ 2;
			    mouseX = ( event.clientX - windowHalfX );
			    mouseY = ( event.clientY - windowHalfY )*2 ;

			}


            function onDocumentMouseDown(event){
                event.preventDefault();event.clientX
                
                // Set mouse to zero in pixel space
                var renderDiv = document.getElementById('renderArea');
                var sMouseX = event.clientX - renderDiv.offsetLeft-5;
                var sMouseY = event.clientY- renderDiv.offsetTop-50;

                // Map mpuse to container space
                var mouse3D = new THREE.Vector3( ( sMouseX /container.offsetWidth ) * 2 - 1,   //x
                                        -( sMouseY /container.offsetHeight) * 2 + 1,  //y
                                        0.7 ); 

                var raycaster = projector.pickingRay( mouse3D.clone(), camera );
                //var intersects = raycaster.intersectObject(cylinderMeshObject,true);
                var intersects = raycaster.intersectObjects(controlGroup.children,true);
//                if ( intersects.length > 0 ) {
//                   cylinderIntersectPoint = intersects[0].point;
//                   cylContextSet = true;
//                var defFlat = cylinderMorphVals[2];
//                var inter;
//                if(defFlat == 2)inter = 1.9;
//                else if(defFlat == 4)inter = 1.5;
//                else inter = 1.0;
//                var defWidth = (200-inter*cylinderMorphVals[0])*defFlat//100*defFlat + (100-cylinderMorphVals[0])*defFlat;
//                 colorSelection(cylinderIntersectPoint);//,defWidth,defFlat);
//                 makeAmplitudeZero();
//                }
                
                if ( intersects.length > 0 ) {
                   cylinderIntersectPoint = intersects[0].point;
                   cylContextSet = true;
                   setMorphSphere(intersects[0].object.name);
                   selectedSphereId = parseInt(intersects[0].object.name);
                   setSliderContext(selectedSphereId);
                }
                
                
    }
                            







			function animate() {

				requestAnimationFrame( animate );
				controls.update();
				render();

			}

			function render() {

				renderer.render( scene, camera );
				//stats.update();

			}
