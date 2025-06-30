#version 300 es

in vec2 a_position;
in vec4 a_color;

uniform vec2 u_resolution;

out vec4 v_color;

void main() {
  // Transform the input pixel position to clip space.
  // The input origin is the top-left corner of the canvas,
  // with x pointing right and y pointing down.
  // The clip space origin is the center of the canvas,
  // with x pointing right and y pointing up, range [-1, 1].
  vec2 positionClip = (a_position / u_resolution * 2.0 - 1.0) * vec2(1, -1);

  gl_Position = vec4(positionClip, 0, 1);

  v_color = a_color;
}
