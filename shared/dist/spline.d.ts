declare class CubicHermiteSpline {
    _points: any[];
    _lerp: any;
    constructor(lerp: any);
    AddPoint(t: any, d: any): void;
    Get(t: any): any;
}
declare class LinearSpline {
    _points: any[];
    _lerp: any;
    constructor(lerp: any);
    AddPoint(t: any, d: any): void;
    Get(t: any): any;
}
export { CubicHermiteSpline, LinearSpline };
//# sourceMappingURL=spline.d.ts.map