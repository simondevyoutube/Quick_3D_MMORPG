import { Component } from './entity';
declare class UIController extends Component {
    _params: any;
    _quests: {};
    iconBar_: {
        stats: HTMLElement;
        inventory: HTMLElement;
        quests: HTMLElement;
    };
    _ui: {
        inventory: HTMLElement;
        stats: HTMLElement;
        quests: HTMLElement;
    };
    chatElement_: HTMLInputElement;
    constructor(params: any);
    InitComponent(): void;
    FadeoutLogin(): void;
    OnChatKeyDown_(evt: any): void;
    AddQuest(quest: any): void;
    AddEventMessages(events: any): void;
    AddChatMessage(msg: any): void;
    OnQuestSelected_(id: any): void;
    HideUI_(): void;
    OnQuestsClicked_(msg: any): void;
    OnStatsClicked_(msg: any): void;
    OnInventoryClicked_(msg: any): void;
    Update(timeInSeconds: any): void;
}
export { UIController };
