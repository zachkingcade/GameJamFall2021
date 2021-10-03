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
    canMove: boolean = true;

    constructor() {
        super("FirstLevel");

        //initalize
        this.coins = [];
        this.signalManager = SignalManager.get();
    }

    create() {
        this.setupPlayer("pengoon");
        this.setupTilemap();
        this.createParallexBackground();
        this.sound.play("forestMusic", {
            loop: true,
            volume: .4
        })
        this.signalManager.emit("levelTimerStart");
    }

    update() {
        if(this.canMove){
            if(this.playerSprite.body.onFloor() && this.input.activePointer.isDown){
                this.fling();
            } else if (this.input.activePointer.isDown){
                this.midairAdjust();
            }
            this.canMove = false;
            setTimeout(() => {
                this.canMove = true;
            }, 100);
        }
        this.backgroundSky.x = this.playerSprite.x;
    }

    fling(){
        let adjustedCoords = {x: this.input.activePointer.x + this.cameras.main.scrollX, y: this.input.activePointer.y + this.cameras.main.scrollY};
        let distance = Phaser.Math.Distance.Between(this.playerSprite.x, this.playerSprite.y, adjustedCoords.x, adjustedCoords.y);
        this.physics.moveTo(this.playerSprite, adjustedCoords.x, adjustedCoords.y, 500 + (distance*3));
    }

    midairAdjust(){
        let pointerX = this.input.activePointer.x + this.cameras.main.scrollX;
        if(this.playerSprite.x > pointerX){
            this.playerSprite.body.velocity.x -= 50;
        } else {
            this.playerSprite.body.velocity.x += 50;
        }
    }

    setupPlayer(key: string) {
        this.playerSprite = this.physics.add.sprite(300, 3820, key, 0);
        this.playerSprite.setScale(.15);
        //this.playerSprite.body.setSize(1667, 1667);
        //this.playerSprite.body.offset.x = -25;
        this.playerSprite.body.setAllowDrag(true);
        this.playerSprite.body.setDrag(300,100);
        this.playerSprite.body.setBounce(0.25, .25);
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

        let objects = this.tilemap.getObjectLayer("objects");
        objects.objects.forEach((object) => {
            //add coins
            if (object.type == "present") {
                let coinSprite = this.physics.add.sprite(object.x, object.y, "present", 0);
                coinSprite.setMaxVelocity(0, 0);
                coinSprite.setScale(.1);

                this.physics.add.overlap(this.playerSprite, coinSprite, () => {
                    this.sound.play("coinPickupSound");
                    this.signalManager.emit("coinCollected", [this.playerSprite.x - this.cameras.main.scrollX, this.playerSprite.y - this.cameras.main.scrollY]);
                    coinSprite.destroy();
                });
                this.coins.push(coinSprite);
            }
         });
        this.signalManager.emit("TotalCoinCount", this.coins.length)
    }

    createParallexBackground() {

        //setup background stuff
        this.backgroundSky = this.add.image(0, 900, "background");
        let backgroundScaleX = this.tilemap.widthInPixels / this.backgroundSky.width;
        let backgroundScaley = this.tilemap.heightInPixels / this.backgroundSky.height;
        this.backgroundSky.setOrigin(.5, .5);
        this.backgroundSky.setScale(backgroundScaleX*2, backgroundScaley*2);
        this.backgroundSky.setDepth(-1);
    }
}