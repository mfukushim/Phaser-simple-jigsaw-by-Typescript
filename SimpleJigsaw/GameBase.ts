module WebSketch {
    export class GameBase extends Phaser.Game {
        constructor(winwidth: number, winheight: number) {
            super(winwidth, winheight, Phaser.AUTO, "", null);

            this.state.add("Boot", Boot, false);
            this.state.add("Practice1", Practice1, false);

            this.state.start("Boot");
        }
    }
}