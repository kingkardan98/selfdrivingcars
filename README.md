# SELF DRIVING CARS

## Description

This is a fully working self driving car, implemented using a neural network, which I trained using a genetic algorithm and mutation.
The `world` folder is for a possible future implementation.

## How to use

The [Github Pages](https://kingkardan98.github.io/selfdrivingcars/) link takes you to a page where traffic is generated, and 100 cars are spawned with random brains. Rays are cast from one car (which is the best performing car at the moment), to signal what it sees and at what distance.

The goal is to get the blue cars as far as possible through traffic, without colliding either with traffic cars or road borders, by training them and iterating through different generations.

On the right side of the screen is a nice visualizer of what's happening with the neurons. The bottom layer lights up accordingly to the sensors' readings, while the top most layers represent movements (as indicated by the small arrow keys drawn on top).

There are three small buttons:

- **Save** (💾): this saves the current brain as the "best brain", and is restored upon loading the page. This is then used as a base to mutate and improve, so to get cars further.

- **Delete** (🗑️): this deletes the currently saved best brain, and resets the cars to random brains.

- **Load best** (⭐): this loads in the best brain I've personally trained, which is capable of weaving through all traffic, and then going on indefinetely. It was three rough hours but it was worth it.

You can play with many parameters, to make it as easy or as hard as you want!

Here are some parameters.

In `main.js`:
- generated car count
- lane count
- mutation percentage

In `sensor.js`:
- ray count
- ray spread
- ray length

In `car.js`:
- car speeds
- car colors

In `utils.js` there's a function that generates traffic, change it up to make up a different challenge!