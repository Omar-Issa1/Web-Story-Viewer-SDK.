interface MiniStoryConfig {
    images?: string[];
    interval?: number;
    autoplay?: boolean;
}
declare class MiniStory extends HTMLElement {
    images: string[];
    index: number;
    interval: number;
    timer: number | null;
    autoplay: boolean;
    private imgEl;
    private progressEl;
    static get observedAttributes(): string[];
    constructor();
    connectedCallback(): void;
    disconnectedCallback(): void;
    attributeChangedCallback(name: string, oldValue: any, newValue: any): void;
    readAttributes(): void;
    startAuto(): void;
    show(): void;
    next(): void;
    prev(): void;
    goTo(i: number): void;
    enableClickNavigation(): void;
    enableSwipeNavigation(): void;
}

export { MiniStory, MiniStoryConfig };
