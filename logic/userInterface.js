/*------------------GENERAL SECTION-------------------------------*/
/*------CONTAINS GENERAL HELPER FUNCTIONS FOR USER INTERFACE------*/

/* used to create either textboxes or checkboxes
   returns a reference to the created text inputBox */
function makeInputBox(inputType) {
  
  var inputBox = document.createElement("INPUT");
  inputBox.setAttribute("type", inputType );

  return inputBox;
}

/* used to create a div element */
function makeDiv(type) {
  
  var container = document.createElement("div");
  container.className = type;

  return container;
}

/* used to create a SemanticUI textbox*/
function makeTextBox() {
  
  var container = makeDiv("ui input");
  container.appendChild(makeInputBox("text"));
  return container;

}

/* used to create a SemanticUI checkbox */
function makeCheckBox() {
  
  var container = makeDiv("ui checkbox");
  var emptyLabel = document.createElement("label");
  container.appendChild(makeInputBox("checkbox"));
  container.appendChild(emptyLabel);
  return container;

}

/* Given an enabled Semantic UI textbox, this function disables it */
function disableTextBox(textBox) {
    textBox.className = "ui disabled input";
}

/* Given a disabled Semantic UI textbox, this function enables it */
function enableTextBox(textBox) {
    textBox.className = "ui input";
}

/* register event handlers */
var resetCameraBtn = document.getElementById("resetCameraButton");
resetCameraBtn.onclick = () => {

    setGrid();
    controls.reset();
};

var rotateGridXBtn = document.getElementById("rotateXButton");
var rotateGridYBtn = document.getElementById("rotateYButton");
var rotateGridZBtn = document.getElementById("rotateZButton");

rotateGridXBtn.onclick = rotateX;
rotateGridYBtn.onclick = rotateY;
rotateGridZBtn.onclick = rotateZ;

function rotateX() {
    var rotateFunc = () => rotateGrid("x");
    renderQueue.unshift(rotateFunc);

    rotateGridXBtn.removeEventListener("onclick", rotateX);
    
    function stopRotation() {
        removeFromRenderQueue(rotateFunc);
        rotateGridXBtn.removeEventListener("onclick", stopRotation);
        rotateGridXBtn.onclick = rotateX;
    }

    rotateGridXBtn.onclick = stopRotation;

}

function rotateY() {
    
    var rotateFunc = () => rotateGrid("y");
    renderQueue.unshift(rotateFunc);

    rotateGridYBtn.removeEventListener("onclick", rotateY);
    
    function stopRotation() {
        removeFromRenderQueue(rotateFunc);
        rotateGridYBtn.removeEventListener("onclick", stopRotation);
        rotateGridYBtn.onclick = rotateY;
    }

    rotateGridYBtn.onclick = stopRotation;

}

function rotateZ() {
    
    var rotateFunc = () => rotateGrid("z");
    renderQueue.unshift(rotateFunc);

    rotateGridZBtn.removeEventListener("onclick", rotateZ);
    
    function stopRotation() {
        removeFromRenderQueue(rotateFunc);
        rotateGridZBtn.removeEventListener("onclick", stopRotation);
        rotateGridZBtn.onclick = rotateZ;
    }

    rotateGridZBtn.onclick = stopRotation;

}

/* precond: a 3*n matrix, where n is the number of basis vectors in a given subspace. 
            Each column is a basis vector.
   
   postcond: 1 <h2> element containing the MathJax equation
             Note: To use the equation element, give it an ID and add it to the HTML page
             After adding it to the page, we need to ask MathJax to render the newly added
             mathematics content. 
             This is done using: MathJax.Hub.Queue(["Typeset",MathJax.Hub,"id-of-equation-element"]);

             For more info, see: http://docs.mathjax.org/en/latest/advanced/typeset.html */
function createCartesianEqnLabel(basisMatrix) {
    
    /* identify number of basis vectors */
    let numVectors = basisMatrix[0].length;
    
    /* create a <h2> element */
    let equationElement = document.createElement("h2");

    if (numVectors === 3) {       
        /* if the subspace is the whole space, generate the zero equation */
        equationElement.textContent = "\\[0x + 0y + 0z = 0\\]";    
    } else if (numVectors === 2) {

        /* if the subspace is a plane, pass the basis vectors and the origin into the 
           'planeVectorToCartesian' function in matrix.js */

        /* extract both basis vectors for the given matrix */
        let vectorA = [basisMatrix[0][0], basisMatrix[1][0], basisMatrix[2][0]];
        let vectorB = [basisMatrix[0][1], basisMatrix[1][1], basisMatrix[2][1]];

        /* since this plane is a span, the origin is one point that lies on the plane */
        let pointOnPlane = [0, 0, 0];

        /* 'planeVectorToCartesian' returns the coefficients of the plane's cartesian eqn,
           given the plane's 2 direction vectors and a point on the plane */
        let cartesianCoeffs = planeVectorToCartesian(vectorA, vectorB, pointOnPlane);

        /* add the equation text to the equation <h2> element */
        equationElement.textContent = printCartesianEqn(cartesianCoeffs);
    } else {

        /* if the subspace is a line, pass 1 basis vector and the origin into the 
           'lineVectorToCartesian' function in matrix.js */
        let vectorA = [basisMatrix[0][0], basisMatrix[1][0], basisMatrix[2][0]];
        let pointOnLine = [0, 0, 0];
        
        let cartesianCoeffs = lineVectorToCartesian(vectorA, pointOnLine);

        /* add the equation text to the equation <h2> element */
        equationElement.textContent = printCartesianEqn(cartesianCoeffs[0]) 
                                      + " " + printCartesianEqn(cartesianCoeffs[1]);
    }
    
    /* return the <h2> element */
    return equationElement;
}


/*------------------VECTORS SECTION-------------------------------*/

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

var animateComboBtn = document.getElementById("animateCombo");
animateComboBtn.onclick = () => { 
    var linComboAnimation = new linComboPlayable(vectorList); 
};
 
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
  vectorLabel.setAttribute("class","label");
  vectorsInnerForm.appendChild(vectorLabel);
  
  // create and add 4 textboxes
  var inputXCoord = makeTextBox();
  vectorsInnerForm.appendChild(inputXCoord);

  var inputYCoord = makeTextBox();
  vectorsInnerForm.appendChild(inputYCoord);
  
  var inputZCoord = makeTextBox();
  vectorsInnerForm.appendChild(inputZCoord);

  var inputCoeff = makeTextBox();   
  vectorsInnerForm.appendChild(inputCoeff);
  
  // create and add 1 checkbox to webpage
  var checkBoxContainer = makeCheckBox();
  vectorsInnerForm.appendChild(checkBoxContainer);


  // wrap key data into an object  
  var vectorObj = {
    label: vectorLabel,
    xCoord: inputXCoord.childNodes[0],
    yCoord: inputYCoord.childNodes[0],
    zCoord: inputZCoord.childNodes[0],
    coeff: inputCoeff.childNodes[0],
    hex: undefined, // store the color of this vector [in future]
    graphic: undefined // store the threeJS object for this vector, once it's created
  };

  vectorList.push(vectorObj);
  checkBoxList.push(checkBoxContainer.firstElementChild);


  /* clicking the vector's label should hide or unhide the vector 
     add a function to handle this */
  var tempNumOfVectors = numVectors;
  vectorLabel.onclick = () => {
    var opac = window.getComputedStyle(vectorLabel).getPropertyValue("opacity");
    
    if (opac === "1") {
      vectorLabel.style.opacity = "0.5";
      allObjects.remove(vectorObj.graphic);

      disableTextBox(inputXCoord);
      disableTextBox(inputYCoord);
      disableTextBox(inputZCoord);
      disableTextBox(inputCoeff);
    } else {
      vectorLabel.style.opacity = "1";
      allObjects.add(vectorObj.graphic);
      
      enableTextBox(inputXCoord);
      enableTextBox(inputYCoord);
      enableTextBox(inputZCoord);
      enableTextBox(inputCoeff);
    }
  };

  vectorLabel.onmouseover = () => {
      console.log("enlarged");
      scale(vectorObj.graphic,2);
    };
    
  vectorLabel.onmouseleave = () => {
      console.log("smallened");
      scale(vectorObj.graphic,0.5);
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
    lastVector.xCoord.parentElement.remove();
    lastVector.yCoord.parentElement.remove();
    lastVector.zCoord.parentElement.remove();
    lastVector.coeff.parentElement.remove();

    /* remove last checkbox from the checkbox list */
    var lastCheckBox = checkBoxList.pop();
    
    /* remove checkbox from webpage */
    lastCheckBox.parentElement.remove();

    /* decrement counter */
    numVectors = numVectors - 1;
        
}

/*------------------SPANS SECTION-------------------------------*/

/* global states for span section */
var numSubps = 0;


/* an arr containing references to subpace objs.
   a subsp obj contain  subsp and also basisVectors objects, 
   both of which contain 2 attributes :1. ref to its label 2. graphical obj)  
    
   Example:
   let subspaceObj = {  
                        subsp: subsp (another object)
                        basisVectosrs: basisVectors (another object)
                     }

    let subsp = {
                    label: subspLabel (contains the HTML label element)
                    graphic: subsGraphic (the threejs graphic object)
                }

    let basisVectors: {
                        labels: vectorLabels (array of HTML labels)
                        graphics: vectorGraphics (array of threejs graphics)
                      } */
var subspList = [];

/* When span button is pressed
   1. Wrap all checked vectors as columns to form a matrix 
   2. If no input/ matrix empty,alert the user, else create a subspObj, and push it into subspList
*/
var spanBtn = document.getElementById("span");
spanBtn.onclick = spanBtnHelper;


/* This function adds a mouseover effect on a given HTML label and its 
   corresponding threejs graphic.
   precond: the HTML label and the threejs graphic object
   postcod: a mouseover function is added to the HTML label */
function addLabelEffects(labelElement, graphic) {
    // adding hide/unhide & labelling features
    labelElement.onclick = () => {
      
      // click once hide, click another time unhide.
      var opac = window.getComputedStyle(labelElement).getPropertyValue("opacity");
      if (opac === "1") {
        labelElement.style.opacity = "0.5";
        graphic.visible = false;
      } else {
        labelElement.style.opacity = "1";
        graphic.visible = true;
      }
      
    };
    
    // depending on the type of subp, changing the states of material of line, plane, or cube
    // when mouse move over the label
    labelElement.onmouseover = () => {
      console.log("enlarged");
      scale(graphic,2);
    };

    labelElement.onmouseleave = () => {
      console.log("smallened");
      scale(graphic,0.5);
    };
}

/* precond:  checkBoxList: an array containing reference of checkBox element
             vectorsList: an array containing reference of vectorArr
             note: all vectors are in 3-space
   
   postcond: return k checked vectors as columns making up a 3* k matrix, 
             if no checked vectors, return empty matrix */
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

/*
*/
function generalSpanHelper(rawVectors, tableBody, labelDesc, spanObj) {

    /* create the current row and two columns */    
    const row = document.createElement("tr");
    const firstCol = document.createElement("td");
    const secondCol = document.createElement("td");
    tableBody.appendChild(row);
    row.appendChild(firstCol);
    row.appendChild(secondCol);

    /*  Filter out the redundant vectors. Result is a 3*r matrix where 1 <= r <= 3 */
    const vectorsToSpan = filterRedundancy(rawVectors);
        
    /* Using the filtered vectors, use "drawSpan" to draw the graphic for this span on the grid.
       "drawSpan" also returns an array containing the ref to the graphics representing the span
        and the basis vectors of the span */
    const arr = drawSpan(vectorsToSpan, spanGraphics);    

   /* Extract the span's graphic from the array */
    const subspGraphic = arr[0];
    
    /* Create the label for this subspace */
    /* First, create an overall container for the labels */
    const subspLabel = document.createElement("div");

    /* Create a label that will read "Subp: X", where X is number of the subspace */
    const descriptorLabel = document.createElement("h2");
    descriptorLabel.innerHTML = labelDesc;
    descriptorLabel.setAttribute("class", "label");

    /* Create the Cartesian equation label */
    const cartesianEqnLabel = createCartesianEqnLabel(vectorsToSpan);
    
    /* add labels into the HTML page */    
    subspLabel.appendChild(descriptorLabel);
    subspLabel.appendChild(cartesianEqnLabel);
    firstCol.appendChild(subspLabel);
    MathJax.Hub.Queue(['Typeset', MathJax.Hub, cartesianEqnLabel]);   

    /* adding mouse over effects to the descriptorLabel */
    addLabelEffects(descriptorLabel, subspGraphic); 

    /* Wrap the graphic and labels in a subspace object */
    const subspObj = {
      label: subspLabel,
      graphic: subspGraphic
    };

    /* now, work on the basisVectors object */
    /* determine the number of basis vectors */
    const numVectors = arr.length - 1;

    /* create placeholders to hold the basis vector labels and graphics */
    const vlabels = [];
    const vgraphics = [];
    const vlabelContainer = document.createElement("div");

    /* Traverse across arr  to setup the graphic and label 
       for each basis vector */
    for (let i = 1; i < arr.length; i++) {
       
      const vGraphic = arr[i];
      vgraphics.push(vGraphic);

      const x = vectorsToSpan[0][i-1];
      const y = vectorsToSpan[1][i-1];
      const z = vectorsToSpan[2][i-1];

      const vLabel = document.createElement("h2");
      vLabel.setAttribute("class", "label");
      vLabel.innerHTML = 
        "Vector" + i + ": (" + x + ", " 
        +  y + ", " + z + ")";

      vlabelContainer.appendChild(vLabel);
      // adding hide/unhide & labelling features
      addLabelEffects(vLabel, vGraphic);
      vlabels.push(vLabel);
    }

    secondCol.appendChild(vlabelContainer);

    const basisVectors = {
      labels: vlabels, // contain ref to labels of correp vectors
      graphics: vgraphics// contain ref to graphics of correp vectors
    };

    spanObj.subsp = subspObj;
    spanObj.basisVectors = basisVectors;

}



/*This function is triggered when the Span button is clicked. 
  When Span button is pressed
  1. Wrap all checked vectors as columns to form a matrix 
  2. if 
  a) no input/matrix empty, alert the user. 
  b) else 
    (i) create a subspObj = {subsp:, basisVectors: }
    (ii) create labels for vectors, and add them to the subpObj
    (iii) creating label for the span and add it to the subspObj,
    (iv) create the threejs objects for both the span and the vectors, 
         and add them to subspObj
    (v)  define onclick events and mousedown and mouseup events for both labels  
    (vi) push the subspObj to the global subsList  */
function spanBtnHelper() {

  /* wrap the selected vectors into a matrix */
  var checkedVectors = getCheckedVectors(checkBoxList,vectorList);

  if (checkedVectors[0].length == 0) {
    /* if no input vectors, alert the user */
    alert("no vector input!");
  } else {   
    /* increment the global counter */
    numSubps++;
    
    /* create the current row and two columns */
    var tableBody = document.getElementById("spanTableBody");
    const subspObj = { };

    generalSpanHelper(checkedVectors, tableBody, "Subsp: " + numSubps, subspObj);
    
    /* push the newly added subpObj into the global subsp list */
    subspList.push(subspObj);

  }
}

/*------------------MATRICES SECTION-------------------------------*/
/* obj caching all info for matrices section , may need to modify it*/ 
/* menu effects*/
var buttonsMenu = document.getElementById("buttonsMenu");
var dropdown = document.getElementById("buttonDropDown");
dropdown.onmouseenter = () => {
    buttonsMenu.style.display = "grid";
  };
dropdown.onmouseleave = () => {
  buttonsMenu.style.display = "none";
};



// initializing the object
var matricesObj= {
  matrix:  [[document.getElementById("m11"), document.getElementById("m12"), document.getElementById("m13")],
            [document.getElementById("m21"), document.getElementById("m22"), document.getElementById("m23")],
            [document.getElementById("m31"), document.getElementById("m32"), document.getElementById("m33")]],
  vector: [document.getElementById("x"), document.getElementById("y"), document.getElementById("z")],
  transformedVector: {coordinate: [], label: undefined, graphic: undefined },
  columnSpace: {subsp: {label: undefined, graphic: undefined}, 
                basisVectors: {labels: [], graphics: []}},
  nullSpace: {subsp: {label: undefined, graphic: undefined}, 
              basisVectors: {labels: [], graphics: []}},
  transformedSubspace: {subsp: {label: undefined, graphic: undefined}, 
                        basisVectors: {labels: [], graphics: []}},
  eigenValues: [],
  eigenSpaces: []
};


// function checking if a matrix contain NaN
function hasNaN(m) {
  for (var i =0; i < m.length; i++) {
    for (var j = 0; j < m[0].length; j++) {
      if (isNaN(m[i][j])) {
        return true;
      }
    }
  }
  return false;
}
// function retrieving 3 * 3 matrix in a 2d array, if there exists no input, return NaN 
function getMatrix(){
  var m = setMatrix(3);
  for (var i = 0; i < 3; i++) {
    for (var j = 0; j < 3; j++) {
      m[i][j] = parseFloat(matricesObj.matrix[i][j].value);
    }
  }
  return m;
}

// retrieving the 3*1 vector as a column vector in 2d, if encounter empty input, return NaN
function getVector() {
  var m = setMatrix(3);
  for (var i = 0; i < 3; i++) {
    m[i][0] = parseFloat(matricesObj.vector[i].value);
  }
  return m;
}

/*adding event listeners for vTransform butn.
when butn is pressed,
1. create vector graphic and vector label, add eventListeners to the label
*/
var tranformBtn = document.getElementById("vTransform");
tranformBtn.onclick = tranformVButnhelper;


function tranformVButnhelper() {
  //update the coordinate attribute of the transformedVector field 
  var currentMatrix = getMatrix();
  if (hasNaN(currentMatrix)) {
    alert("please fill in all fields in the matrix inputs");
    return;
  }
  var currentVector = getVector();
  if (hasNaN(currentVector)) {
    alert("please fill in all fields in the vector inputs");
    return;
  }
  var currentResult = multiply(currentMatrix,currentVector);
  var vectorArr = matricesObj.transformedVector.coordinate;
  for (var i = 0; i < 3; i++) {
    vectorArr[0] = currentResult[0][0];
    vectorArr[1] = currentResult[1][0];
    vectorArr[2] = currentResult[2][0];
  }

  // add graphic
  var graphic = drawOneVector(vectorArr[0],vectorArr[1],vectorArr[2],0xff0066,matricesGraphics);
  matricesObj.transformedVector.graphic = graphic;

  // add label and its eventListener
  var display = document.getElementById("matricesTextDisplay");
  var label = document.createElement("h1");
  label.innerHTML = "VectorTransformed to: (" + vectorArr[0]+ ", "+ vectorArr[1]+ ", " + vectorArr[2] + ")";  
  label.setAttribute("class","label");
  display.appendChild(label);
  matricesObj.transformedVector.label = label;
  addLabelEffects(label,graphic);
}


/* columnSpaceBtn
columnSpace: {subsp: {label: undefined, graphic: undefined}, 
                basisVectors: {labels: [], graphics: []}},
1. add in graphic and labels(with event helper)
*/
var columnSpaceBtn = document.getElementById("columnSpace");
columnSpaceBtn.onclick = columnSpaceButnhelper;


function columnSpaceButnhelper(){
  var currentMatrix = getMatrix();
  if (hasNaN(currentMatrix)) {
    alert("please fill in all fields in the matrix inputs");
    return;
  }
  var display = document.getElementById("matricesTableBody");
  // assign subsp and basisVectors attributes
  generalSpanHelper(findColumnSpace(currentMatrix), display, "columnSpace", matricesObj.columnSpace);
}


/* nullSpaceBtn
  nullSpace: {subsp: {label: undefined, graphic: undefined}, 
              basisVectors: {labels: [], graphics: []}},
*/
var nullSpaceBtn = document.getElementById("nullSpace");
nullSpaceBtn.onclick = nullSpaceButnhelper;

function nullSpaceButnhelper(){
  var currentMatrix = getMatrix();
  if (hasNaN(currentMatrix)) {
    alert("please fill in all fields in the matrix inputs");
    return;
  }
  var display = document.getElementById("matricesTableBody");
  // assign subsp and basisVectors attributes
  generalSpanHelper(findNullSpace(currentMatrix), display, "nullSpace", matricesObj.nullSpace);
}


/* transformedSubspaceBtn
transformedSubspace: {subp: {label: undefined, graphic: undefined}, 
                        basisVectors: {labels: [], graphics: []}},
*/
var transformSubspBtn = document.getElementById("restrictedRange");
transformSubspBtn.onclick = transformSubspButnhelper;

function transformSubspButnhelper() {
  var currentMatrix = getMatrix();
  if (hasNaN(currentMatrix)) {
    alert("please fill in all fields in the matrix inputs");
    return;
  }

  var display = document.getElementById("matricesTableBody");

  var checkedVectors = getCheckedVectors(checkBoxList,vectorList);
  if (checkedVectors[0].length == 0) {
    alert("no subspace to be tranformed, please check vectors under the Vectors Tab to generate a subspace");
    return;
  }
  // original set of basis vectors of the subspace as a 3 * r matrix
  var originalBasis = filterRedundancy(checkedVectors);
  // assign subsp and basisVectors attributes
  generalSpanHelper(findRestrictedRange(currentMatrix,originalBasis), display, "transformedSubspace", matricesObj.nullSpace); 
}


/* eigenvalue and eigenvector buttons */

/* add eventListener to eigenValues Butn
1. find the arr of eigenValues --> if no real eigenvalue, alert, else
2. assign eigenValueArr into matricesObj.eigenValues: [] and at the same time create 
Option element with value as eigenvalue and add it to the eigenValueSelector element
*/
var eigenValueSelector = document.getElementById("evSelector");
var eigenValuesBtn = document.getElementById("eigenValues");
eigenValuesBtn.onclick = eigenValuesBtnhelper;

function eigenValuesBtnhelper() {
  var currentMatrix = getMatrix();
  if (hasNaN(currentMatrix)) {
    alert("please fill in all fields in the matrix inputs");
    return;
  }
  var selector = document.getElementById("evSelector");
  //check if there is already an option element in selector, if so clear it
  if(selector.length != 1) {
    var length = selector.length;
    for (var j = 1; j < length; j++) {
      //console.log("counter++");
      selector.remove(1);
    }
  }
  // assign fields
  var eigenValues = findEigenValue(currentMatrix);
  matricesObj.eigenValues = eigenValues;
  //create Option element with value as eigenvalue and add it to the eigenValueSelector element
  for (var i = 0; i < eigenValues.length; i++) {
    var value = eigenValues[i];
    var option = document.createElement("option");
    option.setAttribute("value", "" + value);
    option.innerHTML = "" + value;
    selector.appendChild(option);
  }

}


// function returning an object with selected eigenvalue as a float and index of 
//the corresponding eigenValue in the eigenvalue arr under matricesObj.eigenValues
function findSelectedEigenValue() {
  var selector = document.getElementById("evSelector");
  var index = parseInt(selector.selectedIndex);
  var value = parseFloat(selector.value)
  return {value:value , index: index};
}

/*eigenSpaceBtn
1. based on an eigenValue and matrix, output the matrix representing basis vectors to span
2. with helper function, create an subsp object and assign it to matricesObj.eigenSpaces at the correct index
*/
var eigenSpaceBtn = document.getElementById("eigenSpace");
eigenSpaceBtn.onclick = () => {
  var valueObj = findSelectedEigenValue();
  eigenSpaceBtnHelper(valueObj);
}
// valueObj: eigenValue and corresponding index of the subspace to be added.
function eigenSpaceBtnHelper(valueObj) {
  var M = getMatrix();
  if (hasNaN(M)) {
    alert("please fill in all fields in the matrix inputs");
    return;
  } 
  var eigenValue = valueObj.value;
  var display = document.getElementById("matricesTableBody");
  // get reference to the subspObj of this eigenspace at the ith index of matricesObj.eigenSpaces
  var subspObj = {subsp: {label: undefined, graphic: undefined}, 
                basisVectors: {labels: [], graphics: []}};
  matricesObj.eigenSpaces[valueObj.index] = subspObj;

  var vectorsToSpan = findEigenSpace(M,eigenValue);
  // adding labels and graphics to fields subsp and basisVectors of subspObj
  generalSpanHelper(vectorsToSpan,display, "EigenSpace", subspObj);
}

