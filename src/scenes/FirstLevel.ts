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
        this.setupKeys();
        //this.setupPlayer("blueDino");
        this.setupTilemap();
        //this.createParallexBackground();
        this.sound.play("forestMusic", {
            loop: true,
            volume: .4
        })
        this.signalManager.emit("levelTimerStart");
    }

    update() {
        //movement is so pressing A goes left, D goes right and pressing them both makes you jump
        if (this.keys["left"].isDown && this.keys["right"].isDown && this.playerSprite.body.onFloor()) {
            this.playerSprite.body.setVelocityY(-3000);
        } else if (this.keys["left"].isDown && !this.keys["right"].isDown) {
            this.playerSprite.body.setVelocityX(-675);
            if (this.playerSprite.anims.getName() != "walk" || !this.playerSprite.flipX) {
                this.playerSprite.play("walk");
                this.playerSprite.setFlipX(true);
            }
        } else if (!this.keys["left"].isDown && this.keys["right"].isDown) {
            this.playerSprite.body.setVelocityX(675);
            if (this.playerSprite.anims.getName() != "walk" || this.playerSprite.flipX) {
                this.playerSprite.play("walk");
                this.playerSprite.setFlipX(false);
            }
        }
        if (this.playerSprite.x != this.changedX) {
            if (this.playerSprite.x > this.changedX) {
                this.backgroundLayers[1].tilePositionX -= .25;
                this.backgroundLayers[2].tilePositionX -= .35;
                this.backgroundLayers[3].tilePositionX -= .45;
            } else if (this.playerSprite.x < this.changedX) {
                this.backgroundLayers[1].tilePositionX += .25;
                this.backgroundLayers[2].tilePositionX += .35;
                this.backgroundLayers[3].tilePositionX += .45;
            }
            this.changedX = this.playerSprite.x;
            this.backgroundLayers[1].x = this.playerSprite.x;
            this.backgroundLayers[2].x = this.playerSprite.x;
            this.backgroundLayers[3].x = this.playerSprite.x;
        }

        //check if animation is playing when we hit the ground, if it is not start playing idle
        if (!this.playerSprite.anims.isPlaying && this.playerSprite.body.onFloor()) {
            this.playerSprite.play("idle");
        }
    }

    setupKeys() {
        //keyboard keys
        this.keys = {};
        this.keys["right"] = this.input.keyboard.addKey("D");
        this.keys["left"] = this.input.keyboard.addKey("A");
        this.keys["jump"] = this.input.keyboard.addKey("SPACE");

        this.input.keyboard.on('keyup-D', () => {
            this.playerSprite.body.setVelocityX(0);
            this.playerSprite.anims.play("idle");
            if (!this.playerSprite.body.onFloor()) {
                this.playerSprite.anims.stop();
            }
        }, this);
        this.input.keyboard.on('keyup-A', () => {
            this.playerSprite.body.setVelocityX(0);
            this.playerSprite.anims.play("idle");
            if (!this.playerSprite.body.onFloor()) {
                this.playerSprite.anims.stop();
            }
        }, this);
    }

    setupPlayer(key: string) {
        this.playerSprite = this.physics.add.sprite(256, 3000, key, 0);
        this.playerSprite.setScale(7);
        this.playerSprite.body.setSize(12, 16);
        this.playerSprite.body.offset.y = 5;
        this.physics.world.setBounds(0, 0, this.game.canvas.width, this.game.canvas.height, true, true, true, true);
        //this.playerSprite.body.setCollideWorldBounds(true);
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
        this.tilemap = this.make.tilemap({ key: "FirstLevelTilemap" });

        let tileset = this.tilemap.addTilesetImage("spritesheet", "firstLevelSpriteSheet");
        let objectTileset = this.tilemap.addTilesetImage("objects", "firstLevelObjectsheet");

        let collisionLayer = this.tilemap.createLayer("collide", [tileset, objectTileset], 0, 0);
        let overtop = this.tilemap.createLayer("overtop", [tileset, objectTileset], 0, 0);
        overtop.setDepth(5);

        this.tilemap.setCollisionBetween(1, 999, true, true, "collide");
        this.physics.add.collider(this.playerSprite, collisionLayer);

        //setup camera
        this.cameras.main.startFollow(this.playerSprite);
        this.cameras.main.setZoom(0.5)

        let objects = this.tilemap.getObjectLayer("collectable");
        objects.objects.forEach((object) => {
            //add coins
            if (object.type == "coin") {
                let coinSprite = this.physics.add.sprite(object.x, object.y, "coin", 0);
                coinSprite.setOrigin(0, 1);
                coinSprite.setMaxVelocity(0, 0);
                coinSprite.play("coinSpin");

                this.physics.add.overlap(this.playerSprite, coinSprite, () => {
                    this.sound.play("coinPickupSound");
                    this.signalManager.emit("coinCollected", [this.playerSprite.x - this.cameras.main.scrollX, this.playerSprite.y - this.cameras.main.scrollY]);
                    coinSprite.destroy();
                });
                this.coins.push(coinSprite);
            } else if (object.type == "vine") {
                let spriteKey: string = (object.name == "vineTop") ? "vineTop" : "vineBody";
                console.log(spriteKey);
                let vineSprite = this.physics.add.sprite(object.x, object.y, spriteKey);
                vineSprite.setOrigin(0, 1);
                vineSprite.setMaxVelocity(0, 0);
                vineSprite.setDepth(0.1);

                this.physics.add.overlap(this.playerSprite, vineSprite, () => {
                    if(this.keys["left"].isDown && this.keys["right"].isDown){
                        this.playerSprite.body.setVelocityY(-1000);
                    }
                    //setMaxVelocity and set interval to check when to turn it back up
                    if(this.vineInterval == null){
                        this.playerSprite.body.setMaxVelocityX(400);
                        this.vineInterval = setInterval(() => {
                            if(this.physics.overlap(this.playerSprite, vineSprite) == false){
                                clearInterval(this.vineInterval);
                                this.vineInterval = null;
                                this.playerSprite.body.setMaxVelocityX(1000);
                            }
                        }, 250)
                    }
                })
            } else if (object.type == "egg"){
                let eggSprite = this.physics.add.sprite(object.x, object.y, "eggGreen", 0);
                eggSprite.setOrigin(0, 1);
                eggSprite.setMaxVelocity(0, 0);
                eggSprite.setBodySize(128,256);
                eggSprite.setOffset(0,16)
                eggSprite.play("eggGreenBounceAnim");

                this.physics.add.overlap(this.playerSprite, eggSprite, () => {
                    this.sound.play("eggPickupSound");
                    this.signalManager.emit("eggCollected", [this.playerSprite.x - this.cameras.main.scrollX, this.playerSprite.y - this.cameras.main.scrollY]);
                    eggSprite.destroy();
                })
            } else if (object.type == "mushroom"){
                let mushroomSprite = this.physics.add.sprite(object.x, object.y, "mushroom", 0);
                mushroomSprite.setOrigin(0, 1);
                mushroomSprite.setMaxVelocity(0, 0);
                mushroomSprite.setDepth(1);
                mushroomSprite.body.setSize(80,60,true);
                mushroomSprite.body.setOffset(24,66);
                mushroomSprite.setImmovable(true);
                mushroomSprite.setData("recentlyTouched", false);
                mushroomSprite.setBounce(0,1);

                this.physics.add.collider(this.playerSprite, mushroomSprite, () => {
                    if(!mushroomSprite.getData("recentlyTouched")){
                        console.log(this.playerSprite.body.velocity.y);
                        // this.playerSprite.setVelocityY(-1 *((this.playerSprite.body.velocity.y) + 5000))
                        console.log(this.playerSprite.body.velocity.y);
                        mushroomSprite.setData("recentlyTouched", true);
                        setTimeout(() => {
                            mushroomSprite.setData("recentlyTouched", false);
                        }, 500)
                    }
                })
            } 
        })
        this.signalManager.emit("TotalCoinCount", this.coins.length)
    }

    createParallexBackground() {
        this.backgroundLayers = {};

        //setup background stuff
        this.backgroundSky = this.add.image(0, 0, "firstLevelSky");
        let backgroundScaleX = this.tilemap.widthInPixels / this.backgroundSky.width;
        let backgroundScaley = this.tilemap.heightInPixels / this.backgroundSky.height;
        this.backgroundSky.setOrigin(0, 0);
        this.backgroundSky.setScale(backgroundScaleX, backgroundScaley);
        this.backgroundSky.setDepth(-1);

        this.backgroundLayers[1] = this.add.tileSprite(0, 2750, 0, 0, "firstLevelBackground1");
        backgroundScaleX = this.cameras.main.displayWidth / this.backgroundLayers[1].width;
        backgroundScaley = this.cameras.main.displayHeight / this.backgroundLayers[1].height;
        this.backgroundLayers[1].setOrigin(.5, .5);
        this.backgroundLayers[1].setDepth(-1);
        this.backgroundLayers[1].setScale(backgroundScaleX, backgroundScaley);
        this.backgroundLayers[1].width *= 2;

        this.backgroundLayers[2] = this.add.tileSprite(0, 2750, 0, 0, "firstLevelBackground2");
        backgroundScaleX = this.cameras.main.displayWidth / this.backgroundLayers[2].width;
        backgroundScaley = this.cameras.main.displayHeight / this.backgroundLayers[2].height;
        this.backgroundLayers[2].setOrigin(.5, .5);
        this.backgroundLayers[2].setDepth(-1);
        this.backgroundLayers[2].setScale(backgroundScaleX, backgroundScaley);
        this.backgroundLayers[2].width *= 2;

        this.backgroundLayers[3] = this.add.tileSprite(0, 3000, 0, 0, "firstLevelBackground3");
        backgroundScaleX = this.cameras.main.displayWidth / this.backgroundLayers[3].width;
        backgroundScaley = this.cameras.main.displayHeight / this.backgroundLayers[3].height;
        this.backgroundLayers[3].setOrigin(.5, .5);
        this.backgroundLayers[3].setDepth(-1);
        this.backgroundLayers[3].setScale(backgroundScaleX, backgroundScaley);
        this.backgroundLayers[3].width *= 2;
    }
}