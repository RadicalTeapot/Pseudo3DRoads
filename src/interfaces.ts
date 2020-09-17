export interface Point {x: number, y: number, z: number};
export interface RoadPoint {world: Point, camera: Point, screen: Point, screenScale?: number};
export interface RoadSegment {index: number, p1: RoadPoint, p2: RoadPoint, color: string};
export interface Keys {left: boolean, right: boolean, up: boolean, down: boolean};
export interface GameState {keys: Keys, position: number, trackLength: number, roadSegments: RoadSegment[], cameraDepth: number};
export interface Colors {
    Dark: string,
    Light: string,
    Sky: string,
    Grass: string,
}
export interface Constants {
    /** Zoom level */
    ZoomLevel: number,
    RoadWidth: number,
    FieldOfView: number,
    CameraHeight: number,
    DrawDistance: number,
    /** Max speed */
    MaxSpeed: number,
    /** Acceleration */
    Acceleration: number,
    /** Braking */
    Breaking: number,
    Deceleration: number,
    OffRoadDeceleration: number,
    OffRoadMinSpeed: number,
    Colors: Colors,
}
