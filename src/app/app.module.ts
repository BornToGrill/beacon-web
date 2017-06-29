import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpModule } from '@angular/http';
import { RouterModule, Routes } from '@angular/router';

import { AppComponent } from './app.component';
import { UsersComponent } from './users/users.component';

import { MdCheckboxModule, MdListModule } from '@angular/material';
import { MapComponent } from './map/map.component';

const appRoutes: Routes = [
   { path: '', component: UsersComponent, pathMatch: 'full' },
   { path: 'position/:id', component: MapComponent }
];

@NgModule({
  declarations: [
    AppComponent,
    UsersComponent,
    MapComponent
  ],
  imports: [
    BrowserModule,
    HttpModule,
    RouterModule.forRoot(appRoutes),

    // Angular material
    MdCheckboxModule,
    MdListModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
