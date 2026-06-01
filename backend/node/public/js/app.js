export class App {
    constructor(state, renderer) {
        this.state = state;
        this.renderer = renderer;

        this.renderScheduled = false;
    }


    requestRender() {
        if (this.renderScheduled) return;

        this.renderScheduled = true;

        requestAnimationFrame(() => {
            this.renderScheduled = false;
            this.renderer.render();
        });
    }

    afterRender() {
    this.renderer.dragDrop?.enable(document.getElementById("body"));
}
}
