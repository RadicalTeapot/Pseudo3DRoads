import { Renderer } from "./renderer";

export class Player {
    color: string;
    x: number;
    y: number;
    baseWidth: number;
    width: number;
    baseHeight: number;
    height: number;
    speed: number;
    /** Position relative to road center, normalized to -1, 1 */
    roadX: number;

    constructor(width: number, height: number, color: string) {
        this.width = width;
        this.baseWidth = width; // 300
        this.height = height;
        this.baseHeight = height; // 150
        this.x = 0;
        this.y = 0;
        this.speed = 0;
        this.roadX = 0;
        this.color = color;
    }

    public render(renderer: Renderer) {
        renderer.context.fillStyle = this.color;
        renderer.context.fillRect(this.x, this.y, this.width, this.height);
    }
}
