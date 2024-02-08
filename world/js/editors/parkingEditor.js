class ParkingEditor extends MarkingEditor {
    constructor(viewport, world) {
        super(viewport, world, world.laneGuides);
    }

    createMarking(center, directionVector) {
        return new Parking(
            center,
            directionVector,
            world.roadWidth,
            world.roadWidth / 2
        );
    }
}