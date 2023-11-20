import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { AppRoutingModule } from './app-routing.module';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { HeaderComponent } from './components/header/header.component';
import { ButtonComponent } from './components/button/button.component';
import { ListsComponent } from './components/lists/lists.component';
import { ListItemComponent } from './components/list-item/list-item.component';
import { AddListComponent } from './components/add-list/add-list.component';
import { AboutComponent } from './components/about/about.component';
import { FooterComponent } from './components/footer/footer.component';
import { LoginComponent } from './components/login/login.component';
import { CreateAccountComponent } from './components/create-account/create-account.component';
import { HeroSearchComponent } from './components/hero-search/hero-search.component';
import { DmcaComplianceComponent } from './components/dmca-compliance/dmca-compliance.component';

const appRoutes: Routes = [
  {path: "lists", component: ListsComponent},
  {path: "about", component: AboutComponent},
  { path: 'login', component: LoginComponent },
  { path: 'create-account', component: CreateAccountComponent },
  { path: 'hero-search', component: HeroSearchComponent },
  { path: 'dmca-compliance', component: DmcaComplianceComponent }
]
@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    ButtonComponent,
    ListsComponent,
    ListItemComponent,
    AddListComponent,
    AboutComponent,
    FooterComponent,
    LoginComponent,
    CreateAccountComponent,
    HeroSearchComponent,
    DmcaComplianceComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FontAwesomeModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forRoot(appRoutes)
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
