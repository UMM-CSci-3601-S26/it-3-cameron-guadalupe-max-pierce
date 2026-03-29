import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';

import { FamilyListComponent } from './families/family_list.component';
import { GradeListComponent } from './grade_list/grade_list.component';

//import { CompanyListComponent } from './company-list/company-list.component';
import { InventoryListComponent } from './inventory/inventory_list.component';
import { AddItemComponent } from './inventory/add_inventory_item.component';
import { ModifyItemComponent } from './inventory/modify_inventory_item.component';

// Note that the 'users/new' route needs to come before 'users/:id'.
// If 'users/:id' came first, it would accidentally catch requests to
// 'users/new'; the router would just think that the string 'new' is a user ID.
const routes: Routes = [
  {path: '', component: HomeComponent, title: 'Home'},
  {path: 'families', component: FamilyListComponent, title: 'Families'},
  {path: 'grade_list', component: GradeListComponent, title: 'Requirements'},
  // {path: 'families/new', component: AddUserComponent, title: 'Add User'},
  // {path: 'families/:id', component: UserProfileComponent, title: 'User Profile'},
  {path: 'inventory', component: InventoryListComponent, title: 'Inventory'},
  {path: 'inventory/new', component: AddItemComponent, title: 'Add Item'},
  {path: 'inventory/:id', component: ModifyItemComponent, title: 'Item Profile'},
  // {path: 'companies', component: CompanyListComponent, title: 'Companies'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
