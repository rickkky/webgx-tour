struct Vertex {
  @location(0) position: vec2f,
};

struct Varing {
  @builtin(position) position: vec4f,
  @location(0) color: vec4f,
};

@group(0) @binding(0) var<storage, read> scalings: array<f32>;
@group(0) @binding(1) var<storage, read> offsets: array<vec2f>;
@group(0) @binding(2) var<storage, read> colors: array<vec4f>;
@group(0) @binding(3) var<uniform> resolution: vec2f;

@vertex fn vs(
  vertex: Vertex,
  @builtin(vertex_index) vertexIndex: u32,
  @builtin(instance_index) instanceIndex: u32
) -> Varing {
  let scaling = scalings[instanceIndex];
  let offset = offsets[instanceIndex];
  let trans = vertex.position * scaling + resolution / 2.0 + offset;
  let clip = (trans / resolution * 2.0 - 1.0) * vec2f(1.0, -1.0);

  var varing: Varing;
  varing.position = vec4f(clip, 0.0, 1.0);
  varing.color = colors[instanceIndex * 3 + vertexIndex];
  return varing;
}

@fragment fn fs(@location(0) color: vec4f) -> @location(0) vec4f {
  return color;
}
