import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit {

   private userId: number;

  constructor(private activatedRoute: ActivatedRoute) { }

  ngOnInit() {
     this.activatedRoute.params.subscribe(params => {
        this.userId = +params['id'];
     });
  }

}
