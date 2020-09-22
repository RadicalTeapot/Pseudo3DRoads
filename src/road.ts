import { RoadConstants, RoadPiece, RoadSegment } from './interfaces';

export class Road {
    segments: RoadSegment[];

    public get trackLength() : number { return this.trackLength_; }
    public get segmentsCount(): number { return this.segmentsCount_; }
    public get segmentLength(): number { return this.constants_.SegmentLength; }

    constructor(constants: RoadConstants) {
        this.segments = [];
        this.constants_ = constants;
        this.trackLength_ = 0;
        this.segmentsCount_ = 0;
    }

    public buildRoad(pieces: RoadPiece[]) {
        this.segments = [];
        pieces.forEach(piece => this.addRoad(piece));
        this.segmentsCount_ = this.segments.length;
        this.trackLength_ = this.segmentsCount_ * this.constants_.SegmentLength;
    }

    public findSegment(z: number): RoadSegment {
        return this.segments[Math.floor(z/this.constants_.SegmentLength) % this.segmentsCount_];
    }

    private addSegment(curve: number) {
        let index = this.segments.length;
        this.segments.push({
            index: index,
            curve: curve,
            p1: { world: { x: 0, y: 0, z: index * this.constants_.SegmentLength }, camera: { x: 0, y: 0, z: 0 }, screen: { x: 0, y: 0, z: 0 } },
            p2: { world: { x: 0, y: 0, z: (index + 1) * this.constants_.SegmentLength }, camera: { x: 0, y: 0, z: 0 }, screen: { x: 0, y: 0, z: 0 } },
            color: Math.floor(index/this.constants_.RumbleLength)%2 ? this.constants_.Colors.Dark : this.constants_.Colors.Light
        })
    }

    private addRoad(piece: RoadPiece) {
        let i;
        for (i = 0; i < piece.enter; i++)
            this.addSegment(this.easeIn(0, piece.curve, i / piece.enter));
        for (i = 0; i < piece.hold; i++)
            this.addSegment(piece.curve);
        for (i = 0; i < piece.leave; i++)
            this.addSegment(this.easeOut(piece.curve, 0, i / piece.leave));
    }

    private easeIn(a: number, b: number, percent: number) {
        return a + (b - a) * Math.pow(percent, 2);
    };

    private easeOut(a: number, b: number, percent: number) {
        return a + (b - a) * (1 - Math.pow(1 - percent, 2));
    }

    private easeInOut(a: number, b: number, percent: number) {
        return a + (b - a) * ((-Math.cos(percent * Math.PI) / 2) + 0.5);
    }

    private constants_: RoadConstants;
    private segmentsCount_: number;
    private trackLength_: number;
}
