const START_NUM_BOIDS = 150

let boids = []
let align = true
let cohesion = true
let avoid = true
let alignWeight = .5
let cohesionWeight = .2
let avoidWeight = .125

function setup() {
    createCanvas(windowWidth, windowHeight - 4)
    for (let i = 0; i < START_NUM_BOIDS; i++) {
        boids.push(new Boid())
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight - 4)
}

function draw() {
    clear()
    for (let boid of boids) {
        boid.calcForce(boids)
    }
    for (let boid of boids) {
        boid.updateBoid()
        boid.draw()
    }
}


// ---------------------------------------------------------------------------


class Boid {
    static MAX_SPEED = 4
    static MAX_FORCE = 0.03
    static SIGHT_RAD = 100
    static SIGHT_ANGLE = 5

    debug = false
    width = 10
    pos
    vel
    acc

    constructor(posX = random() * width, posY = random() * height) {
        this.pos = createVector(posX, posY)
        this.vel = p5.Vector.random2D().setMag(Boid.MAX_SPEED)
        this.acc = createVector(0, 0)
    }

    calcForce(otherBoids) {
        const localBoids = this.getLocalBoids(otherBoids)
        if (localBoids.length === 0) return;
        if (avoid) this.acc.add(this.getAvoidanceForce(localBoids).mult(avoidWeight))
        if (cohesion) this.acc.add(this.getCohesionForce(localBoids).mult(cohesionWeight))
        if (align) this.acc.add(this.getAlignForce(localBoids).mult(alignWeight))
    }

    updateBoid() {
        this.vel.add(this.acc).limit(Boid.MAX_SPEED)

        this.pos.add(this.vel)
        this.wrapPos()
    }

    draw() {
        push();
        fill(255, 204, 0)
        translate(this.pos.x, this.pos.y);
        rotate(this.vel.heading() - radians(90));
        triangle(0,0, this.width,0, this.width / 2,this.width * 1.2)
        pop()
        if (this.debug) {
            noFill()
            ellipse(this.pos.x, this.pos.y, Boid.SIGHT_RAD * 2)
        }
    }

    isWithinAngle(boid) {
        let heading = this.vel.heading() + Math.PI
        let otherHeading = p5.Vector.sub(this.pos, boid.pos).heading() + Math.PI
        if (Math.abs(heading - otherHeading) < Boid.SIGHT_ANGLE/2) return true
        return (Math.PI * 2 - Math.max(heading, otherHeading) + Math.min(heading, otherHeading) < Boid.SIGHT_ANGLE/2)
    }

    getLocalBoids(otherBoids) {
        const localBoids = []
        for (let b of otherBoids) {
            if (b === this) continue
            let heading = this.vel.heading() + Math.PI
            let otherHeading = b.vel.heading() + Math.PI
            if (dist(this.pos.x, this.pos.y, b.pos.x, b.pos.y) <= Boid.SIGHT_RAD
                    && this.isWithinAngle(b)) {
                localBoids.push(b)
            }
        }
        return localBoids
    }

    getAvoidanceForce(localBoids) {
        let steer = createVector(0, 0)
        let count = 0
        for (let b of localBoids) {
            let d = dist(this.pos.x, this.pos.y, b.pos.x, b.pos.y)
            if (d === 0) continue
            let diff = p5.Vector.sub(this.pos, b.pos)
            diff.normalize().div(d)
            steer.add(diff)
            count++
        }
        if (count === 0) return
        steer.div(count) //This is the average avoidance velocity
        //Steering = desiredVelocity - currentVelocity
        steer.setMag(Boid.MAX_SPEED).sub(this.vel)
        return steer.limit(Boid.MAX_FORCE)
    }

    getCohesionForce(localBoids) {
        let sum = createVector(0, 0)
        for (let b of localBoids) {
            sum.add(b.pos)
        }
        sum.div(localBoids.length) //This is the average position
        let steer = sum.sub(this.pos) //Vector towards avgerage position

        //Steering = desiredVelocity - currentVelocity
        steer.setMag(Boid.MAX_SPEED).sub(this.vel)
        return steer.limit(Boid.MAX_FORCE)
    }

    getAlignForce(localBoids) {
        let sum = createVector(0, 0)
        for (let b of localBoids) {
            sum.add(b.vel)
        }
        sum.div(localBoids.length) //This is the average velocity

        //Steering = desiredVelocity - currentVelocity
        sum.setMag(Boid.MAX_SPEED).sub(this.vel)
        return sum.limit(Boid.MAX_FORCE)
    }

    wrapPos() {
        const BUFFER_SIZE = 5
        if (this.pos.x < -BUFFER_SIZE) this.pos.x = width + BUFFER_SIZE
        if (this.pos.x > width + BUFFER_SIZE) this.pos.x = -BUFFER_SIZE
        if (this.pos.y < -BUFFER_SIZE) this.pos.y = height + BUFFER_SIZE
        if (this.pos.y > height + BUFFER_SIZE) this.pos.y = -BUFFER_SIZE
    }
}
