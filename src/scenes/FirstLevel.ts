import { Loader, GameObjects, Scene } from 'phaser';
import { SCREEN_WIDTH, SCREEN_HEIGHT } from '../constants';
import { SignalManager } from '../services/SignalManager';

export class FirstLevel extends Scene {

    backgroundSky: Phaser.GameObjects.Image;
    backgroundLayers: { [key: number]: Phaser.GameObjects.TileSprite };
    playerSprite: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
    keys: { [key: string]: Phaser.Input.Keyboard.Key };
    tilemap: Phaser.Tilemaps.Tilemap;
    changedX: number;
    coins: Phaser.GameObjects.Sprite[];
    signalManager: SignalManager;
    vineInterval: any;

    constructor() {
        super("FirstLevel");

        //initalize
        this.coins = [];
        this.signalManager = SignalManager.get();
    }

    create() {
        this.setupPlayer("blueDino");
        this.setupTilemap();
        this.createParallexBackground();
        this.sound.play("forestMusic", {
            loop: true,
            volume: .4
        })
        this.signalManager.emit("levelTimerStart");
    }

    update() {
        if(this.playerSprite.body.onFloor() && this.input.activePointer.isDown){
            this.fling();
        }
    }

    fling(){
        let adjustedCoords = {x: this.input.activePointer.x + this.cameras.main.scrollX, y: this.input.activePointer.y + this.cameras.main.scrollY};
        let distance = Phaser.Math.Distance.Between(this.playerSprite.x, this.playerSprite.y, adjustedCoords.x, adjustedCoords.y);
        this.physics.moveTo(this.playerSprite, adjustedCoords.x, adjustedCoords.y, 500 + (distance*3));
    }

    setupPlayer(key: string) {
        this.playerSprite = this.physics.add.sprite(300, 900, key, 0);
        this.playerSprite.setScale(7);
        this.playerSprite.body.setSize(12, 16);
        this.playerSprite.body.offset.y = 5;
        this.playerSprite.body.setAllowDrag(true);
        this.playerSprite.body.setDrag(300,100);
        this.playerSprite.body.setBounce(0.25, .25);
        this.playerSprite.anims.create({
            key: "idle",
            frames: this.anims.generateFrameNumbers(key, { start: 0, end: 3 }),
            frameRate: 8,
            repeat: -1
        })
        this.playerSprite.anims.create({
            key: "walk",
            frames: this.anims.generateFrameNumbers(key, { start: 4, end: 9 }),
            frameRate: 8,
            repeat: -1
        })
        this.playerSprite.anims.create({
            key: "hurt",
            frames: this.anims.generateFrameNumbers(key, { start: 13, end: 16 }),
            frameRate: 8,
            repeat: -1,
        })
        this.playerSprite.play("idle");
    }

    setupTilemap() {
        this.tilemap = this.make.tilemap({ key: "baseWorld" });

        let tileset = this.tilemap.addTilesetImage("texture", "baseLevelSpriteSheet");
        //let objectTileset = this.tilemap.addTilesetImage("objects", "firstLevelObjectsheet");

        let collisionLayer = this.tilemap.createLayer("Tile Layer 1", [tileset], 0, 0);
        //let overtop = this.tilemap.createLayer("overtop", [tileset, objectTileset], 0, 0);
        //overtop.setDepth(5);

        collisionLayer.setCollisionBetween(1, 999, true, true);
        this.physics.add.collider(this.playerSprite, collisionLayer);

        //setup camera
        this.cameras.main.startFollow(this.playerSprite);
        this.cameras.main.setZoom(0.5)

        //let objects = this.tilemap.getObjectLayer("collectable");
        // objects.objects.forEach((object) => {
        //     //add coins
        //     if (object.type == "coin") {
        //         let coinSprite = this.physics.add.sprite(object.x, object.y, "coin", 0);
        //         coinSprite.setOrigin(0, 1);
        //         coinSprite.setMaxVelocity(0, 0);
        //         coinSprite.play("coinSpin");

        //         this.physics.add.overlap(this.playerSprite, coinSprite, () => {
        //             this.sound.play("coinPickupSound");
        //             this.signalManager.emit("coinCollected", [this.playerSprite.x - this.cameras.main.scrollX, this.playerSprite.y - this.cameras.main.scrollY]);
        //             coinSprite.destroy();
        //         });
        //         this.coins.push(coinSprite);
        //     } else if (object.type == "vine") {
        //         let spriteKey: string = (object.name == "vineTop") ? "vineTop" : "vineBody";
        //         console.log(spriteKey);
        //         let vineSprite = this.physics.add.sprite(object.x, object.y, spriteKey);
        //         vineSprite.setOrigin(0, 1);
        //         vineSprite.setMaxVelocity(0, 0);
        //         vineSprite.setDepth(0.1);

        //         this.physics.add.overlap(this.playerSprite, vineSprite, () => {
        //             if(this.keys["left"].isDown && this.keys["right"].isDown){
        //                 this.playerSprite.body.setVelocityY(-1000);
        //             }
        //             //setMaxVelocity and set interval to check when to turn it back up
        //             if(this.vineInterval == null){
        //                 this.playerSprite.body.setMaxVelocityX(400);
        //                 this.vineInterval = setInterval(() => {
        //                     if(this.physics.overlap(this.playerSprite, vineSprite) == false){
        //                         clearInterval(this.vineInterval);
        //                         this.vineInterval = null;
        //                         this.playerSprite.body.setMaxVelocityX(1000);
        //                     }
        //                 }, 250)
        //             }
        //         })
        //     } else if (object.type == "egg"){
        //         let eggSprite = this.physics.add.sprite(object.x, object.y, "eggGreen", 0);
        //         eggSprite.setOrigin(0, 1);
        //         eggSprite.setMaxVelocity(0, 0);
        //         eggSprite.setBodySize(128,256);
        //         eggSprite.setOffset(0,16)
        //         eggSprite.play("eggGreenBounceAnim");

        //         this.physics.add.overlap(this.playerSprite, eggSprite, () => {
        //             this.sound.play("eggPickupSound");
        //             this.signalManager.emit("eggCollected", [this.playerSprite.x - this.cameras.main.scrollX, this.playerSprite.y - this.cameras.main.scrollY]);
        //             eggSprite.destroy();
        //         })
        //     } else if (object.type == "mushroom"){
        //         let mushroomSprite = this.physics.add.sprite(object.x, object.y, "mushroom", 0);
        //         mushroomSprite.setOrigin(0, 1);
        //         mushroomSprite.setMaxVelocity(0, 0);
        //         mushroomSprite.setDepth(1);
        //         mushroomSprite.body.setSize(80,60,true);
        //         mushroomSprite.body.setOffset(24,66);
        //         mushroomSprite.setImmovable(true);
        //         mushroomSprite.setData("recentlyTouched", false);
        //         mushroomSprite.setBounce(0,1);

        //         this.physics.add.collider(this.playerSprite, mushroomSprite, () => {
        //             if(!mushroomSprite.getData("recentlyTouched")){
        //                 console.log(this.playerSprite.body.velocity.y);
        //                 // this.playerSprite.setVelocityY(-1 *((this.playerSprite.body.velocity.y) + 5000))
        //                 console.log(this.playerSprite.body.velocity.y);
        //                 mushroomSprite.setData("recentlyTouched", true);
        //                 setTimeout(() => {
        //                     mushroomSprite.setData("recentlyTouched", false);
        //                 }, 500)
        //             }
        //         })
        //     } 
        // })
        this.signalManager.emit("TotalCoinCount", this.coins.length)
    }

    createParallexBackground() {

        //setup background stuff
        this.backgroundSky = this.add.image(0, 0, "background");
        let backgroundScaleX = this.tilemap.widthInPixels / this.backgroundSky.width;
        let backgroundScaley = this.tilemap.heightInPixels / this.backgroundSky.height;
        this.backgroundSky.setOrigin(0, 0);
        this.backgroundSky.setScale(backgroundScaleX, backgroundScaley);
        this.backgroundSky.setDepth(-1);
    }
}