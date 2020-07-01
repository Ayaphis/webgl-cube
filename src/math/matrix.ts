class Matrix4f {
    static getEye(): Matrix4f {
        return new Matrix4f([
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1,
        ])
    }
    static getProjection(angle: number, a: number, zMin: number, zMax: number): Matrix4f {
        const ang: number = Math.tan((angle * 0.5) * Math.PI / 180)
        return new Matrix4f([
            0.5 / ang, 0, 0, 0,
            0, 0.5 * a / ang, 0, 0,
            0, 0, -(zMax + zMin) / (zMax - zMin), -1,
            0, 0, (-2 * zMax * zMin) / (zMax - zMin), 0,
        ])
    }
    _val: Array<number>
    constructor(val: Array<number>) {
        this._val = val;
    }
    rotateZ(angle: number) {
        const c: number = Math.cos(angle)
        const s: number = Math.sin(angle)
        const val0 = this._val[0], val4 = this._val[4], val8 = this._val[8];
        this._val[0] = c * this._val[0] - s * this._val[1]
        this._val[4] = c * this._val[4] - s * this._val[5]
        this._val[8] = c * this._val[8] - s * this._val[9]
        this._val[1] = c * this._val[1] + s * val0
        this._val[5] = c * this._val[5] + s * val4
        this._val[9] = c * this._val[9] + s * val8
    }
    rotateX(angle: number) {
        const c = Math.cos(angle)
        const s = Math.sin(angle)
        const val0 = this._val[1], val5 = this._val[5], val9 = this._val[9];
        this._val[1] = c * this._val[1] - s * this._val[2]
        this._val[5] = c * this._val[5] - s * this._val[6]
        this._val[9] = c * this._val[9] - s * this._val[10]
        this._val[2] = c * this._val[2] + s * val0
        this._val[6] = c * this._val[6] + s * val5
        this._val[10] = c * this._val[10] + s * val9
    }
    rotateY(angle: number) {
        const c: number = Math.cos(angle)
        const s: number = Math.sin(angle)
        const val2 = this._val[2], val6 = this._val[6], val10 = this._val[10];
        this._val[2] = c * this._val[2] - s * this._val[0]
        this._val[6] = c * this._val[6] - s * this._val[4]
        this._val[10] = c * this._val[10] - s * this._val[8]
        this._val[0] = c * this._val[0] + s * val2
        this._val[4] = c * this._val[4] + s * val6
        this._val[8] = c * this._val[8] + s * val10
    }
}

export default Matrix4f