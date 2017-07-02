import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
	selector: 'app-home',
	templateUrl: './home.component.html',
	styleUrls: ['./home.component.css']
})
export class HomeComponent {

	public maps = [
		{
			name: 'Dept',
			floor: '13.5',
			description: 'Dept office floor',
			image: 'assets/layout.svg'
		}
	]

	constructor(
		private router: Router
	) { }

	public editMap(map: { name: string, image: string }) {
		this.router.navigate(['/maps', map.name]);
	}

}
