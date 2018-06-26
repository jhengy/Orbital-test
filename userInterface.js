/* Key variables for the Vectors Tab */
var numVectors = 0; // storet the number of vectors 

var vectorList = []; // store the list of vectors entered by the user
var checkBoxList = []; // store the list of checkboxes on the Vectors Form

/* global states for span section */
var numSubps = 0;
/* an arr containing ref to subpace objs.
a subsp obj contain  subsp and also basisVectors objects, both of which contain 2 attributes
: 1. ref to its label 2. graphical obj)  
*/
var subspList = [];

/* arr caching all info for matrices section */ 
var matricesList= [];

/* register event handlers */
var addVectorBtn = document.getElementById("addVector");
addVectorBtn.onclick = addControls;

var renderBtn = document.getElementById("renderVectors");
renderBtn.onclick = () => { drawAllVectors(vectorList); };

var deleteVectorBtn = document.getElementById("deleteVector");
deleteVectorBtn.onclick = deleteLastVector;

 
/* add a set of text input boxes representing 1 vector to the web page
   Then, store references to these input boxes in an object and add this object
   to the vectorStack */
function addControls() {
  
  // increment counter
  numVectors = numVectors + 1; 
  
  // get a reference to the form holding the textboxes and checkboxes
  var vectorsInnerForm = document.getElementById("vectorsInnerForm");

  // create a label representing the new vector
  var vectorLabel = document.createElement("h1");
  vectorLabel.innerHTML = "Vector " + numVectors;
  vectorsInnerForm.appendChild(vectorLabel);
  
  // create and add 4 textboxes
  var inputXCoord = makeInputBox("text");
  vectorsInnerForm.appendChild(inputXCoord);

  var inputYCoord = makeInputBox("text");
  vectorsInnerForm.appendChild(inputYCoord);
  
  var inputZCoord = makeInputBox("text");
  vectorsInnerForm.appendChild(inputZCoord);

  var inputCoeff = makeInputBox("text");   
  vectorsInnerForm.appendChild(inputCoeff);
  
  // create and add 1 checkbox to webpage
  var checkBox = makeInputBox("checkbox");
  vectorsInnerForm.appendChild(checkBox);


  // wrap key data into an object  
  var vectorObj = {
    label: vectorLabel,
    xCoord: inputXCoord,
    yCoord: inputYCoord,
    zCoord: inputZCoord,
    coeff: inputCoeff,
    hex: undefined, // store the color of this vector [in future]
    graphic: undefined // store the threeJS object for this vector, once it's created
  };

  vectorList.push(vectorObj);
  checkBoxList.push(checkBox);


  /* clicking the vector's label should hide or unhide the vector 
     add a function to handle this */
  var tempNumOfVectors = numVectors;
  vectorLabel.onclick = () => {
    var opac = window.getComputedStyle(vectorLabel).getPropertyValue("opacity");
    
    if (opac === "1") {
      vectorLabel.style.opacity = "0.5";
      allObjects.remove(vectorObj.graphic);
    } else {
      vectorLabel.style.opacity = "1";
      allObjects.add(vectorObj.graphic);
    }
  };
    
}

/* Remove the last vector from the Scene and the Web page.
   This means: 
     - remove associated textboxes, labels and checkbox
     - remove associated threeJS object from the scene
     - remove associated object from the vector list */
function deleteLastVector() {
    
    /* remove last vector object from the vector list */
    var lastVector = vectorList.pop();
    
    /* get reference to the associated threeJS object */
    var graphedVector = lastVector.graphic;
  
    /* remove associated threeJS object from the scene */
    allObjects.remove(graphedVector);

    /* remove associated labels, textboxes from webpage */
    lastVector.label.remove();
    lastVector.xCoord.remove();
    lastVector.yCoord.remove();
    lastVector.zCoord.remove();
    lastVector.coeff.remove();

    /* remove last checkbox from the checkbox list */
    var lastCheckBox = checkBoxList.pop();
    
    /* remove checkbox from webpage */
    lastCheckBox.remove();

    /* decrement counter */
    numVectors = numVectors - 1;
        
}

/* use to create either textboxes or checkboxes
   returns a reference to the created inputBox */
function makeInputBox(inputType) {
  
  var textBox = document.createElement("INPUT");
  textBox.setAttribute("type", inputType);
  
  return textBox;
}

/*
precond: 
checkBoxList: an array containing reference of checkBox element
vectorsList: an array containing reference of vectorArr
* all vectors are in 3-space
postcond: 
return k checked vectors as columns making up a 3* k matrix
return a matrix made up of LI vectors as column vectors that's been checked by
the user
*/
function getCheckedVectors(checkBoxList, vectorsList) {
  var m = setMatrix(3);
  for (var i = 0; i < checkBoxList.length; i++) {
    if (checkBoxList[i].checked) {
      var x = parseFloat(vectorsList[i].xCoord.value);
      var y = parseFloat(vectorsList[i].yCoord.value);
      var z = parseFloat(vectorsList[i].zCoord.value);
      m[0].push(x);
      m[1].push(y);
      m[2].push(z);
    }
  }
  return m;
}


/* when span button is pressed
1. wrapping all checked vectors as columns to form a matrix 
2. if no input/ matrix empty,alert, else create a subspObj, and push it to subspList
*/
var spanBtn = document.getElementById("span");
spanBtn.onclick = () => { 
  spanBtnhelper();
}
/* 
when span button is pressed
1. wrapping all checked vectors as columns to form a matrix 
2. if 
a) no input/ matrix empty,alert 
b) else 
(i)create a subspObj = {subsp : , basisVectors: }
1. creating labels for vectors, and add it to the subpObj
2. creating label for plane and add it to the subspObj,
3.  define onclick events and mousedown and mouseup events for both labels  
(ii) push the subspObj to the arr

*/
function spanBtnhelper() {
  var checkedVectors = getCheckedVectors(checkBoxList,vectorList);
  if (checkedVectors[0].length == 0) {
    alert("no vector input!");
  } else {   
    numSubps++;
    var display = document.getElementById("spanTableBody");
    // a 3*r matrix where 1 <= r <= 3
    var vectorsToSpan = filterRedundancy(checkedVectors);
    /*printMatrix(vectorsToSpan); */
    // array containing ref to graphics
    var arr = drawSpan(vectorsToSpan);

    // creating subsp obj and adding event handlers
    var subspGraphic= arr[0];
    var subspLabel = document.createElement("h1");
    subspLabel.innerHTML = "Subp: " + numSubps;
    display.appendChild(subspLabel);
    var subsp = {
    label: subspLabel,
    graphic: subspGraphic
    };
    // adding hide/unhide & labelling features
    subspLabel.onclick = () => {
      // click once hide, click another time unhide.
    };
    // depending on the type of subp, changing the states of material of line, plane, or cube
    // when mouse move over the label
    subspLabel.onmousemove = () => {

    };
    subspLabel.onmouseout = () => {

    };

    // creating basisVectors obj
    var numVectors = arr.length - 1;
    var vlabels = [];
    var vgraphics = [];
    var basisVectors = {
      labels: vlabels, // contain ref to labels of correp vectors
      graphics: vgraphics// contain ref to graphics of correp vectors
    };
    // traversing across arr.
    for (var i = 1; i < arr.length; i++) { 
      var vGraphic = arr[i];
      vgraphics.push(vGraphic);
      var x = vectorsToSpan[0][i-1];
      var y = vectorsToSpan[1][i-1];
      var z = vectorsToSpan[2][i-1];
      var vLabel = document.createElement("h1");
      vLabel.innerHTML = 
        "Vector" + i + ": (" + x + ", " 
        +  y + ", " + z + ")";
      display.appendChild(vLabel);
      // adding hide/unhide & labelling features
      vLabel.onclick = () => {
        // click once hide, click another time unhide.
      };
      // depending on the type of subp, changing the states of material of line, plane, or cube
      // when mouse move over the label
      vLabel.onmousemove = () => {

      };
      vLabel.onmouseout = () => {
      };
      vlabels.push(vLabel);
    }

    //push the newly added subpObj into the list
    var obj = {
      subsp : subsp,
      basisVectors: basisVectors
    }
    subspList.push(obj);
    } 
}
