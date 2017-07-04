import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Http } from '@angular/http';
import { MdDialog } from '@angular/material';

import { IRenderable, Circle } from '../../models/renderable';
import { MapComponent } from '../map/map.component';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';

@Component({
	selector: 'app-edit-map',
	templateUrl: './edit-map.component.html',
	styleUrls: ['./edit-map.component.css']
})
export class EditMapComponent implements OnInit {

	private baseUrl = 'http://raspberry.daniel-molenaar.com';
	private fillColor = 'rgba(26, 220, 26, 0.18)';
	private strokeColor = 'rgba(26, 220, 26, 0.39)';

	private selectedFillColor = 'rgba(255, 165, 0, 0.28)';

	@ViewChild('map')
	private map: MapComponent

	private beacons: Array<any>

	private _beaconRadius: number = 17.5;

	public get beaconRadius() { return this._beaconRadius; }

	public set beaconRadius(val: number) {
		this._beaconRadius = val;
		if (this.beacons) {
			this.beacons.forEach(x => x.circle.radius = val);
			this.map.redraw();
		}
	}

	public get currentUUID() {
		if (this.currentlySelected)
			return this.currentlySelected.beacon.uuid;
		return '';
	}

	public get currentX() {
		if (this.currentlySelected)
			return this.currentlySelected.circle.x;
		return '';
	}

	public get currentY() {
		if (this.currentlySelected)
			return this.currentlySelected.circle.y;
		return '';
	}

	public set currentUUID(val) {
		if (this.currentlySelected)
			this.currentlySelected.beacon.uuid = val;
	}

	public set currentX(val) {
		if (this.currentlySelected) {
			this.currentlySelected.circle.x = val;
			this.currentlySelected.beacon.x = val;
		}
		this.map.redraw();
	}

	public set currentY(val) {
		if (this.currentlySelected) {
			this.currentlySelected.circle.y = val;
			this.currentlySelected.beacon.y = val;
		}
		this.map.redraw();
	}


	private startingState: any;
	private _currentlySelected: any;
	public get currentlySelected() { return this._currentlySelected; }
	public set currentlySelected(beacon: any) {
		if (this.currentlySelected) {
			this.currentlySelected.circle.fill = this.fillColor;
			this.currentlySelected.circle.stroke = this.strokeColor;
		}
		this._currentlySelected = beacon;
		if (this._currentlySelected) {
			this.startingState = {
				x: beacon.beacon.x,
				y: beacon.beacon.y
			}
			this.currentlySelected.circle.fill = this.selectedFillColor;
		} else {
			this.startingState = undefined;
		}
		this.map.redraw();
	}

	constructor(
		private activatedRoute: ActivatedRoute,
		private http: Http,
		private dialog: MdDialog
	) { }

	ngOnInit() {
		this.activatedRoute.data.subscribe(params => {
			const { data } = params;
			const { beacons, map } = data;
			this.map.setMap(map.image, { x: map.width, y: map.height });
			const mapped = beacons.map(b => this.createBeaconObject(b, true));
			this.beacons = mapped;
			mapped.forEach(b => this.map.addElement(b.circle));
			this.map.redraw();
		})
	}

	private createBeaconObject(beacon, committed) {
		const circle = new Circle(beacon.x, beacon.y, this.beaconRadius);
		circle.fill = this.fillColor;
		circle.stroke = this.strokeColor;
		const  b = { beacon, circle, committed };
		circle.onClick = () => this.beaconClicked(b);
		return b;
	}

	private beaconClicked(beacon: any) {
		if (this.currentlySelected)
			this.revertChanges();
		this.currentlySelected = beacon;
	}

	private applyChanges() {
		const { x, y } = this.startingState;
		const { beacon, committed } = this.currentlySelected;
		this.currentlySelected.committed = true;
		beacon.x = parseFloat(beacon.x);
		beacon.y = parseFloat(beacon.y);
		if (!committed)
			this.addBeaconInApi(beacon);
		else
			this.updateBeaconInApi(beacon);
		this.currentlySelected = undefined;
	}

	private revertChanges() {
		const { x, y } = this.startingState;
		const { beacon, circle, committed } = this.currentlySelected;
		beacon.x = x;
		beacon.y = y;
		circle.x = x;
		circle.y = y;
		if (!committed) {
			this.map.removeElement(circle);
			const index = this.beacons.indexOf(this.currentlySelected);
			this.beacons.splice(index, 1);
		}
		this.map.redraw();
		this.currentlySelected = undefined;
	}

	private deleteBeacon() {
		const dialogRef = this.dialog.open(ConfirmationDialogComponent);
		dialogRef.afterClosed().subscribe(result => {
			if (result !== 'accept') return;
			const { beacon, circle } = this.currentlySelected;
			this.map.removeElement(circle);
			const index = this.beacons.indexOf(this.currentlySelected);
			this.beacons.splice(index, 1);
			this.currentlySelected = undefined;
			this.deleteBeaconInApi(beacon);
		});
	}

	private addBeacon() {
		const pos = { x: 0, y: 0 };
		const newBeacon = this.createBeaconObject(pos, false);
		this.beacons.push(newBeacon);
		this.currentlySelected = newBeacon;
		this.map.addElement(newBeacon.circle);
	}

	private updateBeaconInApi(beacon: { uuid: string, x: number, y: number }) {
		this.http.put(`${this.baseUrl}:8080/beacons/${beacon.uuid}`, beacon)
			.toPromise()
			.then(response => { });
	}

	private addBeaconInApi(beacon: { uuid: string, x: number, y: number }) {
		this.http.post(`${this.baseUrl}:8080/beacons`, beacon)
			.toPromise()
			.then(response => { });
	}

	private deleteBeaconInApi(beacon: { uuid: string }) {
		this.http.delete(`${this.baseUrl}:8080/beacons/${beacon.uuid}`)
			.toPromise()
			.then(response => { });
	}

}
