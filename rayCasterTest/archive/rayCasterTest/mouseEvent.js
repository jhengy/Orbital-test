var Vectorize = {};

/* tracks mouse position as its user moves it across the screen */
Vectorize.mouse = new THREE.Vector2();
//Vectorize.mousePath = new THREE.Raycaster();

/* this should be set to the dimensions of the canvas element you're monitoring */
var canvas = document.getElementById("stage");
Vectorize.dimensions = [canvas.width,canvas.height];

function onDocumentMouseMove( event ) {
    event.preventDefault();
    //findout the canvas position so that we can make adjustments to 
    // mouseX and mouseY accordingly to find out the mouse coordinate
    var canvasPosition = renderer.domElement.getBoundingClientRect();
	var mouseX = event.clientX - canvasPosition.left;
	var mouseY = event.clientY - canvasPosition.top;

    Vectorize.mouse.x = ( mouseX / Vectorize.dimensions[0] ) * 2 - 1;
    Vectorize.mouse.y = - ( mouseY / Vectorize.dimensions[1] ) * 2 + 1; 
}
document.addEventListener( 'mousemove' , onDocumentMouseMove, false); 

/* adds a function func to an event of your choice. func takes a paramter which is passed the raycaster intercepts */

Vectorize.addEventListener = function(type,func,scene,camera){
    function f(event){
    	console.log("(" + Vectorize.mouse.x + "," + Vectorize.mouse.y + ")");
        var vector = new THREE.Vector3( Vectorize.mouse.x, Vectorize.mouse.y, -1 ).unproject( camera );
       	
       	// draw line simulating the ray projected by the raycaster
    	var lineMatrix = [[],[],[]];
    	for (var x = 0; x < 3; x++) {
    		var currentRow = lineMatrix[x];
    		currentRow.push(vector.getComponent(x));
    		currentRow.push(vector.getComponent(x) - camera.position.getComponent(x));
    	}
    	linePlotter(lineMatrix);	

        Vectorize.mousePath = new THREE.Raycaster(camera.position, vector.sub(camera.position).normalize());
        var intersects = Vectorize.mousePath.intersectObject(sphere,true);
        console.log(intersects);
        func(intersects);
    }
    document.addEventListener(type,f,false);
}
var test;
Vectorize.addEventListener('click', 
	// enlarge the 1st element when clicked
	function (intersects) {
		test = intersects;
		var mesh = intersects[0].object;
		mesh.scale.x *= 1.2;
		mesh.scale.y *= 1.2;
		mesh.scale.z *= 1.2; 
	}, scene,camera
	); 
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



