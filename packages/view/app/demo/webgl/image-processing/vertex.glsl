#version 300 es

in vec2 a_position;
in vec2 a_texCoord;

uniform vec2 u_resolution;
uniform float u_flipY;
uniform vec2 u_imageSize;
uniform int u_fitMode; // -1 for no fit, 0 for contain, 1 for cover

out vec2 v_texCoord;

void main() {
  vec2 pos = a_position;

  if (u_fitMode >= 0) { // 如果指定了适配模式
    // 计算画布和图像的宽高比
    float canvasAspect = u_resolution.x / u_resolution.y;
    float imageAspect = u_imageSize.x / u_imageSize.y;

    if (u_fitMode == 1) { // cover mode
      if (canvasAspect > imageAspect) {
        // 画布更宽，以宽度为准
        float scale = u_resolution.x / u_imageSize.x;
        float offsetY = (u_resolution.y - u_imageSize.y * scale) * 0.5;
        pos = vec2(pos.x * scale, pos.y * scale + offsetY);
      } else {
        // 画布更高，以高度为准
        float scale = u_resolution.y / u_imageSize.y;
        float offsetX = (u_resolution.x - u_imageSize.x * scale) * 0.5;
        pos = vec2(pos.x * scale + offsetX, pos.y * scale);
      }
    } else { // contain mode
      if (canvasAspect < imageAspect) {
        // 画布更窄，以宽度为准
        float scale = u_resolution.x / u_imageSize.x;
        float offsetY = (u_resolution.y - u_imageSize.y * scale) * 0.5;
        pos = vec2(pos.x * scale, pos.y * scale + offsetY);
      } else {
        // 画布更宽，以高度为准
        float scale = u_resolution.y / u_imageSize.y;
        float offsetX = (u_resolution.x - u_imageSize.x * scale) * 0.5;
        pos = vec2(pos.x * scale + offsetX, pos.y * scale);
      }
    }
  }

  vec2 clip = (pos / u_resolution * 2.0 - 1.0) * vec2(1, u_flipY);
  gl_Position = vec4(clip, 0, 1);

  v_texCoord = a_texCoord;
}
