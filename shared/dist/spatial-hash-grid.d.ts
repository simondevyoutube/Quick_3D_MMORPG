declare class SpatialHashGrid {
    _cells: any[][];
    _dimensions: any;
    _bounds: any;
    _queryIds: number;
    constructor(bounds: any, dimensions: any);
    _GetCellIndex(position: any): number[];
    NewClient(position: any, dimensions: any): {
        position: any;
        dimensions: any;
        _cells: {
            min: any;
            max: any;
            nodes: any;
        };
        _queryId: number;
    };
    UpdateClient(client: any): void;
    FindNear(position: any, bounds: any): any[];
    _Insert(client: any): void;
    Remove(client: any): void;
}
export { SpatialHashGrid };
//# sourceMappingURL=spatial-hash-grid.d.ts.map