export interface IRenderable {
	render(canvas: any, ctx: any, transform: ({x, y}) => ({x: number, y: number})) : void;
}

export class Circle implements IRenderable {

	public visible: boolean = true;

	constructor(
		public x: number,
		public y: number,
		public radius?: number,
		public fill?: string,
		public stroke?: string) {

	}

	public render(canvas: any, ctx: any, transform) : void {
		if (!this.visible) return;
		//const transform = ctx.getTransform();
		const t = ctx.getTransform();
		const scaleFactor = 0.8;
		const radius = this.radius / (t.d / scaleFactor);

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
}

export class Img implements IRenderable {
	private _image: any;

	public onLoad: () => void;

	constructor(imageUrl: string, onLoad?: () => void) {
		this.onLoad = onLoad;
		this._image = new Image;
		this._image.onload = () => {
			if (this.onLoad)
				this.onLoad();
		}
		this._image.src = imageUrl;
	}

	public get image() {
		return this._image;
	}

	public render(canvas, ctx, transform) {
		ctx.drawImage(this._image, 0, 0)
	}
}
