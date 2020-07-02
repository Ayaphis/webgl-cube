import React, { useState, useEffect } from 'react'
import './App.css'
import Matrix4f from './math/matrix'
import GeoMesh from './math/GeoMesh'
import { meshup, ringCut } from './math/mesh'

// //eslint-disable-next-line
// import vertSource from './shaders/vertices-shader.glsl'
// //eslint-disable-next-line
// import fragSource from 'raw-loader!./shaders/fragment-shader.glsl'
// console.log(vertSource)
// console.log(require(vertSource))


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

    cancelAnimationFrame(nextFrame)
    if (canvas == null) {
      return
    }
    canvas.width = width
    canvas.height = height
    const gl = canvas.getContext("webgl")
    if (gl == null) {
      return
    }




    //compile and use glsl
    const vertShader = gl.createShader(gl.VERTEX_SHADER)
    if (vertShader == null) {
      return
    }

    gl.shaderSource(vertShader, `attribute vec3 coordinates;
    uniform mat4 Pmatrix;
    uniform mat4 Vmatrix;
    uniform mat4 Mmatrix;
    uniform mat4 Lmatrix;
    attribute vec3 color;
    varying vec3 vColor;
    void main(void){
        gl_Position = Pmatrix*Vmatrix*Mmatrix*Lmatrix*vec4(coordinates, 1.0);
        gl_PointSize = 8.0;
        vColor = color;
    }`)
    gl.compileShader(vertShader)
    // console.log(vertSource)
    const fragShader = gl.createShader(gl.FRAGMENT_SHADER)
    if (fragShader == null) {
      return
    }
    gl.shaderSource(fragShader, `precision mediump float;
    varying vec3 vColor;
    void main(void) {
        gl_FragColor = vec4(vColor,0.5);
        //vec4(0.1, 0.0, 0.0, 0.1);
    }`)
    gl.compileShader(fragShader)
    // console.log(fragSource)
    const shaderProgram = gl.createProgram()
    if (shaderProgram == null) {
      return
    }
    gl.attachShader(shaderProgram, vertShader)
    gl.attachShader(shaderProgram, fragShader)
    gl.linkProgram(shaderProgram)
    gl.useProgram(shaderProgram)


    //para handles
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


    //model
    const Model = meshup()
    const Lines = ringCut()

    const bindMesh = (mesh: GeoMesh) => {
      //bind model data to buffer
      const vertexBuffer = gl.createBuffer()
      gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer)
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(mesh.vertices), gl.STATIC_DRAW)
      gl.bindBuffer(gl.ARRAY_BUFFER, null)

      const colorBuffer = gl.createBuffer()
      gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer)
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(mesh.colors), gl.STATIC_DRAW)
      gl.bindBuffer(gl.ARRAY_BUFFER, null)

      const indexBuffer = gl.createBuffer()
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer)
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(mesh.indices), gl.STATIC_DRAW)
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null)

      const lineBuffer = gl.createBuffer()
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, lineBuffer)
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(mesh.lines), gl.STATIC_DRAW)
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null)
      return {
        moveMatrix: Matrix4f.getEye(),
        indexBuffer,
        lineBuffer,
        vertexBuffer,
        colorBuffer,
        length: mesh.indices.length == 0 ? mesh.lines.length : mesh.indices.length 
      }
    }




    const mesh = bindMesh(Model)
    const line = bindMesh(Lines)

    //scene    
    const matrices: MatrixParams = {
      projectMatrix: Matrix4f.getProjection(40, width / height, 1, 100),
      viewMatrix: Matrix4f.getEye(),
      moveMatrix: Matrix4f.getEye(),
    }
    // matrices.moveMatrix.rotateX(0.2)
    matrices.viewMatrix._val[14] -= 6


    console.log("GOGOGO")


    draw({ gl, shaderProgram, matrices, forms, mesh, line })
  }




  const draw = (woker: DrawWorker)
    : void => {
    const { gl, shaderProgram,
      matrices, forms, mesh, line } = woker
    matrices.moveMatrix.rotateY(0.01)
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
    gl.drawElements(gl.TRIANGLES, mesh.length, gl.UNSIGNED_SHORT, 0)
    // gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, mesh.indexBuffer)
    // gl.drawElements(gl.POINTS, mesh.indices.length, gl.UNSIGNED_SHORT, 0)
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, mesh.lineBuffer)
    gl.drawElements(gl.LINES, mesh.length * 2, gl.UNSIGNED_SHORT, 0)

    
    gl.uniformMatrix4fv(forms.Lmatrix, false, mesh.moveMatrix._val)
    gl.bindBuffer(gl.ARRAY_BUFFER, line.vertexBuffer)
    gl.vertexAttribPointer(forms.coord, 3, gl.FLOAT, false, 0, 0)

    gl.bindBuffer(gl.ARRAY_BUFFER, line.colorBuffer)
    gl.vertexAttribPointer(forms.color, 3, gl.FLOAT, false, 0, 0)

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,  line.lineBuffer)
    gl.drawElements(gl.LINES, line.length, gl.UNSIGNED_SHORT, 0)
    // console.log(mesh)
    // console.log("DRAW")
    nextFrame = requestAnimationFrame(() => draw(woker))

  }


  return (
    <canvas ref={onCanvasLoaded} className="App" />
  )

}
let nextFrame = -1

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
  lineBuffer: WebGLBuffer | null
  length: number
}
interface DrawWorker {
  gl: WebGLRenderingContext
  shaderProgram: WebGLProgram
  matrices: MatrixParams
  forms: FormLocations
  mesh: Mesh
  line: Mesh
}

export default App
