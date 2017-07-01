import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
	selector: 'app-home',
	templateUrl: './home.component.html',
	styleUrls: ['./home.component.css']
})
export class HomeComponent {

	private maps = [ { name: 'TamTam', image: 'assets/layout.svg' }]

	constructor(
		private router: Router
	) { }

	private editMap(map: { name: string, image: string }) {
		this.router.navigate(['/maps', map.name]);
	}

}
