export function compileShader(
  gl: WebGL2RenderingContext,
  type: number,
  source: string,
) {
  const shader = gl.createShader(type)!;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  if (!success) {
    const error = new Error(
      `Could not compile shader: \n\n${gl.getShaderInfoLog(shader)}`,
    );
    gl.deleteShader(shader);
    throw error;
  }
  return shader;
}

export function createProgram(
  gl: WebGL2RenderingContext,
  vertexShader: WebGLShader | string,
  fragmentShader: WebGLShader | string,
) {
  const program = gl.createProgram()!;
  if (typeof vertexShader === 'string') {
    vertexShader = compileShader(gl, gl.VERTEX_SHADER, vertexShader);
  }
  if (typeof fragmentShader === 'string') {
    fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, fragmentShader);
  }
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  const success = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (!success) {
    const error = new Error(
      `Could create program: \n\n${gl.getProgramInfoLog(program)}`,
    );
    gl.deleteProgram(program);
    throw error;
  }
  return program;
}
