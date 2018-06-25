# visual-vectors

Proposed Level of achievement: Project Gemini

Target Audience: NUS Students taking introductory linear algebra modules 


Motivation: Ideas in linear algebra often have a “simple” geometrical meaning, as well as a more “pure” mathematical meaning. As students, we felt that some concepts were easier to grasp once their geometrical meaning became clear. We wanted a tool that  allows students to toy around with these concepts and get visual results. Current alternatives are limited to math software suites like MATLAB which are powerful, but not very friendly to new students.
Aim : To create a web application with a user-friendly interface that allows new students to toy with various concepts and get visual feedback

 

 User Stories

*All animations, vectors and vector spaces will be plotted on a 3D grid representing the Euclidean space.


Admin
	

    As a student, I should be able to rotate the 3D grid and the lines / planes / vector drawn on it
    After rotating the grid, I should be able to reset the camera to a default view. 

Vectors
	

    As a student, I should be able to input a specific vector and view its geometric representation.
    As a student, I should be able to specify a linear combination of some vectors of my choice, and watch an animation constructing the resultant vector.

Spans
	

    As a student, I should be able to specify a set of vectors and see a visual representation of the span of this set of vectors (either a line, plane or the whole space). I should be able to watch a simple animation of the span being constructed.
    [Continuing from above] Next, I should be able to pick out a particular vector within the span and find out how this vector can be expressed in terms of the vectors I originally specified. 

Matrices
	

    As a student, I should be able to specify a 3-by-3 matrix A and a vector X, and see the resultant vector AX on the 3D grid.
    As a student, I should be able to specify a 3-by-3 matrix, and see the eigenspaces, range and nullspace of this matrix. Visualising the range is the same as user story 4.
    As a student, I should be able to specify a 3-by-3 matrix, and then restrict the domain to a subspace of the Euclidean space. Then, I should see the new range (instead of the entire range).

 
