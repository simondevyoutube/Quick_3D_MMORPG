declare class OurLoadingManager {
    loader_: any;
    files_: Set<unknown>;
    onLoad: () => void;
    constructor(loader: any);
    load(file: any, cb: any): void;
}
export { OurLoadingManager };
