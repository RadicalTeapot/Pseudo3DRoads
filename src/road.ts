import { Constants, RoadSegment } from './interfaces';

export class Road {
    segments: RoadSegment[];

    public get trackLength() : number { return this.trackLength_; }

    constructor(segmentLength: number, segmentCount: number, rumbleLength: number) {
        this.segments = [];
        this.segmentCount_ = segmentCount;
        this.segmentLength_ = segmentLength;
        this.rumbleLength_ = rumbleLength;
        this.trackLength_ = this.segmentCount_ * this.segmentLength_;
    }

    public buildRoad(constants: Constants) {
        this.segments = [];
        for (let i = 0; i < this.segmentCount_; i++) {
            this.segments.push({
                index: i,
                p1: {world: {x: 0, y: 0, z: i * this.segmentLength_}, camera: {x: 0, y: 0, z: 0}, screen: {x: 0, y: 0, z:0}},
                p2: {world: {x: 0, y: 0, z: (i+1) * this.segmentLength_}, camera: {x: 0, y: 0, z:0}, screen: {x: 0, y: 0, z:0}},
                color: Math.floor(i/this.rumbleLength_)%2 ? constants.Colors.Dark : constants.Colors.Light
            })
        }
    }

    public findSegment(z: number): RoadSegment {
        return this.segments[Math.floor(z/this.segmentLength_) % this.segmentCount_];
    }

    private rumbleLength_: number;
    private segmentLength_: number;
    private trackLength_: number;
    private segmentCount_: number;
}
