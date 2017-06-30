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

	private users: any = [];
	private activeUsers: any = [];
	private query: string;

	constructor(
		private _http: Http,
		private _router: Router
	) {
		this.fetchUsers();
	}

	_contains(string: string, substring: string, caseSensitive = false) {
		if (caseSensitive)
			return string.indexOf(substring) !== -1;
		return string.toLowerCase().indexOf(substring.toLowerCase()) !== -1;
	}

	applyFilter() {
		if (!this.query)
			this.activeUsers = this.users;
		else
			this.activeUsers = this.users.filter(user => {
				const name = `${user.first_name} ${user.last_name}`;
				return this._contains(name, this.query) ||
					this._contains(user.job, this.query);
			});
	}

	fetchUsers() {
		this._http.get('http://raspberry.daniel-molenaar.com:8080/users')
		.toPromise()
		.then(response => {
			this.users = response.json();
			this.activeUsers = this.users;
		});

	}

	gotoMap(user) {
		this._router.navigate(['/position', user.id]);
	}

}
