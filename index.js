const glsl = require('glslify')
const linspace = require('ndarray-linspace')
const vectorFill = require('ndarray-vector-fill')
const ndarray = require('ndarray')
const ease = require('eases/cubic-in-out')
require('regl')({onDone: require('fail-nicely')(run)})

function phyllotaxis (n) {
  const theta = Math.PI * (3 - Math.sqrt(5))
  return function (i) {
    let r = Math.sqrt(i / n)
    let th = i * theta
    return [
      r * Math.cos(th),
      r * Math.sin(th)
    ]
  }
}

function grid (n) {
  const rowlen = Math.round(Math.sqrt(n))
  return (i) => [
    -0.8 + 1.6 / rowlen * (i % rowlen),
    -0.8 + 1.6 / rowlen * Math.floor(i / rowlen)
  ]
}

function sine (n) {
  let xscale = 2 / (n - 1)
  return function (i) {
    let x = -1 + i * xscale
    return [x, Math.sin(x * Math.PI * 3) * 0.3]
  }
}

function spiral (n) {
  return function (i) {
    let t = Math.sqrt(i / (n - 1))
    return [
      t * Math.cos(t * Math.PI * 40),
      t * Math.sin(t * Math.PI * 40)
    ]
  }
}

function run (regl) {
  let n = 100000
  let datasets = []
  let colorBasis
  let datasetPtr = 0

  let pointRadius = 3

  let lastSwitchTime = 0
  let switchInterval = 2
  let switchDuration = 1

  const createDatasets = () => {
    // This is a cute little pattern that *either* creates a buffer or updates
    // the existing buffer since both the constructor and the current instance
    // can be called as a function.
    datasets = [phyllotaxis, grid, sine, spiral].map((func, i) =>
      (datasets[i] || regl.buffer)(vectorFill(ndarray([], [n, 2]), func(n)))
    )
    // This is just a list from 1 to 0 for coloring:
    colorBasis = (colorBasis || regl.buffer)(linspace(ndarray([], [n]), 1, 0))
  }

  // Initialize:
  createDatasets()

  // Create nice controls:
  require('control-panel')([
    {type: 'range', min: 1, max: 10, label: 'radius', initial: pointRadius, step: 0.25},
    {type: 'range', min: 1000, max: 200000, label: 'n', initial: n, step: 1000}
  ], {width: 400}).on('input', (data) => {
    pointRadius = data.radius
    if (data.n !== n) {
      n = Math.round(data.n)
      createDatasets()
    }
  })

  const drawPoints = regl({
    vert: `
      precision mediump float;
      attribute vec2 xy0, xy1;
      attribute float basis;
      varying float t;
      uniform float aspect, interp, radius;
      void main () {
        t = basis;
        // Interpolate between the two positions:
        vec2 pos = mix(xy0, xy1, interp);
        gl_Position = vec4(pos.x, pos.y * aspect, 0, 1);
        gl_PointSize = radius;
      }
    `,
    frag: glsl(`
      precision mediump float;
      #pragma glslify: colormap = require(glsl-colormap/viridis)
      varying float t;
      void main () {
        gl_FragColor = colormap(t);
      }
    `),
    depth: {enable: false},
    attributes: {
      // Pass two buffers between which we ease in the vertex shader:
      xy0: () => datasets[datasetPtr % datasets.length],
      xy1: () => datasets[(datasetPtr + 1) % datasets.length],
      basis: () => colorBasis
    },
    uniforms: {
      radius: () => pointRadius,
      aspect: ctx => ctx.viewportWidth / ctx.viewportHeight,
      // The current interpolation position, from 0 to 1:
      interp: (ctx, props) => Math.max(0, Math.min(1, props.interp))
    },
    primitive: 'point',
    count: () => n
  })

  regl.frame(({time}) => {
    // Check how long it's been since the last switch, and cycle the buffers
    // and reset the timer if it's time for a switch:
    if ((time - lastSwitchTime) > switchInterval) {
      lastSwitchTime = time
      datasetPtr++
    }

    drawPoints({interp: ease((time - lastSwitchTime) / switchDuration)})
  })
}
