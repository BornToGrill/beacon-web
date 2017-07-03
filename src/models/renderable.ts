export interface IRenderable {
	render(canvas: any, ctx: any, transform: ({x, y}) => ({x: number, y: number})) : void;
	hitTest(point: { x: number, y: number }, canvas, ctx, transform) : boolean;
	onClick: () => void;
}

export class Circle implements IRenderable {

	public visible: boolean = true;
	public onClick: () => void;

	constructor(
		public x: number,
		public y: number,
		public radius?: number,
		public fill?: string,
		public stroke?: string) {

	}

	private calculateRadius(ctx, radius) {
		const scaleFactor = 1;
		const t = ctx.getTransform();
		return radius / (t.d / scaleFactor);
	}

	public render(canvas: any, ctx: any, transform) : void {
		if (!this.visible) return;
		const radius = this.calculateRadius(ctx, this.radius);

		const { x, y } = transform({x: this.x, y: this.y });

		ctx.beginPath();
      ctx.arc(x, y, radius, 0, 2 * Math.PI, false);
      //ctx.fillStyle = 'rgba(26, 220, 26, 0.18)';
		ctx.fillStyle = this.fill;
      ctx.fill();
		ctx.strokeStyle = this.stroke;
      //ctx.strokeStyle = 'rgba(26, 220, 26, 0.39)';
      ctx.stroke();
	}

	public hitTest(point, canvas, ctx, transform) : boolean {
		const { x, y } = transform({x: this.x, y: this.y });
		const radius = this.calculateRadius(ctx, this.radius);
		if (Math.pow(point.x - x, 2) + Math.pow(point.y - y, 2) < Math.pow(radius, 2)) {
			if (this.onClick)
				this.onClick();
			return true;
		}
		return false;
	}
}

export class Img implements IRenderable {
	private _image: any;

	public onLoad: () => void;
	public onClick: () => void;

	constructor(imageUrl: string, onLoad?: () => void) {
		this.onLoad = onLoad;
		this._image = new Image;
		this._image.onload = () => {
			if (this.onLoad)
				this.onLoad();
		}
		this._image.src = imageUrl;
	}

	public setImage(url: string) {
		this._image.src = url;
	}

	public get image() {
		return this._image;
	}

	public render(canvas, ctx, transform) {
		ctx.drawImage(this._image, 0, 0)
	}

	public hitTest(canvasPoint, transformedPoint) : boolean {
		throw new Error('Not implemented.');
	}
}
