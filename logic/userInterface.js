/*------------------GENERAL SECTION-------------------------------*/
/*------CONTAINS GENERAL HELPER FUNCTIONS FOR USER INTERFACE------*/

/* used to create either textboxes or checkboxes
   returns a reference to the created text inputBox */
function makeInputBox(inputType) {
  
  const inputBox = document.createElement("INPUT");
  inputBox.setAttribute("type", inputType );

  return inputBox;
}

/* used to create a Semantic UI div element
   for a Semantic UI textbox / checkbox */
function makeDiv(type) {
  
  const container = document.createElement("div");
  container.className = type;

  return container;
}

/* used to create a Semantic UI textbox*/
function makeTextBox() {
  
  const container = makeDiv("ui input");
  container.appendChild(makeInputBox("text"));
  return container;

}

/* Used to create a label (of a given type such as <p>, <h1>, <h2>, etc)
   Users can pass in a "labelText" to set the text of the label.
   If no text is passed, the label text will be an empty string by default */
function makeLabel(labelType, labelText="") {

  const label = document.createElement(labelType);
  // add the 'label' class so the CSS mouseover property is applied
  label.className = "label";
  label.textContent = labelText;
  return label;

}
/* used to create a Semantic UI checkbox */
function makeCheckBox() {
  
  const container = makeDiv("ui checkbox");
  const emptyLabel = document.createElement("label");
  container.appendChild(makeInputBox("checkbox"));
  container.appendChild(emptyLabel);
  return container;

}

/* used to create a Semantic UI icon element
   The icon to be created can be specified by passing 
   a string 'iconClass' into the function */
function makeIcon(iconClass) {
    
    const icon = document.createElement("i");
    icon.className = iconClass;
    return icon;
}

/* Given an enabled Semantic UI textbox, this function disables it 
   Note: This can be generalised to any Semantic UI control */
function disableTextBox(textBox) {
    textBox.className = "ui disabled input";
}

/* Given a disabled Semantic UI textbox, this function enables it
    Note: This can be generalised to any Semantic UI control  */
function enableTextBox(textBox) {
    textBox.className = "ui input";
}

/* Given a <tr> element, add a Semantic UI checkbox to it
   Can we generalise this further?  */
function addCheckBox(headerRow, checkList) {
  const checkBox = makeCheckBox();
  checkList.push(checkBox.children[0]);
  headerRow.appendChild(checkBox);
}

/* register event handlers */
const resetCameraBtn = document.getElementById("resetCameraButton");
resetCameraBtn.onclick = () => {

    setGrid();
    controls.reset();
};

const opacSlider = document.getElementById("opacitySlider");

const rotateGridXBtn = document.getElementById("rotateXButton");
const rotateGridYBtn = document.getElementById("rotateYButton");
const rotateGridZBtn = document.getElementById("rotateZButton");

rotateGridXBtn.onclick = rotateX;
rotateGridYBtn.onclick = rotateY;
rotateGridZBtn.onclick = rotateZ;

function rotateX() {
    const rotateFunc = () => rotateGrid("x");
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
    
    const rotateFunc = () => rotateGrid("y");
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
    
    const rotateFunc = () => rotateGrid("z");
    renderQueue.unshift(rotateFunc);

    rotateGridZBtn.removeEventListener("onclick", rotateZ);
    
    function stopRotation() {
        removeFromRenderQueue(rotateFunc);
        rotateGridZBtn.removeEventListener("onclick", stopRotation);
        rotateGridZBtn.onclick = rotateZ;
    }

    rotateGridZBtn.onclick = stopRotation;
}


function vectorsToCartesianCoeffs(vectorMatrix, pointOnObject) {
    
    /* identify number of basis vectors */
    const numVectors = vectorMatrix[0].length;
       
    if (numVectors === 0) {
    	/* case where it is a zero space */
    	return [[1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 1, 0]]; // [x = 0, y = 0, z = 0]

    } else if (numVectors === 3) {       
        /* if the subspace is the whole space, generate the zero equation */
        return [[0, 0, 0, 0]]; // [0x + 0y + 0z = 0]
    
    } else if (numVectors === 2) {

        /* if the subspace is a plane, pass the basis vectors and the origin into the 
           'planeVectorToCartesian' function in matrix.js */

        /* extract both basis vectors for the given matrix */
        const vectorA = [vectorMatrix[0][0], vectorMatrix[1][0], vectorMatrix[2][0]];
        const vectorB = [vectorMatrix[0][1], vectorMatrix[1][1], vectorMatrix[2][1]];

        /* 'planeVectorToCartesian' returns the coefficients of the plane's cartesian eqn,
           given the plane's 2 direction vectors and a point on the plane */
        const cartesianCoeffs = planeVectorToCartesian(vectorA, vectorB, pointOnObject);

        return [cartesianCoeffs];
    } else {

        /* if the subspace is a line, pass 1 basis vector and the origin into the 
           'lineVectorToCartesian' function in matrix.js */
        const vectorA = [vectorMatrix[0][0], vectorMatrix[1][0], vectorMatrix[2][0]];
        const pointOnLine = [0, 0, 0];
        
        const cartesianCoeffs = lineVectorToCartesian(vectorA, pointOnObject);

        return cartesianCoeffs;
    }  
}

function coeffsToCartesianLatex(coeffsArray) {
  
  return coeffsArray.map(coeffs => printCartesianEqn(coeffs))
                    .reduce((accumulatedEqn, eqnB) => {
                      return accumulatedEqn + " " + eqnB;
                      });
}

/* precond: 
     vectorMatrix: a 3*n matrix, where n is the number of direction / basis vectors.
                   Each Column is a direction / basis vector
     pointOnObject: a 1d 3-element array representing a point on the line / plane / cube
                    In the case of spans, this will be [0, 0, 0]

   postcond: 1 string containing the LaTeX expression for the Cartesian equation
             Note: To use the equation element, add it as the text content of an HTML element
             After adding it to the page, we need to ask MathJax to render the newly added
             mathematics content. 
             This is done using: MathJax.Hub.Queue(["Typeset",MathJax.Hub, "ref-to-equation-element"]);

             For more info, see: http://docs.mathjax.org/en/latest/advanced/typeset.html */
function vectorsToCartesianLatex(vectors, pointOnPlane) { 
  return coeffsToCartesianLatex(vectorsToCartesianCoeffs(vectors, pointOnPlane));
}


function getRandomColour() {
      
      function getRandomInt(lowerLimit, upperLimit) {

        const randomFloat = Math.random();

        const scaledRandom = ((upperLimit + 1) - lowerLimit)*randomFloat + lowerLimit;
        return Math.floor(scaledRandom);

      }

  function rgbToHex(red, green, blue) {

    function decimalToHex(decimalNum) {

      const symbolsMap = [
        "0",
        "1",
        "2",
        "3",
        "4",
        "5",
        "6",
        "7",
        "8",
        "9",
        "a",
        "b",
        "c",
        "d",
        "e",
        "f"
      ];

      const remainder = decimalNum % 16;
      const quotient = (decimalNum - remainder) / 16;

      if (quotient < 16) {
        return symbolsMap[quotient] + symbolsMap[remainder];
      } else {
        return decimalToHex(quotient) + symbolsMap[remainder];
      }
    }
    
    const prelimHex = (decimalToHex(red) + decimalToHex(green) + decimalToHex(blue));
    return +('0x' + prelimHex);
  }

  const redGreenFlag = getRandomInt(0, 1);
  let red = 0;
  let green = 0;
  const blue = getRandomInt(0, 150);

  if (redGreenFlag === 1) {
    red = getRandomInt(200, 255);
    green = getRandomInt(0, 255);
  } else {
    red = getRandomInt(0, 255);
    green = getRandomInt(200, 255);
  }
  
  return rgbToHex(red, green, blue);
}


/*------------------VECTORS SECTION-------------------------------*/

/* Key variables for the Vectors Tab */
var numVectors = 0; // store the number of vectors 

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
  var vectorLabel = makeLabel("h1", "Vector" + numVectors);
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
      scale(graphic,2);
    };

    labelElement.onmouseleave = () => {
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

/* precond: 
   1. vectorsToSpan: m*n matrix consisting of n basis column vectors of the subsp to be spanned
      0 <= n <= m. i.e. if n == 0 --> zero space; if n == m --> whole vector space
      note: vectorsToSpan does not contain NaN.
   2. tableBody: the body of the table where details of this span will be placed
   3. labelDesc: the description that we want for the main label for this span
   4. spanObj: the object for this span

  postcond:
  This function does the following:
    - Sets up the span's table with labels, buttons and label effects
    - Draws the span graphic on the threejs grid
    - Adds the span labels and graphic into the span's object */
function generalSpanHelper(vectorsToSpan, tableBody, labelDesc, spanObj) {

    // if it's a zero space, alert and return the function straight away
    if (vectorsToSpan[0].length == 0) {
		alert("a zero space!");
		return;
	}

    const headerRow = createTableRow(tableBody, labelDesc);
    const descriptorLabel = headerRow.getElementsByTagName("p")[0];
    const infoRow = headerRow.nextElementSibling;
    const vLabelContainer = infoRow.getElementsByTagName("div")[0];

    /* create the LaTeX expression for the Cartesian Equation using "vectorsToCartesianLatex"
       and then fill the Cartesian Equation element with it */
    fillCartesianEqn(headerRow, vectorsToCartesianLatex(vectorsToSpan, [0, 0, 0]));

    /* Using the filtered vectors, use "drawSpan" to draw the graphic for this span on the grid.
    "drawSpan" also returns an array containing the ref to the graphics representing the span
    and the basis vectors of the span */
    const arr = drawSpan(vectorsToSpan, spanGraphics);    

   /* Extract the span's graphic from the array */
    const subspGraphic = arr[0];
    addLabelEffects(descriptorLabel, subspGraphic.reference);

    /* Wrap the graphic and labels in a subspace object */
    const subspObj = {
      label: descriptorLabel,
      graphic: subspGraphic
    };

    /* create placeholders to hold the basis vector labels and graphics */
    const vLabels = [];
    const vGraphics = [];

    /* Traverse across arr to setup the graphic and label 
       for each basis vector */
    for (let i = 1; i < arr.length; i++) {
       
      const vGraphic = arr[i];
      vGraphics.push(vGraphic);

      const x = vectorsToSpan[0][i-1];
      const y = vectorsToSpan[1][i-1];
      const z = vectorsToSpan[2][i-1];

      const vLabel = makeLabel("p",  "Vector" + i + ": (" + x 
                                      + ", " +  y + ", " + z + ")");

      vLabelContainer.appendChild(vLabel);
      // adding hide/unhide & labelling features
      addLabelEffects(vLabel, vGraphic.reference);
      vLabels.push(vLabel);
    }

    const basisVectors = {
      labels: vLabels, // contain ref to labels of correp vectors
      graphics: vGraphics// contain ref to graphics of correp vectors
    };

    spanObj.subsp = subspObj;
    spanObj.basisVectors = basisVectors;

    makeRowCollapsible(headerRow);
   
}

/* This function sets up 2 rows in a given table, intended for a new Span / Matrix space / Plot object 
   The first row will be the "headerRow" and will have a descriptorLabel, and a button.
   The second row will be the "infoRow" and will have 2 columns -> one for the Cartesian Equation and one 
   for the vector information. 
 
   precond:
     - tableBody: the table where the rows should be inserted
     - headerLabelDesc: The label for the header row
     - vectorMatrix: A 4*n matrix, with n column vectors. 
       In the case of spans, all column vectors are basis vectors.
       In the case of plots, the first column is the position vector, and subsequent columns are direction
       vectors. */
function createTableRow(tableBody, headerLabelDesc) {

    /* create a header row */    
    const headerRow = document.createElement("tr");
    const headerCol = document.createElement("td");
    headerRow.appendChild(headerCol); 
    tableBody.appendChild(headerRow);  

    /* create a new row and two columns */    
    /* one row for the Cartesian Equation, and one for the basis vectors */
    const infoRow = document.createElement("tr");
    infoRow.className = "collapsible";
    const cartesianCol = document.createElement("td");
    const vectorCol = document.createElement("td");

    /* set the column widths equally */
    cartesianCol.style.width = "50%";
    vectorCol.style.width = "50%";

    infoRow.appendChild(cartesianCol);
    infoRow.appendChild(vectorCol); 
    tableBody.appendChild(infoRow);

    /* Create a label that will read "Subp: X", where X is number of the subspace */
    const descriptorLabel = makeLabel("p", headerLabelDesc);

    /* Create an empty Cartesian equation label */
    const cartesianEqnLabel = document.createElement("p");
    cartesianEqnLabel.style.transition = "display 0.5s";

    /* Create an empty vector label container */
    const vLabelContainer = document.createElement("div");
    vLabelContainer.style.transition = "display 0.5s";

    /* add labels into the HTML page */    
    headerCol.appendChild(descriptorLabel);
    cartesianCol.appendChild(cartesianEqnLabel);
    vectorCol.appendChild(vLabelContainer);

    return headerRow;

}

/* Adds a latex expression to a table. 
   Precond:
     - headerRow: The row above the row where the latex expression will be placed
     - cartesianLatexExpr: A string containing the LaTeX expression of the equation */
function fillCartesianEqn(headerRow, cartesianLatexExpr) {
    
  const cartesianEqnLabel = headerRow.nextElementSibling
                                     .getElementsByTagName("p")[0];  

  cartesianEqnLabel.textContent = cartesianLatexExpr; 
  MathJax.Hub.Queue(['Typeset', MathJax.Hub, cartesianEqnLabel]);   

}

/* Makes a row collapsible into its header row. A button is added to the header row.
   
   precond: the header row
   postcond: the row below the header row can collapse into the header row */
function makeRowCollapsible(headerRow) {

    const infoRow = headerRow.nextElementSibling;
    const cartesianEqnLabel = infoRow.getElementsByTagName("p")[0];
    const vLabelContainer = infoRow.getElementsByTagName("div")[0];

    /* create a button that will collapse / un-collapse the row information */
    const collapseBtn = document.createElement("button");
    collapseBtn.className = "ui circular icon button";
    collapseBtn.appendChild(makeIcon("minus icon"));

    /* add the button to the header row */
    headerRow.appendChild(collapseBtn);

    /* At this point, the labels, cartesian equation and graphic
       have been added onto the webpage. Now, we need to make the span info
       collapsible */
    
    const rowHeight = infoRow.scrollHeight;

    collapseBtn.onclick = () => {
      if(infoRow.style.height !== "0px") {
        cartesianEqnLabel.style.opacity = "0";
        vLabelContainer.style.opacity = "0";
        
        setTimeout(() => {
          cartesianEqnLabel.style.display = "none";
          vLabelContainer.style.display = "none";
          infoRow.style.height = "0px";
          collapseBtn.children[0].className = "plus icon";
        }, 400);

      } else {
        infoRow.style.height = "" + rowHeight + "px";

        setTimeout(() => {
          cartesianEqnLabel.style.display = "";
          vLabelContainer.style.display = "";
          cartesianEqnLabel.style.opacity = "1";
          vLabelContainer.style.opacity = "1";
          collapseBtn.children[0].className = "minus icon";
         }, 1200);
      }
    };
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
  } else if (hasNaN(checkedVectors)) {
  	alert("please fill in all checked input boxes!");
  } else {   
    /* increment the global counter */
    numSubps++;
    
    /* create the current row and two columns */
    var tableBody = document.getElementById("spanTableBody");
    const subspObj = { };

    /*  Filter out the redundant vectors. Result is a 3*r matrix where 1 <= r <= 3 */
    const vectorsToSpan = filterRedundancy(checkedVectors);
    generalSpanHelper(vectorsToSpan, tableBody, "Subsp: " + numSubps, subspObj);
    
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
  generalSpanHelper(findColumnSpace(currentMatrix), display, "Column Space", matricesObj.columnSpace);
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
  generalSpanHelper(findNullSpace(currentMatrix), display, "Null Space", matricesObj.nullSpace);
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
  generalSpanHelper(vectorsToSpan,display, "Eigenspace", subspObj);
}

/*------------------PLOTTER SECTION-------------------------------*/

/* register event handlers */
const addEqnBtn = document.getElementById("addEqnBtn");
addEqnBtn.onclick = addEqn;

const deleteEqnBtn = document.getElementById("deleteEqnBtn");
deleteEqnBtn.onclick = deleteLastEqn;

const drawIntersectionBtn = document.getElementById("intersectBtn");
drawIntersectionBtn.onclick = drawIntersection;


/* global variables */
let numEqns = 0;
let eqnList = [];
let eqnCheckList = [];


/* Reads the equation input boxes and returns an array [a, b, c, d]
   indicating the coefficients of the Cartesian Equation given by the user */
function readEqn() {
  
  const xCoeff = parseFloat(document.getElementById("xCoeff").value);
  const yCoeff = parseFloat(document.getElementById("yCoeff").value);
  const zCoeff = parseFloat(document.getElementById("zCoeff").value);
  const dConstant = parseFloat(document.getElementById("dConstant").value);
  
  return [xCoeff, yCoeff, zCoeff, dConstant];
}

function addEqn() {
  
  const cartesianCoeffs = readEqn();
  const cartesianLatex = printCartesianEqn(cartesianCoeffs);
  // an object containing 0. matrix containing position and 
  //direction vectors ...{reference : .., hex:...} 
  const parsedLinearSystem = drawGraphicsFromLinearSystem([cartesianCoeffs], equationGraphics);

  const eqnObj = {       
    eqnGraphic: parsedLinearSystem[1].reference,
    cartesianCoeffs: [cartesianCoeffs]
  };

  eqnList.push(eqnObj); 
  
  drawEqn(parsedLinearSystem, cartesianLatex);

}

function drawEqn(parsedLinearSystem, cartesianLatex) {
  numEqns++;    

  console.log(parsedLinearSystem);
    
  // get a reference to the plotter display table body
  const eqnTableBody = document.getElementById("eqnTableBody");

  const headerRow = createTableRow(eqnTableBody, "Equation " + numEqns);
  const descriptorLabel = headerRow.getElementsByTagName("p")[0];
  const infoRow = headerRow.nextElementSibling;
  const vectorLabelContainer = infoRow.getElementsByTagName("div")[0];

  addCheckBox(headerRow, eqnCheckList);

  fillCartesianEqn(headerRow, cartesianLatex);
  
  const eqnGraphic = parsedLinearSystem[1].reference;
  addLabelEffects(descriptorLabel, eqnGraphic);

  /* create vector labels */
  const vectors = parsedLinearSystem[0];

  /* first, set up direction vector labels */  
  for(let i = 0; i < vectors[0].length; i++) {

    const x = vectors[0][i];
    const y = vectors[1][i];
    const z = vectors[2][i];

    let vectorDesc; 
    
    if (i === 0) {
      vectorDesc = "Position Vector: (";
    } else {
      vectorDesc = "Direction Vector: (";
    }

    const vectorLabel = makeLabel("p", vectorDesc + x + ", " + y + ", " + z + ")");

    /* Only link the vector labels with vector graphics if vector graphics exist.
       Vector graphics only exist for Planes and Lines.
       No vector Graphics are provided for Points and Cubes */
    if (parsedLinearSystem.length > 2) {
      const vectorGraphic = parsedLinearSystem[2 + i].reference;
      addLabelEffects(vectorLabel, vectorGraphic);
    }

    vectorLabelContainer.appendChild(vectorLabel);

   }
  
   makeRowCollapsible(headerRow);

}


function deleteLastEqn() {

  const toBeDeleted = eqnList.pop();
  eqnCheckList.pop();

  equationGraphics.remove(toBeDeleted.eqnGraphic);

  const eqnTableBody = document.getElementById("eqnTableBody");
  eqnTableBody.children[eqnTableBody.children.length - 1].remove();
  eqnTableBody.children[eqnTableBody.children.length - 1].remove();

  numEqns--;

}

function drawIntersection() {

  const linearSystem = [];

  for (let i = 0; i < eqnCheckList.length; i++) {

   if (eqnCheckList[i].checked) {
     eqnList[i].cartesianCoeffs.forEach(coeffs => linearSystem.push(coeffs));
   }

  }

  if (linearSystem.length == 0) {
    alert("No objects selected for intersection");
    return;
  }


  const parsedLinearSystem = drawGraphicsFromLinearSystem(linearSystem, equationGraphics);
  let vectorMatrix = parsedLinearSystem[0];
  const pointOnObject = shiftColumn(vectorMatrix);

  console.log(vectorMatrix);

  const cartesianCoeffs = vectorsToCartesianCoeffs(vectorMatrix, pointOnObject);
  const cartesianLatex = coeffsToCartesianLatex(cartesianCoeffs);
   
  prependColumn(vectorMatrix, pointOnObject);
  drawEqn(parsedLinearSystem, cartesianLatex);
  
  const eqnObj = {       
    eqnGraphic: parsedLinearSystem[1].reference,
    cartesianCoeffs: cartesianCoeffs
  };

  eqnList.push(eqnObj);    
 
      
}
