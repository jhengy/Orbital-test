
var camera, scene, renderer, controls, dragControls,sphere;
var axes = new THREE.Object3D;
var allObjects = new THREE.Object3D;
// initialize the vectorObject
var vectorObject = {coordinates: [7,0,0],graphicRef: undefined};

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
  //controls.enabled = false;
  
  // set up spheres
  sphere = new THREE.Object3D();
  scene.add(sphere);
  sphere1 = new THREE.Mesh(new THREE.SphereGeometry(0.5, 16, 8), new THREE.MeshBasicMaterial({color: "red", wireframe: true}));
  sphere1.position.set(vectorObject.coordinates[0],vectorObject.coordinates[1],vectorObject.coordinates[2]);
  sphere.add(sphere1);
  /*sphere2 = new THREE.Mesh(new THREE.SphereGeometry(0.5, 16, 8), new THREE.MeshBasicMaterial({color: "red", wireframe: true}));
  sphere2.position.set(-10, 0, 0);
  sphere.add(sphere2);*/

  // set up the original vector
  let vector = createArrow(vectorObject.coordinates[0],vectorObject.coordinates[1],vectorObject.coordinates[2])
  scene.add(vector);
  vectorObject.graphicRef = vector;

  //setting up xyz axis
  //GridHelper( size of the entire grid, divisions : number of divisions on the grid, colorCenterLine : Color, colorGrid : Color (0x00ff00) ) --> 
  // green central line
  var gridXZ = new THREE.GridHelper(100, 10,0x000000,0x00ff00);
  gridXZ.position.set(0,0,0);
  gridXZ.material.transparent = true;
  gridXZ.material.opacity = 0.3
  axes.add(gridXZ);
  // red central line
  var gridXY = new THREE.GridHelper(100,10,0x000000,0xff0000);
  gridXY.position.set(0,0,0);
  gridXY.material.transparent = true;
  gridXY.material.opacity = 0.3
  // rotation about x axis by 90 degrees
  gridXY.rotation.x = Math.PI/2;
  axes.add(gridXY);

  // blue central line
  var gridYZ = new THREE.GridHelper(100,10,0x000000,0x0000FF);
  gridYZ.position.set(0,0,0);
  gridYZ.material.transparent = true;
  gridYZ.material.opacity = 0.3

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


  // use DragControls.js
  var objects = sphere.children;
  dragControls = new THREE.DragControls( objects, camera, renderer.domElement );
  dragControls.addEventListener( 'dragstart', function ( event ) { controls.enabled = false; } );
  dragControls.addEventListener( 'dragend', function ( event ) { controls.enabled = true; } );


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


function createArrow(x,y,z) {
  var origin = new THREE.Vector3(0,0,0);
  var hex = 0x00ffff;
  var v = new THREE.Vector3(x,y,z);
  var length = v.length();

  // unit vector representing the direction of the arrow
  var direction = v.normalize();

  var arrowHelper = new THREE.ArrowHelper( direction, origin, length, hex);
  arrowHelper.line.material.linewidth = 3; // set width of the vector
  return arrowHelper;
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
  scene.add(spannedLine);
  return spannedLine;
}

// demo example given from threejs 
function dragControlsExample() {

      var container, stats;
      var camera, controls, scene, renderer;
      var objects = [];

      init();
      animate();

      function init() {

        container = document.createElement( 'div' );
        document.body.appendChild( container );

        camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 5000 );
        camera.position.z = 1000;

        controls = new THREE.TrackballControls( camera );
        controls.rotateSpeed = 1.0;
        controls.zoomSpeed = 1.2;
        controls.panSpeed = 0.8;
        controls.noZoom = false;
        controls.noPan = false;
        controls.staticMoving = true;
        controls.dynamicDampingFactor = 0.3;

        scene = new THREE.Scene();
        scene.background = new THREE.Color( 0xf0f0f0 );

        scene.add( new THREE.AmbientLight( 0x505050 ) );

        var light = new THREE.SpotLight( 0xffffff, 1.5 );
        light.position.set( 0, 500, 2000 );
        light.angle = Math.PI / 9;

        light.castShadow = true;
        light.shadow.camera.near = 1000;
        light.shadow.camera.far = 4000;
        light.shadow.mapSize.width = 1024;
        light.shadow.mapSize.height = 1024;

        scene.add( light );

        var geometry = new THREE.BoxBufferGeometry( 40, 40, 40 );

        for ( var i = 0; i < 200; i ++ ) {

          var object = new THREE.Mesh( geometry, new THREE.MeshLambertMaterial( { color: Math.random() * 0xffffff } ) );

          object.position.x = Math.random() * 1000 - 500;
          object.position.y = Math.random() * 600 - 300;
          object.position.z = Math.random() * 800 - 400;

          object.rotation.x = Math.random() * 2 * Math.PI;
          object.rotation.y = Math.random() * 2 * Math.PI;
          object.rotation.z = Math.random() * 2 * Math.PI;

          object.scale.x = Math.random() * 2 + 1;
          object.scale.y = Math.random() * 2 + 1;
          object.scale.z = Math.random() * 2 + 1;

          object.castShadow = true;
          object.receiveShadow = true;

          scene.add( object );

          objects.push( object );

        }

        renderer = new THREE.WebGLRenderer( { antialias: true } );
        renderer.setPixelRatio( window.devicePixelRatio );
        renderer.setSize( window.innerWidth, window.innerHeight );

        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFShadowMap;

        container.appendChild( renderer.domElement );

        var dragControls = new THREE.DragControls( objects, camera, renderer.domElement );
        dragControls.addEventListener( 'dragstart', function ( event ) { controls.enabled = false; } );
        dragControls.addEventListener( 'dragend', function ( event ) { controls.enabled = true; } );

        var info = document.createElement( 'div' );
        info.style.position = 'absolute';
        info.style.top = '10px';
        info.style.width = '100%';
        info.style.textAlign = 'center';
        info.innerHTML = '<a href="http://threejs.org" target="_blank" rel="noopener">three.js</a> webgl - draggable cubes';
        container.appendChild( info );

        stats = new Stats();
        container.appendChild( stats.dom );

        window.addEventListener( 'resize', onWindowResize, false );

      }

      function onWindowResize() {

        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();

        renderer.setSize( window.innerWidth, window.innerHeight );

      }

      //

      function animate() {

        requestAnimationFrame( animate );

        render();
        stats.update();

      }

      function render() {

        controls.update();

        renderer.render( scene, camera );

      }

    






}