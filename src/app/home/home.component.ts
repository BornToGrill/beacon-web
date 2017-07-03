import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Http } from '@angular/http';


@Component({
	selector: 'app-home',
	templateUrl: './home.component.html',
	styleUrls: ['./home.component.css']
})
export class HomeComponent {

	private base_url: string = 'http://localhost:8080';

	public maps = []; /*[
		{
			name: 'Dept',
			floor: '13.5',
			description: 'Dept office floor',
			image: 'assets/layout.svg'
		}
	]*/

	constructor(
		private router: Router,
		private http: Http
	) {
		this.getMaps();
	}

	public editMap(map: { name: string, floor: string, image: string }) {
		this.router.navigate(['/maps', map.name, map.floor]);
	}

	private getMaps() {
		this.http.get(`${this.base_url}/maps`)
			.toPromise()
			.then(response => {
				this.maps = response.json();
			});
	}

}
