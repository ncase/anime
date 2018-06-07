var vid = document.getElementById('videoel');
var vid_width = vid.width;
var vid_height = vid.height;
var overlay = document.getElementById('canvas');
var ctx = overlay.getContext('2d');

var tmpCanvas = document.getElementById('tmpCanvas');
var tmp_ctx = tmpCanvas.getContext('2d');

/*********** Setup of video/webcam and checking for webGL support *********/

function enablestart() {
	/*var startbutton = document.getElementById('startbutton');
	startbutton.value = "start";
	startbutton.disabled = null;*/
	startVideo();
}

function adjustVideoProportions() {
	// resize overlay and video if proportions of video are not 4:3
	// keep same height, just change width
	var proportion = vid.videoWidth/vid.videoHeight;
	vid_width = Math.round(vid_height * proportion);
	vid.width = vid_width;
	overlay.width = vid_width;
}

function gumSuccess( stream ) {
	// add camera stream if getUserMedia succeeded
	if ("srcObject" in vid) {
		vid.srcObject = stream;
	} else {
		vid.src = (window.URL && window.URL.createObjectURL(stream));
	}
	vid.onloadedmetadata = function() {
		adjustVideoProportions();
		vid.play();
	}
	vid.onresize = function() {
		adjustVideoProportions();
		if (trackingStarted) {
			ctrack.stop();
			ctrack.reset();
			ctrack.start(vid);
		}
	}
}

function gumFail() {
	alert("Can't get your webcam video. Try Firefox or Chrome instead?");
}

navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
window.URL = window.URL || window.webkitURL || window.msURL || window.mozURL;

// set up video
if (navigator.mediaDevices) {
	navigator.mediaDevices.getUserMedia({video : true}).then(gumSuccess).catch(gumFail);
} else if (navigator.getUserMedia) {
	navigator.getUserMedia({video : true}, gumSuccess, gumFail);
} else {
	gumFail();
}

vid.addEventListener('canplay', enablestart, false);

/*********** Code for face tracking *********/

var ctrack = new clm.tracker();
ctrack.init();
var trackingStarted = false;

function startVideo() {
	// start video
	vid.play();
	// start tracking
	ctrack.start(vid);
	trackingStarted = true;
	// start loop to draw face
	drawLoop();


	// remove loading, show controls
	document.getElementById("weeb").style.display = "block";
	document.getElementById("loading").style.display = "none";

}

var eye = new Sprite({
	src: "eye.png",
	totalFrames: 2
});
eye_wiggle = {x:0, y:0};

var mouth = new Sprite({
	src: "mouth.png",
	totalFrames: 2
});

var hair = new Image();
hair.src = "hair.png";
var hair2 = new Image();
hair2.src = "hair2.png";
var hair_ends = [
	[0,0],
	[0,0]
];

var blush = new Image();
blush.src = "blush.png";

var sparkle = new Image();
sparkle.src = "sparkle.png";
var sparkles = [];
sparkle_timer = 0;

var bg = new Image();
bg.src = "bg.png";

var body = new Image();
body.src = "body.png";

var cherry = new Image();
cherry.src = "cherry.png";
var cherries = [];
for(var i=0; i<50; i++){
	cherries.push({
		x: Math.random()*600,
		y: Math.random()*450,
		vx: 1+Math.random()*0.5,
		vy: 1+Math.random()*0.5,
		a: Math.random()-0.5
	});
}

var music = document.getElementById("music");

var shake = 0;

function drawLoop() {

	// Clear
	requestAnimationFrame(drawLoop);
	ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

	// Draw Video
	ctx.save();
	ctx.scale(-1,1);
	ctx.translate(-vid.width, 0);
	ctx.drawImage(vid, 0, 0, 600, 450);

	// Eye Wiggle
	if(Math.random()<0.04){
		eye_wiggle = {
			x: Math.random()*8-4,
			y: Math.random()*8-4
		};
	}

	// Weeb Level
	var level;
	var weebValue = parseInt(weebometer.value);
	switch(weebValue){
		case 2: level="20"; break;
		case 3: level="40"; break;
		case 4: level="60"; break;
		case 5: level="80"; break;
		case 6: level="9001"; break;
	}
	var label;
	if(weebValue==1){
		label = "drag slider SLOWLY... to become anime! &darr;";
	}else{
		label = "ANIME LEVEL: "+level+"%";
	}
	if(weebValue==6){
		label = "<b style='font-size:30px; letter-spcing:3px'>"+label+"</b>";
	}
	var labelDOM = document.getElementById("merge_level");
	labelDOM.innerHTML = label;

	// SHAKE
	if(weebValue==1){
		shake += 0.25;
		labelDOM.style.left = (Math.sin(shake)*4)+"px";
	}else{
		labelDOM.style.left = "0px";
	}

	// CLMTracker Face...
	var facePositions = ctrack.getCurrentPosition();
	if(facePositions){

		///////////////////////
		// Figure out points //
		///////////////////////

		var faceCenter, faceAngle, faceScale=1;

		// Center
		faceCenter = [0,0];
		facePositions.forEach(function(p){
			faceCenter[0] += p[0];
			faceCenter[1] += p[1];
		});
		faceCenter[0] /= facePositions.length;
		faceCenter[1] /= facePositions.length;

		// Angle
		var dx = facePositions[47][0] - facePositions[33][0];
		var dy = facePositions[47][1] - facePositions[33][1];
		faceAngle = Math.atan2(dy,dx);

		// Scale
		var dist = Math.sqrt(dx*dx+dy*dy);
		faceScale = dist;

		////////////////////
		// DRAW THE ANIME //
		////////////////////

		// Level 1: nothing


		// LEVEL 6: BACKGROUND, SPARKLES, MUSIC
		if(weebometer.value==6){
			music.play();
		}else{
			music.pause();
		}
		if(weebometer.value>=6){

			// clear!
			tmp_ctx.clearRect(0, 0, tmp_ctx.canvas.width, tmp_ctx.canvas.height);
			tmp_ctx.save();

			// background
			tmp_ctx.drawImage(bg, 0, 0);

			// cherries
			cherries.forEach(function(c){

				c.x += c.vx;
				c.y += c.vy;
				if(c.x>650) c.x=-50;
				if(c.y>500) c.y=-50;

				tmp_ctx.save();
				tmp_ctx.translate(c.x, c.y);
				tmp_ctx.rotate(c.a);
				tmp_ctx.scale(0.5,0.5);
				tmp_ctx.drawImage(cherry, -25, -25);
				tmp_ctx.restore();

			});

			// body
			var body_scale = 50;
			tmp_ctx.save();
			tmp_ctx.translate(faceCenter[0], faceCenter[1]);
			tmp_ctx.scale(faceScale/body_scale, faceScale/body_scale);
			tmp_ctx.drawImage(body, -125, 25);
			tmp_ctx.restore();

			// mask
			tmp_ctx.globalCompositeOperation = "destination-out";
			tmp_ctx.fillStyle = "#000";
			tmp_ctx.beginPath();
			for(var i=0; i<=14; i++){
				var p = facePositions[i];
				if(i==0) tmp_ctx.moveTo(p[0], p[1]);
				else tmp_ctx.lineTo(p[0], p[1]);
			}
			var x = (facePositions[0][0]+facePositions[14][0])/2;
			var y = (facePositions[0][1]+facePositions[14][1])/2;
			tmp_ctx.arc(
				x, y,
				getDistanceBetweenPoints(facePositions, 0, 14)/2,
				0, Math.PI, true
			);
			tmp_ctx.fill();

			tmp_ctx.restore();

			// and draw this ON the main canvas
			ctx.drawImage(tmpCanvas, 0, 0);

		}

		// LEVEL 2: EYES
		if(weebometer.value>=2){

			var eye_distance = 30;
			var eye_scale = 270;

			ctx.save();
			ctx.translate(facePositions[27][0], facePositions[27][1]);
			ctx.rotate(faceAngle - Math.PI/2);
			ctx.scale(faceScale/eye_scale, faceScale/eye_scale);
				
				eye.x = -eye_distance;
				eye.y = 0;
				eye.frame = 0;
				eye.draw(ctx);
				
				eye.x += eye_wiggle.x;
				eye.y += eye_wiggle.y;
				eye.frame = 1;
				eye.draw(ctx);

			ctx.restore();

			ctx.save();
			ctx.translate(facePositions[32][0], facePositions[32][1]);
			ctx.rotate(faceAngle - Math.PI/2);
			ctx.scale(-faceScale/eye_scale, faceScale/eye_scale);
				
				eye.x = -eye_distance;
				eye.y = 0;
				eye.frame = 0;
				eye.draw(ctx);
				
				eye.x -= eye_wiggle.x;
				eye.y += eye_wiggle.y;
				eye.frame = 1;
				eye.draw(ctx);

			ctx.restore();

		}

		// LEVEL 3: MOUTH
		if(weebometer.value>=3){
			
			var mouth_scale = 270;

			var mouthPosition = getAverageOfPoints(facePositions,[
				44, 50, 60, 57
			]);
			var mouthDistance = getDistanceBetweenPoints(facePositions, 60, 57);

			ctx.save();
			ctx.translate(mouthPosition[0], mouthPosition[1]);
			ctx.rotate(faceAngle - Math.PI/2);
			ctx.scale(faceScale/mouth_scale, faceScale/mouth_scale);
			ctx.scale(1, (mouthDistance/faceScale)*2);
				
				mouth.x = 0;
				mouth.y = 15;
				mouth.frame = 0;
				mouth.draw(ctx);

			ctx.restore();

		}

		// LEVEL 4: HAIR
		if(weebometer.value>=4){

			// Hair ends should go to...
			var end;

			end = hair_ends[0];
			end[0] = end[0]*0.9 + facePositions[14][0]*0.1;
			end[1] = end[1]*0.9 + facePositions[14][1]*0.1;
			var hairAngle1 = Math.atan2(
				end[0] - facePositions[33][0],
				end[1] - facePositions[33][1]
			);

			end = hair_ends[1];
			end[0] = end[0]*0.9 + facePositions[0][0]*0.1;
			end[1] = end[1]*0.9 + facePositions[0][1]*0.1;
			var hairAngle2 = Math.atan2(
				end[0] - facePositions[33][0],
				end[1] - facePositions[33][1]
			);

			// hair
			var hair_scale = 110;
			ctx.save();
			ctx.translate(faceCenter[0], faceCenter[1]);
			ctx.rotate(faceAngle - Math.PI/2);
			ctx.scale(faceScale/hair_scale, faceScale/hair_scale);
			ctx.translate(0, -100);
				
				ctx.save();
				ctx.translate(-100,-100);
				ctx.rotate(-hairAngle2);
				ctx.scale(-0.8,0.8);
				ctx.drawImage(hair2, -125, -50, hair2.width, hair2.height);
				ctx.restore();

				ctx.save();
				ctx.translate(100,-100);
				ctx.rotate(-hairAngle1);
				ctx.scale(0.8,0.8);
				ctx.drawImage(hair2, -125, -50, hair2.width, hair2.height);
				ctx.restore();

				ctx.drawImage(hair, -hair.width/2, -hair.height/2, hair.width, hair.height);

			ctx.restore();

		}

		// LEVEL 5: BLUSH, SPARKLES
		if(weebometer.value>=5){

			// blush
			var blush_scale = 190;
			ctx.save();
			ctx.translate(faceCenter[0], faceCenter[1]);
			ctx.rotate(faceAngle - Math.PI/2);
			ctx.scale(faceScale/blush_scale, faceScale/blush_scale);
			ctx.translate(0, 10);
				
				ctx.drawImage(blush, -blush.width/2, -blush.height/2, blush.width, blush.height);

			ctx.restore();

			// sparkles
			if(sparkle_timer==0){
				var angle = (Math.random()*1.5+0.75)*Math.PI;
				var radius = faceScale*1.75;
				radius *= (Math.random()*0.75 + 1);
				var x = faceCenter[0] + Math.cos(angle)*radius;
				var y = faceCenter[1] + Math.sin(angle)*radius;
				var spark = {
					x: x,
					y: y,
					life: 0
				};
				sparkles.push(spark);
			}
			sparkle_timer++;
			if(sparkle_timer>3) sparkle_timer=0;
			for(var i=sparkles.length-1; i>=0; i--){

				var spark = sparkles[i];
				spark.life += 0.02;
				if(spark.life<1){

					ctx.save();
					ctx.translate(spark.x, spark.y);
					var size = 4*((spark.life)*(1-spark.life));
					ctx.scale(0.5*size, 0.5*size);
					ctx.globalAlpha = size;
					ctx.drawImage(sparkle, -50, -50, 100, 100);
					ctx.restore();

				}else{
					sparkles.splice(i,1); // BYE. FOREVER.
				}

			}

		}


		////////////////////
		////////////////////
		

		// debug
		//ctrack.draw(ctx.canvas);

	}

	ctx.restore();

}

function Sprite(config){
	var self = this;

	self.x = 0;
	self.y = 0;
	self.img = new Image();
	self.img.src = config.src;
	self.frame = 0;

	self.draw = function(ctx){
		
		var sw = self.img.width/config.totalFrames;
		var sh = self.img.height;
		var sx = self.frame*sw;
		var sy = 0;

		var dx = self.x - sw/2;
		var dy = self.y - sh/2;
		
		ctx.drawImage(self.img,
			sx, sy, sw, sh,
			dx, dy, sw, sh
		);

	};

}

window.weebometer = document.getElementById("weebometer");

function getAverageOfPoints(array, indices){
	var avg = [0,0];
	indices.forEach(function(i){
		avg[0] += array[i][0];
		avg[1] += array[i][1];
	});
	avg[0] /= indices.length;
	avg[1] /= indices.length;
	return avg;
}

function getDistanceBetweenPoints(array, a, b){
	var dx = array[b][0] - array[a][0];
	var dy = array[b][1] - array[a][1];
	return Math.sqrt(dx*dx+dy*dy);
}

