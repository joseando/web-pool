import { NgModule } from '@angular/core';
import { CommonModule, } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { Routes, RouterModule } from '@angular/router';

import { FaqComponent } from './faq/faq.component';
import { StatsComponent } from './stats/stats.component';
import { FeesComponent } from './fees/fees.component';
import { GiveawayComponent } from './giveaway/giveaway.component';
import { JoinComponent } from './join/join.component';
import { LandingComponent } from './landing/landing.component';
import { PartnersComponent } from './partners/partners.component';
import { ReferralComponent } from './referral/referral.component'
import { TermsComponent } from './terms/terms.component';
import { CalculatorComponent } from './calculator/calculator.component';
import { PagenotfoundComponent } from './errors/pagenotfound/pagenotfound.component';
import { PartialsComponent } from './partials/partials.component'
import { SpaceComponent } from './space/space.component';
import { BlocksComponent } from './blocks/blocks.component';
import { PaymentsComponent } from './payments/payments.component';
import { RewardsComponent } from './rewards/rewards.component';
import { HarvestersComponent } from './harvesters/harvesters.component';
import { AuthenticationGuard } from './guards/authentication.guard';

const routes: Routes = [
  { path: '', component: LandingComponent },
  { path: 'partials', component: PartialsComponent, canActivate: [AuthenticationGuard] },
  { path: 'space', component: SpaceComponent, canActivate: [AuthenticationGuard] },
  { path: 'blocks', component: BlocksComponent, canActivate: [AuthenticationGuard] },
  { path: 'payments', component: PaymentsComponent, canActivate: [AuthenticationGuard] },
  { path: 'rewards', component: RewardsComponent, canActivate: [AuthenticationGuard] },
  // { path: 'harvesters', component: HarvestersComponent, canActivate: [AuthenticationGuard] },

  // { path: 'join', component: JoinComponent },
  // { path: 'faq', component: FaqComponent },
  // { path: 'stats', component: StatsComponent },
  // { path: 'fees', component: FeesComponent },
  // { path: 'giveaway', component: GiveawayComponent },
  // { path: 'partners', component: PartnersComponent },
  // { path: 'referral', component: ReferralComponent },
  // { path: 'terms', component: TermsComponent },
  // { path: 'calculator', component: CalculatorComponent },
  // { path: '404', component: PagenotfoundComponent },

  //{ path: '**', redirectTo: '404', pathMatch: 'full'},
  { path: '', redirectTo: '', pathMatch: 'full' }
];

@NgModule({
  imports: [
    CommonModule,
    BrowserModule,
    RouterModule.forRoot(routes),
  ],
  exports: [
  ],
})
export class AppRoutingModule { }
