/* Key variables for the Vectors Tab */
var numVectors = 0; // storet the number of vectors 

var vectorList = []; // store the list of vectors entered by the user
var checkBoxList = []; // store the list of checkboxes on the Vectors Form

/* register event handlers */
var addVectorBtn = document.getElementById("addVector");
addVectorBtn.onclick = addControls;

var renderBtn = document.getElementById("renderVectors");
renderBtn.onclick = () => { drawAllVectors(vectorList); };

var deleteVectorBtn = document.getElementById("deleteVector");
deleteVectorBtn.onclick = deleteLastVector;

// when span button is pressed, plot the vectors
var spanBtn = document.getElementById("span");
spanBtn.onclick = () => { 
  var m = getVectorsToSpan(checkBoxList,vectorList); 
  printMatrix(m); 
  drawSpan(m);
}
 
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

