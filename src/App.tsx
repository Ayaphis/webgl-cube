import React, { useState, useEffect } from 'react'
import './App.css'
import Matrix4f from './math/matrix'
import Vector3f from './math/vector3f';


const getWindowSize = () => {
  const { innerWidth: width, innerHeight: height } = window;
  return { width, height };
};

const useGetWindowSize = () => {
  const [windowSize, setWindowSize] = useState(getWindowSize());
  useEffect(() => {
    const handleResize = () => {
      setWindowSize(getWindowSize());
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  return windowSize;
};





const App: React.FC = () => {
  const { width, height } = useGetWindowSize()
  const onCanvasLoaded = (canvas: HTMLCanvasElement) => {
    if (canvas == null) {
      return
    }
    canvas.width = width
    canvas.height = height
    const gl = canvas.getContext("webgl")
    if (gl == null) {
      return
    }
    if (nextFrame != null) {
      cancelAnimationFrame(nextFrame)
    }

    //mesh
    const meshup = () => {
      const V = [new Vector3f([1, 1, -1])
        , new Vector3f([-1, 1, 1])
        , new Vector3f([1, -1, 1])
        , new Vector3f([-1, -1, -1])]
      const n = 100
      const c = [[1,1,0],[0,1,1],[1,0,1],[1,1,1]]
      const vertices = []
      const indices = []
      const colors = []
      let idx = 0

      for (let k = 0; k < 4; k++) {
        const A = V[k]
        const B = V[(k + 1) % 4]
        const C = V[(k + 2) % 4]
        const D = V[(k + 3) % 4]
        const AB = Vector3f.PointsOnArc(A, B, D, n)
        const AC = Vector3f.PointsOnArc(A, C, D, n)

        let lastRow = [idx++]
        vertices.push(...A._val)
        colors.push(...c[k])
        for (let i = 1; i <= n; i++) {
          const newRow = []
          for (const p of Vector3f.PointsOnArc(AB[i], AC[i], D, i)) {
            vertices.push(...p._val)
            colors.push(...c[k])
            newRow.push(idx++)
          }
          for (let j = 1; j <= i; j++) {
            indices.push(newRow[j - 1])
            indices.push(lastRow[j - 1])
            indices.push(newRow[j])
          }
          for (let j = 1; j < i; j++) {
            indices.push(lastRow[j - 1])
            indices.push(newRow[j])
            indices.push(lastRow[j])
          }
          lastRow = newRow
        }
      }
      return {
        vertices, indices, colors
      }
    }

    const mm = meshup()
    console.log(mm.vertices)
    console.log(mm.indices)

    const vertShader = gl.createShader(gl.VERTEX_SHADER)
    if (vertShader == null) {
      return
    }
    gl.shaderSource(vertShader, `
    attribute vec3 coordinates;
    uniform mat4 Pmatrix;
    uniform mat4 Vmatrix;
    uniform mat4 Mmatrix;
    uniform mat4 Lmatrix;
    attribute vec3 color;
    varying vec3 vColor;
    void main(void){
        gl_Position = Pmatrix*Vmatrix*Mmatrix*Lmatrix*vec4(coordinates, 1.0);
        gl_PointSize = 10.0;
        vColor = color;
    }
    `)
    gl.compileShader(vertShader)

    const fragShader = gl.createShader(gl.FRAGMENT_SHADER)
    if (fragShader == null) {
      return
    }
    gl.shaderSource(fragShader, `        
    precision mediump float;
    varying vec3 vColor;
    void main(void) {
        gl_FragColor = vec4(vColor,1.0);
        //vec4(0.1, 0.0, 0.0, 0.1);
    }
    `)
    gl.compileShader(fragShader)

    const shaderProgram = gl.createProgram()
    if (shaderProgram == null) {
      return
    }
    gl.attachShader(shaderProgram, vertShader)
    gl.attachShader(shaderProgram, fragShader)
    gl.linkProgram(shaderProgram)
    gl.useProgram(shaderProgram)



    const coord = gl.getAttribLocation(shaderProgram, "coordinates")
    gl.enableVertexAttribArray(coord)

    const color = gl.getAttribLocation(shaderProgram, "color")
    gl.enableVertexAttribArray(color)

    const forms: FormLocations = {
      Pmatrix: gl.getUniformLocation(shaderProgram, "Pmatrix"),
      Vmatrix: gl.getUniformLocation(shaderProgram, "Vmatrix"),
      Mmatrix: gl.getUniformLocation(shaderProgram, "Mmatrix"),
      Lmatrix: gl.getUniformLocation(shaderProgram, "Lmatrix"),
      coord,
      color
    }

    const matrices: MatrixParams = {
      projectMatrix: Matrix4f.getProjection(40, width / height, 1, 100),
      viewMatrix: Matrix4f.getEye(),
      moveMatrix: Matrix4f.getEye(),
    }
    matrices.viewMatrix._val[14] -= 6

    const vertexBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(mm.vertices), gl.STATIC_DRAW)
    gl.bindBuffer(gl.ARRAY_BUFFER, null)

    const colorBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(mm.colors), gl.STATIC_DRAW)
    gl.bindBuffer(gl.ARRAY_BUFFER, null)

    const indexBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer)
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(mm.indices), gl.STATIC_DRAW)
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null)

    const mesh: Mesh = {
      moveMatrix: Matrix4f.getEye(),
      indexBuffer,
      vertexBuffer,
      colorBuffer,
      indices: mm.indices
    }
    console.log("GOGOGO")
    const draw = (gl: WebGLRenderingContext, shaderProgram: WebGLProgram,
      matrices: MatrixParams, forms: FormLocations, mesh: Mesh)
      : void => {
      mesh.moveMatrix.rotateY(0.01)
      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)
      // console.log(width, height)
      gl.enable(gl.DEPTH_TEST)
      gl.clearColor(0, 0, 0, 1)
      gl.clear(gl.COLOR_BUFFER_BIT)

      gl.useProgram(shaderProgram)
      gl.uniformMatrix4fv(forms.Pmatrix, false, matrices.projectMatrix._val)
      gl.uniformMatrix4fv(forms.Vmatrix, false, matrices.viewMatrix._val)
      gl.uniformMatrix4fv(forms.Mmatrix, false, matrices.moveMatrix._val)

      gl.uniformMatrix4fv(forms.Lmatrix, false, mesh.moveMatrix._val)



      gl.bindBuffer(gl.ARRAY_BUFFER, mesh.vertexBuffer)
      gl.vertexAttribPointer(forms.coord, 3, gl.FLOAT, false, 0, 0)

      gl.bindBuffer(gl.ARRAY_BUFFER, mesh.colorBuffer)
      gl.vertexAttribPointer(forms.color, 3, gl.FLOAT, false, 0, 0)


      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, mesh.indexBuffer)
      gl.drawElements(gl.TRIANGLES, mesh.indices.length, gl.UNSIGNED_SHORT, 0)

      // console.log(mesh)
      console.log("DRAW")
      nextFrame = requestAnimationFrame(() => draw(gl, shaderProgram, matrices, forms, mesh))

    }
    draw(gl, shaderProgram, matrices, forms, mesh)
  }

  let nextFrame = -1





  return (
    <canvas ref={onCanvasLoaded} className="App" />
  )

}


interface MatrixParams {
  projectMatrix: Matrix4f
  viewMatrix: Matrix4f
  moveMatrix: Matrix4f
}
interface FormLocations {
  Pmatrix: WebGLUniformLocation | null
  Vmatrix: WebGLUniformLocation | null
  Mmatrix: WebGLUniformLocation | null
  Lmatrix: WebGLUniformLocation | null
  coord: GLuint
  color: GLuint
}
interface Mesh {
  moveMatrix: Matrix4f
  indexBuffer: WebGLBuffer | null
  vertexBuffer: WebGLBuffer | null
  colorBuffer: WebGLBuffer | null
  indices: Array<number>
}

export default App
