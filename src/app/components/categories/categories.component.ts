import { Component, OnInit } from '@angular/core';
import { Category } from '../../models/category';
import { CategoryService } from '../../services/category.service';
import { BlogService } from '../../services/blog.service';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrl: './categories.component.css'
})
export class CategoriesComponent implements OnInit {
  categoryList: Category[] = [];
  newCategoryName: any;
  editMode: boolean = false;
  editingCategoryId: number | null = null; // Để lưu id của danh mục đang chỉnh sửa
  searchTerm: string = '';

  constructor(private categoryService: CategoryService, private blogService: BlogService) {
    // Constructor chỉ khởi tạo object nhưng không nên chứa nhiều logic
    console.log('Constructor called');
  }

  ngOnInit(): void {
    this.getCateFromServices(); // Đảm bảo gọi phương thức này
  }

  getCateFromServices(): void {
    this.categoryService.getCategories().subscribe(
      list => this.categoryList = list,
      error => console.error('Error retrieving data', error)
    );
  }

  addCategory(): void {
    const maxId = this.categoryList.length > 0 ? Math.max(...this.categoryList.map(cate => typeof cate.id === 'number' ? cate.id : parseInt(cate.id, 10))) : 0;

    if (this.newCategoryName.trim()) {
      const newCategory: Category = {
        name: this.newCategoryName,
        id: maxId + 1
      }; // Tạo đối tượng danh mục mới

      // Gọi API để thêm danh mục mới ở đây (cần thêm hàm thêm danh mục trong CategoryService)
      this.categoryService.addCategory(newCategory).subscribe(
        responseCategory => {
          this.categoryList.push(responseCategory); // Thêm vào danh sách
          this.newCategoryName = ''; // Xóa input sau khi thêm
        },
        error => console.error('Error adding category', error)
      );
    }
  }

  deleteCategory(cateId: number): void {
    // Trước khi xóa, kiểm tra xem có blog nào thuộc category không
    this.blogService.getBlogsByCategoryId(cateId).subscribe(
      blogs => {
        if (blogs.length > 0) {
          alert('Không thể xóa vì có blog liên quan đến danh mục này.');
        } else {
          // Nếu không có blog liên quan, tiến hành xóa danh mục
          this.categoryService.deleteCategory(cateId).subscribe(
            () => {
              this.categoryList = this.categoryList.filter(cate => cate.id !== cateId);
              alert('Danh mục đã được xóa.');
            },
            error => console.error('Error deleting category', error)
          );
        }
      },
      error => console.error('Error checking blogs for category', error)
    );
  }

  toggleEditMode(categoryId: number): void {
    if (this.editingCategoryId === categoryId) {
      this.editMode = false;
      this.editingCategoryId = null;
    } else {
      this.editMode = true;
      this.editingCategoryId = categoryId;
    }
  }

  updateCategory(category: Category) {
    this.categoryService.updateCategory(category).subscribe(
      () => {
        // Sau khi cập nhật thành công, tắt chế độ chỉnh sửa
        this.editMode = false;
        this.editingCategoryId = null;
      },
      error => console.error('Error updating category', error)
    );
  }

  searchCategories(): Category[] {
    if (!this.searchTerm) {
      return this.categoryList; // Trả về toàn bộ danh sách nếu không có từ khóa tìm kiếm
    }
    return this.categoryList.filter(category => 
      category.name.toLowerCase().includes(this.searchTerm.toLowerCase())
    ); // Lọc danh sách theo từ khóa tìm kiếm
  }
}
