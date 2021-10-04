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
        //this.createEggCounter();
    }

    createSingalListeners(){
        this.singalManager.on("TotalCoinCount", (total:number) => {
            this.totalCoinCount = total;
            this.coinCountText.setText(`${this.currentCoinCount}/${this.totalCoinCount}`);
        }, this);
        this.singalManager.on("coinCollected", (screenCoords) => {
            this.currentCoinCount++;
            this.coinCountText.setText(`${this.currentCoinCount}/${this.totalCoinCount}`);
            if(this.currentCoinCount == this.totalCoinCount){
                this.stopLevelTime();
                this.levelTimeText.setColor("#FFD700");
                this.sound.play("win");
                setTimeout(() => {
                    this.singalManager.emit("returnTitle");
                    this.scene.stop();
                }, 5000);
            }  
        });
        this.singalManager.on("levelTimerStart", () => {
            this.startLevelTime();
        })
    }

    createCoinCounter(){
        let coinCountSymbol = this.add.sprite(15,15,"present");
        coinCountSymbol.setOrigin(0,0);
        coinCountSymbol.setScale(.05);
        this.coinCountText = this.add.text(85,15,`${this.currentCoinCount}/${this.totalCoinCount}`,{
            fontSize: "75px",
            color: "#FFD700"
        })
    }

    createLevelTimer(){
        this.levelTimeText = this.add.text(this.sys.canvas.width/2, 20, "1:15", {
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
        this.levelTime = 75;
        //increment and update timer text every second
        this.levelTimeInterval = setInterval(() => {
            this.levelTime--;
            if(this.levelTime <= 15 && this.levelTime > 0){
                this.sound.play("timer");
            } else if (this.levelTime == 0){
                this.sound.play("lose");
                this.stopLevelTime();
                this.levelTimeText.setColor("#EB5234");
                setTimeout(() => {
                    this.singalManager.emit("returnTitle");
                    this.scene.stop();
                }, 3000);
            }
            let seconds: string = '' + this.levelTime % 60;
            seconds = seconds.padStart(2, '0');
            this.levelTimeText.setText(`${Math.trunc(this.levelTime/60)}:${seconds}`);
        }, 1000);
    }

    stopLevelTime(){
        clearInterval(this.levelTimeInterval);
    }
}