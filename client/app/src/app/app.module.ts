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
import { ErrorPopupComponent } from './components/error-popup/error-popup.component';
import { SuperheroModalComponent } from './components/superhero-modal/superhero-modal.component';
import { ListModificationComponent } from './components/list-modification/list-modification.component';
import { WriteReviewComponent } from './components/write-review/write-review.component';
import { AdminMenuComponent } from './components/admin-menu/admin-menu.component';
import { IsAdminGuard } from './guards/admin.guard';

const appRoutes: Routes = [
  { path: "lists", component: ListsComponent },
  { path: "about", component: AboutComponent },
  { path: 'login', component: LoginComponent },
  { path: 'create-account', component: CreateAccountComponent },
  { path: 'hero-search', component: HeroSearchComponent },
  { path: 'dmca-compliance', component: DmcaComplianceComponent },
  {
    path: 'admin-menu',
    component: AdminMenuComponent,
    canActivate: [IsAdminGuard]
  },

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
    ErrorPopupComponent,
    SuperheroModalComponent,
    ListModificationComponent,
    WriteReviewComponent,
    AdminMenuComponent
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
