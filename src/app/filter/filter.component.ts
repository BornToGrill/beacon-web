import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ContentChildren, QueryList } from '@angular/core';
import { MdSidenav } from '@angular/material';
@Component({
   selector: 'app-filter',
   templateUrl: './filter.component.html',
   styleUrls: ['./filter.component.css']
})
export class FilterComponent {

   @ViewChild('nav')
   private _sideNav: MdSidenav;

   private _showUsers: boolean;
   private _showBeacons: boolean;

   @Output()
   public showUsersChange: EventEmitter<boolean> = new EventEmitter();
   @Output()
   public showBeaconsChange: EventEmitter<boolean> = new EventEmitter();

   @Input()
   public get showUsers() : boolean {
      return this._showUsers;
   }
   @Input()
   public get showBeacons() : boolean {
      return this._showBeacons;
   }

   public set showUsers(val: boolean) {
      this._showUsers = val;
      this.showUsersChange.emit(this.showUsers);
   }

   public set showBeacons(val: boolean) {
      this._showBeacons = val;
      this.showBeaconsChange.emit(this.showBeacons);
   }

   public toggle() {
      this._sideNav.toggle();
   }

}
