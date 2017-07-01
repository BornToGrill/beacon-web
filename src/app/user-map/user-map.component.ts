import { Component, OnInit, AfterViewInit, OnDestroy, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Http } from '@angular/http';
import 'rxjs/add/operator/toPromise';

import { MapComponent } from '../map/map.component';

import { Circle, Img } from '../../models/renderable';

@Component({
	selector: 'app-user-map',
	templateUrl: './user-map.component.html',
	styleUrls: ['./user-map.component.css']
})
export class UserMapComponent implements OnInit, AfterViewInit, OnDestroy {

	@ViewChild('map')
	private map: MapComponent;

	private userId: number;
	private fetchPositionTask: number;

	private userPosition: Circle;
	private beacons: Array<Circle> = [];

	private _showUsers: boolean;
	private get showUsers() { return this._showUsers; }
	private set showUsers(val: boolean) {
		this._showUsers = val;
		if (this.userPosition) {
			this.userPosition.visible = val;
			this.map.redraw();
		}
	}

	constructor(
		private activatedRoute: ActivatedRoute,
		private http: Http
	) {

	}

	ngOnInit() {
	}

	ngAfterViewInit() {
		const user = new Circle(-Infinity, -Infinity, 25);
		user.fill = 'rgba(43, 202, 220, 0.44)';
		user.stroke = 'rgba(43, 171, 220, 0.58)';
		this.userPosition = user;
		this.map.addElement(this.userPosition);

		this.fetchBeacons();
		this.activatedRoute.params.subscribe(params => {
			this.userId = +params['id'];
			this.fetchPositionTask = setInterval(this.fetchPosition.bind(this), 1000);
		});
	}

	ngOnDestroy() {
		clearInterval(this.fetchPositionTask);
	}

	private toggleBeacons(show: boolean) {
		this.beacons.forEach(beacon => {
			beacon.visible = show;
		});
		this.map.redraw();
	}

	private fetchBeacons() {
		this.http.get('http://raspberry.daniel-molenaar.com:8080/beacons')
			.toPromise()
			.then(response => {
				const json = response.json();
				json.forEach(b => {
					const circle = new Circle(b.x, b.y, 25 / 2);
					circle.fill = 'rgba(26, 220, 26, 0.18)';
					circle.stroke = 'rgba(26, 220, 26, 0.39)';
					this.beacons.push(circle);
					this.map.addElement(circle);
				})
				this.map.redraw();
			});
	}

	private fetchPosition() {
		this.http.get(`http://raspberry.daniel-molenaar.com:8081/${this.userId}`)
		.toPromise()
		.then(response => {
			const json = response.json();
			const { x, y } = json;
			console.log({x, y});
			this.userPosition.x = x;
			this.userPosition.y = y;
			this.map.redraw();
		})
	}

}
