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
   private _userRadius: number;
   private _beaconRadius: number;

   @Output()
   public showUsersChange: EventEmitter<boolean> = new EventEmitter();
   @Output()
   public showBeaconsChange: EventEmitter<boolean> = new EventEmitter();
   @Output()
   public userRadiusChange: EventEmitter<number> = new EventEmitter();
   @Output()
   public beaconRadiusChange: EventEmitter<number> = new EventEmitter();

   @Input()
   public get showUsers() : boolean {
      return this._showUsers;
   }
   @Input()
   public get showBeacons() : boolean {
      return this._showBeacons;
   }
   @Input()
   public get userRadius() : number {
      return this._userRadius;
   }

   @Input()
   public get beaconRadius() : number {
      return this._beaconRadius;
   }

   public set showUsers(val: boolean) {
      this._showUsers = val;
      this.showUsersChange.emit(this.showUsers);
   }

   public set showBeacons(val: boolean) {
      this._showBeacons = val;
      this.showBeaconsChange.emit(this.showBeacons);
   }

   public set userRadius(val: number) {
      this._userRadius = val;
      this.userRadiusChange.emit(this._userRadius);
   }

   public set beaconRadius(val: number) {
      this._beaconRadius = val;
      this.beaconRadiusChange.emit(this._beaconRadius);
   }

   public toggle() {
      this._sideNav.toggle();
   }

}
