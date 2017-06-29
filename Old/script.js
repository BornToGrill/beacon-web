const image = new Image;
image.src = 'layout.svg';
let canvas;
let map;
/*const width = 1000;
const height = 500;*/

const metersX = 100;
const metersY = 50;


window.onload = () => {

	const { width, height } = image;
	canvas = document.getElementById('canvas');
	canvas.width = $(document).width();
	canvas.height = $(document).height();


	console.log(width, height);

	map = new Map(canvas, image);
	//const map = new Test(canvas, image);


	setInterval(fetchLocation(map), 1000);
};

window.onresize = () => {
	console.log("Resize 1");
	if (!canvas || !map) return;
	console.log("Resize 2");
	canvas.width = $(document).width();
	canvas.height = $(document).height();
	map.redraw();
}

function fetchLocation(map) {
	return function() {
		//const userId = Math.floor((Math.random() * 5) + 1);
		const userId = 1;
		$.get({
			url: 'http://raspberry.daniel-molenaar.com:8081/' + userId,
			dataType: 'json',
			success: json => {
				const { x, y } = json;
				console.log({x,y});
				const translatedX = (image.width / metersX) * x;
				const translatedY = (image.height / metersY) * y;

				map.setPoint(translatedX, translatedY);
				map.redraw();
			},
			error: err => {
				console.log(err);
			}
		})
	}
}
