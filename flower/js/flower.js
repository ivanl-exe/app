$(window).ready(() => play(flower));

const RESOLUTION_MULTIPLIER = 2;

async function flower(playback) {
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
                .map((f) => this.magnitude * f(this.angle));
        }
    }

    class PolarPencil {
        constructor(ctx, viewportDomain = [-1, 1], viewportRange = [-1, 1]) {
            this.ctx = ctx;
            this.viewportDomain = viewportDomain;
            this.viewportRange = viewportRange;
        }

        point(theta, r, drawer) {
            const magnitude = r(theta);
            const polarCoordinate = new PolarCoordinate(magnitude, theta);
            const [abscissa, ordinate] = polarCoordinate.toRectangular()
            const [x, y] = [
                (abscissa - this.viewportDomain[0]) / (this.viewportDomain[1] - this.viewportDomain[0]) * this.ctx.canvas.width,
                (ordinate - this.viewportRange[0]) / (this.viewportRange[1] - this.viewportRange[0]) * this.ctx.canvas.height
            ]
            drawer(
                this.ctx,
                {
                    "x": x,
                    "y": y
                }
            );
        }

        draw([fromTheta, toTheta], r, drawer, resolution = 100, style = "white") {
            const increment = safeDivision(2 * Math.PI, resolution);
            if(increment == 0) { return null; }
            let theta = fromTheta;
            this.ctx.strokeStyle = style;
            while(theta < toTheta) {
                this.point(theta, r, drawer);
                theta += increment;
            }
        }
    }

    //query
    window.query = new Query();
    
    //canvas
    const canvas = $("#flower-canvas");
    const ctx = canvas.get(0).getContext("2d");

    const polarPencil = new PolarPencil(ctx);

    //resize
    $(window).on("resize", () => {
        const squareLength = Math.min(
            window.innerWidth,
            window.innerHeight
        );
        canvas.width(squareLength);
        ctx.canvas.width = canvas.width() * RESOLUTION_MULTIPLIER;
        canvas.height(squareLength)
        ctx.canvas.height = canvas.height() * RESOLUTION_MULTIPLIER;

    }).trigger("resize");
    //display
    canvas.css("display", "block");

    //coefficient
    const coefficientVariableSlider = $("#flower-coefficient-variable");

    //offset
    const offsetVariableSlider = $("#flower-offset-variable");

    //divisions
    const divisionsVariableSlider = $("#flower-divisions-variable");

    //IIFE (immediately invoked function expression)
    (() => {
        const coefficientFactor = parseNumber(window.query.get("coefficient"));
        if(coefficientFactor != null) { coefficientVariableSlider.val(coefficientFactor); }
        const offsetFactor = parseNumber(window.query.get("offset"));
        if(offsetFactor != null) { offsetVariableSlider.val(offsetFactor); }
        const divisionsFactor = parseNumber(window.query.get("divisions"));
        if(divisionsFactor != null) { divisionsVariableSlider.val(divisionsFactor); }
    })();

    //coefficient factor
    coefficientVariableSlider.on("input", (e) => {
        const target = $(e.target);
        window.coefficientFactor = target.value();
    }).trigger("input");

    coefficientVariableSlider.on("change", (e) => {
        const target = $(e.target);
        query.set("coefficient", target.value());
    });

    //offset factor
    offsetVariableSlider.on("input", (e) => {
        const target = $(e.target);
        window.offsetFactor = target.value((value) => value / 180 * Math.PI);
    }).trigger("input");

    offsetVariableSlider.on("change", (e) => {
        const target = $(e.target);
        query.set("offset", target.value());
    });

    //divisions factor
    divisionsVariableSlider.on("input", (e) => {
        const target = $(e.target);
        window.divisionsFactor = target.value();
    }).trigger("input");

    divisionsVariableSlider.on("change", (e) => {
        const target = $(e.target);
        query.set("divisions", target.value());
    });
    
    //clear
    const clearCanvas = () => {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    }

    const canvasMouse = (e) => {
        const bounding = e.target.getBoundingClientRect();
        window.cursorX = (e.clientX - bounding.left) * RESOLUTION_MULTIPLIER;
        window.cursorY = (e.clientY - bounding.top) * RESOLUTION_MULTIPLIER;
    };

    canvas.on("mousedown", () => {
        canvas.on("mousemove", (e) => canvasMouse(e));
    });

    $(document).on("mouseup", () => {
        canvas.off("mousemove");
    })

    const animate = () => {
        if(playback.state() == playback.PLAY) {
            const offset = wrap(
                window.offsetFactor + 0.01,
                [0, 2 * Math.PI]
            ) / Math.PI * 180;
            console.log(offset);
            offsetVariableSlider.val(offset).trigger("input");
        }

        clearCanvas();
        polarPencil.draw(
            [0, 2 * Math.PI],
            (theta) => Math.sin(window.coefficientFactor * theta + window.offsetFactor),
            (ctx, obj) => {
                const [x, y] = [obj.x, obj.y];
                ctx.beginPath();
                ctx.moveTo(
                    window.cursorX != undefined ? window.cursorX : ctx.canvas.width / 2,
                    window.cursorY != undefined ? window.cursorY : ctx.canvas.height / 2
                );
                ctx.lineTo(x, y);
                ctx.stroke();
                ctx.closePath();
            },
            window.divisionsFactor
        );
        requestAnimationFrame(animate);
    }
    animate();
}