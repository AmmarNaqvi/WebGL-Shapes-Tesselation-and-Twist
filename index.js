var vertices = [];
var vcolors = [];
var lastDrawnShapes = [];
var shapeIndex = 0;
var FizzyText = function() {
	this.shapes = shape;
	this.size = size;
	this.rotation = rotation;
	this.tessellation = tessellation;
  	this.randomColors = randomColors;
	this.color = color;
	this.undo = undo;
	this.redo = redo;
	this.clear = clear;
};

var tessellation = 0;
var rotation = 0;
var shape = 'triangle';
var size = 0.3;
var color = [Math.random() * 256, Math.random() * 256, Math.random() * 256, 1];
var randomColors = false;
var undo = false;
var redo = false;
var clear = false;

function main() {
  	var canvas = document.getElementById('webgl');
	var gl = getWebGLContext(canvas);
	if (!gl){
		console.log('Failed to find context');
	}
	
	var program = initShaders( gl, "vertex-shader", "fragment-shader" );
	gl.useProgram (program);
	gl.program = program;

	var tapCoordinates = [];
	var tapCoordinatesBackup = [];	
	canvas.onmousedown = function(ev) {click(ev, program, gl, canvas, tapCoordinates);};

	var text = new FizzyText();
	var gui = new dat.GUI();

	var shapesController = gui.add(text, 'shapes', ['line', 'triangle', 'quad', 'circle', 'pentagon', 'hexagon', 'octagon']);
	var sizeController = gui.add(text, 'size', 0.1, 0.5);
	var tessellationController = gui.add(text, 'tessellation', 0, 5).step(1);
	var rotationController = gui.add(text, 'rotation', 0, 360).step(1);
  	var colorController = gui.addColor(text, 'color');
  	var randomColorsController = gui.add(text, 'randomColors');
   	var undoController = gui.add(text, 'undo').listen();
   	var redoController = gui.add(text, 'redo').listen();
   	var clearController = gui.add(text, 'clear').listen();
 	
	var update = function() {
	  requestAnimationFrame(update);
	  text.undo = false;
	  text.redo = false;
	  text.clear = false;
	};

	shapesController.onChange(function (value) {
		shape = value;
	})
	tessellationController.onChange(function(value) {
		tessellation = value;
		vertices = [];
		
		for (var i = 0; i < tapCoordinates.length; i+=6) {
			tessellate([tapCoordinates[i], tapCoordinates[i+1]], [tapCoordinates[i+2], tapCoordinates[i+3]], [tapCoordinates[i+4], tapCoordinates[i+5]], tessellation);
		}
		numberOfVertices = initVertices(program, gl);
		render(gl, numberOfVertices);
	});
	rotationController.onChange(function(value) {
		rotation = value;
		numberOfVertices = initVertices(program, gl);
		initRotations(program, gl);
		render(gl, numberOfVertices);
	});
	sizeController.onChange(function(value) {
		size = value;
	});
	colorController.onChange(function(value) {
		if (value[0] != '#') {
			color = value;			
		}
	});
	randomColorsController.onChange(function(value) {
		randomColors = value;
	});
	undoController.onChange(function(value) {
		undo = value;
		update();
		if (lastDrawnShapes.length < 1) {
			return;
		}
		var lastDrawnShape = lastDrawnShapes[shapeIndex];
		shapeIndex--;		
		if (lastDrawnShape == 'triangle') {
			for (var i = 0; i < 6; i++) {
				tapCoordinatesBackup.push(tapCoordinates.pop());
			}
		}	
		else if (lastDrawnShape == 'quad') {
			for (var i = 0; i < 6 * 2; i++) {
				tapCoordinatesBackup.push(tapCoordinates.pop());
			}
		}	
		else if (lastDrawnShape == 'circle') {
			for (var i = 0; i < 6 * 50; i++) {
				tapCoordinatesBackup.push(tapCoordinates.pop());
			}
		}
		else if (lastDrawnShape == 'pentagon') {
			for (var i = 0; i < 6 * 5; i++) {
				tapCoordinatesBackup.push(tapCoordinates.pop());
			}
		}
		else if (lastDrawnShape == 'hexagon') {
			for (var i = 0; i < 6 * 6; i++) {
				tapCoordinatesBackup.push(tapCoordinates.pop());
			}
		}
		else if (lastDrawnShape == 'octagon') {
			for (var i = 0; i < 6 * 8; i++) {
				tapCoordinatesBackup.push(tapCoordinates.pop());
			}
		}

		vertices = [];
		for (var i = 0; i < tapCoordinates.length; i+=6) {
			tessellate([tapCoordinates[i], tapCoordinates[i+1]], [tapCoordinates[i+2], tapCoordinates[i+3]], [tapCoordinates[i+4], tapCoordinates[i+5]], tessellation);
		}
		numberOfVertices = initVertices(program, gl);
		render(gl, numberOfVertices);
	});

	redoController.onChange(function(value) {
		redo = value;
		update();
		if (lastDrawnShapes.length < 1) {
			return;
		}
		shapeIndex++;		
		var lastRemovedShape = lastDrawnShapes[shapeIndex];
		if (lastRemovedShape == 'triangle') {
			for (var i = 0; i < 6; i++) {
				tapCoordinates.push(tapCoordinatesBackup.pop());
			}
		}
		else if (lastRemovedShape == 'quad') {
			for (var i = 0; i < 6 * 2; i++) {
				tapCoordinates.push(tapCoordinatesBackup.pop());
			}
		}
		else if (lastRemovedShape == 'circle') {
			for (var i = 0; i < 6 * 50; i++) {
				tapCoordinates.push(tapCoordinatesBackup.pop());
			}
		}
		else if (lastRemovedShape == 'pentagon') {
			for (var i = 0; i < 6 * 5; i++) {
				tapCoordinates.push(tapCoordinatesBackup.pop());
			}
		}
		else if (lastRemovedShape == 'hexagon') {
			for (var i = 0; i < 6 * 6; i++) {
				tapCoordinates.push(tapCoordinatesBackup.pop());
			}
		}
		else if (lastRemovedShape == 'octagon') {
			for (var i = 0; i < 6 * 8; i++) {
				tapCoordinates.push(tapCoordinatesBackup.pop());
			}
		}
		vertices = [];
		for (var i = 0; i < tapCoordinates.length; i+=6) {
			tessellate([tapCoordinates[i], tapCoordinates[i+1]], [tapCoordinates[i+2], tapCoordinates[i+3]], [tapCoordinates[i+4], tapCoordinates[i+5]], tessellation);
		}
		numberOfVertices = initVertices(program, gl);
		render(gl, numberOfVertices);
	});
	clearController.onChange(function(value) {
		clear = value;
		update();
		vertices = [];
		tapCoordinates = [];
		tapCoordinatesBackup = [];
		vcolors = [];
		gl.clearColor(0.0, 0.0, 0.0, 1.0);
		gl.clear(gl.COLOR_BUFFER_BIT);
	});

	gl.clearColor(0.0, 0.0, 0.0, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT);
}

function click(ev, program, gl, canvas, tapCoordinates){
	var x = ev.clientX; // x coordinate of a mouse pointer
	var y = ev.clientY; // y coordinate of a mouse pointer
	var rect = ev.target.getBoundingClientRect();

	x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
	y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);

	var i = tapCoordinates.length;

	if (shape == 'triangle') {
		drawTriangle(x, y, size, tapCoordinates);
	} else if (shape == 'quad') {
		drawSquare(x, y, size, tapCoordinates);
	} else if (shape == 'circle') {
		drawCircle(x, y, size, tapCoordinates, 50);
	} else if (shape == 'pentagon') {
		drawCircle(x, y, size, tapCoordinates, 5);
	} else if (shape == 'hexagon') {
		drawCircle(x, y, size, tapCoordinates, 6);
	} else if (shape == 'octagon') {
		drawCircle(x, y, size, tapCoordinates, 8);
	}

	shapeIndex++;
	lastDrawnShapes.push(shape);

	for (i; i < tapCoordinates.length; i+=6) {
		tessellate([tapCoordinates[i], tapCoordinates[i+1]], [tapCoordinates[i+2], tapCoordinates[i+3]], [tapCoordinates[i+4], tapCoordinates[i+5]], tessellation);
	}

	var numberOfVertices = initVertices(program, gl);
	initRotations(program, gl);	

	render(gl, numberOfVertices);

}

function drawTriangle(x, y, size, tapCoordinates) {
	tapCoordinates.push(x - size);
	tapCoordinates.push(y - size);
	tapCoordinates.push(x + size);
	tapCoordinates.push(y - size);
	tapCoordinates.push(x);
	tapCoordinates.push(y + size);
}

function drawSquare(x, y, size, tapCoordinates) {
	tapCoordinates.push(x - size);
	tapCoordinates.push(y - size);
	tapCoordinates.push(x + size);
	tapCoordinates.push(y + size);
	tapCoordinates.push(x + size);
	tapCoordinates.push(y - size);
	tapCoordinates.push(x - size);
	tapCoordinates.push(y - size);
	tapCoordinates.push(x + size);
	tapCoordinates.push(y + size);	
	tapCoordinates.push(x - size);
	tapCoordinates.push(y + size);
}

function drawCircle(cx, cy, size, tapCoordinates, sides) {
	var r = size;

	var theta = 2*Math.PI/sides;

	var x = [] ,
		y = [];

	x[0] = cx + r;
	y[0] = cy;

	for (var j=1; j<sides; j++)
	{
		x[j]=cx+Math.cos(theta * j) * r;
		y[j]=cy+Math.sin(theta * j) * r;

		tapCoordinates.push(x[j-1], y[j-1], x[j], y[j], cx, cy);
	}

	tapCoordinates.push(x[sides-1], y[sides-1], x[0], y[0], cx, cy);
}


function tessellate(a, b, c, tessellation) {
    if (tessellation === 0)
    {	
    	vertices.push(a[0], a[1], b[0], b[1], c[0], c[1]);
    	var r, g, b;
    	if (randomColors == true) {
    		r = Math.random();
    		g = Math.random();
    		b = Math.random();
    	} else {
    		r = color[0]/256;
    		g = color[1]/256;
    		b = color[2]/256;
    	}
    	for (var i = 0; i < 3; i++) {
    		vcolors.push(r, g, b, 1);
    	}
    	return;
    }

    var ab = midpoint(a, b);
    var ac = midpoint(a, c);
    var bc = midpoint(b, c);    

    tessellate(a, ab, ac, tessellation - 1)
    tessellate(c, ac, bc, tessellation - 1)
    tessellate(b, bc, ab, tessellation - 1)
    tessellate(ab, ac, bc, tessellation - 1)

}

function midpoint(a, b) {
	var abx = (a[0] + b[0]) / 2;
	var aby = (a[1] + b[1]) / 2;
	return [abx, aby];
}

function initTransformations(gl, modelMatrix){
	var transformationMatrix = gl.getUniformLocation(gl.program, 'transformationMatrix');
	gl.uniformMatrix4fv(transformationMatrix, false, flatten(modelMatrix));	

}

function render (gl, numberOfVertices){
	gl.clearColor(0.0, 0.0, 0.0, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT);

	initTransformations(gl, mvMatrix );
	gl.drawArrays(gl.TRIANGLES, 0, numberOfVertices);
}

function initRotations(program, gl) {
	gl.uniform1f(gl.getUniformLocation(program, "inRotation"), glMatrix.toRadian(rotation));
}

function initVertices(program, gl){
	var noOfDim = 2;
	var numberOfVertices = vertices.length / noOfDim;

	var colorItemSize = 4;

	
	var vertexBuffer = gl.createBuffer();
	if (!vertexBuffer){ console.log('Failed to create the buffer object ');	return -1;}
	
	gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.DYNAMIC_DRAW);
	
	var a_Position = gl.getAttribLocation(program, 'a_Position');
	if (a_Position < 0) { console.log ("Failed to Get Position"); return;	}
	
	gl.vertexAttribPointer(a_Position, noOfDim, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(a_Position);

	// setting up color (Complete vertex position initialization before starting color attribute)
	var colorBuffer = gl.createBuffer();
	if (!colorBuffer){ console.log('Failed to create the buffer object ');	return -1;}
	gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, flatten(vcolors), gl.DYNAMIC_DRAW);

	var a_Color = gl.getAttribLocation(program, "a_Color");
	if (a_Color < 0) { console.log ("Failed to Get Color"); return;	}
		
	gl.vertexAttribPointer(a_Color, colorItemSize, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(a_Color);
	
	return numberOfVertices;
}

