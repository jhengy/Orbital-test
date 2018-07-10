/*------------------GENERAL SETUP -------------------------------*/

/* key variables for a basic threejs scene */
var camera, scene, renderer, controls;

/* raycaster contains methods to handle mouse input */
var raycaster = new THREE.Raycaster();

/* track the user's cursor coordinates globally */
var mouse = new THREE.Vector2();
mouse.x = 1000;
mouse.y = 1000;
/* renderQueue contains list of functions to be executed on each frame. 
   'render' function must be executed last */
var renderQueue = [render];

/* axes is the root object of our scene */
var axes = new THREE.Object3D;

/* stores references to all graphical elements related to the vectors section */
   // NOTE: needs renaming 
var allObjects = new THREE.Object3D;

/* a separate var storing ref to an obj3d for containing all graphical elements 
 related to the span section */
var spanGraphics = new THREE.Object3D;

/* a separate var storing ref to an obj3d for containing all graphical elements 
 related to the matrices section */
var matricesGraphics = new THREE.Object3D;

let equationGraphics = new THREE.Object3D;

function onMouseMove(event) {

	// calculate mouse position in normalized device coordinates
	// (-1 to +1) for both components
    var stage = document.getElementById("stage");

	mouse.x = ( event.clientX / stage.innerWidth ) * 2 - 1;
	mouse.y = - ( event.clientY / stage.innerHeight ) * 2 + 1;

}

window.addEventListener( 'click', onMouseMove, false );

// add eventListener to adjust 
window.addEventListener("resize", function() {
	var width = 3*(window.innerWidth / 4);
	var height = 8*(window.innerHeight / 9);
	renderer.setSize(width, height);
	camera.aspect = width/height;
	camera.updateProjectionMatrix();
});

init();
animate();

function init() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color( 0x002233 );
  camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 5000);
  setCamera();

  var stage = document.getElementById("stage");

  renderer = new THREE.WebGLRenderer({canvas: stage, antialias: true});
  renderer.setSize(3*(window.innerWidth / 4), 8*(window.innerHeight / 9));
  controls = new THREE.OrbitControls(camera, renderer.domElement);

  //setting up xyz axis
  //GridHelper( size of the entire grid, divisions : number of divisions on the grid, colorCenterLine : Color, colorGrid : Color (0x00ff00) ) --> 
  // green central line
  var gridXZ = new THREE.GridHelper(100, 10,0xffffff, 0x33bbff);
  axes.add(gridXZ);
  // red central line
  var gridXY = new THREE.GridHelper(100,10,0xffffff,0x33bbff);
  // rotation about x axis by 90 degrees
  gridXY.rotation.x = Math.PI/2;
  axes.add(gridXY);
  // blue central line
  var gridYZ = new THREE.GridHelper(100,10,0xffffff,0x33bbff);
  // rotation about z axis by 90 degrees
  gridYZ.rotation.z = Math.PI/2;
  axes.add(gridYZ); 


  axes.add(allObjects);
  axes.add(spanGraphics);
  axes.add(matricesGraphics);
  axes.add(equationGraphics);
  setGrid();
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

/* this function iterates through renderQueue and executes each function in the queue. 
   We must call this function once per frame of animation. This is done using 
   requestAnimationFrame. */
function animate() {
  requestAnimationFrame(animate);
  
  renderQueue.forEach(function(playable) {
    playable();
  });
}

/* add this function to the renderQueue to render the scene */
function render() {
  renderer.render(scene, camera);

	// update the picking ray with the camera and mouse position
	raycaster.setFromCamera(mouse, camera);

	// calculate objects intersecting the picking ray
	var intersects = raycaster.intersectObjects(allObjects.children, true);
        
   // console.log(intersects.length);
  
	for ( var i = 0; i < intersects.length; i++ ) {
		intersects[ i ].object.material.color.set( 0xffff00 );

	}
};

/* Sets the Grid to the default rotation */
function setGrid() {
  axes.position.set(0, 0, 0);
  axes.rotation.set(0, 0, 0);
}

/* Sets the Camera to the Default View */
function setCamera() {    
  camera.position.set(40, 120, 0);
  camera.lookAt(0, 0, 0);
  camera.up.set(0, 1, 0);
  camera.updateProjectionMatrix();

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

/* function enlarging the object by a certain factor */
function scale(mesh, factor) {
  mesh.scale.x *= factor;
  mesh.scale.y *= factor;
  mesh.scale.z *= factor;
}


/*------------------VECTOR GRAPHICS-------------------------------*/

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

/* plot one vector onto a particular container in the canvas
 and return reference to the 3d graphicObj*/
function drawOneVector(x,y,z,hex, container) {
  var graphic = createVector(x,y,z,new THREE.Vector3(0,0,0),hex);
  container.add(graphic);
  return graphic;
}

/* read the vectorlist and draw the vectors on the grid */
function drawAllVectors(vectorQueue) {
  // first, clear existing vectors
  axes.remove(allObjects);
  allObjects = new THREE.Object3D;
  axes.add(allObjects);

  for (var i = 0; i < vectorQueue.length; i++) {

    var currentVectorObj = vectorQueue[i];
    var vector = createVector(currentVectorObj.xCoord.value, currentVectorObj.yCoord.value, currentVectorObj.zCoord.value,
        new THREE.Vector3(0,0,0), getRandomColour());
    
    /* Store the created threeJS object into the vector object in the Queue [to facilitate deletion of vectors] */
    vectorQueue[i].graphic = vector;
    
    /* Add the created threeJS object to the scene */
    allObjects.add(vector);
  }  
}


/*------------------SPAN GRAPHICS-------------------------------*/

// function creating a line graphic spanned by the vector 
// vector: vector wrapped in Vector3 object; scale: the upper bound of x,y,z axis 
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

//function creating a plane graphic  passing through the origin 
function createSpannedPlane(v1,v2,sizeOfPlane,color) {
  // unit vector perpendicular to the plane
  var normal = v1.cross(v2).normalize();
  //note that distance of plane from origin is always 0 since it passes through orgin
  var plane = new THREE.Plane( new THREE.Vector3(normal.getComponent(0), normal.getComponent(1), normal.getComponent(2) ), 0 );
  var obj = new THREE.Object3D();
  var planeHelper = new THREE.PlaneHelper( plane, sizeOfPlane, color );
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


/*
precond: 1. m: 3 * n matrix of n LI column vectors, where  1<= n <= 3
         2. container: the Object3D to put all graphics generated into
         3. no entries should be NaN
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
    var v = createVector(x,y,z,new THREE.Vector3(0,0,0),getRandomColour());
    var line = createSpannedLine(new THREE.Vector3(x,y,z),36,getRandomColour());
    arr.push(line);
    arr.push(v);
    obj.add(line);
    obj.add(v);

    lineVectorToCartesian([x, y, z], [0, 0, 0]);

  } else if (numVectors == 2) {
    var x1 = m[0][0];
    var y1 = m[1][0];
    var z1 = m[2][0];
    var x2 = m[0][1];
    var y2 = m[1][1];
    var z2 = m[2][1];
    var plane = createSpannedPlane(
        new THREE.Vector3(x1,y1,z1),
        new THREE.Vector3(x2,y2,z2),
        100,getRandomColour()
        )
    var v1 = createVector(x1,y1,z1,new THREE.Vector3(0,0,0),getRandomColour());
    var v2 = createVector(x2,y2,z2,new THREE.Vector3(0,0,0),getRandomColour());
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
    var v1 = createVector(x1,y1,z1,new THREE.Vector3(0,0,0),getRandomColour());
    var v2 = createVector(x2,y2,z2,new THREE.Vector3(0,0,0),getRandomColour());
    var v3 = createVector(x3,y3,z3,new THREE.Vector3(0,0,0),getRandomColour());
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

/*-------------------------------Plotter graphics ------------------------------------ */
/*
precond: pointMatrix: 3*1 array
postcond: return an object describing the graphic
*/
function pointPlotter(pointMatrix) {
  var sizeOfPoint = 1.0;
  var hex = getRandomColour();
  var geometry = new THREE.Geometry();
  var material = new THREE.PointsMaterial({ color: hex, size: sizeOfPoint});
  var vector = new THREE.Vector3();
  vector.x = pointMatrix[0][0];
  vector.y = pointMatrix[1][0];
  vector.z = pointMatrix[2][0];
  geometry.vertices.push(vector);
  var point = new THREE.Points(geometry,material);
  var graphic = {reference: point, hex: hex};
  return graphic;
}

/*
precond: lineMatrix: 3*2 array
postcond:return an object describing the graphic
method1: plot a line through origin and then translate position by the postion vector
method2: determine 2 points on the line by a suitable proportion
*/
function linePlotter(lineMatrix) {
  var scaleOfAxis = 50; 
  var hex = getRandomColour();
  // find point and direction as 3-elements 1d array
  var positionV = getCol(lineMatrix,0);
  var directionV = getCol(lineMatrix,1);
  var spannedLine = createSpannedLine(
                      new THREE.Vector3(directionV[0],directionV[1],directionV[2]),
                      scaleOfAxis,hex);
  // traverse the spannedline by the position vector
  spannedLine.position.set(positionV[0],positionV[1],positionV[2]);
  var graphic = {reference: spannedLine, hex: hex};
  return graphic;
}


/*
precond: unitNormal: 1d array with 3 elements; 
postcond: return a planehelper described by the parameters
*/
function planePlotTemp(unitNormal, perpDistanceFromOrigin, sizeOfPlane, color) {
    var plane = new THREE.Plane(
                new THREE.Vector3(unitNormal[0],unitNormal[1],unitNormal[2]),
                perpDistanceFromOrigin
                );
    var helper = new THREE.PlaneHelper(plane, sizeOfPlane, color);
    return helper;
}

/*
precond: planeMatrix: 3*3 array
postcond: return a planehelper described by the parameters
method1: create a subspace using createSpannedPlane() and then translate accordingly
*/
function planePlotter(planeMatrix) {
  var hex = getRandomColour();
  var sizeOfPlane = 100;
  // 3 1d arrays with 3 elements each.
  var positionV =  getCol(planeMatrix,0);
  var directionV1 = getCol(planeMatrix,1);
  var directionV2 = getCol(planeMatrix,2);

  var spannedPlane = createSpannedPlane(
                      new THREE.Vector3(directionV1[0],directionV1[1],directionV1[2]),
                      new THREE.Vector3(directionV2[0],directionV2[1],directionV2[2]),
                      sizeOfPlane, hex
                     );
  spannedPlane.position.set(positionV[0],positionV[1],positionV[2]);
  var graphic = {reference: spannedPlane, hex: hex};
  return graphic;                  
}


/*
precond: coefficients: a 4-elements 1d array,i.e. [A,B,C,D] ---->
 Ax + By + Cz = D; case1: A == B == C == 0 && D !=0 ; case2: A == B == C == 0 && D == 0;
 case 3: other case3: at least one of A/B/C != 0
postcond: draw the plane in a 3D grid 
case1: return empty outputObj,i.e outputObj.children.length ==0 
case2: return outputObj containing cube 
case 3: return outputObj containing plane 
*/
function createObj3DFromCartesian(coefficients) {
  var outputObj = new THREE.Object3D();

  if (coefficients[0] == 0 && coefficients[1] == 0 &&coefficients[2] == 0) {
    if (coefficients[3] != 0) {
      alert("invalid cartesianEquation input!");
    } else {
      outputObj.add(createCube()); 
    }
    return outputObj;
  }
  var sizeOfPlane = 100;
  var hex = getRandomColour();
  var normal = [coefficients[0],coefficients[1],coefficients[2]];
  var unitNormal = getUnitVector(normal);
  var perpDistanceFromOrigin = -1 * coefficients[3] / vectorLength(normal);

  var helper = planePlotTemp(unitNormal, perpDistanceFromOrigin, sizeOfPlane, hex);
  outputObj.add(helper);
 
  return outputObj;
}

function createObj3DFromCartesianTemp(coefficients) {
  // wrap it in 2d array as augmented matrix
  var augmentedMatrix = [coefficients];
  return createObjFromLinearSystem(augmentedMatrix);
}

/*
precond: 
  vectorMatrix: 3* n matrix of n vectors, where n >= 1
  container: the Object3D instance to include vector graphics in.
postcond: draw all vectors in the container and return an array containing 
graphics, where order is preserved as of that in vectorMatrix. graphics := 
{reference: undefined, hex: undefined}
*/
function drawVectors(vectorMatrix, container) {
  let outputArr = new Array();
  // 1d array indicating the postionVector of the vectorMatrix
  let positionV = getCol(vectorMatrix,0); 
  // for each column vector, generate 
  for (var col = 0; col < vectorMatrix[0].length; col++) {
    let color = getRandomColour();
    let origin = (col == 0)? new THREE.Vector3(0,0,0) :
                  new THREE.Vector3(positionV[0],positionV[1],positionV[2]);
    let ref = createVector(vectorMatrix[0][col],vectorMatrix[1][col],
                           vectorMatrix[2][col],origin,color);
    container.add(ref);
    let vectorGraphic = {reference: ref, hex: color};
    outputArr.push(vectorGraphic);
  }
  return outputArr;
}
/*
precond: 1. augmentedMatrix: m*4 matrix representing a system of linear equations with 3 unknowns
each row is a cartesian equation. 2. container: object3D wrapper to put graphics in
3. No NaN entries
postcond: from a linear system represented by the augmentedMatrix, 
draw all graphics and return an array
  -0th index: 3*i solution matrix representing solution of the linear system, where i 
    is the number of position and direction vectors
  -1th index: graphic of the solution of the linear system:= 
  {reference: undefined, hex: undefined } 
  -2nd index onwards: graphic of vectors, order of vectors are preserved 
  as in the solution matrix ,each entry := {reference: undefined, hex: undefined } 

case1: inconsistent linear system, no real solution, output an empty array
case2: consistent 
        case1.1: unique solution/ a point, i.e. no nonPivotCol among 1st 3 columns, return an array of 2 elements (exclude position/ direction vectors)
        case2.2: line ,i.e 1 nonPivotColumns among 1st 3 columns, return an array with 4 elements
        case2.3: plane, i.e. 2 nonPivotColumns among 1st 3 columns,return an array with 5 elements
        case2.4: cube, i.e 3 nonPivotColumns among 1st 3 columns, return an array with 2 elements(exclude position/ direction vectors)
*/
function drawGraphicsFromLinearSystem(augmentedMatrix,container) {
  let outputArr = new Array();
  let outputObj = new THREE.Object3D();
  let solutions = solveAugmentedMatrix(augmentedMatrix);

  // case where linear system is inconsistent 
  if (solutions[0].length == 0) {
    alert("inconsistent, no real solution!");
    return outputArr;
  }
  // if there exists real solution, push the solution to the outputArr
  outputArr.push(solutions);
  // an object describing graphic of the solution:= {reference: .. , hex:...}
  let solutionGraphic; 

  // plot the solution graphic 
  if (solutions[0].length == 1) {
    solutionGraphic = pointPlotter(solutions);
  } else if (solutions[0].length == 2) {
    solutionGraphic = linePlotter(solutions);
  } else if (solutions[0].length == 3) {
    solutionGraphic = planePlotter(solutions);
  } else {
    solutionGraphic = {reference:createCube(), hex: undefined};
  }
  // add graphic to the scene
  container.add(solutionGraphic.reference);
  outputArr.push(solutionGraphic);
  
  /*given a line/plane object, plot all vectors and append the 
  resultant object to the outputArr
  each entry describes a particular vector graphic := {reference: ..; hex: ..};
  */
  if (solutions[0].length == 2 || solutions[0].length == 3) {
      let vectorArr = drawVectors(solutions,container);
      appendArr(outputArr, vectorArr);
  }
  return outputArr;
}
