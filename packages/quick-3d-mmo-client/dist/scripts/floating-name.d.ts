import { Component } from './entity';
declare class FloatingName extends Component {
    params_: {
        desc: {
            character: {
                class: string;
            };
            account: {
                name: string;
            };
        };
    };
    visible_: boolean;
    sprite_: any;
    element_: HTMLCanvasElement;
    context2d_: any;
    constructor(params: any);
    Destroy(): void;
    InitComponent(): void;
    OnDeath_(e: any): void;
    CreateSprite_(msg: any): void;
}
export { FloatingName };
