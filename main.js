const carCanvas = document.getElementById("carCanvas");
carCanvas.width = 500;
const networkCanvas = document.getElementById("networkCanvas");
networkCanvas.width = 300;

const laneQuantity = 5;
const mutationPercentage = 0.05;

const carCtx = carCanvas.getContext("2d");
const networkCtx = networkCanvas.getContext("2d");

const road = new Road(carCanvas.width/2,carCanvas.width*0.9, 5);

const N = 100;
const cars = generateCars(N);
let bestCar = cars[0];
if (localStorage.getItem("bestBrain")){
    for (let i = 0; i < cars.length; i++){
        cars[i].brain = JSON.parse(
            localStorage.getItem("bestBrain"));
        if(i != 0){
            NeuralNetwork.mutate(cars[i].brain, mutationPercentage);
        }
    }
}

const traffic= generateTraffic(laneQuantity);

animate();

function save(){
    localStorage.setItem("bestBrain",
        JSON.stringify(bestCar.brain));
}

function discard(){
    localStorage.removeItem("bestBrain");
}

function loadBest() {
    localStorage.setItem("bestBrain",
    trainedBrain);

    window.location.reload();
    return false;
}

function generateCars(N){
    const cars=[];
    for(let i = 1; i <= N; i++){
        cars.push(new Car(road.getLaneCenter(Math.floor(laneQuantity / 2)), 100, 30, 50, "AI"));
    }
    return cars;
}

function animate(time){
    for(let i = 0; i < traffic.length; i++){
        traffic[i].update(road.borders, []);
    }
    for(let i = 0; i < cars.length; i++){
        cars[i].update(road.borders, traffic);
    }
    bestCar = cars.find(
        c => c.y == Math.min(
            ...cars.map(c => c.y)
        ));

    carCanvas.height = window.innerHeight;
    networkCanvas.height = window.innerHeight;

    carCtx.save();
    carCtx.translate(0, -bestCar.y + carCanvas.height * 0.7);

    road.draw(carCtx);
    for(let i = 0; i < traffic.length; i++){
        traffic[i].draw(carCtx, "red");
    }
    carCtx.globalAlpha = 0.2;
    for(let i = 0; i < cars.length; i++){
        cars[i].draw(carCtx, "blue");
    }

    carCtx.globalAlpha = 1;
    bestCar.drawSensors = true;
    bestCar.draw(carCtx, "blue");
    
    for (let i = 0; i < cars.length; i++) {
        if (cars[i] === bestCar) {
            cars[i].drawSensors = true;
        } else {
            cars[i].drawSensors = false;
        }
    }

    carCtx.restore();

    networkCtx.lineDashOffset = -time/50;
    Visualizer.drawNetwork(networkCtx, bestCar.brain);
    requestAnimationFrame(animate);
}