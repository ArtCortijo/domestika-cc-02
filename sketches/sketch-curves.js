const canvasSketch = require("canvas-sketch");
const random = require("canvas-sketch-util/random");
const math = require("canvas-sketch-util/math");
const colormap = require("colormap");

const settings = {
	dimensions: [1080, 1080],
	animate: true,
};

const sketch = ({ width, height }) => {
	const cols = 72;
	const rows = 8;
	const numCells = cols * rows;

	// Grid
	const gridWidth = width * 0.8;
	const gridHeight = height * 0.8;

	// Cell
	const cellWidth = gridWidth / cols;
	const cellHeight = gridHeight / rows;

	// Margin
	const mx = (width - gridWidth) * 0.5;
	const my = (height - gridHeight) * 0.5;

	const points = [];

	let x, y, n, lineWidth;
	let frequency = 0.002;
	let amplitude = 90;

	const colors = colormap({
		colormap: "salinity",
		nshades: amplitude,
	});

	for (let i = 0; i < numCells; i++) {
		x = (i % cols) * cellWidth;
		y = Math.floor(i / cols) * cellHeight;

		n = random.noise2D(x, y, frequency, amplitude);
		// x += n;
		// y += n;

		lineWidth = math.mapRange(n, -amplitude, amplitude, 0, 5);

		color =
			colors[Math.floor(math.mapRange(n, -amplitude, amplitude, 0, amplitude))];

		points.push(new Point({ x, y, lineWidth, color }));
	}

	return ({ context, width, height, frame }) => {
		context.fillStyle = "black";
		context.fillRect(0, 0, width, height);

		context.save();
		context.translate(mx, my);
		context.translate(cellWidth * 0.5, cellHeight * 0.5);
		context.strokeStyle = "red";
		context.lineWidth = 4;

		// Update positions
		points.forEach((point) => {
			n = random.noise2D(
				point.initX + frame * 3,
				point.initY + frame,
				frequency,
				amplitude
			);
			point.x = point.initX + n;
			point.y = point.initY + n;
		});

		let lastX, lastY;

		// Draw lines
		for (let r = 0; r < rows; r++) {
			for (let c = 0; c < cols - 1; c++) {
				const curr = points[r * cols + c + 0];
				const next = points[r * cols + c + 1];

				// if (!c) context.moveTo(point.x, point.y);
				// else context.lineTo(point.x, point.y);

				const mx = curr.x + (next.x - curr.x) * 0.8;
				const my = curr.y + (next.y - curr.y) * 5.5;

				if (!c) {
					lastX = curr.x;
					lastY = curr.y;
				}

				context.beginPath();
				context.lineWidth = curr.lineWidth;
				context.strokeStyle = curr.color;

				// if (c == 0) context.moveTo(curr.x, curr.y);
				// else if (c == cols - 2)
				// 	context.quadraticCurveTo(curr.x, curr.y, next.x, next.y);
				// else context.quadraticCurveTo(curr.x, curr.y, mx, my);

				context.moveTo(lastX, lastY);
				context.quadraticCurveTo(curr.x, curr.y, mx, my);

				context.stroke();

				lastX = mx - (c / cols) * 250;
				lastY = my - (r / rows) * 250;
			}
		}

		// Draw points
		points.forEach((point) => {
			// point.draw(context);
		});

		context.restore();
	};
};

canvasSketch(sketch, settings);

class Point {
	constructor({ x, y, lineWidth, color }) {
		this.x = x;
		this.y = y;
		this.lineWidth = lineWidth;
		this.color = color;

		this.initX = x;
		this.initY = y;
	}

	draw(context) {
		context.save();
		context.translate(this.x, this.y);
		context.fillStyle = "red";

		context.beginPath();
		context.arc(0, 0, 10, 0, Math.PI * 2);
		context.fill();
		context.restore();
	}
}
