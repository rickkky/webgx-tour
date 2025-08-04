import { WebGLRenderer } from '@/common/renderer';
import { signal } from '@/common/signal';
import { bindSignal } from '@/common/pane';
import { createProgram } from '@/common/webgl';
import { kernels } from './data';
import vertexSource from './vertex.glsl';
import fragmentSource from './fragment.glsl';
import imageSource from '@/assets/leaves.jpg';

async function loadImage(
  src: string | { src: string },
): Promise<HTMLImageElement> {
  const url = typeof src === 'string' ? src : src.src;
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

class Renderer extends WebGLRenderer {
  kernel1 = signal('normal');
  kernel2 = signal('normal');
  kernel3 = signal('normal');

  initPane() {
    const folder = this.pane!.addFolder({
      title: 'State',
    });

    bindSignal(folder, this.kernel1, {
      options: {
        list: Object.keys(kernels),
      },
    });
    bindSignal(folder, this.kernel2, {
      options: {
        list: Object.keys(kernels),
      },
    });
    bindSignal(folder, this.kernel3, {
      options: {
        list: Object.keys(kernels),
      },
    });
  }

  initRender() {
    // Load image
    const imagePromise = loadImage(imageSource);

    // Create program
    const program = createProgram(this.context, vertexSource, fragmentSource);
    this.context.useProgram(program);

    // Set up vertex attributes
    const vao = this.context.createVertexArray();
    this.context.bindVertexArray(vao);

    // Position attribute
    const positionLocation = this.context.getAttribLocation(
      program,
      'a_position',
    );
    const positionBuffer = this.context.createBuffer();

    // Texture coordinate attribute
    const texCoordLocation = this.context.getAttribLocation(
      program,
      'a_texCoord',
    );
    const texCoordBuffer = this.context.createBuffer();

    // Uniform locations
    const resolutionLocation = this.context.getUniformLocation(
      program,
      'u_resolution',
    );
    const flipYLocation = this.context.getUniformLocation(program, 'u_flipY');
    const imageLocation = this.context.getUniformLocation(program, 'u_image');
    this.context.uniform1i(imageLocation, 0);

    // Kernel uniforms
    const kernelLocation = this.context.getUniformLocation(
      program,
      'u_kernel[0]',
    );
    const kernelWeightLocation = this.context.getUniformLocation(
      program,
      'u_kernelWeight',
    );

    // Textures and framebuffers
    const textures: WebGLTexture[] = [];
    const framebuffers: WebGLFramebuffer[] = [];
    let originalTexture: WebGLTexture;

    // Create and setup texture function
    const createAndSetupTexture = () => {
      const texture = this.context.createTexture();
      this.context.bindTexture(this.context.TEXTURE_2D, texture);
      this.context.texParameteri(
        this.context.TEXTURE_2D,
        this.context.TEXTURE_WRAP_S,
        this.context.CLAMP_TO_EDGE,
      );
      this.context.texParameteri(
        this.context.TEXTURE_2D,
        this.context.TEXTURE_WRAP_T,
        this.context.CLAMP_TO_EDGE,
      );
      this.context.texParameteri(
        this.context.TEXTURE_2D,
        this.context.TEXTURE_MIN_FILTER,
        this.context.NEAREST,
      );
      this.context.texParameteri(
        this.context.TEXTURE_2D,
        this.context.TEXTURE_MAG_FILTER,
        this.context.NEAREST,
      );
      return texture;
    };

    // Compute kernel weight function
    const computeKernelWeight = (kernel: number[]) => {
      const weight = kernel.reduce((sum, value) => sum + value, 0);
      return weight <= 0 ? 1 : weight;
    };

    // Set framebuffer function
    const setFrameBuffer = (
      fbo: WebGLFramebuffer | null,
      width: number,
      height: number,
    ) => {
      this.context.bindFramebuffer(this.context.FRAMEBUFFER, fbo);
      this.context.uniform2f(resolutionLocation, width, height);
      this.context.viewport(0, 0, width, height);
    };

    // Draw with kernel function
    const drawWithKernel = (name: string) => {
      const kernel = kernels[name as keyof typeof kernels];
      this.context.uniform1fv(kernelLocation, kernel);
      this.context.uniform1f(kernelWeightLocation, computeKernelWeight(kernel));
      this.context.drawArrays(this.context.TRIANGLES, 0, 6);
    };

    // Draw effects function
    const drawEffects = (effects: string[], image: HTMLImageElement) => {
      this.context.activeTexture(this.context.TEXTURE0 + 0);
      this.context.bindTexture(this.context.TEXTURE_2D, originalTexture);
      this.context.uniform1f(flipYLocation, 1);
      let count = 0;
      for (let i = 0; i < effects.length; i++) {
        setFrameBuffer(framebuffers[count % 2], image.width, image.height);
        drawWithKernel(effects[i]);
        this.context.bindTexture(this.context.TEXTURE_2D, textures[count % 2]);
        count += 1;
      }
      this.context.uniform1f(flipYLocation, -1);
      setFrameBuffer(
        null,
        this.context.canvas.width,
        this.context.canvas.height,
      );
      drawWithKernel('normal');
    };

    // Render function
    return async () => {
      // Wait for image to load
      const image = await imagePromise;

      // Set up position buffer data
      const positions = [
        0,
        0,
        image.width,
        0,
        0,
        image.height,
        0,
        image.height,
        image.width,
        0,
        image.width,
        image.height,
      ];
      this.context.enableVertexAttribArray(positionLocation);
      this.context.bindBuffer(this.context.ARRAY_BUFFER, positionBuffer);
      this.context.bufferData(
        this.context.ARRAY_BUFFER,
        new Float32Array(positions),
        this.context.STATIC_DRAW,
      );
      this.context.vertexAttribPointer(
        positionLocation,
        2,
        this.context.FLOAT,
        false,
        0,
        0,
      );

      // Set up texture coordinate buffer data
      const texCoords = [0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1];
      this.context.enableVertexAttribArray(texCoordLocation);
      this.context.bindBuffer(this.context.ARRAY_BUFFER, texCoordBuffer);
      this.context.bufferData(
        this.context.ARRAY_BUFFER,
        new Float32Array(texCoords),
        this.context.STATIC_DRAW,
      );
      this.context.vertexAttribPointer(
        texCoordLocation,
        2,
        this.context.FLOAT,
        false,
        0,
        0,
      );

      // Create original texture if not already created
      if (!originalTexture) {
        originalTexture = createAndSetupTexture();
        this.context.texImage2D(
          this.context.TEXTURE_2D,
          0,
          this.context.RGBA,
          this.context.RGBA,
          this.context.UNSIGNED_BYTE,
          image,
        );

        // Create textures and framebuffers
        for (let i = 0; i < 2; i++) {
          const texture = createAndSetupTexture()!;
          textures.push(texture);
          this.context.texImage2D(
            this.context.TEXTURE_2D,
            0,
            this.context.RGBA,
            image.width,
            image.height,
            0,
            this.context.RGBA,
            this.context.UNSIGNED_BYTE,
            null,
          );

          const fbo = this.context.createFramebuffer()!;
          framebuffers.push(fbo);
          this.context.bindFramebuffer(this.context.FRAMEBUFFER, fbo);

          this.context.framebufferTexture2D(
            this.context.FRAMEBUFFER,
            this.context.COLOR_ATTACHMENT0,
            this.context.TEXTURE_2D,
            texture,
            0,
          );
        }
      }

      // Set resolution uniform
      this.context.uniform2f(
        resolutionLocation,
        this.context.canvas.width,
        this.context.canvas.height,
      );

      // Clear canvas
      this.context.viewport(
        0,
        0,
        this.context.canvas.width,
        this.context.canvas.height,
      );
      this.context.clearColor(0, 0, 0, 0);
      this.context.clear(this.context.COLOR_BUFFER_BIT);

      // Draw effects
      drawEffects([this.kernel1(), this.kernel2(), this.kernel3()], image);
    };
  }
}

export default Renderer;
