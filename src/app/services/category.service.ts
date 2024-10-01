import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, of, tap } from 'rxjs';
import { Category } from '../models/category';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
  providedIn: 'root'
})

export class CategoryService {
  private apiUrl = 'http://admin-pc:3000/categories';
  constructor(private http: HttpClient) { }

  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(this.apiUrl).pipe(
      tap(receiveCate => console.log(`receiveCate = ${JSON.stringify(receiveCate)}`)),
      catchError(error => of([]))
    );
  }

  // Thêm vào CategoryService
  addCategory(category: Category): Observable<Category>{
    return this.http.post<Category>(this.apiUrl, category, httpOptions).pipe(
      tap((newCategory: Category) => console.log(`Added category with id=${newCategory.id}`)),
      catchError(error => of({id: 0, name: ""} as Category))
    );
  }

  deleteCategory(cateId: number): Observable<Category | null> {
    const deleteUrl = `${this.apiUrl}/${cateId}`;
    return this.http.delete<Category>(deleteUrl, httpOptions).pipe(
      tap(_ => console.log(`Delete by id = ${cateId}`)),
      catchError(error => of(null))
    );
  }

  updateCategory(category: Category): Observable<Category>{
    const updateUrl = `${this.apiUrl}/${category.id}`;
    return this.http.put<Category>(updateUrl, category, httpOptions).pipe(
      tap(updatedCategory => console.log(`Updated category with id=${updatedCategory.id}`)),
      catchError(error => of({ id: 0, name: '' } as Category))
    );
  }

}
