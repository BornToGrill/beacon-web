import { Component, OnInit, AfterViewInit, OnDestroy, ViewChild,
	trigger,
    state,
    style,
    transition,
    animate } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Http } from '@angular/http';
import 'rxjs/add/operator/toPromise';

import { MapComponent } from '../map/map.component';

import { Circle, Img } from '../../models/renderable';

@Component({
	selector: 'app-user-map',
	templateUrl: './user-map.component.html',
	styleUrls: ['./user-map.component.css'],
	animations: [
		trigger('slide-in', [
			state('noshow', style({
				paddingTop: 0,
				paddingBottom: 0,
				height: '4px'
			})),
			transition('noshow <=> show', animate('300ms linear'))
		])
	]
})
export class UserMapComponent implements OnInit, OnDestroy {

	@ViewChild('map')
	private map: MapComponent;

	private currentMap: { name: string, floor: string };

	public trackedUser: any;
	public showTrackedUser: boolean = true;
	public get trackedUserState() { return this.showTrackedUser ? 'show' : 'noshow' };

	private fetchPositionTask: number;
	public hasPosition: string = 'warn';


	public userPosition: Circle;
	private beacons: Array<Circle>;

	private _showUsers: boolean;
	public get showUsers() { return this._showUsers; }
	public set showUsers(val: boolean) {
		this._showUsers = val;
		if (this.userPosition) {
			this.userPosition.visible = val;
			this.map.redraw();
		}
	}

	private _showBeacons: boolean;
	public get showBeacons() { return this._showBeacons; }
	public set showBeacons(val: boolean) {
		this._showBeacons = val;
		if (this.beacons) {
			this.beacons.forEach(beacon => {
				beacon.visible = this._showBeacons;
			});
			this.map.redraw();
		}
	}

	private requestAnimationFrame: any;
	private stepSize: { x: number, y: number };
	private nextPosition: { x: number, y: number };

	private _userRadius: number = 35;
	private _beaconRadius: number = 17.5;

	public get userRadius() { return this._userRadius; }
	public get beaconRadius() { return this._beaconRadius; }

	public set userRadius(val: number) {
		this._userRadius = val;
		if (this.userPosition) {
			this.userPosition.radius = val;
			this.map.redraw();
		}
	}
	public set beaconRadius(val: number) {
		this._beaconRadius = val;
		if (this.beacons) {
			this.beacons.forEach(x => x.radius = val);
			this.map.redraw();
		}
	}

	constructor(
		private activatedRoute: ActivatedRoute,
		private http: Http
	) {
		this.showUsers = true;
		this.showBeacons = false;
		this.requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window['mozRequestAnimationFrame'] || window['RequestAnimationFrame'] || window['msRequestAnimationFrame'] ||
        function(callback) {
          window.setTimeout(callback, 1000 / 60);
        };
	}

	private createUser(pos) : Circle {
		const user = new Circle(pos.x, pos.y, this.userRadius);
		user.fill = 'rgba(43, 202, 220, 0.44)';
		user.stroke = 'rgba(43, 171, 220, 0.58)';
		user.visible = this.showUsers;
		return user;
	}

	ngOnInit() {
		this.activatedRoute.data.subscribe(args => {
			const { user, position, map } = args.data;

			if (position && map) {
				this.userPosition = this.createUser(position);
				this.hasPosition = 'primary';
				this.map.addElement(this.userPosition);
				this.currentMap = map;
				this.map.setMap(map.image, { x: map.width, y: map.height });
			}

			this.trackedUser = user;
			this.fetchBeacons();
			this.fetchPositionTask = setInterval(this.fetchPosition.bind(this), 1000);
 			this.animate();
		});
	}

	ngOnDestroy() {
		clearInterval(this.fetchPositionTask);
	}

	private setNextPosition(position) {
		if (this.userPosition) {
			this.nextPosition = position;
			this.stepSize = {
				x: (position.x - this.userPosition.x) / 50,
				y: (position.y - this.userPosition.y) / 50
			}
		} else {
			this.userPosition = this.createUser(position);
			this.map.addElement(this.userPosition);
		}
		this.map.redraw();
	}

	private nextFrame() {
		this.requestAnimationFrame(() => {
			this.animate();
		});
	}

	private animate() {
		if (!this.nextPosition) return this.nextFrame();

		if (this.isInBounds(this.userPosition.x, this.nextPosition.x, this.stepSize.x)) {
			this.stepSize.x = 0;
		}
		if (this.isInBounds(this.userPosition.y, this.nextPosition.y, this.stepSize.y)) {
			this.stepSize.y = 0;
		}

		if (this.stepSize.x === 0 && this.stepSize.y === 0) {
			this.nextPosition = undefined;
			return this.nextFrame();
		}

		this.userPosition.x += this.stepSize.x;
		this.userPosition.y += this.stepSize.y;
		this.map.redraw();
		return this.nextFrame();
	}

	private isInBounds(current, next, stepSize) {
		const low = Math.min(current, current + stepSize);
		const high = Math.max(current, current + stepSize);
		return next >= low && next <= high;
	}

	private fetchBeacons() {
		this.http.get('http://raspberry.daniel-molenaar.com:8080/beacons')
			.toPromise()
			.then(response => {
				const json = response.json();
				const beacons = json.map(b => {
					const circle = new Circle(b.x, b.y, this.beaconRadius);
					circle.fill = 'rgba(26, 220, 26, 0.18)';
					circle.stroke = 'rgba(26, 220, 26, 0.39)';
					circle.visible = this.showBeacons;
					return circle;
				});
				this.beacons = beacons;
				beacons.forEach(b => this.map.addElement(b));
				this.map.redraw();
			});
	}

	private fetchPosition() {
		this.http.get(`http://localhost:8081/${this.trackedUser.id}`)
		.toPromise()
		.then(response => {
			const json = response.json();
			if (!json) {
				this.hasPosition = 'warn';
				return;
			}
			const { map_name, map_floor } = json;
			if (!map_name || !map_floor) {
				this.hasPosition = 'warn';
				return;
			}

			this.hasPosition = 'primary';
			if (!this.currentMap || this.currentMap.name !== map_name || this.currentMap.floor !== map_floor) {
				this.fetchMap(map_name, map_floor);
			}

			const { x, y } = json;
			//console.log({x,y});
			this.setNextPosition({ x, y });
		})
	}

	private fetchMap(name: string, floor: string) {
		this.http.get(`http://localhost:8080/maps/${name}/${floor}`)
			.toPromise()
			.then(response => {
				const map = response.json();
				this.currentMap = map;
				this.map.setMap(map.image, { x: map.width, y: map.height });
			})
	}

}
