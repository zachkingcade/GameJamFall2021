import { Loader, GameObjects, Scene} from 'phaser';


export class LoadAssets extends Scene {

    //varibles
    assets :string = "../../assets";

    constructor(){
        super("LoadAssets");
    }

    preload(){
        //our 4 dino friends
        this.load.spritesheet("blueDino",`${this.assets}/images/characters/Dino/DinoSpritesBlue.png`,{ frameWidth: 24, frameHeight: 24});

        //backgrounds
        this.load.image("firstLevelSky",`${this.assets}/images/tilesets/fantasyVillage/ParallaxBackground/Background-01.png`);
        this.load.image("firstLevelBackground1",`${this.assets}/images/tilesets/fantasyVillage/ParallaxBackground/Background-02.png`);
        this.load.image("firstLevelBackground2",`${this.assets}/images/tilesets/fantasyVillage/ParallaxBackground/Background-03.png`);
        this.load.image("firstLevelBackground3",`${this.assets}/images/tilesets/fantasyVillage/ParallaxBackground/Background-04.png`);
        this.load.image("firstLevelSpriteSheet",`${this.assets}/images/tilesets/fantasyVillage/Platformer/spritesheet.png`);
        this.load.image("firstLevelObjectsheet",`${this.assets}/images/tilesets/fantasyVillage/GameObject/objects.png`);

        //tilemaps
        this.load.tilemapTiledJSON("FirstLevelTilemap", `${this.assets}/tilemaps/firstLevel/firstLevel.json`);

        //objects
        this.load.spritesheet("coin",`${this.assets}/images/tilesets/tropicalIsland/Collectable/GoldCoin/coinSheet.png`, {frameWidth: 128, frameHeight: 128});
        this.load.spritesheet("eggGreenBounce",`${this.assets}/images/tilesets/collectables/egg_green_bounce.png`, {frameWidth: 128, frameHeight: 256});
        this.load.image("eggGreen",`${this.assets}/images/tilesets/collectables/egg_Green.png`);
        this.load.image("vineBody",`${this.assets}/images/tilesets/fantasyVillage/GameObject/Ladder01.png`);
        this.load.image("vineTop",`${this.assets}/images/tilesets/fantasyVillage/GameObject/Ladder02.png`);
        this.load.image("mushroom",`${this.assets}/images/tilesets/fantasyVillage/GameObject/Mushroom.png`);

        //sound effects
        this.load.audio("coinPickupSound",`${this.assets}/audio/soundEffects/Ancient_Game_Coin_Jar_Touch.wav`);
        this.load.audio("eggPickupSound",`${this.assets}/audio/soundEffects/Ancient_Game_Fantasy_Treasure_1.wav`);
        this.load.audio("forestMusic",`${this.assets}/audio/music/Field_3.mp3`);

        //user interface
        this.load.image("controlArrowLeft",`${this.assets}/images/userInterface/ControlArrowRight.png`);
        this.load.image("godRays",`${this.assets}/images/userInterface/godrays.png`);
    }

    create(){
        //global animations
        this.anims.create({
            key: "coinSpin",
            frames: this.anims.generateFrameNumbers("coin", { start: 0, end: 5 }),
            frameRate: 8,
            repeat: -1
        });
        this.anims.create({
            key: "eggGreenBounceAnim",
            frames: this.anims.generateFrameNumbers("eggGreenBounce", { start: 0, end: 30 }),
            frameRate: 15,
            repeat: -1
        });
        //star hud scene
        this.scene.launch("Hud");
        //layer actual game under hud scene
        this.scene.start("FirstLevel");
    }
}