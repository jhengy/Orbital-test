var camera, scene, renderer, controls;
var axes = new THREE.Object3D;
var allObjects = new THREE.Object3D;
var renderQueue = [render];

/*a separate var storing ref to an obj3d for containing all graphical elements 
 related to the span section */
var spanGraphics = new THREE.Object3D;
/*a separate var storing ref to an obj3d for containing all graphical elements 
 related to the matrices section */
var matricesGraphics = new THREE.Object3D;

init();
// add eventListener to adjust 
window.addEventListener("resize", function() {
	var width = 3*(window.innerWidth / 4);
	var height = 8*(window.innerHeight / 9);
	renderer.setSize(width, height);
	camera.aspect = width/height;
	camera.updateProjectionMatrix();
});

animate();


function init() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color( 0x002233 );
  camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 5000);
  camera.position.set(0, 5, 1.5).setLength(120);

  var stage = document.getElementById("stage");

  renderer = new THREE.WebGLRenderer({canvas: stage, antialias: true});
  renderer.setSize(3*(window.innerWidth / 4), 8*(window.innerHeight / 9));
  controls = new THREE.OrbitControls(camera, renderer.domElement);

  //setting up xyz axis
  //GridHelper( size of the entire grid, divisions : number of divisions on the grid, colorCenterLine : Color, colorGrid : Color (0x00ff00) ) --> 
  // green central line
  var gridXZ = new THREE.GridHelper(100, 10,0xffffff, 0x33bbff);
  gridXZ.position.set(0,0,0);
  axes.add(gridXZ);
  // red central line
  var gridXY = new THREE.GridHelper(100,10,0xffffff,0x33bbff);
  gridXY.position.set(0,0,0);
  // rotation about x axis by 90 degrees
  gridXY.rotation.x = Math.PI/2;
  axes.add(gridXY);
  // blue central line
  var gridYZ = new THREE.GridHelper(100,10,0xffffff,0x33bbff);
  gridYZ.position.set(0,0,0);
  // rotation about z axis by 90 degrees
  gridYZ.rotation.z = Math.PI/2;
  axes.add(gridYZ); 


  axes.add(allObjects);
  axes.add(spanGraphics);
  axes.add(matricesGraphics);
  scene.add(axes);

  // create labels for axes
  for (var i = -55; i <= 55; i = i + 10) {
    var sprX = makeTextSprite(i - 5, undefined, i, 0, 0);
    var sprY = makeTextSprite(i - 5, undefined, 5, i - 5, 0);
    var sprZ = makeTextSprite(i - 5, undefined, 0, 0, i - 5);
    axes.add(sprX);
    axes.add(sprY);   
    axes.add(sprZ);
  }
  var xLabel = makeTextSprite("x", undefined, 60,0,0);
  axes.add(xLabel);
  var yLabel = makeTextSprite("y", undefined,5,60,0);
  axes.add(yLabel);
  var zLabel = makeTextSprite("z", undefined, 0,0,55);
  axes.add(zLabel);
}

function animate() {
  requestAnimationFrame(animate);
  
  renderQueue.forEach(function(playable) {
    playable();
  });
}

function render() {
  renderer.render(scene, camera);
};

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
  context.fillStyle = 'rgb(51, 187, 255)';
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


// function to plot vector in the form of an arrow
function createVector(x,y,z,origin,hex) {
  var v = new THREE.Vector3(x,y,z);
  var length = v.length();

  // unit vector representing the direction of the arrow
  var direction = v.normalize();

  var arrowHelper = new THREE.ArrowHelper( direction, origin, length, hex);
  arrowHelper.line.material.linewidth = 3; // set width of the vector
  return arrowHelper;
}

// function creating a line graphic spanned by the vector 
// vector: vector wrapped in Vector3 object; scale: the upper bound of x,y,z axis 
function createLine(vector,scale) {
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
  var material = new THREE.LineBasicMaterial({ color: 0xb38600, linewidth: 5 });
  var line = new THREE.Line(geometry, material);

  var allObj = new THREE.Object3D();
  //allObj.add(arrow);
  allObj.add(line); 
  return allObj;
}

//function creating a plane graphic  passing through the origin 
function createPlane(v1,v2,sizeOfPlane,color) {
  // unit vector perpendicular to the plane
  var normal = v1.cross(v2).normalize();
  //note that distance of plane from origin is always 0 since it passes through orgin
  var plane = new THREE.Plane( new THREE.Vector3(normal.getComponent(0), normal.getComponent(1), normal.getComponent(2) ), 0 );
  var obj = new THREE.Object3D();
  var planeHelper = new THREE.PlaneHelper( plane, sizeOfPlane, color );
  /*
  var V1 = createVector(
    v1.getComponent(0),v1.getComponent(1),v1.getComponent(2),
    new THREE.Vector3(0,0,0), 0x000000);
  var V2 = createVector(
    v2.getComponent(0),v2.getComponent(1),v2.getComponent(2),
    new THREE.Vector3(0,0,0), 0x000000);
  obj.add(V1);
  obj.add(V2);*/
  obj.add(planeHelper);
  return obj;
}


function createCube() {
  var size = 100;
  var geometry = new THREE.CubeGeometry(size,size,size);
  var cubeMaterials = [ 
    new THREE.MeshBasicMaterial({color:0x33AA55, transparent:true, opacity:0.8, side: THREE.DoubleSide}),
        new THREE.MeshBasicMaterial({color:0x55CC00, transparent:true, opacity:0.8, side: THREE.DoubleSide}), 
        new THREE.MeshBasicMaterial({color:0x000000, transparent:true, opacity:0.2, side: THREE.DoubleSide}),
        new THREE.MeshBasicMaterial({color:0xFF0000, transparent:true, opacity:0.8, side: THREE.DoubleSide}), 
        new THREE.MeshBasicMaterial({color:0xFF0000, transparent:true, opacity:0.8, side: THREE.DoubleSide}), 
        new THREE.MeshBasicMaterial({color:0x5555AA, transparent:true, opacity:0.8, side: THREE.DoubleSide}), 
  ]; 
  // Create a MeshFaceMaterial, which allows the cube to have different materials on each face 
  var cubeMaterial = new THREE.MeshFaceMaterial(cubeMaterials); 
  var cube = new THREE.Mesh(geometry, cubeMaterial);
  return cube;
}

//how to represent vector addition in an intuitive way? how to add labels to it?
// function returning a linear combination of two Vector3 objects, which is a 3D object consisting of 2 intermediate vectors and 1 resultant vector, av1+bv2
function lc(a,b,v1,v2) {
  var allObjects = new THREE.Object3D();
  //local function wrapping v into allObjects
  function push(v,origin,hex) {
    allObjects.add(createVector(v.getComponent(0),v.getComponent(1),v.getComponent(2),origin,hex));
  }

  // wrapping two arrows in 3d obj ---> in black
  push(v1,new THREE.Vector3( 0, 0, 0 ),0x000000);
  push(v2,new THREE.Vector3( 0, 0, 0 ),0x000000);

  // mutating the two vectors and wrapping two mutated vectors in 3d obj, in blue
  v1.multiplyScalar(a);
  v2.multiplyScalar(b);
  push(v1,new THREE.Vector3( 0, 0, 0 ),0x00ffff);
  push(v2,new THREE.Vector3( 0, 0, 0 ),0x00ffff);

  // adding two arrows further to form a parallelogram, in yellow 
  push(v1,v2,0xffff00);
  push(v2,v1,0xffff00);

  // mutating v1 by adding it to v2, and add it to 3d object, in black
  push(v1.add(v2),new THREE.Vector3( 0, 0, 0 ),0x000000);

  return allObjects;
}

/* plot one vector onto a particular container in the canvas
 and return reference to the 3d graphicObj*/
function drawOneVector(x,y,z,hex, container) {
  var graphic = createVector(x,y,z,new THREE.Vector3(0,0,0),hex);
  container.add(graphic);
  return graphic;
}

/* read the vectorStack and draw the vectors on the grid */
function drawAllVectors(vectorQueue) {
  // first, clear existing vectors
  axes.remove(allObjects);
  allObjects = new THREE.Object3D;
  axes.add(allObjects);

  for (var i = 0; i < vectorQueue.length; i++) {

    var currentVectorObj = vectorQueue[i];
    var vector = createVector(currentVectorObj.xCoord.value, currentVectorObj.yCoord.value, currentVectorObj.zCoord.value,
        new THREE.Vector3(0,0,0),0xff0066);
    
    /* Store the created threeJS object into the vector object in the Queue [to facilitate deletion of vectors] */
    vectorQueue[i].graphic = vector;
    
    /* Add the created threeJS object to the scene */
    allObjects.add(vector);
  }  
}

/*
precond: m: 3 * n matrix of n LI column vectors, where  1<= n <= 3 container: the Object3D to put all graphics generated into
postcond : generating graphics of vectors and subsp in the canvas, then return an array containing 
their ref. index 0: ref to subp graphic ; >=index 1 : reference to basis vectors(orders are preserved)  
 */
function drawSpan(m,container) {
  var arr = [];
  var obj = new THREE.Object3D();
  // identify the number of vectors to span
  var numVectors = m[0].length
  if (numVectors == 1) {
    var x = m[0][0];
    var y = m[1][0];
    var z = m[2][0];
    var v = createVector(x,y,z,new THREE.Vector3(0,0,0),0xff0066);
    var line = createLine(new THREE.Vector3(x,y,z),36);
    arr.push(line);
    arr.push(v);
    obj.add(line);
    obj.add(v);
  } else if (numVectors == 2) {
    var x1 = m[0][0];
    var y1 = m[1][0];
    var z1 = m[2][0];
    var x2 = m[0][1];
    var y2 = m[1][1];
    var z2 = m[2][1];
    var plane = createPlane(
        new THREE.Vector3(x1,y1,z1),
        new THREE.Vector3(x2,y2,z2),
        100,0xb38600
        )
    var v1 = createVector(x1,y1,z1,new THREE.Vector3(0,0,0),0xff0066);
    var v2 = createVector(x2,y2,z2,new THREE.Vector3(0,0,0),0xff0066);
    arr.push(plane);
    arr.push(v1);
    arr.push(v2);
    obj.add(plane);
    obj.add(v1);
    obj.add(v2);
  } else {
    var x1 = m[0][0];
    var y1 = m[1][0];
    var z1 = m[2][0];
    var x2 = m[0][1];
    var y2 = m[1][1];
    var z2 = m[2][1];
    var x3 = m[0][2];
    var y3 = m[1][2];
    var z3 = m[2][2];
    var cube = createCube();
    var v1 = createVector(x1,y1,z1,new THREE.Vector3(0,0,0),0xff0066);
    var v2 = createVector(x2,y2,z2,new THREE.Vector3(0,0,0),0xff0066);
    var v3 = createVector(x3,y3,z3,new THREE.Vector3(0,0,0),0xff0066);
    arr.push(cube);
    arr.push(v1);
    arr.push(v2);
    arr.push(v3);
    obj.add(cube);
    obj.add(v1);
    obj.add(v2);
    obj.add(v3);
  }
  //adding graphics into subpaceObjs
  container.add(obj); 

  return arr;
}

/* function enlarging the object by a certain factor */
function scale(mesh, factor) {
  mesh.scale.x *= factor;
  mesh.scale.y *= factor;
  mesh.scale.z *= factor;
}


