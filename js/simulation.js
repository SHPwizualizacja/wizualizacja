'use strict';

var gameW = 1000;
var gameH = 600;

// mode = 0
var opis11 = 'Pociąg w ruchu, znajduje się przed punktem oddziaływania, urządzenie SHP jest gotowe do odbioru informacji z toru.';
var opis12 = 'Przejazd nad rezonatorem powoduje zablokowanie przekaźnika elektronicznego, zostaje uruchomiony sygnalizator świetlny i pisak rejestrujący.';
var opis13 = 'Brak reakcji maszynisty powoduje włączenie sygnału dźwiękowego.';
var opis14 = '';
var opis15 = 'Zostaje przerwane zasilanie zaworu elektropneumatycznego, który sterując zaworem czuwaka rozpoczyna hamowanie.';
var opis16 = 'Maszynista naciska przycisk czujności, następuje powrót urządzenia do stanu zasadniczego.';

// mode = 1, semaphorMode = 1
var opis21 = 'Pociąg w ruchu, znajduje się przed punktem oddziaływania, urządzenie SHP jest gotowe do odbioru informacji z toru.';
var opis22 = 'Przejazd jest uzależniony od wskazań semafora, który wskazuje "Stój", rezonator oddziałowuje na czujnik powoduje to zablokowanie przekaźnika elektronicznego, zostaje uruchomiony sygnalizator świetlny i pisak rejestrujący.';
var opis23 = 'Brak reakcji maszynisty powoduje włączenie sygnału dźwiękowego.';
var opis24 = '';
var opis25 = 'Zostaje przerwane zasilanie zaworu elektropneumatycznego, który sterując zaworem czuwaka rozpoczyna hamowanie.';
var opis26 = 'Maszynista naciska przycisk czujności, następuje powrót urządzenia do stanu zasadniczego.';

// mode = 1, semaphorMode = 0
var opis31 = 'Pociąg w ruchu, znajduje się przed punktem oddziaływania, urządzenie SHP jest gotowe do odbioru informacji z toru.';
var opis32 = 'Przejazd jest uzależniony od wskazań semafora, który wskazuje "droga wolna", zostaje zwarty obwód rezonatora, co nie powoduje zadziałania urządzenia SHP w pociągu';
var opis33 = opis32;
var opis34 = 'Pociąg swobodnie przejeżdża';

var shpInfo = 'Zadziałało SHP!! Należy odblokować urządzenie';
var startInfo1 = "Aby rozpocząć symulację naciśnij przycisk ▶ na górze ekranu.\nAby zmienić prędkość pociągu użyj nastawnika po prawej stronie.";
var startInfo23 = "Aby rozpocząć symulację naciśnij przycisk ▶ na górze ekranu.\nAby zmienić prędkość pociągu użyj nastawnika po prawej stronie.\nAby zmienić sygnał wyświetlany na semaforze kliknij w semafor.";

var Sensor = function(game, x, y) {
    Phaser.Sprite.call(this, game, x, y, 'sensor');
	this.scale.setTo(0.5, 0.5);
    this.anchor.setTo(0.5, 0.1);
    this.game.physics.enable(this, Phaser.Physics.ARCADE);
    //this.width = 100;
    //this.height = 20;
}
Sensor.prototype = Object.create(Phaser.Sprite.prototype);
Sensor.prototype.constructor = Sensor;

var ReactionButton = function(game, x, y, callback, callbackContext) {
    Phaser.Button.call(this, game, x, y, '', callback, callbackContext);
    this.bodySprite = this.game.add.sprite(0, 0, 'reactionButton');
    this.bodySprite.anchor.setTo(0.5, 0.5);
    this.addChild(this.bodySprite);
    this.bodySprite.animations.add('needReaction', null, 4, true);
}
ReactionButton.prototype = Object.create(Phaser.Button.prototype);
ReactionButton.prototype.constructor = ReactionButton;
ReactionButton.prototype.playAnimation = function() {
    this.bodySprite.animations.play('needReaction');
}
ReactionButton.prototype.stopAnimation = function() {
    this.bodySprite.animations.stop(null, true);
}

var Train = function(game, points, gap, isCycle) {
    Phaser.Sprite.call(this, game, 0, 0, 'train');
	this.scale.setTo(0.35, 0.35);
    this.anchor.setTo(0.5, 1);
    this.game.physics.enable(this, Phaser.Physics.ARCADE);

	this.sensor = game.add.sprite(0, 0, 'trainSensor');
	this.sensor.alpha = 0;
    this.game.physics.enable(this.sensor, Phaser.Physics.ARCADE);
	this.addChild(this.sensor);
		
    this.points = points;
    this.currentPointIt = 0;
    this.currentPoint = this.points[this.currentPointIt];    
    this.isCycle = isCycle || false;

    this.x = this.currentPoint.x;
    this.y = this.currentPoint.y;
    if (gap > 0) {
        var lastPoint = this.points[this.points.length - 1];
        var rotation = this.game.math.angleBetween(this.x, this.y, lastPoint.x, lastPoint.y);
        this.x += Math.cos(rotation) * this.width * 1.1 * gap;
        this.y += Math.sin(rotation) * this.width * 1.1 * gap;
    }
    this.run = false;
    
    this.MAX_SPEED = 50; // pixels/second
};
Train.prototype = Object.create(Phaser.Sprite.prototype);
Train.prototype.constructor = Train;
Train.prototype.update = function () {
    if (this.run) {
        // Calculate distance to target
        var distance = this.game.math.distance(this.x, this.y, this.currentPoint.x, this.currentPoint.y);
        
        // If the distance > MIN_DISTANCE then move
        if (this.game.time.fps * Math.floor(distance) > this.MAX_SPEED ) {
            // Calculate the angle to the target
            var rotation = this.game.math.angleBetween(this.x, this.y, this.currentPoint.x, this.currentPoint.y);

            // Calculate velocity vector based on rotation and this.MAX_SPEED
            this.body.velocity.x = Math.cos(rotation) * this.MAX_SPEED;
            this.body.velocity.y = Math.sin(rotation) * this.MAX_SPEED;
        } else {
            this.body.velocity.setTo(0, 0);
            this.x = this.currentPoint.x;
            this.y = this.currentPoint.y;
            if (this.currentPointIt < this.points.length - 1) {
                this.currentPointIt += 1;
                this.currentPoint = this.points[this.currentPointIt];
            } else {
                if (this.isCycle) {
                    this.currentPointIt = 0;
                    this.currentPoint = this.points[this.currentPointIt];
                } else {
                    this.stop();
                }
            }
        }
    }
},
Train.prototype.start = function () {
    this.run = true;
};
Train.prototype.stop = function () {
    this.run = false;
    this.body.velocity.setTo(0, 0);
};

// APPLICATION STATES
function Boot () {
}
Boot.prototype = {
    preload: function () {
        this.game.time.advancedTiming = true;
        this.load.image('preloader', 'assets/preloader.gif');
    },
    create: function () {
        this.game.input.maxPointers = 1;
        this.game.state.start('preload');
    }
};

function Preload () {
    this.asset = null;
    this.ready = false;
}
Preload.prototype = {    
    preload: function () {
        this.load.onLoadComplete.addOnce(this.onLoadComplete, this);
        this.asset = this.add.sprite(this.game.width / 2, this.game.height / 2, 'preloader');
        this.asset.anchor.setTo(0.5, 0.5);
        this.load.setPreloadSprite(this.asset);
    
        //this.game.stage.backgroundColor = '#ffffff';
        this.game.load.image('train', 'assets/train.png');
        this.game.load.image('trainSensor', 'assets/trainSensor.png');
        this.game.load.image('sensor', 'assets/sensor.png');
        this.game.load.image('background', 'assets/background.png');
        this.game.load.spritesheet('controlButton', 'assets/controlButton.png', 64, 64, 9);
        this.game.load.spritesheet('escapeButton', 'assets/escapeButton.png', 60, 60, 3);
        
		this.game.load.spritesheet('semaphor', 'assets/semaphor.png', 40, 250, 2);
        this.game.load.spritesheet('speedControl', 'assets/speedControl.png', 200, 200, 7);
		this.game.load.spritesheet('reactionButton', 'assets/button.png', 168, 168, 2);
		this.game.load.spritesheet('reactionSignal', 'assets/signal.png', 160, 160, 2);
        //this.game.load.spritesheet('reactionBell', 'assets/bell.png', 50, 50, 2);
        
		this.game.load.audio('ringing', 'assets/ringing.wav');
        
		this.game.load.json('tracksPoints', 'assets/tracks.json', true);

		this.game.CurrentStateEnum = {
			BEFORE_START       : "Before start",
			START              : "Start",
			NEED_REACTION      : "Need reaction",
			GAIN_REACTION      : "Gain reaction", 
			FIRST_NO_REACTION  : "First no reaction",
			SECOND_NO_REACTION : "Second no reaction",
			END                : "End"
		};
    },
    create: function () {
        this.asset.cropEnabled = false;
    },
    update: function () {
        if (!!this.ready) {
            this.game.state.start('menu');
        }
    },
    onLoadComplete: function () {
        this.ready = true;
    }
};
function Menu() {
}
Menu.prototype = {
    create: function () {      		
        this.game.physics.startSystem(Phaser.Physics.ARCADE);
		
        this.titleText = this.game.add.text(500, 100, 'WIZUALIZACJA', {
            font: '30px "Anaheim",sans-serif',
            fill: '#000'
        });
		this.titleText.anchor.setTo(0.5, 0.5);
				
        this.descriptionEasyText = this.game.add.text(250, 500, 'Przejazd bez uzależnienia od wskazań semafora', {
            font: '20px "Anaheim",sans-serif',
            fill: '#333'
        });
		this.descriptionEasyText.anchor.setTo(0.5, 0.5);
		this.easyButton = this.game.add.button(250, 420, 'controlButton', this.startEasySimulation, this, 2, 1, 0, 1);
		this.easyButton.anchor.setTo(0.5, 0.5);
		this.descriptionEasyText.anchor.setTo(0.5, 0.5);
		
		this.descriptionHardText = this.game.add.text(750, 500, 'Przejazd z uzależnieniem od wskazań semafora', {
            font: '20px "Anaheim",sans-serif',
            fill: '#333'
        });
		this.hardButton = this.game.add.button(750, 420, 'controlButton', this.startHardSimulation, this, 2, 1, 0, 1);
		this.hardButton.anchor.setTo(0.5, 0.5);
		this.descriptionHardText.anchor.setTo(0.5, 0.5);
		
		
        this.trainLogo = this.game.add.sprite(500, 200, 'train');
		this.trainLogo.scale.setTo(0.5, 0.5);
        this.trainLogo.anchor.setTo(0.5, 0.5);
	},
	startEasySimulation() {
		this.game.mode = 0;
        this.game.state.start('main');
	},
	startHardSimulation() {
		this.game.mode = 1;
        this.game.state.start('main');
	}	
};

function Main() {
}
Main.prototype = {
    create: function () {      		
        this.game.physics.startSystem(Phaser.Physics.ARCADE);
		
        //AUTOSTART
		//this.game.time.events.add(Phaser.Timer.SECOND * 1.5, this.startSimulation, this).autoDestroy = true;		
	    
		//BACKGORUND
		//this.game.stage.backgroundColor = '#fff';	
		var background = game.add.graphics(0, 0);
		background.beginFill(0xEEEEEE);
		background.drawRect(0, 0, 1000, 400);
		background.endFill();
		background.beginFill(0xCCCCCC, 0.3);
		background.drawRect(0, 400, 600, 200);
		background.endFill();
		background.beginFill(0xCCCCCC, 0.3);
		background.drawRect(600, 400, 400, 200);
		background.endFill();
        
        this.backgroundImage = this.game.add.sprite(0, 0, 'background');
		this.backgroundImage.width = 1000;
		this.backgroundImage.height = 400;
		
        //TRACKS
        this.tracksJSON = this.game.cache.getJSON('tracksPoints');
        this.tracksBitmap = this.game.add.bitmapData(this.game.width, this.game.height);
        this.drawTracks(this.tracksBitmap, this.tracksJSON.points, this.tracksJSON.isCycle);
        //this.tracks = this.game.add.sprite(0, 0, this.tracksBitmap);
        
        //SENSORS
        this.sensors = this.game.add.group();
        this.drawSensors(this.sensors, this.tracksJSON.points);
        this.reactionTimer = this.game.time.create(false);
		this.reactionTimer.repeat(Phaser.Timer.SECOND * 1.5, 2, this.checkReaction, this);
		this.ringingSound = this.game.add.audio('ringing', 0.5, true);
		
        //TRAIN
        this.train = new Train(this.game, this.tracksJSON.points, 0, this.tracksJSON.isCycle);
        this.game.add.existing(this.train);
        
        //this.wagons = this.game.add.group();
        //for (var i = 1; i < 1; i++) {
        //    this.wagons.add(new Train(this.game, this.tracksJSON.points, i, this.tracksJSON.isCycle));
        //}
		//SEMAPHORE
        if (this.game.mode != 0) {
			this.semaphor = this.game.add.button(10, 150, 'semaphor', this.semaphorClick, this, 0, 0, 0, 0);
			this.game.semaphorMode = 0;
		}
		
		this.game.add.button(394, 40, 'controlButton', this.startSimulation, this, 2, 1, 0, 1);
		this.game.add.button(468, 40, 'controlButton', this.pauseSimulation, this, 5, 4, 3, 4);
		this.game.add.button(542, 40, 'controlButton', this.resetSimulation, this, 8, 7, 6, 7);
		this.escapeButton = this.game.add.button(960, 40, 'escapeButton', this.gotoMenu, this, 2, 1, 0, 1);
		this.escapeButton.scale.setTo(0.6, 0.6);
		this.escapeButton.anchor.setTo(0.5, 0.5);
		
		//// DESCRIPTION	
		this.shpInfoLabel = this.game.add.text(500, 135, shpInfo, {
            font: 'bold 30px "Anaheim",sans-serif',
            fill: '#fff'
        });
		this.shpInfoLabel.anchor.setTo(0.5, 0.5);
		this.shpInfoLabel.visible = false
		
        this.descriptionTitle = this.game.add.text(20, 420, 'OPIS', {
            font: '30px "Anaheim",sans-serif',
            fill: '#000'
        });
        this.descriptionText = this.game.add.text(20, 460, '', {
            font: '20px "Anaheim",sans-serif',
            fill: '#222',
			wordWrap: true,
			wordWrapWidth: 600
        });
		
		//// CONTROL PANEL
        //REACTION BUTTON
        this.controlPanel = this.game.add.group();
		this.controlPanel.x = 600;
		this.controlPanel.y = 400;
		
		this.speedControl = this.controlPanel.add(new Phaser.Button(this.game, 50, 10, 'speedControl', this.speedControlClick, this, 0, 0, 0, 0));
		this.trainSpeed = 0;
		
		/*this.speedControl = this.controlPanel.add(new Phaser.Sprite(this.game, 200, 100, 'speedControl', 1));
		this.speedControl.inputEnabled = true;
		this.speedControl.anchor.set(0.5);
		this.speedControl.input.enableDrag();
		this.speedControl.input.allowHorizontalDrag = false;
		this.speedControl.input.boundsRect = new Phaser.Rectangle(0, 25, 400, 150);*/
		this.speedControl.input.useHandCursor = true;
		
		this.trainSpeedLabel = this.controlPanel.add(new Phaser.Text(this.game, 10, 100, '0', {
            font: '30px "Anaheim",sans-serif',
            fill: '#000'
        }));
		this.trainSpeedLabel.visible = false;
		
        //this.reactionButton = this.controlPanel.add(new ReactionButton(this.game, 325, 150, this.reactionClick, this));
        //this.reactionButton.anchor.setTo(0.5, 0.5);
				
		this.reactionButton = this.controlPanel.add(new Phaser.Button(this.game, 300, 150, 'reactionButton', this.reactionClick, this, 0, 0, 1, 0));
		this.reactionButton.scale.setTo(0.5, 0.5);
		this.reactionButton.anchor.setTo(0.5, 0.5);
		this.reactionButton.input.useHandCursor = true;
		
        this.reactionSignal = this.controlPanel.add(new Phaser.Sprite(this.game, 300, 50, 'reactionSignal', 0));
		this.reactionSignal.scale.setTo(0.5, 0.5);
        this.reactionSignal.anchor.setTo(0.5, 0.5);
        this.reactionSignal.animations.add('signaling', [0, 1], 8, true);
		
        //this.ringingBell = this.controlPanel.add(new Phaser.Sprite(this.game, 350, 50, 'reactionBell', 0));
        //this.ringingBell.anchor.setTo(0.5, 0.5);
        //this.ringingBell.animations.add('ringing', [0, 1], 8, true);
		
		this.setState(this.game.CurrentStateEnum.BEFORE_START);
    },
	setState: function(newState) {
		console.log("New state: " + newState);
		switch (newState) {
			case this.game.CurrentStateEnum.BEFORE_START:
				this.descriptionText.setText(this.game.mode ? startInfo23 : startInfo1);
				this.isTrainOverSensor = false;
				this.isRinging = false;
				this.isEnded = false;
				break;
				
			case this.game.CurrentStateEnum.START:
				if (this.game.mode === 0) {
					this.descriptionText.setText(opis11);
				} else {
					if (this.game.semaphorMode === 0) {
						this.descriptionText.setText(opis31);
					} else {
						this.descriptionText.setText(opis21);
					}
				}
				break;
				
			case this.game.CurrentStateEnum.NEED_REACTION:
				if (this.game.mode === 1 && this.game.semaphorMode === 0) {
					this.descriptionText.setText(opis32);
				} else {
					if (game.mode === 0) {
						this.descriptionText.setText(opis12);
					} else {
						this.descriptionText.setText(opis22);
					}
					//this.reactionButton.playAnimation();
					this.reactionSignal.play('signaling');
				}
				this.isReaction = false;
				this.reactionTimer.start();
				break;
			
			case this.game.CurrentStateEnum.GAIN_REACTION:	
				this.isReaction = true;	
				if (game.mode === 0) {
					this.descriptionText.setText(opis16);
				} else {
					this.descriptionText.setText(opis26);
				}
				//this.reactionButton.stopAnimation();
				this.ringingSound.stop();
				this.reactionSignal.animations.stop('signaling', true);
				//this.ringingBell.animations.stop('ringing', true);
				break;
			
			case this.game.CurrentStateEnum.FIRST_NO_REACTION:	
				if (this.game.mode === 1 && this.game.semaphorMode === 0) {
					this.descriptionText.setText(opis33);
				} else {
					if (game.mode === 0) {
						this.descriptionText.setText(opis13);
					} else {
						this.descriptionText.setText(opis23);
					}
					this.ringingSound.play();
					//this.ringingBell.play('ringing');
				}		
				this.isRinging = true;
				break;
				
			case this.game.CurrentStateEnum.SECOND_NO_REACTION:	
				if (this.game.mode === 1 && this.game.semaphorMode === 0) {
					this.descriptionText.setText(opis34);
				} else {
					if (game.mode === 0) {
						this.descriptionText.setText(opis15);
					} else {
						this.descriptionText.setText(opis25);
					}
					this.ringingSound.stop();
					this.reactionSignal.animations.stop('signaling', true);
					this.shpInfoLabel.visible = true;
					//this.ringingBell.animations.stop('ringing', true);
					//this.reactionButton.stopAnimation();
					this.train.stop();
					this.isEnded = true;
				}
				break;
				
			default:
				console.log("Unknown state");
				return;
		}
		this.game.currentState = newState;
	},
	
	// SIMULATION METHODS
    startSimulation: function () {
		if (!this.isEnded) {
			this.train.start();
			//this.wagons.callAll('start');
			if (this.reactionTimer.paused) {
				this.reactionTimer.resume();
			}
			if (this.game.currentState === this.game.CurrentStateEnum.BEFORE_START) {
				this.setState(this.game.CurrentStateEnum.START);
			}
		}
    },
    pauseSimulation: function () {
        this.train.stop();
        //this.wagons.callAll('stop');
		this.reactionTimer.pause();
    },
    resetSimulation: function () {
		this.reactionTimer.destroy();
		this.ringingSound.destroy();
        this.game.state.start('main');
    },
	gotoMenu: function () {
		this.reactionTimer.destroy();
		this.ringingSound.destroy();
        this.game.state.start('menu');
	},
    update: function () {
		if (!this.isTrainOverSensor) {
			this.isTrainOverSensor = this.game.physics.arcade.overlap(this.train.sensor, this.sensors, this.needReaction, null, this);
		} else {
			this.isTrainOverSensor = this.game.physics.arcade.overlap(this.train.sensor, this.sensors, null, null, this);
		}
		//this.trainSpeed = this.speedControl.y - 50;
		this.trainSpeedLabel.setText(this.trainSpeed.toString());
		this.train.MAX_SPEED = this.trainSpeed;
    },

	// REACTION METHODS
    needReaction: function () {
		this.setState(this.game.CurrentStateEnum.NEED_REACTION);
    },
    reactionClick: function () {
        if (!this.isReaction && (this.game.currentState === this.game.CurrentStateEnum.NEED_REACTION || this.game.currentState === this.game.CurrentStateEnum.FIRST_NO_REACTION)) {
			if (this.game.mode === 0 || this.game.semaphorMode === 1) {
				this.setState(this.game.CurrentStateEnum.GAIN_REACTION);
			}
        }
    },
    checkReaction: function () {
        if (!this.isReaction) {
			if (this.isRinging) {
				this.setState(this.game.CurrentStateEnum.SECOND_NO_REACTION);
			} else {
				this.setState(this.game.CurrentStateEnum.FIRST_NO_REACTION);
			}
        } else {
        }
    },  
	semaphorClick: function() {
		if (this.game.currentState === this.game.CurrentStateEnum.BEFORE_START) {
			var frame = (this.semaphor.frame + 1) % 2;
			this.semaphor.setFrames(frame, frame, frame, frame);
			this.game.semaphorMode = frame;
		}
	},  
	speedControlClick: function() {
		var frame = (this.speedControl.frame + 1) % 7;
		this.trainSpeed = frame * 15;
		this.speedControl.setFrames(frame, frame, frame, frame);
	},

	// DRAWING METHODS
    drawTracks: function (bitmap, points, isCycle) {
        var i;
        bitmap.ctx.beginPath();
        bitmap.ctx.lineWidth = "10";
        bitmap.ctx.moveTo(points[0].x, points[0].y);
        for (i = 1; i < points.length; i += 1) {
            bitmap.ctx.lineTo(points[i].x, points[i].y);
        }
        if (isCycle) {            
            bitmap.ctx.lineTo(points[0].x, points[0].y);
        }
        bitmap.ctx.stroke();
    },    
    drawSensors: function (group, points) {
        var i;
        for (i = 1; i < points.length; i += 1) {
            if (points[i].sensor) {
                group.add(new Sensor(group.game, points[i].x, points[i].y));
            }
        }
    }
};

var game = new Phaser.Game(gameW, gameH, Phaser.CANVAS, 'gameDiv', null, true);
game.state.add('boot', new Boot());
game.state.add('preload', new Preload());
game.state.add('menu', new Menu());
game.state.add('main', new Main());
game.state.start('boot');
