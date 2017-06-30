import { Component, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
   selector: 'app-filter',
   templateUrl: './filter.component.html',
   styleUrls: ['./filter.component.css']
})
export class FilterComponent implements OnInit {

   @Output()
   public showBeacons: EventEmitter<boolean> = new EventEmitter();
   private _showBeacons: boolean = true;

   constructor() {

   }

   ngOnInit() {
   }

   toggleBeacons() {
      this._showBeacons = this._showBeacons;
      this.showBeacons.emit(this._showBeacons);
   }
}
