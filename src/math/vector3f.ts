class Vector3f {
    _val: Array<number>
    constructor(val: Array<number>) {
        this._val = val
    }
    static innerPoduct(a: Vector3f, b: Vector3f): number {
        return a._val[0] * b._val[0] + a._val[1] * b._val[1] + a._val[2] * b._val[2]
    }
    static diff(a: Vector3f, b: Vector3f): Vector3f {
        return new Vector3f([
            a._val[0] - b._val[0],
            a._val[1] - b._val[1],
            a._val[2] - b._val[2],
        ])
    }
    static sum(a: Vector3f, b: Vector3f): Vector3f {
        return new Vector3f([
            a._val[0] + b._val[0],
            a._val[1] + b._val[1],
            a._val[2] + b._val[2],
        ])
    }
    static scaled(a: Vector3f, x: number): Vector3f {
        return new Vector3f([
            a._val[0] * x,
            a._val[1] * x,
            a._val[2] * x,
        ])
    }
    mod2(): number {
        return Vector3f.innerPoduct(this, this)
    }
    sub(a: Vector3f): void {
        this._val[0] -= a._val[0]
        this._val[1] -= a._val[1]
        this._val[2] -= a._val[2]
    }
    add(a: Vector3f): void {
        this._val[0] += a._val[0]
        this._val[1] += a._val[1]
        this._val[2] += a._val[2]
    }
    scale(x: number): void {
        this._val[0] *= x
        this._val[1] *= x
        this._val[2] -= x
    }


    static PointsOnArc(from: Vector3f, to: Vector3f, origin: Vector3f, divide: number): Array<Vector3f> {
        const ans: Array<Vector3f> = []
        const A = Vector3f.diff(from, origin)
        const B = Vector3f.diff(to, origin)
        const theta = Math.acos(Vector3f.innerPoduct(A, B) / A.mod2())
        const delta = theta / divide        
        for (let i = 0; i <= divide; i++) {
            const y = Math.sin(i * delta) / Math.sin(theta)
            const x = Math.cos(i * delta) - Math.cos(theta) * y
            ans.push(Vector3f.sum(origin, Vector3f.sum(Vector3f.scaled(A, x), Vector3f.scaled(B, y))))
        }
        return ans
    }
}

export default Vector3f
