import { Injectable, Inject } from '@angular/core';
import {
	Router, Resolve,
	ActivatedRouteSnapshot
} from '@angular/router';
import { Http, URLSearchParams } from '@angular/http';
import 'rxjs/add/operator/toPromise';


@Injectable()
export class EditMapResolve implements Resolve<any> {

	private base_url: string = 'http://localhost'

	constructor(private http: Http, private router: Router) { }

	resolve(route: ActivatedRouteSnapshot, state: Object): Object | Promise<any> | boolean {
		const name = route.params['name'];
		const floor = route.params['floor'];
		const mapPromise = this.http.get(`${this.base_url}:8080/maps/${name}/${floor}`)
			.toPromise()
			.then(response => response.json());

		const beaconPromise = this.http.get(`${this.base_url}:8080/beacons`)
			.toPromise()
			.then(response => response.json());

		return Promise.all([mapPromise, beaconPromise])
			.then(([map, beacons]) => ({ map, beacons }));
	}

}
