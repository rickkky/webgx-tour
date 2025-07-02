export function compileShader(
  context: WebGL2RenderingContext,
  type: number,
  source: string,
) {
  const shader = context.createShader(type)!;
  context.shaderSource(shader, source);
  context.compileShader(shader);
  const success = context.getShaderParameter(shader, context.COMPILE_STATUS);
  if (!success) {
    const error = new Error(
      `Could not compile shader: \n\n${context.getShaderInfoLog(shader)}`,
    );
    context.deleteShader(shader);
    throw error;
  }
  return shader;
}

export function createProgram(
  context: WebGL2RenderingContext,
  vertexShader: WebGLShader | string,
  fragmentShader: WebGLShader | string,
) {
  const program = context.createProgram()!;
  if (typeof vertexShader === 'string') {
    vertexShader = compileShader(
      context,
      context.VERTEX_SHADER,
      vertexShader.trim(),
    );
  }
  if (typeof fragmentShader === 'string') {
    fragmentShader = compileShader(
      context,
      context.FRAGMENT_SHADER,
      fragmentShader.trim(),
    );
  }
  context.attachShader(program, vertexShader);
  context.attachShader(program, fragmentShader);
  context.linkProgram(program);
  const success = context.getProgramParameter(program, context.LINK_STATUS);
  if (!success) {
    const error = new Error(
      `Could create program: \n\n${context.getProgramInfoLog(program)}`,
    );
    context.deleteProgram(program);
    throw error;
  }
  return program;
}
