import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpModule } from '@angular/http';
import { FormsModule }   from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import { AppComponent } from './app.component';
import { UsersComponent } from './users/users.component';

import { MdCheckboxModule, MdListModule, MdInputModule } from '@angular/material';
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
    BrowserAnimationsModule,
    HttpModule,
    FormsModule,
    RouterModule.forRoot(appRoutes),

    // Angular material
    MdCheckboxModule,
    MdInputModule,
    MdListModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
