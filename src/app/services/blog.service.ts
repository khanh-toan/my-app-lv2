import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, of, tap } from 'rxjs';
import { Blog } from '../models/blog';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
  providedIn: 'root'
})
export class BlogService {
  private apiUrl = 'http://admin-pc:3000/blogs';

  constructor(private http: HttpClient) {}

  getBlogsByCategoryId(categoryId: number): Observable<Blog[]> {
    const url = `${this.apiUrl}?category=${categoryId}`; // Lấy blogs theo categoryId
    return this.http.get<Blog[]>(url).pipe(
      tap(blogs => console.log(`Fetched blogs for categoryId=${categoryId}`)),
      catchError(error => {
        console.error('Error fetching blogs:', error);
        return of([]);
      })
    );
  }

  getBlogs(): Observable<Blog[]> {
    return this.http.get<Blog[]>(this.apiUrl).pipe(
      tap(blogs => console.log('Fetched blogs')),
      catchError(this.handleError<Blog[]>('getBlogs', []))
    );
  }

  addBlog(blog: Blog): Observable<Blog> {
    return this.http.post<Blog>(this.apiUrl, blog, httpOptions).pipe(
      tap((newBlog: Blog) => console.log(`Added blog with id=${newBlog.id}`)),
      catchError(this.handleError<Blog>('addBlog'))
    );
  }

  updateBlog(blog: Blog): Observable<Blog> {
    return this.http.put<Blog>(`${this.apiUrl}/${blog.id}`, blog, httpOptions).pipe(
      tap(() => console.log(`Updated blog id=${blog.id}`)),
      catchError(this.handleError<Blog>('updateBlog'))
    );
  }

  deleteBlog(id: number): Observable<Blog> {
    return this.http.delete<Blog>(`${this.apiUrl}/${id}`, httpOptions).pipe(
      tap(() => console.log(`Deleted blog id=${id}`)),
      catchError(this.handleError<Blog>('deleteBlog'))
    );
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed: ${error.message}`);
      return of(result as T);
    };
  }
}
