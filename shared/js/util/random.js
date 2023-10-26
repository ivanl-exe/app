const randomMagnitude = () => Math.random();

const randomAngle = () => Math.random() * 2 * Math.PI;

const randomColor = () => {
    return "#" + new Array(3)
        .fill(null)
        .map(() => Math.floor(Math.random() * 255))
        .map((n) => n.toString(16).padStart(2, "0"))
        .join("");
}
