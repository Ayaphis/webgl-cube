import Vector3f from './vector3f'

const meshup = ():GeoMesh => {
    const V = [new Vector3f([1, 1, -1])
        , new Vector3f([-1, 1, 1])
        , new Vector3f([1, -1, 1])
        , new Vector3f([-1, -1, -1])]
    const n = 10
    const c = [[1, 1, 0], [0, 1, 1], [1, 0, 1], [1, 1, 1]]
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
    console.log(vertices)
    console.log(indices)
    for (let i = 0; i < indices.length; i+=3){
        lines.push(indices[i])
        lines.push(indices[i+1])
        lines.push(indices[i+1])
        lines.push(indices[i+2])
        lines.push(indices[i+2])
        lines.push(indices[i])
    }
    return {
        vertices, indices, colors, lines
    }
}
interface GeoMesh {
    vertices: Array<number>
    indices: Array<number>
    colors: Array<number>
    lines: Array<number>
}

export default meshup