var Vectorize = {};

/* tracks mouse position as its user moves it across the screen */
Vectorize.mouse = new THREE.Vector2();
Vectorize.mousePath = new THREE.Raycaster();

/* this should be set to the dimensions of the canvas element you're monitoring */
var canvas = document.getElementById("stage");
Vectorize.dimensions = [canvas.width,canvas.height];

function onDocumentMouseMove( event ) {
    event.preventDefault();
    Vectorize.mouse.x = ( event.clientX / renderer.domElement.clientWidth ) * 2 - 1;
    Vectorize.mouse.y = - ( event.clientY / renderer.domElement.clientHeight ) * 2 + 1; 
}
document.addEventListener( 'mousemove' , onDocumentMouseMove, false); 

/* adds a function func to an event of your choice. func takes a paramter which is passed the raycaster intercepts */
Vectorize.addEventListener = function(type,func,scene,camera){
    function f(event){
    	console.log("(" + Vectorize.mouse.x + "," + Vectorize.mouse.y + ")");
        Vectorize.mousePath.setFromCamera(Vectorize.mouse,camera); 
        var intersects = Vectorize.mousePath.intersectObject(allObjects,true);
        console.log(intersects);
        func(intersects);
    }
    document.addEventListener(type,f,false);
}
var test;
Vectorize.addEventListener('click', 
	function (intersects) {
		test = intersects;
		var mesh = intersects[0].object;
		mesh.scale.x *= 3;
		mesh.scale.y *= 3;
		mesh.scale.z *= 3; 
	}, scene,camera
	);



