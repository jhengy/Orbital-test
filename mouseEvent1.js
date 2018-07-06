var Vectorize = {};

/* tracks mouse position as its user moves it across the screen */
Vectorize.mouse = new THREE.Vector3();
Vectorize.mousePath = new THREE.Raycaster();
var projector = new THREE.Projector();

/* this should be set to the dimensions of the canvas element you're monitoring */
var canvas = document.getElementById("stage");
Vectorize.dimensions = [canvas.width,canvas.height];

function onDocumentMouseMove( event ) {
    event.preventDefault();
    Vectorize.mouse.x = ( event.clientX / Vectorize.dimensions[0] ) * 2 - 1;
    Vectorize.mouse.y = - ( event.clientY / Vectorize.dimensions[1] ) * 2 + 1; 
    Vectorize.mouse.z = 1;
}
document.addEventListener( 'mousemove' , onDocumentMouseMove, false); 

/* adds a function func to an event of your choice. func takes a paramter which is passed the raycaster intercepts */
Vectorize.addEventListener = function(type,func,scene,camera){
    function f(event){
    	projector.unprojectVector(Vectorize.mouse,camera);
    	var direction = Vectorize.mouse.sub( camera.position ).normalize();
    	console.log("(" + Vectorize.mouse.x + "," + Vectorize.mouse.y + ")");
        //Vectorize.mousePath.setFromCamera(Vectorize.mouse,camera); 
        Vectorize.mousePath.set(camera.position,direction);
        var intersects = Vectorize.mousePath.intersectObject(mesh);
        console.log(intersects);
        func(intersects);
    }
    document.addEventListener(type,f,false);
}
var test;
Vectorize.addEventListener('click', 
	function (intersects) {
		test = intersects;
		if(intersects.length != 0) {
			alert("hit");
		}
	}, scene,camera
	);



