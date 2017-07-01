import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpModule } from '@angular/http';
import { FormsModule }   from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import { AppComponent } from './app.component';
import { UsersComponent } from './users/users.component';

import {
   MdCheckboxModule,
   MdListModule,
   MdInputModule,
   MdSidenavModule,
   MdToolbarModule,
   MdIconModule,
   MdIconRegistry,
   MdButtonModule,
   MdButtonToggleModule,
   MdTabsModule,
   MdCardModule
} from '@angular/material';

import { MapComponent } from './map/map.component';
import { FilterComponent } from './filter/filter.component';
import { HomeComponent } from './home/home.component';
import { UserMapComponent } from './user-map/user-map.component';
import { EditMapComponent } from './edit-map/edit-map.component';

const appRoutes: Routes = [
   { path: '', component: HomeComponent, pathMatch: 'full' },
   { path: 'position/:id', component: UserMapComponent },
   { path: 'maps/:name', component: EditMapComponent }
];

@NgModule({
   declarations: [
      AppComponent,
      UsersComponent,
      MapComponent,
      FilterComponent,
      HomeComponent,
      UserMapComponent,
      EditMapComponent
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
      MdListModule,
      MdSidenavModule,
      MdToolbarModule,
      MdIconModule,
      MdButtonModule,
      MdButtonToggleModule,
      MdTabsModule,
      MdCardModule
   ],
   providers: [
      MdIconRegistry
   ],
   bootstrap: [
      AppComponent
   ]
})
export class AppModule { }
