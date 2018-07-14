var Vectorize = {};

/* tracks mouse position as its user moves it across the screen */
Vectorize.mouse = new THREE.Vector2();
//Vectorize.mousePath = new THREE.Raycaster();

/* this should be set to the dimensions of the canvas element you're monitoring */
var canvas = document.getElementById("stage");
Vectorize.dimensions = [canvas.width,canvas.height];


/*Idea to transform vector dynamically by dragging the point
initilize a global 3-elements array named point.
when mousemoves, update mousecoordinates.
if isDragged is true(i.e. something is being dragged), update the point, and then 
update the graphic& textbox of the input vector, and graphic of the output vector been
transformed
*/
function onDocumentMouseMove( event ) {
    event.preventDefault();

    //findout the canvas position so that we can make adjustments to 
    // mouseX and mouseY accordingly to find out the mouse coordinate
    var canvasPosition = renderer.domElement.getBoundingClientRect();
	var mouseX = event.clientX - canvasPosition.left;
	var mouseY = event.clientY - canvasPosition.top;
    Vectorize.mouse.x = ( mouseX / Vectorize.dimensions[0] ) * 2 - 1;
    Vectorize.mouse.y = - ( mouseY / Vectorize.dimensions[1] ) * 2 + 1; 

    // if an obj is being dragged, when mouse moves, the vector coordinate and graphic will be adjusted
    if (isDragging) {
        // update coordinates of vector according to things being dragged
        vectorObject.coordinates = findIntersection();
        // update the graphic
        scene.remove(vectorObject.graphicRef);
        vectorObject.graphicRef = createArrow(
                                vectorObject.coordinates[0],
                                vectorObject.coordinates[1],
                                vectorObject.coordinates[2]);
        scene.add(vectorObject.graphicRef);

    }
}
document.addEventListener( 'mousemove' , onDocumentMouseMove, false); 

/* adds a function func to an event of your choice. func takes a paramter which is passed the raycaster intercepts */

Vectorize.addEventListener = function(type,func,scene,camera){
    function f(event){
    	//console.log("(" + Vectorize.mouse.x + "," + Vectorize.mouse.y + ")");
        var vector = new THREE.Vector3( Vectorize.mouse.x, Vectorize.mouse.y, -1 ).unproject( camera );
       	
       	// draw line simulating the ray projected by the raycaster
    	var lineMatrix = [[],[],[]];
    	for (var x = 0; x < 3; x++) {
    		var currentRow = lineMatrix[x];
    		currentRow.push(vector.getComponent(x));
    		currentRow.push(vector.getComponent(x) - camera.position.getComponent(x));
    	}
    	//linePlotter(lineMatrix);	

        Vectorize.mousePath = new THREE.Raycaster(camera.position, vector.sub(camera.position).normalize());
        var intersects = Vectorize.mousePath.intersectObject(sphere,true);
        //console.log(intersects);
        func(intersects);
    }
    document.addEventListener(type,f,false);
}
var test;

// global boolean checking if an object is being dragged.
var isDragging = false;
Vectorize.addEventListener('mousedown', 
	// enlarge the 1st element when clicked
	function (intersects) {
        if (intersects.length == 0) {
            console.log("no intersection upon mousedown");
            return;
        }

        isDragging = true;
        console.log("dragging activated upon mousedown");
		test = intersects;
		var mesh = intersects[0].object;
		var position = new THREE.Vector3( Vectorize.mouse.x, Vectorize.mouse.y, -1 ).unproject( camera );
		//console.log("(" + position.getComponent(0) + "," + position.getComponent(1) + "," + position.getComponent(2)+ ")");
		mesh.scale.x *= 1.2;mesh.scale.y *= 1.2;mesh.scale.z *= 1.2; 
	}, scene,camera
	); 

Vectorize.addEventListener('mouseup', 
    function(intersects) {
        if (intersects.length == 0 || !isDragging) {
            console.log("no intersection upon mouseup or nothing being dragged");
            return;
        }
        test = intersects;
        let mesh = intersects[0].object;
        mesh.scale.x *= 1/1.2;mesh.scale.y *= 1/1.2;mesh.scale.z *= 1/1.2;
        let intersectionPoint = intersects[0].point;
        console.log("object has been dragged to: (" + 
            intersectionPoint.getComponent(0) + "," + 
            intersectionPoint.getComponent(1) + "," + 
            intersectionPoint.getComponent(2) + ")"
            );

        isDragging = false;
    },
    scene,camera);

/*
postcond: return the coordinate of intersection as 3 element array,
if no intersection return null
*/
function findIntersection() {
    var worldCoord = new THREE.Vector3( Vectorize.mouse.x, Vectorize.mouse.y, -1 ).unproject( camera );
    Vectorize.mousePath = new THREE.Raycaster(camera.position, worldCoord.sub(camera.position).normalize());
    var intersects = Vectorize.mousePath.intersectObject(sphere,true); 
    if (intersects.length == 0) {
        return null;
    } else {
        let intersectionPoint = intersects[0].point;
        return [intersectionPoint.getComponent(0),
                intersectionPoint.getComponent(1),
                intersectionPoint.getComponent(2)];
    }
}

/*
Vectorize.addEventListener('mouseup', 
	// enlarge the 1st element when clicked
	function (intersects) {
		test = intersects;
		var mesh = intersects[0].object;
		mesh.scale.x *= 1/1.2;
		mesh.scale.y *= 1/1.2;
		mesh.scale.z *= 1/1.2; 
	}, scene,camera
	); 
*/

/*

Vectorize.addEventListener = function(type,camera){
    function f(event){
    	console.log("mouse: (" + Vectorize.mouse.x + "," + Vectorize.mouse.y + ")");
    	var vArr = new THREE.Vector3( Vectorize.mouse.x, Vectorize.mouse.y, -1 ).unproject( camera );
    	console.log("vector: (" + vArr.getComponent(0) + "," + vArr.getComponent(1) + "," + vArr.getComponent(2) + ")");
    	//createLine(vArr); // draw the vector as a line
    	var lineMatrix = [[],[],[]];
    	for (var x = 0; x < 3; x++) {
    		var currentRow = lineMatrix[x];
    		currentRow.push(vArr.getComponent(x));
    		currentRow.push(vArr.getComponent(x) - camera.position.getComponent(x));
    	}
    	// draw the ray projection line
    	linePlotter(lineMatrix);
    }
    // note that f is as good as anonymous function that give rise to
    // variable capture
    renderer.domElement.addEventListener(type,f,false);
}

Vectorize.addEventListener("click",camera);

*/



