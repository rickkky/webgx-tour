#version 300 es

in vec2 a_position;
in float a_scaling;
in vec2 a_offset;

uniform vec2 u_resolution;

uniform sampler2D u_color_texture;
out vec4 v_color;

void main() {
  vec2 trans = a_position * a_scaling + u_resolution / 2.0f + a_offset;
  vec2 clip = (trans / u_resolution * 2.0f - 1.0f) * vec2(1, -1);
  gl_Position = vec4(clip, 0, 1);

  // Calculate color index using gl_InstanceID and gl_VertexID.
  int colorIndex = gl_InstanceID * 3 + gl_VertexID;
  int textureWidth = textureSize(u_color_texture, 0).x;
  int row = colorIndex / textureWidth;
  int col = colorIndex % textureWidth;
  // Fetch color directly from texture using integer coordinates.
  v_color = texelFetch(u_color_texture, ivec2(col, row), 0);
}
