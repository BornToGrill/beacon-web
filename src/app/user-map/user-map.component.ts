import { Component, AfterViewInit, OnDestroy, ViewChild,
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
			state('show', style({ transform: 'translateY(0)' })),
			state('noshow', style({ transform: 'translateY(110%)' })),
			transition('noshow <=> show', animate('300ms linear'))
		])
	]
})
export class UserMapComponent implements AfterViewInit, OnDestroy {

	@ViewChild('map')
	private map: MapComponent;

	private userId: number;
	private trackedUser: any;
	private showTrackedUser: boolean = true;
	private get trackedUserState() { return this.showTrackedUser ? 'show' : 'noshow' };

	private fetchPositionTask: number;
	private hasPosition: string = 'warn';


	private userPosition: Circle;
	private beacons: Array<Circle>;

	private _showUsers: boolean;
	private get showUsers() { return this._showUsers; }
	private set showUsers(val: boolean) {
		this._showUsers = val;
		if (this.userPosition) {
			this.userPosition.visible = val;
			this.map.redraw();
		}
	}

	private _showBeacons: boolean;
	private get showBeacons() { return this._showBeacons; }
	private set showBeacons(val: boolean) {
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

	ngAfterViewInit() {
		const user = new Circle(-Infinity, -Infinity, 25);
		user.fill = 'rgba(43, 202, 220, 0.44)';
		user.stroke = 'rgba(43, 171, 220, 0.58)';
		user.visible = this.showUsers;
		this.userPosition = user;
		this.map.addElement(this.userPosition);

		this.fetchBeacons();
		this.activatedRoute.params.subscribe(params => {
			this.userId = +params['id'];
			this.fetchUser();
			this.fetchPosition();
			this.fetchPositionTask = setInterval(this.fetchPosition.bind(this), 1000);
		});
	}

	ngOnDestroy() {
		clearInterval(this.fetchPositionTask);
	}

	private animate(toPosition?) {
		if (toPosition) {
			this.nextPosition = toPosition;
			this.stepSize = {
				x: (toPosition.x - this.userPosition.x) / 50,
				y: (toPosition.y - this.userPosition.y) / 50
			}
		}
		if (!this.nextPosition) {
			this.nextPosition = undefined;
			this.stepSize = undefined;
			return;
		}

		if (this.isInBounds(this.userPosition.x, this.nextPosition.x, this.stepSize.x)) {
			this.stepSize.x = 0;
		}
		if (this.isInBounds(this.userPosition.y, this.nextPosition.y, this.stepSize.y)) {
			this.stepSize.y = 0;
		}
		if (this.stepSize.x === 0 && this.stepSize.y === 0) {
			this.nextPosition = undefined;
			this.stepSize = undefined;
			return;
		}

		this.userPosition.x += this.stepSize.x;
		this.userPosition.y += this.stepSize.y;
		this.map.redraw();

		this.requestAnimationFrame(() => {
			this.animate();
		});
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
					const circle = new Circle(b.x, b.y, 25 / 2);
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

	private fetchUser() {
		this.http.get(`http://raspberry.daniel-molenaar.com:8080/users/${this.userId}`)
			.toPromise()
			.then(response => {
				this.trackedUser = response.json();
			});
	}

	private fetchPosition() {
		this.http.get(`http://raspberry.daniel-molenaar.com:8081/${this.userId}`)
		.toPromise()
		.then(response => {
			const json = response.json();
			if (!json) {
				this.hasPosition = 'warn';
				return;
			}
			this.hasPosition = 'primary';
			const { x, y } = json;
			console.log({x, y});
			if (this.userPosition.x === -Infinity) {
				this.userPosition.x = x;
				this.userPosition.y = y;
				this.map.redraw();
			} else {
				this.animate({ x, y });
			}
		})
	}

}
