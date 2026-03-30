import HomeScene from "./scenes/HomeScene.js";
import LevelSelectScene from "./scenes/LevelSelectScene.js";
import GameScene from "./scenes/GameScene.js";
import CreditScene from "./scenes/CreditScene.js";

const config = {
    type: Phaser.AUTO,
    scale: {
        mode:       Phaser.Scale.FIT,
        autocenter: Phaser.Scale.CENTER_BOTH,
        width:      1905,
        height:     870,
    },
    scene: [HomeScene, CreditScene, LevelSelectScene, GameScene]
};

const game = new Phaser.Game(config);
