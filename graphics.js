var camera, scene, renderer, controls;
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
  renderer.setSize(3*(window.innerWidth / 4), 8*(window.innerHeight / 9));
  controls = new THREE.OrbitControls(camera, renderer.domElement);

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
}

function animate() {
  requestAnimationFrame(animate);
  render();
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


// function to plot vector in the form of an arrow
function createVector(x,y,z,origin,hex) {

  var v = new THREE.Vector3(x,y,z);
  var length = v.length();

  // unit vector representing the direction of the arrow
  var direction = v.normalize();

  var arrowHelper = new THREE.ArrowHelper( direction, origin, length, hex);
  arrowHelper.line.material.linewidth = 3; // set width of the vector
  return arrowHelper
}

// function creating a 3D object consisting of the vector and a line spanned by the vector 
// vector: vector wrapped in Vector3 object; scale: the upper bound of x,y,z axis 
function createLine(vector,scale) {
  var arrow = createVector(vector.getComponent(0),vector.getComponent(1),vector.getComponent(2),new THREE.Vector3( 0, 0, 0 ),0x000000);
  var vectorMaxLength = Math.sqrt(scale * scale * 3); 
  var scaleFactor = vectorMaxLength / (vector.length());  
  var endPt1 = vector.multiplyScalar(scaleFactor);
  var endPt2 = new THREE.Vector3(-1 * endPt1.getComponent(0), -1 * endPt1.getComponent(1), -1 * endPt1.getComponent(2));
  var geometry = new THREE.Geometry();
  geometry.vertices.push(
      endPt1,
      endPt2
      );
  var material = new THREE.LineBasicMaterial({ color: 0x00ffff, linewidth: 5 });
  var line = new THREE.Line(geometry, material);

  var allObj = new THREE.Object3D();
  allObj.add(arrow);
  allObj.add(line); 
  return allObj;
}

//function creating v1 and v2 obj and also a plane object  passing through the origin 
function createPlane(v1,v2,sizeOfPlane) {
  // unit vector perpendicular to the plane
  var normal = v1.cross(v2).normalize();
  //note that distance of plane from origin is always 0 since it passes through orgin
  var plane = new THREE.Plane( new THREE.Vector3(normal.getComponent(0), normal.getComponent(1), normal.getComponent(2) ), 0 );
  var color = 0xffff00;
  var obj = new THREE.Object3D();
  var planeHelper = new THREE.PlaneHelper( plane, sizeOfPlane, color );
  var V1 = createVector(
    v1.getComponent(0),v1.getComponent(1),v1.getComponent(2),
    new THREE.Vector3(0,0,0), 0x000000);
  var V2 = createVector(
    v2.getComponent(0),v2.getComponent(1),v2.getComponent(2),
    new THREE.Vector3(0,0,0), 0x000000);
  obj.add(V1);
  obj.add(V2);
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

/* read the vectorStack and draw the vectors on the grid */
function drawAllVectors(vectorQueue) {
  // first, clear existing vectors
  axes.remove(allObjects);
  allObjects = new THREE.Object3D;
  axes.add(allObjects);

  for (var i = 0; i < vectorQueue.length; i++) {

    var currentVectorObj = vectorQueue[i];
    var vector = createVector(currentVectorObj.xCoord.value, currentVectorObj.yCoord.value, currentVectorObj.zCoord.value,
        new THREE.Vector3(0,0,0),0x00ffff);
    
    /* Store the created threeJS object into the vector object in the Queue [to facilitate deletion of vectors] */
    vectorQueue[i].graphic = vector;
    
    /* Add the created threeJS object to the scene */
    allObjects.add(vector);
  }  
}

/*
precond: m: 3 * n matrix of n LI column vectors, where n = [0,1,2,3] 
 */
function drawSpan(m) {
  var obj;
  // identify the number of vectors to span
  var numVectors = m[0].length
    if (numVectors == 0) {
      alert("no vector input!");
    } else {
      if (numVectors == 1) {
        obj = createLine(new THREE.Vector3(m[0][0],m[1][0],m[2][0]),50);
      } else if (numVectors == 2) {
        obj = createPlane(
            new THREE.Vector3(m[0][0],m[1][0],m[2][0]),
            new THREE.Vector3(m[0][1],m[1][1],m[2][1]),
            100
            )
      } else {
        obj = createCube();
      }

      allObjects.add(obj); 
    }

}

