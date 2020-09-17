import { Game } from './game';
import { Constants } from './interfaces';
import { Player } from './player';
import { Renderer } from './renderer';
import { Road } from './road';

const constants: Constants = {
    ZoomLevel: 1,
    RoadWidth: 2000,
    FieldOfView: 100,
    CameraHeight: 1000,
    DrawDistance: 300,
    MaxSpeed: 10000,
    Acceleration: 1000,
    Breaking: -10000,
    Deceleration: -1000,
    OffRoadDeceleration: -5000,
    OffRoadMinSpeed: 4000,
    Colors: {
        Dark: '#666',
        Light: '#777',
        Sky: '#aec1c4',
        Grass: '#6ead7c',
    }
};

let game = new Game(60, constants, new Player(300, 150, 'red'), new Road(200, 300, 6), new Renderer('canvas', constants));
game.start();
