import { Loader, GameObjects, Scene} from 'phaser';


export class LoadAssets extends Scene {

    //varibles
    assets :string = "./assets";

    constructor(){
        super("LoadAssets");
    }

    preload(){
        //our pengoon
        this.load.image("pengoon",`${this.assets}/images/characters/Pengoon.png`);

        //images
        this.load.image("baseLevelSpriteSheet",`${this.assets}/images/texture.png`);
        this.load.image("background",`${this.assets}/images/BG.png`);
        this.load.image("present",`${this.assets}/images/present.png`);
        this.load.image("sled",`${this.assets}/images/sled.png`);
        this.load.image("north",`${this.assets}/images/north.png`);
        this.load.image("play",`${this.assets}/images/play.png`);
        this.load.image("title",`${this.assets}/images/title.png`);

        //tilemaps
        this.load.tilemapTiledJSON("baseWorld", `${this.assets}/maps/baseWorld.json`);

        //sound effects
        this.load.audio("presentPickup01",`${this.assets}/audio/soundEffects/Keys_Grab_01.wav`);
        this.load.audio("presentPickup02",`${this.assets}/audio/soundEffects/Keys_Grab_02.wav`);
        this.load.audio("presentPickup03",`${this.assets}/audio/soundEffects/Keys_Grab_03.wav`);
        this.load.audio("timer",`${this.assets}/audio/soundEffects/timer.wav`);
        this.load.audio("win",`${this.assets}/audio/soundEffects/win.wav`);
        this.load.audio("lose",`${this.assets}/audio/soundEffects/lose.wav`);
        this.load.audio("music",`${this.assets}/audio/music/Level8.wav`);
    }

    create(){
        //layer actual game under hud scene
        this.scene.start("Title");
    }
}