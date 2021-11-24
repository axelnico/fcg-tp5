
// <============================================ EJERCICIOS ============================================>
// a) Implementar la función:
//
//      GetModelViewMatrix( translationX, translationY, translationZ, rotationX, rotationY )
//
//    Si la implementación es correcta, podrán hacer rotar la caja correctamente (como en el video). Notar 
//    que esta función no es exactamente la misma que implementaron en el TP4, ya que no recibe por parámetro
//    la matriz de proyección. Es decir, deberá retornar solo la transformación antes de la proyección model-view (MV)
//    Es necesario completar esta implementación para que funcione el control de la luz en la interfaz. 
//    IMPORTANTE: No es recomendable avanzar con los ejercicios b) y c) si este no funciona correctamente. 
//
// b) Implementar los métodos:
//
//      setMesh( vertPos, texCoords, normals )
//      swapYZ( swap )
//      draw( matrixMVP, matrixMV, matrixNormal )
//
//    Si la implementación es correcta, podrán visualizar el objeto 3D que hayan cargado, asi como también intercambiar 
//    sus coordenadas yz. Notar que es necesario pasar las normales como atributo al VertexShader. 
//    La función draw recibe ahora 3 matrices en column-major: 
//
//       * model-view-projection (MVP de 4x4)
//       * model-view (MV de 4x4)
//       * normal transformation (MV_3x3)
//
//    Estas últimas dos matrices adicionales deben ser utilizadas para transformar las posiciones y las normales del 
//    espacio objeto al esapcio cámara. 
//
// c) Implementar los métodos:
//
//      setTexture( img )
//      showTexture( show )
//
//    Si la implementación es correcta, podrán visualizar el objeto 3D que hayan cargado y su textura.
//    Notar que los shaders deberán ser modificados entre el ejercicio b) y el c) para incorporar las texturas.
//  
// d) Implementar los métodos:
//
//      setLightDir(x,y,z)
//      setShininess(alpha)
//    
//    Estas funciones se llaman cada vez que se modifican los parámetros del modelo de iluminación en la 
//    interface. No es necesario transformar la dirección de la luz (x,y,z), ya viene en espacio cámara.
//
// Otras aclaraciones: 
//
//      * Utilizaremos una sola fuente de luz direccional en toda la escena
//      * La intensidad I para el modelo de iluminación debe ser seteada como blanca (1.0,1.0,1.0,1.0) en RGB
//      * Es opcional incorporar la componente ambiental (Ka) del modelo de iluminación
//      * Los coeficientes Kd y Ks correspondientes a las componentes difusa y especular del modelo 
//        deben ser seteados con el color blanco. En caso de que se active el uso de texturas, la 
//        componente difusa (Kd) será reemplazada por el valor de textura. 
//        
// <=====================================================================================================>

// Esta función recibe la matriz de proyección (ya calculada), una 
// traslación y dos ángulos de rotación (en radianes). Cada una de 
// las rotaciones se aplican sobre el eje x e y, respectivamente. 
// La función debe retornar la combinación de las transformaciones 
// 3D (rotación, traslación y proyección) en una matriz de 4x4, 
// representada por un arreglo en formato column-major. 

function GetModelViewMatrix( translationX, translationY, translationZ, rotationX, rotationY )
{
	// [COMPLETAR] Modificar el código para formar la matriz de transformación.

	// Matriz de rotacion en X
	var rotX = [
		1, 0, 0, 0,
		0, Math.cos(rotationX), Math.sin(rotationX), 0,
		0, -Math.sin(rotationX), Math.cos(rotationX),0,
		0, 0, 0, 1
	];

	// Matriz de rotacion en Y
	var rotY = [
		Math.cos(rotationY), 0, -Math.sin(rotationY), 0,
		0, 1, 0, 0,
		Math.sin(rotationY), 0, Math.cos(rotationY),0,
		0, 0, 0, 1
	];

	var rotationXY = MatrixMult(rotX, rotY);

	// Matriz de traslación
	var trans = [
		1, 0, 0, 0,
		0, 1, 0, 0,
		0, 0, 1, 0,
		translationX, translationY, translationZ, 1
	];

	return MatrixMult(trans, rotationXY);
}

// [COMPLETAR] Completar la implementación de esta clase.
class MeshDrawer
{
	// El constructor es donde nos encargamos de realizar las inicializaciones necesarias. 
	constructor()
	{
		// [COMPLETAR] inicializaciones

		this.prog = InitShaderProgram(meshVS, meshFS);

		// 1. Compilamos el programa de shaders
		
		// 2. Obtenemos los IDs de las variables uniformes en los shaders

		// 3. Obtenemos los IDs de los atributos de los vértices en los shaders

		this.mvp = gl.getUniformLocation(this.prog, 'mvp');

		this.mv = gl.getUniformLocation(this.prog, 'mv');

		this.swap = gl.getUniformLocation(this.prog, 'swap');

		this.matrixNormal = gl.getUniformLocation(this.prog, 'mn');

		this.ld = gl.getUniformLocation(this.prog, 'lightDirection');

		this.shininess = gl.getUniformLocation(this.prog, 'shininess');

		// Usado para determinar si se usa la textura o el color en el fragment shader
		this.useTexture = gl.getUniformLocation(this.prog, 'useTexture');

		this.pos = gl.getAttribLocation(this.prog, 'pos');

		this.coord = gl.getAttribLocation(this.prog, 'coord');

		this.norm = gl.getAttribLocation(this.prog, 'norm');

		// 4. Creamos los buffers
		
		this.buffer = gl.createBuffer();

		this.texCoordsbuffer = gl.createBuffer();

		this.normBuffer = gl.createBuffer();

		gl.useProgram(this.prog);
		// ...

		// Se usa esta matriz por defecto para la funcionalidad de invertir Y y Z que por defecto esta desactivada, por eso
		// usamos la matriz de identidad
		var identityMatrix = [1,0,0,0,
			0,1,0,0,
			0,0,1,0,
			0,0,0,1]
        gl.uniformMatrix4fv(this.swap, false, identityMatrix);

		gl.uniform1i(this.useTexture,0);

		this.textura = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D,this.textura);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([255,255,255,255]));

		// determina el estado del checkbox para mostrar o no la textura. Arranca por defecto encendido
		this.show = true;


	}
	
	// Esta función se llama cada vez que el usuario carga un nuevo
	// archivo OBJ. En los argumentos de esta función llegan un areglo
	// con las posiciones 3D de los vértices, un arreglo 2D con las
	// coordenadas de textura y las normales correspondientes a cada 
	// vértice. Todos los items en estos arreglos son del tipo float. 
	// Los vértices y normales se componen de a tres elementos 
	// consecutivos en el arreglo vertPos [x0,y0,z0,x1,y1,z1,..] y 
	// normals [n0,n0,n0,n1,n1,n1,...]. De manera similar, las 
	// cooredenadas de textura se componen de a 2 elementos 
	// consecutivos y se  asocian a cada vértice en orden. 
	setMesh( vertPos, texCoords, normals )
	{
		// [COMPLETAR] Actualizar el contenido del buffer de vértices y otros atributos..
		this.numTriangles = vertPos.length / 3 / 3;

		// 1. Binding y seteo del buffer de vértices

		gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertPos), gl.STATIC_DRAW);

		// 2. Binding y seteo del buffer de coordenadas de textura	

		gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordsbuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCoords), gl.STATIC_DRAW);

		// 3. Binding y seteo del buffer de normales
		gl.bindBuffer(gl.ARRAY_BUFFER, this.normBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);	
	}
	
	// Esta función se llama cada vez que el usuario cambia el estado del checkbox 'Intercambiar Y-Z'
	// El argumento es un boleano que indica si el checkbox está tildado
	swapYZ( swap )
	{
		// [COMPLETAR] Setear variables uniformes en el vertex shader
		gl.useProgram(this.prog);
		if (swap){
			var swap = [1,0,0,0,
			            0,0,1,0,
					    0,1,0,0,
					    0,0,0,1]
			gl.uniformMatrix4fv(this.swap, false, swap);
		} else {
			var identityMatrix = [1,0,0,0,
				                  0,1,0,0,
								  0,0,1,0,
								  0,0,0,1]
			gl.uniformMatrix4fv(this.swap, false, identityMatrix);
		}
	}
	
	// Esta función se llama para dibujar la malla de triángulos
	// El argumento es la matriz model-view-projection (matrixMVP),
	// la matriz model-view (matrixMV) que es retornada por 
	// GetModelViewProjection y la matriz de transformación de las 
	// normales (matrixNormal) que es la inversa transpuesta de matrixMV
	draw( matrixMVP, matrixMV, matrixNormal )
	{
		// [COMPLETAR] Completar con lo necesario para dibujar la colección de triángulos en WebGL
		
		// 1. Seleccionamos el shader

		gl.useProgram(this.prog);
	
		// 2. Setear uniformes con las matrices de transformaciones

		gl.uniformMatrix4fv(this.mvp, false, matrixMVP);

		gl.uniformMatrix4fv(this.mv, false, matrixMV);

		gl.uniformMatrix3fv(this.matrixNormal, false, matrixNormal);

   		// 3. Habilitar atributos: vértices, normales, texturas

		gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
	
		gl.vertexAttribPointer( this.pos, 3, gl.FLOAT, false, 0, 0 );
		gl.enableVertexAttribArray( this.pos );

		gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordsbuffer);

		gl.vertexAttribPointer( this.coord, 2, gl.FLOAT, false, 0, 0 );
		gl.enableVertexAttribArray( this.coord );

		gl.bindBuffer(gl.ARRAY_BUFFER, this.normBuffer);
	
		gl.vertexAttribPointer( this.norm, 3, gl.FLOAT, false, 0, 0 );
		gl.enableVertexAttribArray( this.norm );

		if(this.numTriangles > 0){
			gl.drawArrays( gl.TRIANGLES, 0, this.numTriangles * 3 );
		}
	}
	
	// Esta función se llama para setear una textura sobre la malla
	// El argumento es un componente <img> de html que contiene la textura. 
	setTexture( img )
	{
		// [COMPLETAR] Ahora que la textura ya está seteada, debemos setear 
		// parámetros uniformes en el fragment shader para que pueda usarla. 
		this.textureLoaded = true;
		gl.useProgram(this.prog);
		gl.bindTexture(gl.TEXTURE_2D, this.textura);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE,img);
		gl.generateMipmap(gl.TEXTURE_2D);
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, this.textura);
		var sampler = gl.getUniformLocation(this.prog,'texGPU');
		gl.uniform1i(sampler,0);
		// Si el checkbox para mostrar la textura esta marcado entonces usar la textura
		if(this.show){
			gl.uniform1i(this.useTexture,1);
		}
	}
		
        // Esta función se llama cada vez que el usuario cambia el estado del checkbox 'Mostrar textura'
	// El argumento es un boleano que indica si el checkbox está tildado
	showTexture( show )
	{
		// [COMPLETAR] Setear variables uniformes en el fragment shader para indicar si debe o no usar la textura
		gl.useProgram(this.prog);
		this.show = show;
		if (show && this.textureLoaded){
			gl.uniform1i(this.useTexture,1);
		} else {
			gl.uniform1i(this.useTexture,0);
		}
	}
	
	// Este método se llama al actualizar la dirección de la luz desde la interfaz
	setLightDir( x, y, z )
	{		
		// [COMPLETAR] Setear variables uniformes en el fragment shader para especificar la dirección de la luz
		gl.useProgram(this.prog);
		gl.uniform3fv(this.ld, [x,y,z]);
	}
		
	// Este método se llama al actualizar el brillo del material 
	setShininess( shininess )
	{		
		// [COMPLETAR] Setear variables uniformes en el fragment shader para especificar el brillo.
		gl.useProgram(this.prog);
		gl.uniform1f(this.shininess, shininess);
	}
}



// [COMPLETAR] Calcular iluminación utilizando Blinn-Phong.

// Recordar que: 
// Si declarás las variables pero no las usás, es como que no las declaraste
// y va a tirar error. Siempre va punto y coma al finalizar la sentencia. 
// Las constantes en punto flotante necesitan ser expresadas como x.y, 
// incluso si son enteros: ejemplo, para 4 escribimos 4.0.

// Vertex Shader
var meshVS = `
	attribute vec3 pos;
	attribute vec2 coord;
	attribute vec3 norm;
	uniform mat4 mvp;
	uniform mat4 mv;
	uniform mat4 swap;

	varying vec2 texCoord;
	varying vec3 normCoord;
	varying vec4 vertCoord;

	void main()
	{ 
		gl_Position = mvp * swap * vec4(pos,1);
		texCoord = coord;
		vertCoord = - (mv * vec4(pos,1));
		normCoord = norm;
	}
`;

// Fragment Shader
// Algunas funciones útiles para escribir este shader:
// Dot product: https://thebookofshaders.com/glossary/?search=dot
// Normalize:   https://thebookofshaders.com/glossary/?search=normalize
// Pow:         https://thebookofshaders.com/glossary/?search=pow

var meshFS = `
	precision mediump float;
	uniform sampler2D texGPU;
	uniform int useTexture;
	uniform mat3 mn;

	varying vec2 texCoord;
	varying vec3 normCoord;
	varying vec4 vertCoord;

	uniform vec3 lightDirection;

	uniform float shininess;

	vec4 kd;
	vec4 ks;
	vec4 i;
	vec4 v;
	vec3 n;
	float comp_difusa;
	vec4 h;
	float comp_especular;

	void main()
	{		
		kd = vec4(1,1,1,1);
		ks = vec4(1,1,1,1);
		i = vec4(1,1,1,1);
		if (useTexture != 0){
			kd = texture2D(texGPU,texCoord);
		}
		v = vertCoord;
		n = mn * normCoord;
		comp_difusa = dot(n,lightDirection);
		h = normalize(vec4(lightDirection,1) + v);
		comp_especular = dot(vec4(n,1),h);
		gl_FragColor = i * max(0.0,comp_difusa)*(kd + ks*pow(max(0.0,comp_especular),shininess)/comp_difusa);
	}
`;
