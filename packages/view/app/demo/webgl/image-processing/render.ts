import imageData from '@/assets/leaves.jpg';
import { loadImage } from '@/common/image';
import { bindSignal } from '@/common/pane';
import { WebGLRenderer } from '@/common/renderer';
import { effect, signal } from '@/common/signal';
import { createProgram } from '@/common/webgl';

import { kernelOptions, kernels } from './data';
import fragmentSource from './fragment.glsl';
import vertexSource from './vertex.glsl';

class Renderer extends WebGLRenderer {
  state = {
    kernel1: signal<keyof typeof kernels>('normal'),
    kernel2: signal<keyof typeof kernels>('normal'),
    kernel3: signal<keyof typeof kernels>('normal'),
    fitMode: signal<'contain' | 'cover'>('contain'), // 'contain' 或 'cover'
  };

  initPane() {
    const folder = this.pane!.addFolder({
      title: 'State',
    });
    bindSignal(folder, this.state.fitMode, {
      label: 'Fit Mode',
      options: {
        contain: 'contain',
        cover: 'cover',
      },
    });
    bindSignal(folder, this.state.kernel1, {
      label: 'Kernel 1',
      options: kernelOptions,
    });
    bindSignal(folder, this.state.kernel2, {
      label: 'Kernel 2',
      options: kernelOptions,
    });
    bindSignal(folder, this.state.kernel3, {
      label: 'Kernel 3',
      options: kernelOptions,
    });
  }

  async initRender() {
    const context = this.context;

    const program = createProgram(context, vertexSource, fragmentSource);
    context.useProgram(program);

    const vao = context.createVertexArray()!;
    context.bindVertexArray(vao);

    const image = await loadImage(imageData.src);

    // prettier-ignore
    const positions = [
      0,           0,
      image.width, 0,
      0,           image.height,

      0,           image.height,
      image.width, 0,
      image.width, image.height,
    ];
    const positionBuf = context.createBuffer();
    context.bindBuffer(context.ARRAY_BUFFER, positionBuf);
    context.bufferData(
      context.ARRAY_BUFFER,
      new Float32Array(positions),
      context.STATIC_DRAW,
    );
    const positionLoc = context.getAttribLocation(program, 'a_position');
    context.enableVertexAttribArray(positionLoc);
    context.vertexAttribPointer(positionLoc, 2, context.FLOAT, false, 0, 0);

    const texCoordBuf = context.createBuffer();
    context.bindBuffer(context.ARRAY_BUFFER, texCoordBuf);
    const texCoordLoc = context.getAttribLocation(program, 'a_texCoord');
    context.enableVertexAttribArray(texCoordLoc);

    const resolutionLoc = context.getUniformLocation(program, 'u_resolution')!;
    const flipYLoc = context.getUniformLocation(program, 'u_flipY')!;
    const imageLoc = context.getUniformLocation(program, 'u_image')!;
    const imageSizeLoc = context.getUniformLocation(program, 'u_imageSize')!;
    const fitModeLoc = context.getUniformLocation(program, 'u_fitMode')!;
    const kernelLoc = context.getUniformLocation(program, 'u_kernel[0]')!;
    const kernelWeightLoc = context.getUniformLocation(
      program,
      'u_kernelWeight',
    )!;

    context.uniform1i(imageLoc, 0);
    context.uniform2f(imageSizeLoc, image.width, image.height);
    context.uniform1i(fitModeLoc, -1);

    const createAndSetupTexture = () => {
      const texture = context.createTexture()!;
      context.bindTexture(context.TEXTURE_2D, texture);
      context.texParameteri(
        context.TEXTURE_2D,
        context.TEXTURE_WRAP_S,
        context.CLAMP_TO_EDGE,
      );
      context.texParameteri(
        context.TEXTURE_2D,
        context.TEXTURE_WRAP_T,
        context.CLAMP_TO_EDGE,
      );
      context.texParameteri(
        context.TEXTURE_2D,
        context.TEXTURE_MIN_FILTER,
        context.NEAREST,
      );
      context.texParameteri(
        context.TEXTURE_2D,
        context.TEXTURE_MAG_FILTER,
        context.NEAREST,
      );
      return texture;
    };

    const originalTexture = createAndSetupTexture();
    context.texImage2D(
      context.TEXTURE_2D,
      0,
      context.RGBA,
      context.RGBA,
      context.UNSIGNED_BYTE,
      image,
    );

    const textures: WebGLTexture[] = [];
    const framebufs: WebGLFramebuffer[] = [];
    for (let i = 0; i < 2; i++) {
      const texture = createAndSetupTexture();
      textures.push(texture);
      context.texImage2D(
        context.TEXTURE_2D,
        0,
        context.RGBA,
        image.width,
        image.height,
        0,
        context.RGBA,
        context.UNSIGNED_BYTE,
        null,
      );

      const fbo = context.createFramebuffer()!;
      framebufs.push(fbo);
      context.bindFramebuffer(context.FRAMEBUFFER, fbo);

      context.framebufferTexture2D(
        context.FRAMEBUFFER,
        context.COLOR_ATTACHMENT0,
        context.TEXTURE_2D,
        texture,
        0,
      );
    }

    const computeKernelWeight = (kernel: number[]) => {
      const weight = kernel.reduce((sum, value) => sum + value, 0);
      return weight <= 0 ? 1 : weight;
    };

    const drawWithKernel = (name: keyof typeof kernels) => {
      const kernel = kernels[name];
      context.uniform1fv(kernelLoc, kernel);
      context.uniform1f(kernelWeightLoc, computeKernelWeight(kernel));
      context.drawArrays(context.TRIANGLES, 0, 6);
    };

    const setFrameBuffer = (
      fbo: WebGLFramebuffer | null,
      width: number,
      height: number,
    ) => {
      context.bindFramebuffer(context.FRAMEBUFFER, fbo);
      context.uniform2f(resolutionLoc, width, height);
      context.viewport(0, 0, width, height);
    };

    const drawEffects = (effects: (keyof typeof kernels)[]) => {
      context.activeTexture(context.TEXTURE0);
      context.bindTexture(context.TEXTURE_2D, originalTexture);
      context.uniform1f(flipYLoc, 1);
      let count = 0;
      for (let i = 0; i < effects.length; i++) {
        setFrameBuffer(framebufs[count % 2], image.width, image.height);
        drawWithKernel(effects[i]);
        context.bindTexture(context.TEXTURE_2D, textures[count % 2]);
        count += 1;
      }
      context.uniform1f(flipYLoc, -1);
      setFrameBuffer(null, context.canvas.width, context.canvas.height);
      drawWithKernel('normal');
    };

    // prettier-ignore
    const texCoords = [
      0, 0,
      1, 0,
      0, 1,

      0, 1,
      1, 0,
      1, 1,
    ];
    context.bindBuffer(context.ARRAY_BUFFER, texCoordBuf);
    context.bufferData(
      context.ARRAY_BUFFER,
      new Float32Array(texCoords),
      context.STATIC_DRAW,
    );
    context.vertexAttribPointer(texCoordLoc, 2, context.FLOAT, false, 0, 0);

    context.bindVertexArray(null);

    effect(() => {
      context.viewport(0, 0, this.width(), this.height());

      context.uniform2f(resolutionLoc, this.width(), this.height());
    });

    effect(() => {
      let fitModeValue = -1;
      if (this.state.fitMode() === 'cover') {
        fitModeValue = 1;
      } else if (this.state.fitMode() === 'contain') {
        fitModeValue = 0;
      }
      context.uniform1i(fitModeLoc, fitModeValue);
    });

    return () => {
      context.viewport(0, 0, context.canvas.width, context.canvas.height);
      context.clearColor(0, 0, 0, 0);
      context.clear(context.COLOR_BUFFER_BIT);

      context.bindVertexArray(vao);
      drawEffects([
        this.state.kernel1(),
        this.state.kernel2(),
        this.state.kernel3(),
      ]);
    };
  }
}

export default Renderer;
