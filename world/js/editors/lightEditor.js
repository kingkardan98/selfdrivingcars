class LightEditor extends MarkingEditor {
    constructor(viewport, world) {
        super(viewport, world, world.laneGuides);
    }

    createMarking(center, directionVector) {
        return new Light(
            center,
            directionVector,
            world.roadWidth,
            world.roadWidth / 2
        );
    }
}