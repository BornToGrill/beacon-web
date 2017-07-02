import { Component, OnInit, AfterViewInit, OnDestroy, ViewChild, Renderer2, ElementRef, HostListener, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Http } from '@angular/http';

import { IRenderable, Circle, Img } from '../../models/renderable';
import { trackTransforms } from '../../util/canvas';
import 'rxjs/add/operator/toPromise';

@Component({
   selector: 'app-map',
   templateUrl: './map.component.html',
   styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit, AfterViewInit {

   @Input()
   private image: string;

   @ViewChild('myCanvas') private canvasElement: ElementRef;
   @ViewChild('canvasDiv') private canvasDivElement: ElementRef;
   public canvas: any;
   public ctx: any;

   private userId: number;

   private lastX: number;
   private lastY: number;
   private dragStart: { x: number, y: number };
   private dragged: boolean;
   private scaleFactor = 1.1;

   private meterSize = { x: 100, y: 50 };

   private mapImage: Img;
   private _mapElements: Array<IRenderable> = new Array();

   public addElement(e: IRenderable) {
      this._mapElements.push(e);
      this.redraw();
   }

   public removeElement(e: IRenderable) {
      const index = this._mapElements.indexOf(e);
      if (index >= 0)
         this._mapElements.splice(index, 1);
   }

   constructor(
         private activatedRoute: ActivatedRoute,
         private renderer: Renderer2,
         private _http: Http) {
   }

   ngOnInit() {
      this.mapImage = new Img('../../assets/layout.svg', () => {
         this.configureCanvas();
         this.redraw();
      });
      this.canvas = this.canvasElement.nativeElement;
      this.ctx = this.canvas.getContext('2d');
      trackTransforms(this.ctx);
      this.addListeners();
   }

   ngAfterViewInit() {
      this.redraw();
   }

   public transformPosition(position: { x: number, y: number }) {
      const { x, y } = position;
      const translatedX = (this.mapImage.image.width / this.meterSize.x) * x;
      const translatedY = (this.mapImage.image.height / this.meterSize.y) * y;
      return {
         x: translatedX,
         y: translatedY
      };
   }

   public reversePosition(position: { x: number, y: number }) {
      const { x, y } = position;
      const translatedX = x / (this.mapImage.image.width / this.meterSize.x);
      const translatedY = y / (this.mapImage.image.height / this.meterSize.y);
      return { x: translatedX, y: translatedY };
   }


   private resizeCanvas() {
      const canvas = this.canvasElement.nativeElement;
      const { offsetWidth, offsetHeight } = this.canvasDivElement.nativeElement;
      canvas.width = offsetWidth;
      canvas.height = offsetHeight;
      trackTransforms(this.ctx);

      const { width, height } = this.mapImage.image;
      const centerX = (offsetWidth - width) / 2;
      const centerY = (offsetHeight - height) / 2;
      this.ctx.translate(centerX, centerY);
      this.redraw();
   }

   private configureCanvas() {
      const canvas = this.canvasElement.nativeElement;
      this.resizeCanvas();
   }

   private canvasMouseDown(event) {
      document.body.style['mozUserSelect'] =
            document.body.style.webkitUserSelect =
            document.body.style.userSelect = 'none';
      this.lastX = event.offsetX || (event.pageX - this.canvas.offsetLeft);
      this.lastY = event.offsetY || (event.pageY - this.canvas.offsetTop);
      this.dragStart = this.ctx.transformedPoint(this.lastX, this.lastY);
      this.dragged = false;
   }

   private canvasMouseUp(event) {
      this.dragStart = null;

      // Zoom on click below
      //if (!this.dragged) this.zoom(event.shiftKey ? -1 : 1 );
   }

   private canvasClick(event) {
      if (this.dragged) return;

      const { offsetX, offsetY } = event;
      const canvasPoint = this.ctx.transformedPoint(offsetX, offsetY);
      const actualPoint = this.reversePosition(canvasPoint);
      this._mapElements.forEach(e => {
         e.hitTest(canvasPoint, this.canvas, this.ctx, this.transformPosition.bind(this));
      });
   }

   private canvasMouseMove(event) {
      this.lastX = event.offsetX || (event.pageX - this.canvas.offsetLeft);
      this.lastY = event.offsetY || (event.pageY - this.canvas.offsetTop);
      this.dragged = true;
      if (this.dragStart){
         var pt = this.ctx.transformedPoint(this.lastX, this.lastY);
         this.ctx.translate(pt.x - this.dragStart.x, pt.y - this.dragStart.y);
         this.redraw();
      }
   }

   private canvasScroll(event) {
      var delta = event.wheelDelta ? event.wheelDelta / 40 : event.detail ? -event.detail : 0;
      if (delta) this.zoom(delta);
      event.preventDefault();
      return false;
   }

   private zoom(clicks: number) {
      const pt = this.ctx.transformedPoint(this.lastX, this.lastY);
      this.ctx.translate(pt.x, pt.y);
      const factor = Math.pow(this.scaleFactor, clicks);
      this.ctx.scale(factor, factor);
      this.ctx.translate(-pt.x, -pt.y);
      this.redraw();
   }

   private addListeners() {
      this.renderer.listen(this.canvas, 'wheel', e => {
         this.canvasScroll(e);
      });
   }

   public redraw() {
      const ctx = this.ctx;
      const canvas = this.canvas;
      const p1 = ctx.transformedPoint(0, 0);
      const p2 = ctx.transformedPoint(canvas.width, canvas.height);
      ctx.clearRect(p1.x, p1.y, p2.x - p1.x, p2.y - p1.y);

      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.restore();

      this.mapImage.render(canvas, ctx, this.transformPosition.bind(this));

      this._mapElements.forEach(x => {
         x.render(canvas, ctx, this.transformPosition.bind(this));
      });
   }
}
