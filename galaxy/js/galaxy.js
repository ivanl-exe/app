$(window).ready(() => play(galaxy));

async function galaxy(playback) {
    class PolarCoordinate {
        constructor(magnitude, angle) {
            this.magnitude = magnitude;
            this.angle = angle;
        }

        toRectangular() {
            return [Math.cos, Math.sin]
                // .map((f) => (angle) => {
                //     const leg = f(angle);
                //     return leg >= 0 ? leg : leg + (2 * Math.PI);
                // })
                .map((f) => this.magnitude / f(this.angle));
        }
    }

    class Star {
        constructor(polarCoordinate = null, radius = 0, color = null) {
            if(polarCoordinate == null) { polarCoordinate = new PolarCoordinate(0, 0); }
            this.polarCoordinate = polarCoordinate;
            this.radius = radius
            if(color == null) { color = randomColor(); }
            this.color = color;
        }

        animate(magnitudeProgression, radiusProgression) {
            this.polarCoordinate.magnitude += magnitudeProgression;
            this.radius += radiusProgression;
        }
    }

    class Galaxy {
        constructor(ctx) {
            this.ctx = ctx;
            this.stars = [];
        }

        addStars(...star) {
            this.stars.push(...star);
        }

        createStars(n = 1) {
            for(let i = 0; i < n; i++) {
                const [r, theta] = [0, randomAngle()]
                const polarCoordinate = new PolarCoordinate(r, theta);
                const star = new Star(polarCoordinate);
                this.addStars(star);
            }
        }

        #getResolution() {
            return [
                this.ctx.canvas.width,
                this.ctx.canvas.height
            ]
        }

        #calculateCenter() {
            return this.#getResolution().map((n) => n / 2);
        }

        #calculateDiagonal() {
            return Math.sqrt(
                this.#getResolution().map((n) => Math.pow(n, 2)).sum()
            );
        }

        animate(magnitudeLambda, radiusLambda) {
            this.stars.forEach((star) => {
                star.animate(
                    ...[magnitudeLambda, radiusLambda]
                        .map((f) => f(star.polarCoordinate))
                    )
            });
        }

        draw() {
            const [centerX, centerY] = this.#calculateCenter();
            const diagonal = this.#calculateDiagonal();
            
            let [i, removed] = [0, 0]
            while(true) {
                if(i >= this.stars.length) { break; }

                const star = this.stars[i];
                //polar-rectangular calculations
                const [dx, dy] = star.polarCoordinate.toRectangular();
                const [x, y] = [
                    diagonal * dx + centerX,
                    diagonal * dy + centerY 
                ];
                
                if(
                    (x + star.radius) < 0 ||
                    (x - star.radius) > this.ctx.canvas.width ||
                    (y + star.radius) < 0 ||
                    (y - star.radius) > this.ctx.canvas.height
                ) {
                    this.stars.splice(i, 1);
                    removed++;
                }
                else {
                    i++;
                }

                //canvas
                this.ctx.fillStyle = star.color;
                this.ctx.beginPath();
                this.ctx.arc(x, y, star.radius, 0, 2 * Math.PI);
                this.ctx.fill();
            }
            return removed;
        }
    }
    
    //query
    window.query = new Query();

    //canvas
    const canvas = $("#galaxy-canvas");
    const ctx = canvas.get(0).getContext("2d");

    const clearCanvas = () => {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    }

    //resize
    $(window).on("resize", () => {
        ctx.canvas.width = canvas.width();
        ctx.canvas.height = canvas.height();
    }).trigger("resize");

    //galaxy
    const galaxy = new Galaxy(ctx);

    const magnitudeProgressionSlider = $("#galaxy-magnitude-progression");
    const radiusProgressionSlider = $("#galaxy-radius-progression");

    //IIFE (immediately invoked function expression)
    (() => {
        const magnitudeFactor = parseNumber(window.query.get("magnitude"));
        if(magnitudeFactor != null) { magnitudeProgressionSlider.val(magnitudeFactor); }
        const radiusFactor = parseNumber(window.query.get("radius"));
        if(radiusFactor != null) {
            radiusProgressionSlider.val(
                radiusFactor * (radiusProgressionSlider.attr("max") - radiusProgressionSlider.attr("min"))
            );
        }
    })();

    //magnitude factor
    magnitudeProgressionSlider.on("input", (e) => {
        const target = $(e.target);
        window.magnitudeFactor = target.value();
    }).trigger("input");

    magnitudeProgressionSlider.on("change", () => {
        window.query.set("magnitude", window.magnitudeFactor);
    });
    
    //radius factor
    radiusProgressionSlider.on("input", (e) => {
        const target = $(e.target);
        window.radiusFactor = target.value((value) => {
            return value / (target.attr("max") - target.attr("min"))
        });
    }).trigger("input");

    radiusProgressionSlider.on("change", () => {
        window.query.set("radius", window.radiusFactor);
    });
    
    //stars
    const polarQuarter = Math.PI / 2;
    const magnitudeLambda = (polarCoordinate) => {
        const modulus = Math.abs(polarCoordinate.angle.modulo(polarQuarter));
        const extremaProximity = new Number(
            modulus > (polarQuarter / 2) ? Math.PI - modulus : modulus
        ).modulo(polarQuarter)
        return (1 / window.magnitudeFactor) * Math.tan(extremaProximity / polarQuarter);
    }
    
    const radiusLambda = (polarCoordinate) => {
        return window.radiusFactor;
    }

    //animate
    const animate = () => {
        clearCanvas();
        galaxy.draw();
        if(playback.state() === playback.PLAY) {
            galaxy.createStars(1);
            galaxy.animate(
                magnitudeLambda,
                radiusLambda
            );
        }
        requestAnimationFrame(animate);
    }
    animate();
}
