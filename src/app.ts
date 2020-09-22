import { Game } from './game';
import { Constants, RoadConstants, RoadPiece } from './interfaces';
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
    Centrifugal: 0.3,
    Colors: {
        Sky: '#aec1c4',
        Grass: '#6ead7c',
    }
};
const roadConstants: RoadConstants = {
    SegmentLength: 200,
    RumbleLength: 6,
    Length: {None: 0, Short: 25, Medium: 50, Long: 100},
    Curve: {None: 0, Easy: 2, Medium: 4, Hard: 6},
    Colors: {
        Dark: '#666',
        Light: '#777',
    }
}

const road: RoadPiece[] = [
    {enter: roadConstants.Length.None, hold: roadConstants.Length.Long, leave: roadConstants.Length.None, curve: roadConstants.Curve.None},
    {enter: roadConstants.Length.Short, hold: roadConstants.Length.Medium, leave: roadConstants.Length.Short, curve: roadConstants.Curve.Medium},
]

let game = new Game(
    60, constants,
    new Player(300, 150, 'red'),
    new Road(roadConstants),
    new Renderer('canvas', constants)
);
game.start(road);
