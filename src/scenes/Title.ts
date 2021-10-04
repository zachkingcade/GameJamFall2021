import { Loader, GameObjects, Scene } from 'phaser';
import { SCREEN_WIDTH, SCREEN_HEIGHT } from '../constants';
import { SignalManager } from '../services/SignalManager';

export class Title extends Scene {

    constructor() {
        super("Title");
    }

    create() {
        let bg = this.add.image(0,0,"background");
        bg.setOrigin(0);
        let titleCard = this.add.image(900,250,"title");
        titleCard.setScale(.25);
        let pole = this.add.image(1650,635,"north");
        pole.setScale(0.15,0.15);
        let sled = this.add.image(600,600,"sled");
        sled.setScale(0.1,0.1);
        sled.flipX = true;
        let playButton = this.add.sprite(850,400,"play");
        playButton.setScale(.75);
        playButton.setInteractive();
        playButton.on("pointerdown", () => {
            this.startLevel();
        })
    }

    startLevel(){
        //start hud scene
        this.scene.launch("Hud");
        //layer actual game under hud scene
        this.scene.start("FirstLevel");
    }
}