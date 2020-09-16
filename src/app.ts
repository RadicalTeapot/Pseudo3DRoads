import { init, Sprite, GameLoop, initKeys, keyPressed } from 'kontra';
import * as c from './gameConstants';
import * as colors from './colors';

interface Point {x?: number, y?: number, z?: number};
interface RoadPoint {world: Point, camera: Point, screen: Point, screenScale?: number};
interface RoadSegment {index: number, p1: RoadPoint, p2: RoadPoint, color: string};
interface Keys {left: boolean, right: boolean, up: boolean, down: boolean};
interface GameState {keys: Keys, position: number, trackLength: number, roadSegments: RoadSegments[], cameraDepth: number};

// Make canvas full screen
let canvas: HTMLCanvasElement = document.getElementById("canvas");
canvas.width = innerWidth;
canvas.height = innerHeight;
let { context } = init(canvas);
context.scale(c.ZoomLevel, c.ZoomLevel);
let width = innerWidth / c.ZoomLevel;
let height = innerHeight / c.ZoomLevel;

initKeys();

let player = Sprite({
    color: 'red',  // fill color of the sprite rectangle
    x: 0,
    y: 0,
    baseWidth: 300,
    baseHeight: 150,

    speed: 0,
    /** Position relative to road center, normalized to -1, 1 */
    roadX: 0,
});

function checkKeys(state: GameState) {
    state.keys.left = keyPressed('left') || keyPressed('a');
    state.keys.right = keyPressed('right') || keyPressed('d');
    state.keys.up = keyPressed('up') || keyPressed('w');
    state.keys.down = keyPressed('down') || keyPressed('s');
}

function resetRoad(): {segments: RoadSegments[], trackLength: number} {
    let segments: RoadSegment[] = [];
    const segCount = c.RumbleLength * 2 * 10;
    for (let i = 0; i < segCount; i++) {
        segments.push({
            index: i,
            p1: {world: {z: i * c.SegmentLength}, camera: {}, screen: {}},
            p2: {world: {z: (i+1) * c.SegmentLength}, camera: {}, screen: {}},
            color: Math.floor(i/c.RumbleLength)%2 ? colors.Dark : colors.Light
        })
    }

    return {segments: segments, trackLength: segments.length * c.SegmentLength};
}

function findSegment(z: number, segments: RoadSegments[]): RoadSegment {
    return segments[Math.floor(z/c.SegmentLength) % segments.length];
}

function renderPolygon(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, x4: number, y4: number, color: string) {
    context.fillStyle = color;
    // context.strokeStyle = 'rgba(255,0,0,0.5)';
    context.lineWidth = 0.25;
    context.beginPath();
    context.moveTo(x1, y1);
    context.lineTo(x2, y2);
    context.lineTo(x3, y3);
    context.lineTo(x4, y4);
    context.closePath();
    context.fill();
    // context.stroke();
}

function project(p: RoadPoint, cameraX: number, cameraY: number, cameraZ: number, width: number, height: number, roadWidth: number) {
    p.camera.x = (p.world.x || 0) - cameraX;
    p.camera.y = (p.world.y || 0) - cameraY;
    p.camera.z = (p.world.z || 0) - cameraZ;
    p.screenScale = state.cameraDepth / p.camera.z;
    p.screen.x = Math.round((width / 2) + (p.screenScale * p.camera.x * width/2));
    p.screen.y = Math.round((height / 2) - (p.screenScale * p.camera.y * height/2));
    p.screen.z = Math.round(p.screenScale * roadWidth * width/2);
}

function resetState(state: GameState) {
    const {segments, trackLength} = resetRoad();
    state.roadSegments = segments;
    state.trackLength = trackLength;
    state.cameraDepth = 1 / Math.tan((c.FieldOfView / 2) * Math.PI / 180);
    state.position = 0;
    state.playerZ = c.CameraHeight * state.cameraDepth;
}

let state: GameState = {
    keys: {left: false, right: false, up: false, down: false},
    position: 0,
    trackLength: 0,
    roadSegments: [],
    cameraDepth: 0,
    playerZ: 0,
}

let loop = GameLoop({  // create the main game loop
    clearCanvas: true,

    update: function (dt: number) {
        checkKeys(state);

        state.position = (state.position + dt * player.speed) % state.trackLength;
        // At max speed, cross road left to right in 1 sec
        let dx = dt * 2 * (player.speed / c.MaxSpeed);
        if (state.keys.left)
            player.roadX -= dx;
        else if (state.keys.right)
            player.roadX += dx;

        if (state.keys.up)
            player.speed += c.Acceleration * dt;
        else if (state.keys.down)
            player.speed += c.Breaking * dt;
        else
            player.speed += c.Deceleration * dt;

        if ((player.roadX < -1 || player.roadX > 1) && (player.speed > c.OffRoadMinSpeed))
            player.speed += c.OffRoadDeceleration * dt;

        player.roadX = Math.min(Math.max(player.roadX, -2), 2);
        player.speed = Math.min(Math.max(player.speed, 0), c.MaxSpeed);

        let bounce =
        player.width = player.baseWidth * (state.cameraDepth / state.playerZ) * width / 2;
        player.height = player.baseHeight * (state.cameraDepth / state.playerZ) * width / 2;
        player.x = width / 2 - player.width * 0.5;
        // Add bounce to player y position
        player.y = height - player.height * 1.5 + (1.5 * Math.random() * (player.speed / c.MaxSpeed) * (height / 480) * (Math.random() > 0.5 ? -1 : 1));
    },

    render: function() {
        context.fillStyle = colors.Sky;
        context.fillRect(0, 0, width, height);

        // todo : use Kontra group to group road rendering
        let baseSegment = findSegment(state.position, state.roadSegments);
        let maxy = height;
        let i: number, segment: RoadSegment;
        let looped = false;

        for (i = 0; i < c.DrawDistance; i++) {
            segment = state.roadSegments[(baseSegment.index + i) % state.roadSegments.length];

            project(segment.p1, (player.roadX * c.RoadWidth), c.CameraHeight, state.position - Math.floor((i+baseSegment.index)/state.roadSegments.length) * state.trackLength, width, height, c.RoadWidth);
            project(segment.p2, (player.roadX * c.RoadWidth), c.CameraHeight, state.position - Math.floor((i+baseSegment.index)/state.roadSegments.length) * state.trackLength, width, height, c.RoadWidth);

            if (segment.p1.camera.z <= state.cameraDepth || segment.p2.screen.y >= maxy)
                continue;

            renderPolygon(
                0,
                segment.p1.screen.y,
                width,
                segment.p1.screen.y,
                width,
                segment.p2.screen.y,
                0
                segment.p2.screen.y,
                colors.Grass
            );
            renderPolygon(
                segment.p1.screen.x - segment.p1.screen.z,
                segment.p1.screen.y,
                segment.p1.screen.x + segment.p1.screen.z,
                segment.p1.screen.y,
                segment.p2.screen.x + segment.p2.screen.z,
                segment.p2.screen.y,
                segment.p2.screen.x - segment.p2.screen.z,
                segment.p2.screen.y,
                segment.color
                // `hsl(${360 * segment.index / state.roadSegments.length}, 100%, 66%)`
            );

            maxy = segment.p2.screen.y;
        }

        player.render();
    };
});

resetState(state);
loop.start();    // start the game
