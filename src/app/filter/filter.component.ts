import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
   selector: 'app-filter',
   templateUrl: './filter.component.html',
   styleUrls: ['./filter.component.css']
})
export class FilterComponent implements OnInit {

   private _showBeacons: boolean = false;

   @Output()
   public showBeaconsChange: EventEmitter<boolean> = new EventEmitter();

   @Input()
   public get showBeacons() {
   console.log('Get:', this._showBeacons);
      return this._showBeacons;
   }

   public set showBeacons(val: boolean) {
      this._showBeacons = val;
      this.showBeaconsChange.emit(this._showBeacons);

      console.log('Set:', this._showBeacons);
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
      console.log('Toggle');
   }

}
