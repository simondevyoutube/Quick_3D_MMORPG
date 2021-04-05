import { Component } from "./entity";
declare class QuestComponent extends Component {
    constructor();
    InitComponent(): void;
    _OnPicked(msg: any): void;
    _AddQuestToJournal(quest: any): void;
}
export { QuestComponent };
