import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ContentChildren, QueryList } from '@angular/core';
import { MdSidenav } from '@angular/material';
@Component({
   selector: 'app-filter',
   templateUrl: './filter.component.html',
   styleUrls: ['./filter.component.css']
})
export class FilterComponent implements OnInit {

   private _showUsers: boolean = true;
   private _showBeacons: boolean = false;

   @ViewChild('nav')
   private _sideNav: MdSidenav;

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

   constructor() {

   }

   ngOnInit() {
   }

   private toggleBeacons() {
      console.log('toggleBeacons', this._showBeacons);
      this.showBeacons = !this.showBeacons;
   }

   public toggle() {
      this._sideNav.toggle();
      console.log('Toggled sidenav.', this._sideNav.opened);
   }

}
