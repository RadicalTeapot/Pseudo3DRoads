export interface Point {x: number, y: number, z: number};
export interface RoadPoint {world: Point, camera: Point, screen: Point, screenScale?: number};
export interface RoadSegment {index: number, p1: RoadPoint, p2: RoadPoint, color: string, curve: number};
export interface RoadPiece {enter: number, hold: number, leave: number, curve: number};
export interface Keys {left: boolean, right: boolean, up: boolean, down: boolean};
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
    Centrifugal: number,
    Colors: {Sky: string, Grass: string},
}

export interface RoadConstants {
    SegmentLength: number,
    RumbleLength: number,
    Length: {None: number, Short: number, Medium: number, Long: number},
    Curve: {None: number, Easy: number, Medium: number, Hard: number},
    Colors: {Light: string, Dark: string},
}
