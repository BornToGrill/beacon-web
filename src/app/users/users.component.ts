import { Component } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Router } from '@angular/router';
import 'rxjs/add/operator/toPromise';

@Component({
	selector: 'users-list',
	templateUrl: './users.component.html',
	styleUrls: ['./users.component.css']
})
export class UsersComponent {

	private users: any = [
		{ first_name : 'Hannah' },
		{ first_name : 'Daniel ' }
	];

	constructor(
		private _http: Http,
		private _router: Router
	) {
		this.fetchUsers();
	}

	fetchUsers() {
		this._http.get('http://localhost:8080/users')
		.toPromise()
		.then(response => {
			this.users = response.json();
		});

	}

	gotoMap(user) {
		this._router.navigate(['/position', user.id]);
	}

}
