import { Component, OnInit, ViewChild } from '@angular/core';
import { Http } from '@angular/http';

import { IRenderable, Circle } from '../../models/renderable';
import { MapComponent } from '../map/map.component';

@Component({
	selector: 'app-edit-map',
	templateUrl: './edit-map.component.html',
	styleUrls: ['./edit-map.component.css']
})
export class EditMapComponent implements OnInit {

	private fillColor = 'rgba(26, 220, 26, 0.18)';
	private strokeColor = 'rgba(26, 220, 26, 0.39)';

	private selectedFillColor = 'orange';

	@ViewChild('map')
	private map: MapComponent

	private beacons: Array<any>

	private get commited() {
		if (this.currentlySelected)
			return this.currentlySelected.beacon.commited;
	}

	private get currentUUID() {
		if (this.currentlySelected)
			return this.currentlySelected.beacon.uuid;
		return '';
	}

	private get currentX() {
		if (this.currentlySelected)
			return this.currentlySelected.circle.x;
		return '';
	}

	private get currentY() {
		if (this.currentlySelected)
			return this.currentlySelected.circle.y;
		return '';
	}

	private set currentUUID(val) {
		if (this.currentlySelected)
			this.currentlySelected.beacon.uuid = val;
	}

	private set currentX(val) {
		if (this.currentlySelected)
			this.currentlySelected.circle.x = val;
		this.map.redraw();
	}

	private set currentY(val) {
		if (this.currentlySelected)
			this.currentlySelected.circle.y = val;
		this.map.redraw();
	}


	private startingState: any;
	private _currentlySelected: any;
	private get currentlySelected() { return this._currentlySelected; }
	private set currentlySelected(beacon: any) {
		if (this.currentlySelected) {
			this.currentlySelected.circle.fill = this.fillColor;
			this.currentlySelected.circle.stroke = this.strokeColor;
		}
		this._currentlySelected = beacon;
		if (this._currentlySelected) {
			this.startingState = {
				x: beacon.beacon.x,
				y: beacon.beacon.y,
				commited: beacon.commited
			}
			this.currentlySelected.circle.fill = this.selectedFillColor;
		} else {
			this.startingState = undefined;
		}
		this.map.redraw();
	}

	constructor(
		private http: Http
	) { }

	ngOnInit() {
		this.fetchBeacons();
	}

	private fetchBeacons() {
		this.http.get('http://raspberry.daniel-molenaar.com:8080/beacons')
		.toPromise()
		.then(response => {
			const json = response.json();
			const beacons = json.map(b => {
				const circle = new Circle(b.x, b.y, 25 / 2);
				circle.fill = this.fillColor;
				circle.stroke = this.strokeColor;
				const beacon = { beacon: b, circle: circle, commited: true };
				circle.onClick = () => this.beaconClicked(beacon);
				return beacon;
			});
			this.beacons = beacons;
			beacons.forEach(b => this.map.addElement(b.circle));
			this.map.redraw();
		});
	}

	private beaconClicked(beacon: any) {
		this.currentlySelected = beacon;
	}

	private applyChanges() {
		const { x, y, commited } = this.startingState;
		const { beacon } = this.currentlySelected;
		beacon.commited = true;
		if (!commited)
			this.addBeaconInApi(beacon);
		else
			this.updateBeaconInApi(beacon);
		this.currentlySelected = undefined;
	}

	private revertChanges() {
		const { x, y, comitted } = this.startingState;
		const { beacon, circle } = this.currentlySelected;
		beacon.x = x;
		beacon.y = y;
		circle.x = x;
		circle.y = y;
		this.map.redraw();
		this.currentlySelected = undefined;
	}

	private updateBeaconInApi(beacon: any) {
		this.http.put(`http://raspberry.daniel-molenaar.com:8080/beacons/${beacon.uuid}`, beacon)
			.toPromise()
			.then(response => { });
	}

	private addBeaconInApi(beacon: any) {
		this.http.post(`http://raspberry.daniel-molenaar.com:8080/beacons`, beacon)
			.toPromise()
			.then(response => { });
	}

}
