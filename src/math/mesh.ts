import Vector3f from './vector3f'
import GeoMesh from './GeoMesh'

const meshup = (): GeoMesh => {
    const V = [new Vector3f([1, 1, -1])
        , new Vector3f([-1, 1, 1])
        , new Vector3f([1, -1, 1])
        , new Vector3f([-1, -1, -1])]
    const n = 10
    const c = [[0.1, 0.1, 0], [0, 0.1, 0.1], [0.1, 0, 0.1], [0.1, 0.1, 0.1]]
    const vertices = []
    const indices = []
    const colors = []
    const lines = []
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
            const BC = Vector3f.PointsOnArc(AB[i], AC[i], D, i)
            if (i < n) {
                BC[0] = Vector3f.RotateTo(BC[0], C, D, 60)
                BC[i] = Vector3f.RotateTo(BC[i], B, D, 60)
            } else {
                for (let j = 1; j < i; j++) {
                    BC[j] = Vector3f.RotateTo(BC[j], A, D, 60)
                }
            }
            for (const p of BC) {
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
    console.log(vertices)
    console.log(indices)
    for (let i = 0; i < indices.length; i += 3) {
        lines.push(indices[i])
        lines.push(indices[i + 1])
        lines.push(indices[i + 1])
        lines.push(indices[i + 2])
        lines.push(indices[i + 2])
        lines.push(indices[i])
    }
    return {
        vertices, indices, colors, lines
    }
}
const ringCut = (): GeoMesh => {
    const vertices: Array<number> = []
    const indices: Array<number> = []
    const colors: Array<number> = []
    const lines: Array<number> = []
    const V = [new Vector3f([1, 1, -1])
        , new Vector3f([-1, 1, 1])
        , new Vector3f([1, -1, 1])
        , new Vector3f([-1, -1, -1])]

    let n = 100
    let idx = 0;
    //axis
    for (let k = 0; k < 3; k++) {
        for (let z = -1/3; z < 1; z += 2 / 3) {

            for (let i = 0; i <= n; i++) {
                const theta = i * Math.PI * 2 /n
                const c = Math.cos(theta)
                const s = Math.sin(theta)
                let r = Infinity
                //sphere
                for (let j = 0; j < 4; j++) {
                    const cs = c * V[j]._val[(k + 1) % 3] + s * V[j]._val[(k + 2) % 3]
                    const cc = Math.sqrt(8 - Math.pow(z - V[j]._val[k], 2) - 1 - 1 + cs * cs)
                    r = Math.min(r, cc + cs)
                }
                const vv = [0, 0, 0]
                vv[k] = z
                vv[(k + 1) % 3] = c * r
                vv[(k + 2) % 3] = s * r
                vertices.push(...vv)
                colors.push(...[1.0, 1.0, 1.0])
            }
            for (let i = 0; i < n; i++) {
                lines.push(idx)
                lines.push(++idx)
            }
            lines.push(idx)
            lines.push(idx - n)
            idx++
        }

    }
    console.log(vertices)
    console.log(lines)
    return {
        vertices, indices, colors, lines
    }
}



export { meshup, ringCut }
