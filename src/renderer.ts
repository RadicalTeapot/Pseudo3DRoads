import { init } from 'kontra';
import { Constants, RoadPoint } from './interfaces';

export class Renderer {

    public get canvas(): HTMLCanvasElement { return this.canvas_; }
    public get context(): CanvasRenderingContext2D { return this.context_; }
    public get width(): number { return this.width_; }
    public get height(): number { return this.height_; }

    constructor(canvasElementID: string, constants: Constants)
    {
        // todo add safety check for canvas existence
        this.canvas_ = document.getElementById(canvasElementID) as HTMLCanvasElement;
        this.canvas_.width = innerWidth;
        this.canvas_.height = innerHeight;
        const { context } = init(this.canvas_);
        this.context_ = context;
        this.context_.scale(constants.ZoomLevel, constants.ZoomLevel);
        this.width_ = innerWidth / constants.ZoomLevel;
        this.height_ = innerHeight / constants.ZoomLevel;
    }

    public renderPolygon(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, x4: number, y4: number, color: string) {
        this.context_.fillStyle = color;
        // this.context_.strokeStyle = 'rgba(255,0,0,0.5)';
        this.context_.lineWidth = 0.25;
        this.context.beginPath();
        this.context_.moveTo(x1, y1);
        this.context_.lineTo(x2, y2);
        this.context_.lineTo(x3, y3);
        this.context_.lineTo(x4, y4);
        this.context_.closePath();
        this.context_.fill();
        // this.context_.stroke();
    }

    public project(p: RoadPoint, cameraX: number, cameraY: number, cameraZ: number, roadWidth: number, cameraDepth: number) {
        p.camera.x = (p.world.x || 0) - cameraX;
        p.camera.y = (p.world.y || 0) - cameraY;
        p.camera.z = (p.world.z || 0) - cameraZ;
        p.screenScale = cameraDepth / p.camera.z;
        p.screen.x = Math.round((this.width_ / 2) + (p.screenScale * p.camera.x * this.width_/2));
        p.screen.y = Math.round((this.height_ / 2) - (p.screenScale * p.camera.y * this.height_/2));
        p.screen.z = Math.round(p.screenScale * roadWidth * this.width_/2);
    }

    private canvas_: HTMLCanvasElement;
    private context_: CanvasRenderingContext2D;
    private width_: number;
    private height_: number;
}
