class TargetEditor extends MarkingEditor {
    constructor(viewport, world) {
        super(viewport, world, world.laneGuides);
    }

    createMarking(center, directionVector) {
        return new Target(
            center,
            directionVector,
            world.roadWidth,
            world.roadWidth / 2
        );
    }
}