import { Component, OnInit, AfterViewInit, OnDestroy, ViewChild, Renderer2, ElementRef, HostListener } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Http } from '@angular/http';
import 'rxjs/add/operator/toPromise';

@Component({
   selector: 'app-map',
   templateUrl: './map.component.html',
   styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit, AfterViewInit, OnDestroy {

   @ViewChild('myCanvas') _canvas: ElementRef;
   @ViewChild('canvasDiv') _canvasDiv: ElementRef;
   private canvas: any;
   private ctx: any;
   private _image: any;

   private userId: number;

   private lastX: number;
   private lastY: number;
   private dragStart: { x: number, y: number };
   private dragged: boolean;
   private scaleFactor = 1.1;

   private currentPosition = { x: -Infinity, y: -Infinity };
   private meterSize = { x: 100, y: 50 };
   private beacons = [ {x: 50, y: 100 }];

   private fetchTask: number;
   private showBeacons: boolean = false;
   private showUsers: boolean = true;


   constructor(
         private activatedRoute: ActivatedRoute,
         private renderer: Renderer2,
         private _http: Http) {
      this._image = new Image;
      this._image.src = '../../assets/layout.svg';

   }
   toggleBeacons(show: boolean) {
      this.showBeacons = show;
      this.redraw();
   }

   toggleUsers(show: boolean) {
      this.showUsers = show;
      this.redraw();
   }

   ngOnInit() {
      this.activatedRoute.params.subscribe(params => {
         this.userId = +params['id'];
         this.fetchTask = setInterval(this.fetchPosition.bind(this), 1000);
      });
      this.canvas = this._canvas.nativeElement;
      this.ctx = this.canvas.getContext('2d');
      this.addListeners();

   }

   ngAfterViewInit() {
      this._configureCanvas();
   }

   ngOnDestroy() {
      clearInterval(this.fetchTask);
   }
   transformPosition(position: { x: number, y: number }) {
      const { x, y } = position;
      const translatedX = (this._image.width / this.meterSize.x) * x;
      const translatedY = (this._image.height / this.meterSize.y) * y;
      return {
         x: translatedX,
         y: translatedY
      };
   }

   fetchBeacons() {
      this._http.get('http://raspberry.daniel-molenaar.com:8080/beacons')
      .toPromise()
      .then(response => {
         const json = response.json();
         this.beacons = json.map(b => {
            const { x , y } = b;
            const transformed = this.transformPosition({ x, y });
            return transformed;
         });
         this.redraw();
      });
   }

   fetchPosition() {
      this._http.get(`http://raspberry.daniel-molenaar.com:8081/${this.userId}`)
         .toPromise()
         .then(response => {
            const json = response.json();
            const { x, y } = json;
            //console.log('Position:', { x, y });
            const transformed = this.transformPosition({ x, y });
            this.currentPosition = transformed;
            this.redraw();
         })
   }

   resizeCanvas() {
      const canvas = this._canvas.nativeElement;
      const { offsetWidth, offsetHeight } = this._canvasDiv.nativeElement;
      canvas.width = offsetWidth;
      canvas.height = offsetHeight;
      this.trackTransforms(this.ctx);

      const { width, height } = canvas;
      this.ctx.translate(width / 4, height / 4);
      this.redraw();
   }

   _configureCanvas() {
      const { width, height } = this._image;
      const canvas = this._canvas.nativeElement;
      this.resizeCanvas();
      this.fetchBeacons();
   }

   canvasMouseDown(event) {
      document.body.style['mozUserSelect'] =
            document.body.style.webkitUserSelect =
            document.body.style.userSelect = 'none';
      this.lastX = event.offsetX || (event.pageX - this.canvas.offsetLeft);
      this.lastY = event.offsetY || (event.pageY - this.canvas.offsetTop);
      this.dragStart = this.ctx.transformedPoint(this.lastX, this.lastY);
      this.dragged = false;
   }

   canvasMouseUp(event) {
      this.dragStart = null;
      if (!this.dragged) this.zoom(event.shiftKey ? -1 : 1 );
   }

   canvasMouseMove(event) {
      this.lastX = event.offsetX || (event.pageX - this.canvas.offsetLeft);
      this.lastY = event.offsetY || (event.pageY - this.canvas.offsetTop);
      this.dragged = true;
      if (this.dragStart){
         var pt = this.ctx.transformedPoint(this.lastX, this.lastY);
         this.ctx.translate(pt.x - this.dragStart.x, pt.y - this.dragStart.y);
         this.redraw();
      }
   }

   canvasScroll(event) {
      var delta = event.wheelDelta ? event.wheelDelta / 40 : event.detail ? -event.detail : 0;
      if (delta) this.zoom(delta);
      event.preventDefault();
      return false;
   }

   zoom(clicks: number) {
      const pt = this.ctx.transformedPoint(this.lastX, this.lastY);
      this.ctx.translate(pt.x, pt.y);
      const factor = Math.pow(this.scaleFactor, clicks);
      this.ctx.scale(factor, factor);
      this.ctx.translate(-pt.x, -pt.y);
      this.redraw();
   }

   addListeners() {
      const canvas = this._canvas.nativeElement;
      const ctx = this.ctx;
      this.renderer.listen(this.canvas, 'wheel', e => {
         this.canvasScroll(e);
      });
   }

   redraw() {
      const ctx = this.ctx;
      const canvas = this._canvas.nativeElement;
      const p1 = ctx.transformedPoint(0, 0);
      const p2 = ctx.transformedPoint(canvas.width, canvas.height);
      ctx.clearRect(p1.x, p1.y, p2.x - p1.x, p2.y - p1.y);

      ctx.save();
      ctx.setTransform(1,0,0,1,0,0);
		ctx.clearRect(0,0,canvas.width,canvas.height);
		ctx.restore();

		ctx.drawImage(this._image, 0, 0)

      /* Testing */

      const transform = ctx.getTransform();
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const scaleFactor = 0.8;
      const radius = 25 / (transform.d / scaleFactor);

      if (this.showUsers)
         this.drawUser(ctx, this.currentPosition, radius);
      if (this.showBeacons)
         this.beacons.forEach(b => this.drawBeacon(ctx, b, radius / 2));
   }

   drawBeacon(ctx, position: { x: number, y: number }, radius: number) {
      ctx.beginPath();
      const { x, y } = position;
      ctx.arc(x, y, radius, 0, 2 * Math.PI, false);
      ctx.fillStyle = 'rgba(26, 220, 26, 0.18)';
      ctx.fill();
      //ctx.lineWidth = 5;
      ctx.strokeStyle = 'rgba(26, 220, 26, 0.39)';
      ctx.stroke();
   }

   drawUser(ctx, position: { x:number, y: number }, radius: number) {
      ctx.beginPath();
      const { x, y } = position;
      ctx.arc(x, y, radius, 0, 2 * Math.PI, false);
      ctx.fillStyle = 'rgba(43, 202, 220, 0.44)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(43, 171, 220, 0.58)';
      ctx.stroke();
   }


   // Adds ctx.getTransform() - returns an SVGMatrix
	// Adds ctx.transformedPoint(x,y) - returns an SVGPoint
	trackTransforms(ctx){
		var svg = document.createElementNS("http://www.w3.org/2000/svg",'svg');
		var xform = svg.createSVGMatrix();
		ctx.getTransform = function(){ return xform; };

		var savedTransforms = [];
		var save = ctx.save;
		ctx.save = function(){
			savedTransforms.push(xform.translate(0,0));
			return save.call(ctx);
		};

		var restore = ctx.restore;
		ctx.restore = function(){
			xform = savedTransforms.pop();
			return restore.call(ctx);
		};

		var scale = ctx.scale;
		ctx.scale = function(sx,sy){
			xform = xform.scaleNonUniform(sx,sy);
			return scale.call(ctx,sx,sy);
		};

		var rotate = ctx.rotate;
		ctx.rotate = function(radians){
			xform = xform.rotate(radians*180/Math.PI);
			return rotate.call(ctx,radians);
		};

		var translate = ctx.translate;
		ctx.translate = function(dx,dy){
			xform = xform.translate(dx,dy);
			return translate.call(ctx,dx,dy);
		};

		var transform = ctx.transform;
		ctx.transform = function(a,b,c,d,e,f){
			var m2 = svg.createSVGMatrix();
			m2.a=a; m2.b=b; m2.c=c; m2.d=d; m2.e=e; m2.f=f;
			xform = xform.multiply(m2);
			return transform.call(ctx,a,b,c,d,e,f);
		};

		var setTransform = ctx.setTransform;
		ctx.setTransform = function(a,b,c,d,e,f){
			xform.a = a;
			xform.b = b;
			xform.c = c;
			xform.d = d;
			xform.e = e;
			xform.f = f;
			return setTransform.call(ctx,a,b,c,d,e,f);
		};

		var pt  = svg.createSVGPoint();
		ctx.transformedPoint = function(x,y){
			pt.x=x; pt.y=y;
			return pt.matrixTransform(xform.inverse());
		}
	}

}
