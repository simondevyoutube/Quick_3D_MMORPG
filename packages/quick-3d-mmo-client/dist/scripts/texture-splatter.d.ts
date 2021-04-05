declare class TextureSplatter {
    _colourSpline: any[];
    _oceanSpline: any;
    _params: any;
    constructor(params: any);
    _BaseColour(x: any, y: any, z: any): any;
    _Colour(x: number, y: number, z: number): any;
    _GetTextureWeights(p: any, n: any, up: any): {
        dirt: {
            index: number;
            strength: number;
        };
        grass: {
            index: number;
            strength: number;
        };
        gravel: {
            index: number;
            strength: number;
        };
        rock: {
            index: number;
            strength: number;
        };
        snow: {
            index: number;
            strength: number;
        };
        snowrock: {
            index: number;
            strength: number;
        };
        cobble: {
            index: number;
            strength: number;
        };
        sandyrock: {
            index: number;
            strength: number;
        };
    };
    GetColour(position: any): any;
    GetSplat(position: any, normal: any, up: any): {
        dirt: {
            index: number;
            strength: number;
        };
        grass: {
            index: number;
            strength: number;
        };
        gravel: {
            index: number;
            strength: number;
        };
        rock: {
            index: number;
            strength: number;
        };
        snow: {
            index: number;
            strength: number;
        };
        snowrock: {
            index: number;
            strength: number;
        };
        cobble: {
            index: number;
            strength: number;
        };
        sandyrock: {
            index: number;
            strength: number;
        };
    };
}
export { TextureSplatter };
