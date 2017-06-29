import { Component } from '@angular/core';
import { Http, Response } from '@angular/http';
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
		private _http: Http
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
		console.log('Going to map', user)
	}

}
