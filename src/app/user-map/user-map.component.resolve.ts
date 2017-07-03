import { Injectable, Inject } from '@angular/core';
import {
	Router, Resolve,
	ActivatedRouteSnapshot
} from '@angular/router';
import { Http, URLSearchParams } from '@angular/http';
import 'rxjs/add/operator/toPromise';


@Injectable()
export class UserMapResolve implements Resolve<any> {

	private base_url: string = 'http://localhost'

	constructor(private http: Http, private router: Router) { }

	resolve(route: ActivatedRouteSnapshot, state: Object): Object | Promise<any> | boolean {
		const userId = route.params['id'];
		const userPromise = this.http.get(`${this.base_url}:8080/users/${userId}`)
		.toPromise()
		.then(response => response.json());
		const mapPromise = this.http.get(`${this.base_url}:8081/${userId}`)
		.toPromise()
		.then(response => response.json())
		.then(position => {
			if (!position || !position.map_name || !position.map_floor) return { map: undefined, position: undefined };
			return this.http.get(`${this.base_url}:8080/maps/${position.map_name}/${position.map_floor}`)
				.toPromise()
				.then(response => response.json())
				.then(map => ({ map, position }) );
		});


		const res = Promise.all([ userPromise, mapPromise])
			.then(([user, data]) => {
				const { map, position } = data;
				return { user, map, position };
			})

		return res;

	}

}
