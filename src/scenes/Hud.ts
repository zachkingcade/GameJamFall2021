import { Loader, GameObjects, Scene} from 'phaser';
import { SignalManager } from '../services/SignalManager';


export class Hud extends Scene {

    //counters
    coinCountSymbol: Phaser.GameObjects.Sprite;
    totalCoinCount: number;
    currentCoinCount: number;
    coinCountText: Phaser.GameObjects.Text;
    totalEggCount: number;
    eggCountSymbols: Phaser.GameObjects.Sprite[];

    //level timer
    levelTime: number;
    levelTimeText: Phaser.GameObjects.Text;
    levelTimeInterval: any;

    //tools
    singalManager: SignalManager;


    constructor(){
        super("Hud");
        //initalize
        this.singalManager = SignalManager.get();
        this.totalCoinCount = 0;
        this.currentCoinCount = 0;
        this.levelTime = 0;
        this.totalEggCount = 0;
        this.eggCountSymbols = [];
    }


    create(){
        this.createSingalListeners();
        this.createCoinCounter();
        this.createLevelTimer();
        this.createEggCounter();
    }

    createSingalListeners(){
        this.singalManager.on("TotalCoinCount", (total:number) => {
            this.totalCoinCount = total;
            this.coinCountText.setText(`${this.currentCoinCount}/${this.totalCoinCount}`);
        }, this);
        this.singalManager.on("coinCollected", (screenCoords) => {
            let travelCoin = this.add.sprite(screenCoords[0], screenCoords[1], "coin");
            travelCoin.setOrigin(0,0);
            travelCoin.setScale(.5,.5);
            travelCoin.play("coinSpin");
            this.add.tween({
                targets: travelCoin,
                repeat: false,
                x: 15,
                y: 15,
                duration: 600,
                onComplete: () => {
                    travelCoin.destroy();
                }
            })
            this.currentCoinCount++;
            this.coinCountText.setText(`${this.currentCoinCount}/${this.totalCoinCount}`);
            if(this.currentCoinCount == this.totalCoinCount){
                this.stopLevelTime();
            }  
        });
        this.singalManager.on("eggCollected", (screenCoords) => {
            let travelEgg = this.add.sprite(screenCoords[0], screenCoords[1], "eggGreen");
            travelEgg.setOrigin(0,0);
            travelEgg.setScale(.5,.5);
            let rays = this.add.sprite(screenCoords[0] + 30, screenCoords[1] + 30, "godRays");
            rays.setOrigin(.5,.5);
            rays.setScale(3,3);
            rays.setDepth(-1);
            this.totalEggCount++;
            let eggTimeline = this.tweens.createTimeline();
            eggTimeline.add({
                targets: travelEgg,
                repeat: false,
                y: this.sys.game.scale.gameSize.height /8,
                duration: 1500,
            })
            eggTimeline.add({
                targets: travelEgg,
                repeat: false,
                x: this.sys.canvas.width-(this.totalEggCount * 64),
                y: 15,
                duration: 500,
                onComplete: () => {
                    travelEgg.destroy();
                    this.eggCountSymbols[this.totalEggCount].clearTint();
                },
            })
            eggTimeline.play();
            this.add.tween({
                targets: rays,
                repeat: false,
                duration: 1500,
                angle: 200,
                onComplete: () => {
                    rays.destroy();
                },
                onUpdate: () => {
                    rays.y = travelEgg.y + 30;
                }
            })
        });
        this.singalManager.on("levelTimerStart", () => {
            this.startLevelTime();
        })
    }

    createCoinCounter(){
        let coinCountSymbol = this.add.sprite(15,15,"coin");
        coinCountSymbol.setOrigin(0,0);
        coinCountSymbol.setScale(.5,.5);
        coinCountSymbol.play("coinSpin");
        this.coinCountText = this.add.text(85,15,`${this.currentCoinCount}/${this.totalCoinCount}`,{
            fontSize: "75px",
            color: "#FFD700"
        })
    }

    createLevelTimer(){
        this.levelTimeText = this.add.text(this.sys.canvas.width/2, 20, "0:00", {
            fontSize: "75px",
            color: "white"
        })
    }

    createEggCounter(){
        for(let i = 1 ; i < 4; i++){
            let eggCounter = this.add.sprite(this.sys.canvas.width-(i * 64), 15, "eggGreen");
            eggCounter.setOrigin(0,0);
            eggCounter.setScale(.5,.5);
            eggCounter.setTint(0x858585);
            this.eggCountSymbols[i] = eggCounter;
        }
    }

    startLevelTime(){
        //reset value
        this.levelTime = 0;
        //increment and update timer text every second
        this.levelTimeInterval = setInterval(() => {
            this.levelTime++;
            let seconds: string = '' + this.levelTime % 60;
            seconds = seconds.padStart(2, '0');
            this.levelTimeText.setText(`${Math.trunc(this.levelTime/60)}:${seconds}`);
        }, 1000);
    }

    stopLevelTime(){
        clearInterval(this.levelTimeInterval);
    }
}