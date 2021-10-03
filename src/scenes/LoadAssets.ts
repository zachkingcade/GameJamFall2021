import { Loader, GameObjects, Scene} from 'phaser';


export class LoadAssets extends Scene {

    //varibles
    assets :string = "../../assets";

    constructor(){
        super("LoadAssets");
    }

    preload(){
        //our pengoon
        this.load.spritesheet("blueDino",`${this.assets}/images/characters/Dino/DinoSpritesBlue.png`,{ frameWidth: 24, frameHeight: 24});

        //images
        this.load.image("baseLevelSpriteSheet",`${this.assets}/images/texture.png`);
        this.load.image("background",`${this.assets}/images/BG.png`);

        //tilemaps
        this.load.tilemapTiledJSON("baseWorld", `${this.assets}/maps/baseWorld.json`);

        //sound effects
        this.load.audio("coinPickupSound",`${this.assets}/audio/soundEffects/Ancient_Game_Coin_Jar_Touch.wav`);
        this.load.audio("eggPickupSound",`${this.assets}/audio/soundEffects/Ancient_Game_Fantasy_Treasure_1.wav`);
        this.load.audio("forestMusic",`${this.assets}/audio/music/Field_3.mp3`);
    }

    create(){
        //star hud scene
        this.scene.launch("Hud");
        //layer actual game under hud scene
        this.scene.start("FirstLevel");
    }
}