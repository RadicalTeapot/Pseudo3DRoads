import { keyPressed, initKeys } from 'kontra';
import { Constants, Keys, RoadPiece, RoadSegment } from './interfaces';
import { Player } from './player';
import { Renderer } from './renderer';
import { Road } from './road';

export class Game {
    state: GameState;
    road: Road;
    player: Player;

    constructor(fps: number, constants: Constants, player: Player, road: Road, renderer: Renderer) {
        this.now_ = Date.now();
        this.last_ = this.now_;
        this.dt_ = 0;
        this.gdt_ = 0;
        this.step_ = 1 / fps;
        this.state = new GameState();
        this.road = road;
        this.player = player;
        this.constants_ = constants;
        this.renderer_ = renderer;

        this.frame = this.frame.bind(this);
        initKeys();
    }

    public start(pieces: RoadPiece[]) {
        this.road.buildRoad(pieces);
        this.state.reset(this.constants_);
        this.now_ = Date.now();
        this.last_ = this.now_;
        this.frame();
    }

    private checkKeys() {
        this.state.keys.left = keyPressed('left') || keyPressed('a');
        this.state.keys.right = keyPressed('right') || keyPressed('d');
        this.state.keys.up = keyPressed('up') || keyPressed('w');
        this.state.keys.down = keyPressed('down') || keyPressed('s');
    }

    private update() {
        this.checkKeys();

        this.state.position = (this.state.position + this.step_ * this.player.speed) % this.road.trackLength;
        let currentSegment = this.road.findSegment(this.state.position);
        // At max speed, cross road left to right in 1 sec
        let dx = this.dt_ * 2 * (this.player.speed / this.constants_.MaxSpeed);
        if (this.state.keys.left)
            this.player.roadX -= dx;
        else if (this.state.keys.right)
            this.player.roadX += dx;

        if (this.state.keys.up)
            this.player.speed += this.constants_.Acceleration * this.dt_;
        else if (this.state.keys.down)
            this.player.speed += this.constants_.Breaking * this.dt_;
        else
            this.player.speed += this.constants_.Deceleration * this.dt_;

        if ((this.player.roadX < -1 || this.player.roadX > 1) && (this.player.speed > this.constants_.OffRoadMinSpeed))
            this.player.speed += this.constants_.OffRoadDeceleration * this.dt_;

        this.player.roadX = Math.min(Math.max(this.player.roadX, -2), 2);
        this.player.roadX = this.player.roadX - (dx * (this.player.speed / this.constants_.MaxSpeed) * currentSegment.curve * this.constants_.Centrifugal);
        this.player.speed = Math.min(Math.max(this.player.speed, 0), this.constants_.MaxSpeed);

        this.player.width = this.player.baseWidth * (this.state.cameraDepth / this.state.playerZ) * this.renderer_.width / 2;
        this.player.height = this.player.baseHeight * (this.state.cameraDepth / this.state.playerZ) * this.renderer_.width / 2;
        this.player.x = this.renderer_.width / 2 - this.player.width * 0.5;
        // Add bounce to player y position
        this.player.y = this.renderer_.height - this.player.height * 1.5 + (1.5 * Math.random() * (this.player.speed / this.constants_.MaxSpeed) * (this.renderer_.height / 480) * (Math.random() > 0.5 ? -1 : 1));
    }

    private render() {
        this.renderer_.context.fillStyle = this.constants_.Colors.Sky;
        this.renderer_.context.fillRect(0, 0, this.renderer_.width, this.renderer_.height);

        let baseSegment = this.road.findSegment(this.state.position);
        let segmentPercent = (this.state.position % this.road.segmentLength) / this.road.segmentLength;
        let x = 0;
        let dx = - (segmentPercent * baseSegment.curve);
        let maxY = this.renderer_.height;
        let i: number, segment: RoadSegment;

        for (i = 0; i < this.constants_.DrawDistance; i++) {
            segment = this.road.segments[(baseSegment.index + i) % this.road.segmentsCount];

            this.renderer_.project(segment.p1, (this.player.roadX * this.constants_.RoadWidth) - x, this.constants_.CameraHeight, this.state.position - Math.floor((i+baseSegment.index)/this.road.segmentsCount) * this.road.trackLength, this.constants_.RoadWidth, this.state.cameraDepth);
            this.renderer_.project(segment.p2, (this.player.roadX * this.constants_.RoadWidth) - x - dx, this.constants_.CameraHeight, this.state.position - Math.floor((i+baseSegment.index)/this.road.segmentsCount) * this.road.trackLength, this.constants_.RoadWidth, this.state.cameraDepth);

            x = x + dx;
            dx = dx + segment.curve;

            if (segment.p1.camera.z <= this.state.cameraDepth || segment.p2.screen.y >= maxY)
                continue;

            // Render grass
            this.renderer_.renderPolygon(
                0,
                segment.p1.screen.y,
                this.renderer_.width,
                segment.p1.screen.y,
                this.renderer_.width,
                segment.p2.screen.y,
                0,
                segment.p2.screen.y,
                this.constants_.Colors.Grass
            );
            // Render road
            this.renderer_.renderPolygon(
                segment.p1.screen.x - segment.p1.screen.z,
                segment.p1.screen.y,
                segment.p1.screen.x + segment.p1.screen.z,
                segment.p1.screen.y,
                segment.p2.screen.x + segment.p2.screen.z,
                segment.p2.screen.y,
                segment.p2.screen.x - segment.p2.screen.z,
                segment.p2.screen.y,
                segment.color
                // `hsl(${360 * segment.index / this.road.segments.length}, 100%, 66%)`
            );

            maxY = segment.p2.screen.y;
        }

        this.player.render(this.renderer_);
    }

    /** Game loop with fixed time step update */
    private frame() {
        this.now_ = Date.now();
        this.dt_ = Math.min(1, (this.now_ - this.last_) / 1000);
        this.gdt_ = this.gdt_ + this.dt_;
        while (this.gdt_ > this.step_) {
            this.gdt_ = this.gdt_ - this.step_;
            this.update();
        }
        this.render();
        this.last_ = this.now_;
        requestAnimationFrame(this.frame);
    }

    private constants_: Constants;
    private renderer_: Renderer;
    private now_: number;
    private last_: number;
    /** Time since last update, in seconds, up to 1 sec */
    private dt_: number;
    private gdt_: number;
    private step_: number;
}

export class GameState {
    keys: Keys = {left: false, right: false, up: false, down: false};
    position: number = 0;
    cameraDepth: number = 0;
    playerZ: number = 0;

    constructor() {
        this.keys = {left: false, right: false, up: false, down: false};
        this.position = 0;
        this.cameraDepth = 0;
        this.playerZ = 0;
    }

    public reset(constants: Constants) {
        this.position = 0;
        this.cameraDepth = 1 / Math.tan((constants.FieldOfView / 2) * Math.PI / 180);
        this.playerZ = constants.CameraHeight * this.cameraDepth;
    }
}
