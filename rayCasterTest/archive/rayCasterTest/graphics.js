
			var camera, scene, renderer, controls, sphere;
            var axes = new THREE.Object3D;
            var allObjects = new THREE.Object3D;

			init();
			animate();

			function init() {
        
			  scene = new THREE.Scene();
			  scene.background = new THREE.Color( 0xffffff );
			  camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 5000);
			  camera.position.set(0, 5, 1.5).setLength(100);

        var stage = document.getElementById("stage");

			  renderer = new THREE.WebGLRenderer({canvas: stage, antialias: true});
			  //renderer.setSize(3*(window.innerWidth / 4), 8*(window.innerHeight / 9));
			  renderer.setSize( window.innerWidth, window.innerHeight );
        controls = new THREE.OrbitControls(camera, renderer.domElement);
        scene.add(axes);
        
        sphere = new THREE.Object3D();
        scene.add(sphere);
        sphere1 = new THREE.Mesh(new THREE.SphereGeometry(10, 16, 8), new THREE.MeshBasicMaterial({color: "red", wireframe: true}));
        sphere1.position.set(7, 0, 0);
        sphere.add(sphere1);
        sphere2 = new THREE.Mesh(new THREE.SphereGeometry(5, 16, 8), new THREE.MeshBasicMaterial({color: "red", wireframe: true}));
        sphere2.position.set(-10, 0, 0);
        sphere.add(sphere2);

			  //setting up xyz axis
			  //GridHelper( size of the entire grid, divisions : number of divisions on the grid, colorCenterLine : Color, colorGrid : Color (0x00ff00) ) --> 
			  // green central line
			  var gridXZ = new THREE.GridHelper(100, 10,0x000000,0x00ff00);
			  gridXZ.position.set(0,0,0);
			  axes.add(gridXZ);
			  // red central line
			  var gridXY = new THREE.GridHelper(100,10,0x000000,0xff0000);
			  gridXY.position.set(0,0,0);
			  // rotation about x axis by 90 degrees
			  gridXY.rotation.x = Math.PI/2;
			  axes.add(gridXY);
			  // blue central line
			  var gridYZ = new THREE.GridHelper(100,10,0x000000,0x0000FF);
			  gridYZ.position.set(0,0,0);
			  // rotation about z axis by 90 degrees
			  gridYZ.rotation.z = Math.PI/2;
			  axes.add(gridYZ); 
		      
              axes.add(allObjects);

              // create labels for axes
              for (var i = -55; i <= 55; i = i + 10) {
                  var sprX = makeTextSprite(i - 5, undefined, i, 0, 0);
                  var sprY = makeTextSprite(i - 5, undefined, 5, i - 5, 0);
                  var sprZ = makeTextSprite(i - 5, undefined, 0, 0, i - 5);
                  axes.add(sprX);
                  axes.add(sprY);   
                  axes.add(sprZ);
              }
      }

			function animate() {
			  requestAnimationFrame(animate);
			  renderer.render(scene, camera);
			}


            function makeTextSprite(message, opts, xCoord, yCoord, zCoord) {
              var parameters = opts || {};
              var fontface = parameters.fontface || 'Helvetica';
              var fontsize = parameters.fontsize || 70;
              var canvas = document.createElement('canvas');
              var context = canvas.getContext('2d');
              context.font = fontsize + "px " + fontface;

              // get size data (height depends only on font size)
              var metrics = context.measureText(message);
              var textWidth = metrics.width;

              // text color
              context.fillStyle = 'rgba(0, 0, 0, 1.0)';
              context.fillText(message, 0, fontsize);

              // canvas contents will be used for a texture
              var texture = new THREE.Texture(canvas)
              texture.minFilter = THREE.LinearFilter;
              texture.needsUpdate = true;

              var spriteMaterial = new THREE.SpriteMaterial({
                  map: texture,
                  useScreenCoordinates: false
              });
              var sprite = new THREE.Sprite(spriteMaterial);
              sprite.scale.set(10, 5, 1.0);
              sprite.position.set(xCoord, yCoord, zCoord);
              return sprite;
            }


            function createVector(xCoord, yCoord, zCoord) { 

                var geometry = new THREE.Geometry();
                geometry.vertices.push(new THREE.Vector3(0, 0, 0));
                geometry.vertices.push(new THREE.Vector3(xCoord, yCoord, zCoord));
                
                var material = new THREE.LineBasicMaterial({ color: 0x0000ff, linewidth: 3  });
               
                var newLine = new THREE.Line(geometry, material);
                allObjects.add(newLine);
            };  
            // v: Vector3 object
             function createLine(v) { 

                var geometry = new THREE.Geometry();
                geometry.vertices.push(new THREE.Vector3(0, 0, 0));
                geometry.vertices.push(new THREE.Vector3(v.getComponent(0), v.getComponent(1), v.getComponent(2)));
                
                var material = new THREE.LineBasicMaterial({ color: 0x0000ff, linewidth: 3  });
               
                var newLine = new THREE.Line(geometry, material);
                newLine.updateMatrixWorld(true);
                allObjects.add(newLine);
            }; 
            /* read the vectorStack and draw the vectors on the grid */
            function drawAllVectors(vectorQueue) {

                // first, clear existing vectors
                axes.remove(allObjects);
                allObjects = new THREE.Object3D;
                axes.add(allObjects);

                for (var i = 0; i < vectorQueue.length; i++) {
                    
                    var currentVectorObj = vectorQueue[i];
                    createVector(currentVectorObj.xCoord.value, currentVectorObj.yCoord.value, currentVectorObj.zCoord.value);
                }  
            }

function createSpannedLine(vector,scale,hex) {
  //var arrow = createVector(vector.getComponent(0),vector.getComponent(1),vector.getComponent(2),new THREE.Vector3( 0, 0, 0 ),0x000000);
  var vectorMaxLength = Math.sqrt(scale * scale * 3); 
  var scaleFactor = vectorMaxLength / (vector.length());  
  var endPt1 = vector.multiplyScalar(scaleFactor);
  var endPt2 = new THREE.Vector3(-1 * endPt1.getComponent(0), -1 * endPt1.getComponent(1), -1 * endPt1.getComponent(2));
  var geometry = new THREE.Geometry();
  geometry.vertices.push(
      endPt1,
      endPt2
      );
  var material = new THREE.LineBasicMaterial({ color: hex, linewidth: 5 });
  var line = new THREE.Line(geometry, material);

  var allObj = new THREE.Object3D();
  //allObj.add(arrow);
  allObj.add(line); 
  return allObj;
}
// return kth column of m*n matrix M as a 1d array
function getCol(matrix,k){
  var outArr = new Array();
  for (var i = 0; i < matrix.length; i++) {
    outArr.push(matrix[i][k]);
  }
  return outArr;
}

            function linePlotter(lineMatrix) {
  var scaleOfAxis = 100; 
  var hex = 0x000000;
  // find point and direction as 3-elements 1d array
  var positionV = getCol(lineMatrix,0);
  var directionV = getCol(lineMatrix,1);
  var spannedLine = createSpannedLine(
                      new THREE.Vector3(directionV[0],directionV[1],directionV[2]),
                      scaleOfAxis,hex);
  // traverse the spannedline by the position vector
  spannedLine.position.set(positionV[0],positionV[1],positionV[2]);
  allObjects.add(spannedLine);
  return spannedLine;
}
