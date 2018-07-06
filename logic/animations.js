function linComboPlayable(vectorList) {
    
    this.conditions = [];
    this.actions = [];
    this.postActions = [];
    
    var conditions = this.conditions;
    var actions = this.actions;
    var postActions = this.postActions;
 
    vectorList.map(function(vectorObj) {

        var animatedObj = { };

        var vector = createVector(vectorObj.xCoord.value, vectorObj.yCoord.value, vectorObj.zCoord.value,
            new THREE.Vector3(0,0,0),0xff0066);

        /* add the endpoints of this vector as properties of the vector object */
        animatedObj.x = parseFloat(vectorObj.xCoord.value);
        animatedObj.y = parseFloat(vectorObj.yCoord.value);               
        animatedObj.z = parseFloat(vectorObj.zCoord.value);

        /* Store the created threeJS object into the animated object (will be needed in the reduction done later) */
        animatedObj.graphic = vector;
        
        /* Add the created threeJS object to the scene */
        allObjects.add(vector);
        
        /* obtain the intended scaling factor for this vector  */
        var scale = parseFloat(vectorObj.coeff.value)
        
        /* add a comparator that indicates if the scaling animation has been completed */
        conditions.push(() => { 
            return Math.floor(vector.scale.x) == scale;
        });
            
        /* add the action to be taken on each frame of animation */
        actions.push(() => {
            vector.scale.x += 0.05;
            vector.scale.y += 0.05;
            vector.scale.z += 0.05;

        });

        /* update the endpoints of this vector, after scaling */
        animatedObj.x = scale*animatedObj.x;
        animatedObj.y = scale*animatedObj.y;
        animatedObj.z = scale*animatedObj.z;
        
        /* add the postAction to be taken once the scaling animation is complete */
        postActions.push(() => {            
          vector.scale.set(scale, scale, scale);
         });
        
        return animatedObj;

    }).reduce(function(prevVector, nextVector) {
      
        /* use an interval of 180 steps --> complete animation in 3s */
        var numOfSteps = 180;
        var xDistance = nextVector.x - prevVector.graphic.position.x;
        var xStep = xDistance / numOfSteps;

        var yDistance = nextVector.y - prevVector.graphic.position.y;
        var yStep = yDistance / numOfSteps;

        var zDistance = nextVector.z - prevVector.graphic.position.z;
        var zStep = zDistance / numOfSteps;

        var translationCounter = 0;

        conditions.push(() => {
          //return ((Math.floor(prevVector.graphic.position.x) == nextVector.x) && (Math.floor(prevVector.graphic.position.y) == nextVector.y) && (Math.floor     (prevVector.graphic.position.z) == nextVector.z));
          return translationCounter == numOfSteps;    
        });

        actions.push(() => {
        
          prevVector.graphic.position.x += xStep;
          prevVector.graphic.position.y += yStep;
          prevVector.graphic.position.z += zStep;
          translationCounter++;
       
        });

        /* calculate resultant vector */
        var resX = prevVector.x + nextVector.x;
        var resY = prevVector.y + nextVector.y;
        var resZ = prevVector.z + nextVector.z;

        var resVector = createVector(resX, resY, resZ, new THREE.Vector3(0,0,0),0xff0066);

      
        postActions.push(() => {
          allObjects.add(resVector);
          allObjects.remove(prevVector.graphic);
          allObjects.remove(nextVector.graphic);

        });


        var resVectorObj = { };
        resVectorObj.graphic = resVector;
        resVectorObj.x = resX;
        resVectorObj.y = resY;
        resVectorObj.z = resZ;
        
        return resVectorObj;
    });      
          
      this.currentCondition = conditions[0];
      this.currentAction = actions[0];

      this.play = () => {
        
        if (actions.length == 0) {
          // remove this Playable from the head of the render queue 
          removeFromRenderQueue(this.play);
        } else {       
          if (this.currentCondition() == false) {
            // terminating condition not met, continue current animation
            this.currentAction();
          } else {
            // terminating condition met, proceed to next action      
            this.postActions[0]();
            this.postActions.shift();
                    
            this.conditions.shift();
            this.actions.shift();

            this.currentCondition = conditions[0];
            this.currentAction = actions[0];
          }
        }
      }

      renderQueue.unshift(this.play);

}


/* remove a given function from the render queue. 
   IMPORTANT: The given function MUST be present in the render queue */
function removeFromRenderQueue(funcToBeRemoved) {
    /* filter the renderQueue, so that only the target function is removed */   
    renderQueue = renderQueue.filter((renderFunction) => renderFunction !== funcToBeRemoved);
}

/* add this function to the renderQueue to rotate the grid about a specified axis */
function rotateGrid(axisToRotate) {
    axes.rotation[axisToRotate] += 0.01;
}
