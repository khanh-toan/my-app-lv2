import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CategoriesComponent } from './components/categories/categories.component';
import { PositionsComponent } from './components/positions/positions.component';
import { BlogsComponent } from './components/blogs/blogs.component';

const routes: Routes = [
  { path: 'categories', component: CategoriesComponent },
  { path: 'positions', component: PositionsComponent },
  { path: 'blogs', component: BlogsComponent },
  { path: '', redirectTo: '/categories', pathMatch: 'full' } // Redirect mặc định
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
