/*---------------------------for R^n space-------------------------------- */
/*
rounding off the number to closest integer if the number is very close to an integer.
*/
function roundToNearestInteger(num) {
	var closeness = Math.abs(num - Math.round(num));
	if (closeness < 1e-10) {
		return Math.round(num);
	} else {
		return num;
	}
}

/*
precond: matrix : a 3 * k matrix making up of k column vectors
postcond: return a 3 * i matrix made up of i LI vectors as column vectors,
original matrix mutated as a result
*/
function filterRedundancy(matrix) {
	var m = duplicate(matrix);
	var outputMatrix = setMatrix(3);
	var vectorsProperty = findPivots(m);
	for (var i = 0; i < vectorsProperty.length; i++) {
		// if vector is a pivot, add it to the output matrix
		if (vectorsProperty[i][1]) {
			var vector = vectorsProperty[i][0];
			for (var j = 0; j < vector.length; j++) {
				outputMatrix[j].push(vector[j]);
			}
		}
	}
	return outputMatrix;
}


// initialize a 2D matrix with numRows rows, each row corresponds to a particular coordinate(either x,y,z) of a set of Vector3 
function setMatrix(numRows) {
	var matrix = new Array();
	for (var i = 0; i < numRows; i++) {
		matrix.push(new Array());
	}
	return matrix;
}

// return an m*n matrix with all zero entries
function setZeroMatrix(m,n) {
	var out = setMatrix(m);
	for (var i = 0; i < m; i++) {
		for (var j = 0; j < n; j++) {
			out[i][j] = 0;
		}
	}
	return out;
}

// return a duplicate of matrix
function duplicate(matrix) {
	var numRows = matrix.length;
	var outputMatrix = setMatrix(numRows);
	var numCols = matrix[0].length;
	for (var r = 0; r < numRows; r++) {
		for (var c = 0; c < numCols; c++) {
			outputMatrix[r].push(matrix[r][c]);
		}	
	}
	return outputMatrix;
}
//function mutating matrix by appending another column vector to the existing m*n matrix consisting of n column vectors
// matrix: 2d array m*n, colVector: 1d array 1 * m
function appendColumn(matrix, colVector) {
	for (var row = 0; row < matrix.length; row++ ) {
		matrix[row].push(colVector[row]);
	}
}
// function mutating m1 by appending m2 to m1, where m1 & m2 are both 2d array
function appendMatrix(m1,m2) {
	for (var row = 0; row < m1.length; row++) {
		for (var col = 0; col < m2[0].length; col++) {
			m1[row].push(m2[row][col]);
		}
	}
}
// return kth column of m*n matrix M as a 1d array
function getCol(M,k){
	var outArr = new Array();
	for (var i = 0; i < m.length; i++) {
		outArr.push(M[i][k]);
	}
	return outArr;
}
// v : 1d 1*n row vector 
// returning another 2d n*1 matrix 
function matrixify(v) {
	var out = setMatrix(v.length);
	appendColumn(out,v);
	return out;
}
// V: a 2d n * 1 matrix
// return a 1d 1*n row vector
function vectorize(V) {
	var arr = new Array();
	for (var i = 0; i < V.length; i++) {
		arr.push(V[i][0]);
	}
	return arr;
}

// matrix: a 2d array of order m*n
function printMatrix(matrix) {
	var output = "";
	for (var i = 0; i < matrix.length; i++) {
		output += "["; 
		for (var j = 0; j < matrix[0].length; j++) {
			output += matrix[i][j]  + ",";
		}
		output += "]" + "\n";
	}
    console.log(output);
}

// mutating the matrix by swapping row1 and row2
function swap_row(matrix, row1, row2) {
	var numCols = matrix[0].length;
	// state var col to traverse across all elements in row1 and row2
	for (var col = 0; col < numCols; col++) {
		var temp = matrix[row1][col];
		matrix[row1][col] = matrix[row2][col];
		matrix[row2][col] = temp;
	}
}
// A: m*k matrix(2d), B: k*n matrix(2d)
// function returning a m*n matrix
function multiply(A,B) {
	var m = A.length;
	var n = B[0].length;

	// initialize the outputArr
	var output = setMatrix(m);
	for (var r = 0; r < m; r++) {
		for (var c = 0; c < n; c++) {
			// in each iteration of rth column for A and cth column for B, find out the (r,c) element of the output arr.
			var ans = 0;
			// calculate sumof products
			for (var i = 0; i < B.length;i++) {
				ans += A[r][i] * B[i][c];
			}
			output[r][c] = ans;
		}
	}
	return output;
}

/*
   precond: 2 m*n matrices A and B
   postcond: 1 m*n matrix representing A + B */
function add(A, B) {
    
    let numRows = A.length;
    let numColumns = A[0].length;

    // initialise the outputMatrix
    let output = setMatrix(numRows);

    // iterate through each row
    for (let i = 0; i < numRows; i++) {
        // iterate through each column
        for (let j= 0; j < numColums; j++) {
            // entry wise addition
            ouput[i][j] = A[i][j] + B[i][j];
        }
    }

    return output;
}

/*function mutating a m*n matrix into REF, where n is the number of column vectors. 
may consider combining function gussianElimination and function findPivots 
limitation: rounding off error --> if a number is very close to an interger, round it to an integer: i.e. particularly need to round off numbers which are close to 0.
*/
function guassianElimination(matrix) {
	/* a coordinate as a state for potential pivot point,for each iteration, identify the column of the potential pivot point, traverse through elements in the same column, swap it with the row 
	with max element, if element non-zero, move the potential pivot point by (+1,-1) in x,y coordinate and perform row operations s.t elements below it become zero, else (all elements below the current column are all zero), move (+1,0). repeat this until all it moves out of bound,i.e. x > 3 and y > n
	*/
	var numRows = matrix.length;
	var numCols = matrix[0].length;
	// currentRow also indicates the number of pivot rows = number of pivot columns created so far
	var currentRow = 0;
	var currentCol = 0;
	while (currentRow < numRows && currentCol < numCols) {
		var currentMax = Math.abs(matrix[currentRow][currentCol]);
		var currentMaxRow = currentRow;
		// swap the currentRow with the maximumRow:= row with max element in column below the current element
		for (var i = currentRow + 1; i < numRows; i++) {
			var possibleMax = Math.abs(matrix[i][currentCol]);
			if (currentMax < possibleMax) {
				currentMaxRow = i;
				currentMax = possibleMax;
			}
		}
		swap_row(matrix,currentRow,currentMaxRow);
		//printMatrix(matrix);

		// if currentElement non-zero, perform row operations to make all elements below the same column zero, then move to the next pivot by +1,-1. if current element zero, i.e. all elements below are zero, move to the next pivot by +1,0
		var currentPivot = matrix[currentRow][currentCol]
		if ( currentPivot== 0) {
			currentCol++;
		} else {
			for (var i = currentRow + 1; i < numRows; i++) {
				// scale factor f to be applied to the currentRow
				var f = matrix[i][currentCol] / currentPivot;
				// substract ith row by a factor of the currentRow to make all elements below the same column zero
				for (var j = currentCol + 1; j < numCols; j++ ) {
					matrix[i][j] -= matrix[currentRow][j] * f; 
				}
				matrix[i][currentCol] = 0;
			}
			currentRow++;
			currentCol++;
		}
	}
}


/*
function mutating the matrix and returning a n*3 2D array consisting of n vectors, where row number = column number of the column vector in the original matrix, each row has 3 indices, 0: 1* n 1d row vector  1: boolean indicating if the column is a pivot column, 2: a pair object (x,y) indicating the pivot point coordinate

limitation: rounding off error leading to incorrect identification of pivot columns --> resolve by treating numbers close to 0 as 0
*/
function findPivots(matrix){
	var numRows = matrix.length;
	var numCols = matrix[0].length;
	// initialize the output array, set all columns to be redundant columns first.
	var output = new Array();
	// row:= each row of the output array = each column vector of the original matrix
	for (var row = 0; row < numCols; row++) {
		// each row is another array with three indices, initialize all columns to be non- pivot, and the pivot points to be a dummy (-1,-1) 
		output[row] = [new Array(),false, {r: -1, c: -1}];
		// record the column vectors in the output matrix 
		for (var i = 0; i < numRows; i++ ) {
			output[row][0][i] = matrix[i][row];
		}	
	}

	guassianElimination(matrix);
	/*given a matrix in REF, to identify redundant vectors,look at possible pivot position across the matrix. starting from (0,0) --> at each iteration, if the entry is none-zero, increase currentrow and column by 1(move 1 along x and -1 along y), record the column as pivot column, else, record it as non-pivot column, increase column by 1(move +1 along x).
	continue the process until either row exceeds 3 or column exceeds n
	*/
	// currentCol correspond to the index of the original column vector 
	// currentRow represents the index of the pivot row so far, note that the max is 3.
	var currentRow = 0; 
	var currentCol = 0;

	while (currentRow < numRows && currentCol < numCols) {
		var currentElement = matrix[currentRow][currentCol];
		if (Math.abs(currentElement) < 1e-10) {
			currentCol++;
		} else {
			// record the current point as a pivot point
			output[currentCol][1] = true;
			output[currentCol][2].r = currentRow;
			output[currentCol][2].c = currentCol; 
			currentRow++;
			currentCol++;
		}
	}
	return output;
}

/*
precond : m*n matrix
postcond: mutating the existing matrix to RREF
limitation: rouding off error --> possible solution: if (Math.abs(x - Math.round(x) < 1E-10) { x = Math.round(x)}
*/
function guassJordanElimination(matrix) {
	// 1.perform GE and find pivots 2. starting from last pivot point, work backwards to form RREF, by performing row operations 
	var m = matrix.length;
	var n = matrix[0].length;
	// a 1d array where each element is a pair object with r and c as fields
	var vectorsProperty = findPivots(matrix);
	// find an array containing the coordinates for pivot points in reverse order.
	var coordinates = new Array();
	for (var i = vectorsProperty.length - 1; i >= 0; i--) {
		if (vectorsProperty[i][1]) {
			coordinates.push(vectorsProperty[i][2]);
		}
	}

	// starting the last pivot point, perform row operations to make it reduced form, then move forward to the prev pivot column until all pivot columns are reduced
	for (var i = 0; i < coordinates.length; i++) {
		var pair = coordinates[i];
		var currentRow = pair.r;
		var currentCol = pair.c;
		var pivotValue = matrix[currentRow][currentCol];
		// 1/pivotValue * currentRow to make pivot point 1;
		matrix[currentRow][currentCol] = 1;
		for (var j = currentCol + 1; j < n; j++) {
			matrix[currentRow][j] *= 1/pivotValue;
		}
		// reducing all entries above the same column as the pivot 0;
		for (var k = currentRow - 1; k >=0 ; k--) {
			var elementToMakeZero = matrix[k][currentCol];
			// apply - elementToMakeZero * currentRow + kth row 
			for (var l = 0; l < n; l++) {
				matrix[k][l] += -1 * elementToMakeZero * matrix[currentRow][l];
			}
			matrix[k][currentCol] = 0;
		}
	}
} 


/*
precond: augmentedMatrix: m*n matrix(2d array)
postcond:
  
	case1: last col pivot col --> alert inconsistent.
	case2: else output a r*c matrix: 1st column as the point 
		and subsequent columns as direction vectors(or coordinates wrt a 
		particular arbitrary value). When all columns are pivot columns except the 
		last column, c= 1 --> the solution is a point/ unique solution.
note: for linear equations with 3 unknowns(x,y,z), no of col of augmented
matrix = 4. output: if the augmented is consistent, output a 3*c matrix. 
cases: c == 1 --> a point, c == 2 --> a line, c == 3 --> a plane, c = 4	--> the whole space
*/
function solveAugmentedMatrix(augmentedMatrix) {
	/*
	1. duplicate matrix, apply guassian elimination and findPivots 
	2. based on 1. traverse to get numOfNonPivotColumns and coordinates(array where each index
	correp to column number of the column vector, if pivot, return the coordiate of the pivot, else
	return {r:-1,c:-1})
	3. check if last column pivot column, if so, alert and return 
	4. else, create an output k * j matrix, where k = numUnkowns, j = 1 + numNonPivotColumns; 
	set up a state storing the currentCol of arbitraryNum, 
	traverse through augmentedMatrix(in REF), column by column, from 
	the second last column/ last unknown, to assign values row by row starting from the last
	row of the output
		a.if pivot, set orginal entry at output[currentRow][currentCol] = constantOfTheEquation 
		create var ans and set it to the original value in the matrix, assign value entry by entry forward on the current row,
		starting from constant term(using currentOuputCol to traverse through). when assigning each value of output 
		at (currentOutPutRow,currentOutputCol), traverse through all unknowns after the pivot point on 
		the same row in the augmented matrix. 
		b. if non-pivot, simply replace output[currentRow][currentArbitrayCol] = 1
	*/
	var matrix = duplicate(augmentedMatrix)
	var m = matrix.length;
	var n = matrix[0].length;

	var vectorsProperty = findPivots(matrix);

	// if last column is pivot, alert inconsistent and return an empty 2d array/matrix with m rows
	if (vectorsProperty[n - 1][1]) {
		alert("inconsistent linear system!");
		return setMatrix(m);
	}

	var numOfNonPivotCols = 0;
	/* 1d array where each index stores pivot coordinate of the corresp column if any */
	var coordinates = new Array(); 
	// traverse through each column of the matrix, except the last column 
	for (var vectorNum = 0; vectorNum < n - 1; vectorNum++) {
		//increase the numOfNonPivotCols if encountered
		if (!vectorsProperty[vectorNum][1]) {
			numOfNonPivotCols++;
		}
		coordinates.push(vectorsProperty[vectorNum][2]);
	}
	
	// (n -1) * (numOfNonPivotCols + 1) output matrix,with all entries 0.
	var numRowsOfOutput = n - 1;
	var numColsOfOutput = numOfNonPivotCols + 1;
	var out = setZeroMatrix(numRowsOfOutput, numColsOfOutput);
	// state indicating current arbitaray number assigned so far, initialize to the last column of output matrix 
	var currentArbitrayCol = numOfNonPivotCols;

	/* assign values into the output matrix,starting from the last row of output matrix/ second last column of augmentedMatrix,
	For each row, assign entry by entry rightwards, starting from the constant entry.
	*/
	for (var currentRow = numRowsOfOutput - 1; currentRow >= 0; currentRow--) {
		var currentPivot = coordinates[currentRow];
		if (currentPivot.r == -1) {
			// if non -pivot, assign 1 
			out[currentRow][currentArbitrayCol] = 1;
			currentArbitrayCol--;
		} else {
			// if pivot, initialize the constant term of the currentRow to the RHS value of the augmented matrix.
			out[currentRow][0] = matrix[currentPivot.r][n - 1];
			for (var currentCol = 0; currentCol < numColsOfOutput; currentCol++) {
				// a state storing the value to be assigned at the current entry
				var ans = out[currentRow][currentCol];
				// minus off the components from other unknowns after the pivot
				for (var augMatrixCol = currentPivot.c + 1; augMatrixCol < n - 1; augMatrixCol++) {
					ans -= matrix[currentPivot.r][augMatrixCol] * out[augMatrixCol][currentCol];
				}
				ans /= matrix[currentPivot.r][currentPivot.c];
				out[currentRow][currentCol] = ans;
			}
		}
		
	}

	return out;
} 


/* 
precond: matrix: m*n matrix
postCond: returning a 2d m*k matrix indicating k column vectors that span the Column space of the matrix. 
*/
function findColumnSpace(M){
	var matrix = duplicate(M);
	//find the pivot columns of the matrix using findPivots, then output the 2d result matrix.
	var numRows = matrix.length;
	var numCols = matrix[0].length;
	var outputMatrix = setMatrix(numRows);
	// returning a m*3 2d array
	var vectorsProperty = findPivots(matrix);
	// traverse through all vectors, append the 1d vector to the output if its a pivot
	for (var index = 0; index < vectorsProperty.length; index++) {
		if (vectorsProperty[index][1]) {
			appendColumn(outputMatrix,vectorsProperty[index][0]);
		}
	}   
	return outputMatrix;
}



/* 
precond: m*n matrix
postcond: returning a n * k matrix, where n is numOfCol of matrix and k is the number of none- pivot columns, each column of the result is a basis vector of the nullspace 
when k = 0/ when 2d arr is empty --> nullspace is a zero space.
nullspace of a 3*3 matrix: 3 cases: 1 pivot column, 2 pivot columns, 3 pivot columns: an identity matrix in RREF -> nullspace is zero space.
for the prev 2 cases, can be solved mathematically through RREF, by setting unknowns(algebra). 

*/
function findNullSpace(M) {
	/*
	case1: For the case where all columns are pivot columns, the nullspcae is zero space
	case2: existence of non-pivot columns.
	1a)given REF and apply the function findPivots, traverese throught the 2d array, find out the number of none pivot columns, initialize the 3*k matrix, setting all entries to 0 (note: none pivot cols of REF correspond to rows with only one number 1 and all others zero, non pivot rows which are rows below the last non-pivot row(the first none pivot row is the number of pivot cols of REF, i.e. 2 pivot cols, last none- pivot row is 1) are all 0, ). 
	1b)initialize an array of the coordinates of pivot points.
	1c)solve for unknowns corresponding to the non-pivot columns, by setting arbitray values :set 1 to the row of result matrix, the row correspond to the index of the pivot 
	2) Solve for unknowns corresponding to the pivot columns, starting from the last pivot row of REF and work backwards, identify the pivot point(i.e. (x1,y1))update row  y1 of the resultant matrix(each row of result matrix represent a linear combination of the unknown correspond to the same column in the original matrix)  
	*/
	var matrix = duplicate(M);
	// a n*3 matrix indicating the analysis of vectors, where n is the number of vectors
	var vectorsProperty = findPivots(matrix);
	// 1. find numOfNonPivotCols --> set the matrix where colNum = numOfNonPivotCols and rowNum = colNum of original matrix 2. initialize an array of indicating pivot points, if any. 3) starting from the last column, 3a.initialize "1"s for non-pivot points(arbitray values) in the output matrix 3b. solve for unknowns corresponding to pivot columns 
	// an array, where each index corresp to the colNum of the column vector, if the column vector is a pivot, it records the pivot coordinate , else, if it's a non-pivot column, it returns (-1,-1) 
	var coordinates = new Array();
	var numOfNonPivotCols = 0;
	var numCols = matrix[0].length;
	// perform 1 and 2
	for (var vectorNum = 0; vectorNum < numCols; vectorNum++) {
		//increase the numOfNonPivotCols if encountered
		if (!vectorsProperty[vectorNum][1]) {
			numOfNonPivotCols++;
		}
		coordinates.push(vectorsProperty[vectorNum][2]);
	}

	//initialize matrix of dimension numCols * numOfNonPivotCols 
	var output = new Array();
	for (var row = 0; row < numCols; row++) {
		output[row] = new Array();
		for (var col = 0; col < numOfNonPivotCols; col++) {
			output[row][col] = 0;
		}
	}
	// if nullspace is a zero space, return an empty 2d array
	if (numOfNonPivotCols == 0) {
		console.log("nullspace is a zero space");
		return output;
	}


	//console.log(output);

	// assign "1"s starting from the last column of the output matrix
	var colNumArbs = output[0].length - 1;
	// traverse across all column vectors starting from the last index, vectorNum = column number of the original matrix
	for (var colNum = coordinates.length - 1; colNum >=0; colNum--) {
		var pair = coordinates[colNum];
		// if the current col is non-pivot, input 1, at the output matrix,starting from the last column. relative position of non-pivot columns are preserved.
		if (pair.r == -1) {
			output[colNum][colNumArbs] = 1; 
			colNumArbs--;
		} else {
			// for each pivotRow of the original matrix, calculate the correponding row of the output matrix(the rowNum of output = colNum of pivot), which corresponds to a general solution of an unknown
			for (var outputCol = 0; outputCol < output[0].length; outputCol++) {
				// a variable calculating the answer at output[pair.c][outputCol];
				var ans = 0;
				for (var matrixCol = pair.c + 1; matrixCol < numCols; matrixCol++) {
					//console.log("matrixCol is: " + matrixCol);
					//console.log("outputCol is: " + outputCol);
					ans -= matrix[pair.r][matrixCol] * output[matrixCol][outputCol];
				}
				//console.log("temp ans is " + ans);
				// divide by the pivot
				ans /= matrix[pair.r][pair.c];
				output[pair.c][outputCol] = ans;
			}
		}

	}
	return output;
}

/* 
precond: m * n vectorMatrix is made up of n -1 linearly independent vectors,i.e. all n columns are pivot columns except the last column
postcond: return a 1D array/ row vector of size n-1, representing the unique solution/coordinate vector of the redundant vector(last col)
*/ 
function backSubst(vectorMatrixOriginal) {
	var vectorMatrix = duplicate(vectorMatrixOriginal);
	var m = vectorMatrix.length;
	var n = vectorMatrix[0].length;
	// perform guassianElimination on vectorMatrix and output properties.
	var vectorsProperty = findPivots(vectorMatrix);
	/*starting from the second last column, corresponding to solving for the the last variable, move back up to find the solution column by column. in each iteration, make use of already found value to find the unknown value.*/
	// instanstiating the coordinate vector
	var output = new Array(n - 1);
	// starting from the last pivot point at (n-2,n-2), perform the algorithm to find the output. update the pivot point position by moving (-1,1)
	var currentPivot = n - 2;// all pivots having same row and column
	printMatrix(vectorMatrix);
	while(currentPivot >= 0) {
		var pivotValue = vectorMatrix[currentPivot][currentPivot];
		// initialize ans to be the element at the last column at currentRow.
		var ans = vectorMatrix[currentPivot][n - 1];
		// traverse through all unknowns(all already solved) after the currentColumn
		for (var i = currentPivot + 1; i < n - 1; i++) {
			ans -= vectorMatrix[currentPivot][i] * output[i]
		}
		ans /= pivotValue;
		output[currentPivot] = ans;
		currentPivot--;
	}
	return output;
}


/*
precond: M : m*n matrix with first n-1 columns as basis vectors of a subspace and the last column as the redundant vector
postCond: returning a n-1 * 1 row vector correponding to the coordinate vector of the redundant vector
coefficient vector of a redundant vecotr in the plane. As good as evaluating a system of linear equations.
three possible cases: subspace spanned by 1) 1 vector 2) 2 vectors 3) 3 vectors. 1) is nothing more than finding the scaling factor 2) && 3): using back substitution to solve foe equation. note: case 2 solution is a 2d vector, case 3 solution is a 3d vector.

for case 1: just apply scaling.
for case2: to express a redundant vector in terms of 2 LI vector, one can just use the idea to find nullspace of a 3*3.
precond: M is a m*n matrix where ONLY the last column is the redundant vector and n - 1 columns before it are the basis vectors
*/
function expressRedundantVector(M) {
	return backSubst(M);
}

/*
precond: matrix: n*n matrix
postcond: returning the eigenvalue of a matrix as a 1d array.
if there's no eigenvalue in the real number field, output an empty array

Note: may have slight rounding off error,which in turn affects the calculation
for eigenspaces later, so apply Math.round to the result
*/
function findEigenValue(matrix) {
	// numeric.eig(matrix) --> returns an object with 2 fields: lambda and E. lamda field is another object of type T, with field x as a 1d array containing the real component of the root(eigenvalue) and y as another 1d array containing the complex component of the root(eigenvalue).  
	// a 1d array with possible duplicates, indicating all eigenvalues of the matrix
	var result = numeric.eig(matrix);
	// get the real component of the eigenValues
	var arr = result.lambda.x;
	//get complex component of the eigenvalues and see if there is any value, if so, return an empty array
	var arrComplex = result.lambda.y;
	if (arrComplex != undefined) {
		return [];
	}

	// rounding off all numbers close to integer in the arr.
	for (var i = 0; i < arr.length; i++) {
		arr[i] = roundToNearestInteger(arr[i]);
	}

	// function returning a unique arr in sorted order, original arr mutated as side effect
	function removeDuplicates(arr) {
		arr.sort();
		var outputArr = new Array();
		outputArr.push(arr[0]);
		// traverse across the arr, to fill in unique values into the output
		var outputIndex = 0;
		for (var i = 1; i < arr.length; i++) {
			if (arr[i] != outputArr[outputIndex]) {
				outputIndex++;
				outputArr[outputIndex] = arr[i];
			}
		}
		return outputArr;	
	}
	return removeDuplicates(arr);
}

/*
precond: M: n*n sq matrix. eigenvalue: a real number eigenvalue of the matrix
postcond:returning a m*k matrix,indicating k column vectors as a basis that span the Eigenspace. Note: original matrix will be mutated as a side effect
*/
function findEigenSpace(M,eigenvalue) {
	var matrix = duplicate(M);
	// initialize a 2d array with m rows
	var outArr = setMatrix(matrix.length);
	// find the nullspace of (ev * I - matrix)
	for (var p = 0; p < matrix.length; p++) {
		matrix[p][p] -= eigenvalue;
	}
	// finding nullspace associated with the current eigenvalue,
	// as a 2d matrix, containing column vectors
	return findNullSpace(matrix);		
}

/*
precond: M : m*n matrix. V: n * 1 matrix representing a column vector from n-space.
postcond: returning m * 1 2d array, representing the vector Mv, where M is m*n  matrix(2d) and V is the n * 1 matrix(2d).
*/
function vectorTransformatiom(M,V){
	return multiply(M,V);
}

/*
precond: matrix:  m*n matrix. Vectors: k, column vectors from n-space, represented as a n * k matrix, where each column is a basis vector
postcond: returning restricted range of matrix linear transformation by on a subspace spanned by Vectors
the restricted range is another subsp(subsp preserved under lt), that is spanned by {Mv1, Mv2}, while both may not be LI.
return a m * i matrix where i is the number of basis vectors spanning the restricted space.
when i is 0, it is a zero space.
*/

function findRestrictedRange(matrix,Vectors) {
	var M = duplicate(matrix);
	// M(v1 v2 ..) = (Mv1 Mv2 ....), a matrix consisting of column vectors transformed from basis vectors of the restricted subsp
	var tranformedVectors = multiply(M,Vectors);
	printMatrix(tranformedVectors);
	// remove redundant vectors and output the resultant 
	var outputMatrix = filterRedundancy(tranformedVectors);
	printMatrix(outputMatrix);
	return outputMatrix;
}




/* precond: 1 row vector (3 element array)
   postcond: length of the vector */
function vectorLength(vector) {
    
    // our vector is [a, b, c]
    // calculate a^2 + b^2 + c^2
    let squaredSum = vector.reduce(function(accSquaredSum, nextCoord) {
        let squaredNextCoord = Math.pow(nextCoord, 2);
        return accSquaredSum + squaredNextCoord;
   });

   // return sqrt(squaredSum);
   return Math.sqrt(squaredSum);

}


/* precond: 1 row vector (3 element array)
   postcond: a unit vector in the same direction as the given vector */
function getUnitVector(vector) {
    
    // get the length of the given vector
    let magnitude = vectorLength(vector);
    // scale the vector to a unit vector
    let scaledUnitVector = vector.map(function(coordinate) {
        return coordinate / magnitude;
    });

    return scaledUnitVector;
}



/*--------------------------- for R^3 space-------------------------------- */

/* precond: 2 row vectors (each vector is a 3 element array)
   postcond: 1 vector that is orthogonal to both the given vectors, in a 3 element array */
function crossProduct(vectorA, vectorB) {

    /* this is the cross product formula,
       derived using the distributive property of cross product */
    
    let resultantX = vectorA[1]*vectorB[2] - vectorA[2]*vectorB[1];
    let resultantY = -1*vectorA[0]*vectorB[2] + vectorA[2]*vectorB[0];
    let resultantZ = vectorA[0]*vectorB[1] - vectorA[1]*vectorB[0];

    return [resultantX, resultantY, resultantZ];

}

/* precond: 2 row vectors (each vector is a 3 element array)
   postcond: the dot product of the two vectors */
function dotProduct(vectorA, vectorB) {
    // use the multiply function to compute dot product
    // multiply function will return a 1*1 matrix
   let ans = multiply([vectorA], matrixify(vectorB));

   // extract and return the scalar value from the 1*1 matrix
   return ans[0][0];
}

/* precond: 2 linearly independent row vectors and 1 point, defining a plane
            Note: A plane is defined by 1 point and 2 linearly independent vectors
                  e.g --> plane a:= (0, 0, 0) + s(1, 0, 0) + r(0, 1, 0), where r and s are arbitrary parameters
            The vectors and the point will both be row vectors (3 element arrays)

   postcond: coefficients (x, y, z) of the Cartesian equation "ax + by + cz = d" of the plane defined 
             by these 2 vectors and 1 point. The coefficients are returned as an array [a, b, c, d] */
function planeVectorToCartesian(vectorA, vectorB, pointOnPlane) {
    
    // obtain a vector perpendicular to the plane defined by the 2 vectors
    let normalVector = crossProduct(vectorA, vectorB);
    
    // obtain a unit vector in same direction as normal Vector;
    let unitNormalVector = getUnitVector(normalVector);

    // take the dot product of the point with the unitNormalVector
    let d = dotProduct(pointOnPlane, normalVector);
    let a = normalVector[0];
    let b = normalVector[1];
    let c = normalVector[2];
    
    return [a, b, c, d];  // ax + by + cz = d
}


/* precond: 1 row vectors and 1 point, defining a line
            Note: A line is defined by 1 point and 1 vector
                  e.g --> line a:= (0, 0, 0) + s(1, 0, 0), where s is an arbitrary parameter
            The vector and the point will both be row vectors (3 element arrays)

   postcond: coefficients (x, y, z) of the Cartesian equations "ax + by + cz = d" of the 2 planes intersecting
             at the given line. 
             The coefficients are returned as a 2*4 array
    
             e.g. Cartesian Eqn 1: ax + by + cz = d
                  Cartesian Eqn 2: ex + fy + gz = h
                  output array: [ [a, b, c, d], [e, f, g, h] ] */
function lineVectorToCartesian(vectorA, pointOnLine) {

    /* write the given vectorA into a 1*3 matrix */
    let lineMatrix = [vectorA];
    
        /* solve for the null space of this matrix.
       Every vector in the null space will be orthogonal to the 
       vectors of the given line. */
    let nullSpaceBasis = findNullSpace(lineMatrix);

    /* in this case, the null space has dimension 2 */
    /* there will be 2 vectors in nullSpaceBasis */

    /* retrieve the 2 vectors */
    printMatrix(nullSpaceBasis);
    let vectorB = [nullSpaceBasis[0][0], nullSpaceBasis[1][0], nullSpaceBasis[2][0]];
    let vectorC = [nullSpaceBasis[0][1], nullSpaceBasis[1][1], nullSpaceBasis[2][1]];

    /* get the cartesian eqn of the plane spanned by vector A and B*/
    let planeAB = planeVectorToCartesian(vectorA, vectorB, pointOnLine);

    /* get the cartesian eqn of the plane spanned by vector A and C*/
    let planeAC = planeVectorToCartesian(vectorA, vectorC, pointOnLine);    
    
    printCartesianEqn(planeAB);
    printCartesianEqn(planeAC);

    /* return the 2 planes */
    return [planeAB, planeAC]
}


/* precond: the coefficients of a cartesian equation defining a space
            the coefficients will be in a 4 element array
            ax + by + cz = d --> [a, c, c, d]
            
            note: since only 1 equation is provided, the space will be either
            a plane or the whole 3D space

   postcond: a 3*(n + 1) matrix, where n is the number of linearly independent vectors
             each vector is a basis vector of the given space.
             The last column in a point in the space */
function cartesianToVector(cartesianCoeffs) {
    
    /* solve for the null space of the 1*3 matrix [a b c] */
    let nullSpaceBasis = findNullSpace([ [cartesianCoeffs[0], cartesianCoeffs[1], cartesianCoeffs[2]] ]);
    
    /* check if nullSpace dimension is 3 */
    if (nullSpaceBasis[0].length === 3) {   
        /* check if d !== 0 here, for example 0x + 0y + 0z = 1 --> no solutions exist */        
        if (cartesianCoeffs[3] !== 0) {
            alert("equation has no solutions");
        } else {     
            /* if not, return the whole 3d space, together with the point (0, 0, 0) */
            appendColumn(nullSpaceBasis, [0, 0, 0]);
            return nullSpaceBasis;   
        }     
    } else {
      /* now, we have the vectors defining the plane given */
      /* next, we need to find 1 point in the plane given */

      /* null space MUST have dimension 2  in this case */
      /* --> one of the coefficients, a, b, c must be non zero */

      /* find the first non zero coefficient, starting from a */
      let foundFirstNonZero = false;
      let counter = 0;

      while ((counter < 3) && (foundFirstNonZero === false)) {  
        if (cartesianCoeffs[counter] !== 0) {
          foundFirstNonZero = true; 
        } else {
          counter++;
        }
      }
      
      let firstNonZeroIndex = counter; 

      /* we substitute 0 into the other variables */
      /* divide d by the first non zero coefficient */

      let dividedD = cartesianCoeffs[3] / cartesianCoeffs[firstNonZeroIndex];
      
      /* construct a point in the given plane using this info */
      let pointInSpace = [0, 0, 0];
      pointInSpace[firstNonZeroIndex] = dividedD;
      
      appendColumn(nullSpaceBasis, pointInSpace);
      return nullSpaceBasis;
     
    }

}

/* precond: a 4 element array containing the coefficients of a Cartesian equation.
            --> e.g. If the eqn is x + y + z = 1, the array will be: [1, 1, 1, 1]

   postcod: a string containing the LaTeX expression for this Cartesian equation */
function printCartesianEqn(cartesianCoeffs) {
    
    const variables = ["x", "y", "z"];    

    let currentEqn = "\\[" + cartesianCoeffs[0] + variables.shift();

    for(let i = 1; i < 3; i++) {
        let nextCoeff = cartesianCoeffs[i];

        if (nextCoeff >= 0) {
            currentEqn = currentEqn + "+ " + nextCoeff + variables.shift();
        } else {  
            currentEqn = currentEqn + nextCoeff + variables.shift();
        }
    }      
     
    currentEqn = currentEqn + "= " + cartesianCoeffs[3] + "\\]";
    return currentEqn;
}


