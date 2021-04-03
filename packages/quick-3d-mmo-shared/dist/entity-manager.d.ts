declare class EntityManager {
    _ids: number;
    _entitiesMap: {};
    _entities: any[];
    constructor();
    _GenerateName(): string;
    Get(n: any): any;
    Filter(cb: any): any[];
    Add(e: any, n: any): void;
    SetActive(e: any, b: any): void;
    Update(timeElapsed: any): void;
}
export { EntityManager };
//# sourceMappingURL=entity-manager.d.ts.map