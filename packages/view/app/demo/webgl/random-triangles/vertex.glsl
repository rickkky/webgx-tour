#version 300 es

in vec2 a_position;
in vec4 a_color;
in float a_scaling;
in vec2 a_offset;

uniform vec2 u_resolution;

out vec4 v_color;

void main() {
  vec2 trans = a_position * a_scaling + a_offset;
  vec2 clip = (trans / u_resolution * 2.0 - 1.0) * vec2(1, -1);

  gl_Position = vec4(clip, 0, 1);

  v_color = a_color;
}
