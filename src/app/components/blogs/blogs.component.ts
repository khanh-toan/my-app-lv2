import { Component, OnInit } from '@angular/core';
import { Blog } from '../../models/blog';
import { BlogService } from '../../services/blog.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CategoryService } from '../../services/category.service';
import { PositionService } from '../../services/position.service';
import { Position } from '../../models/position';

@Component({
  selector: 'app-blogs',
  templateUrl: './blogs.component.html',
  styleUrl: './blogs.component.css'
})
export class BlogsComponent implements OnInit {
  blogForm: FormGroup;
  blogList: Blog[] = []; // Danh sách blog
  categories: { id: number; name: string }[] = [];
  positions: Position[] = [];
  editMode: boolean = false;
  editingBlogId: number | null = null;
  // Modal
  isModalVisible = false;

  openAddModal(): void {
    this.isModalVisible = true;
    this.editMode = false; // Thiết lập chế độ thêm
    this.blogForm.reset(); // Reset form
  }

  openEditModal(blog: Blog): void {
    this.editMode = true; // Thiết lập chế độ sửa
    this.editingBlogId = blog.id; // Gán ID blog cần sửa
    this.blogForm.patchValue({
      id: blog.id,
      title: blog.title,
      des: blog.des,
      detail: blog.detail,
      category: blog.category.toString(), // Set giá trị danh mục là ID của danh mục hiện tại
      data_pubblic: blog.data_pubblic ? new Date(blog.data_pubblic).toISOString().substring(0, 10) : null,
      public: blog.public,
      thumbs: blog.thumbs == null ? "" : blog.thumbs.toString(),
      position: blog.position.map(pos => pos.toString())
    });
    this.isModalVisible = true;
  }

  handleCancel(): void {
    this.isModalVisible = false; // Đóng modal
  }

  // Các biến để lưu thông báo lỗi
  titleError: string = '';
  desError: string = "";
  detailError: string = "";
  categoryError: string = "";
  dateError: string = "";
  positionError: string = "";

  constructor(private fb: FormBuilder, private blogService: BlogService, private categoryService: CategoryService, private positionService: PositionService) {
    this.blogForm = this.fb.group({
      id: [],
      title: ['', Validators.required],
      des: ['', Validators.required],
      detail: ['', Validators.required],
      category: [null, [Validators.required, Validators.min(1)]],
      data_pubblic: ['', Validators.required],
      public: [true], // Trường radio, mặc định là công khai
      thumbs: [null], // Trường upload ảnh
      position: [[], Validators.required]
    });
    this.updateErrorMessages(); // Khởi tạo các biến lưu thông báo l��i
  }

  ngOnInit(): void {
    this.fetchCategories(); // Lấy danh sách danh mục khi khởi đ��ng
    this.fetchBlogs(); // Lấy danh sách blog khi khởi động
    this.fetchPositions();
  }

  fetchBlogs(): void {
    this.blogService.getBlogs().subscribe(blogs => {
      this.blogList = blogs; // Cập nhật danh sách blog
    });
  }

  fetchCategories(): void {
    this.categoryService.getCategories().subscribe((categories) => {
      this.categories = categories; // Lưu danh sách danh mục vào biến categories
    });
  }

  fetchPositions(): void {
    this.positionService.getPositions().subscribe(positions => {
      this.positions = positions;
    });
  }

  getCategoryName(categoryId: number): string {
    const category = this.categories.find(cat => +cat.id === categoryId);
    // console.log(category);
    return category ? category.name : 'Unknown'; // Trả về 'Unknown' nếu không tìm thấy
  }

  getPositionName(posId: number): string {
    const position = this.positions.find(pos => +pos.id === posId);
    return position ? position.name : 'Unknown';
  }

  isLastPosition(positionArray: number[], posId: number): boolean {
    return positionArray.indexOf(posId) === positionArray.length - 1;
  }

  resetErrorMessages(): void {
    this.titleError = '';
    this.desError = "";
    this.detailError = "";
    this.categoryError = "";
  }

  toggleEditMode(blogId: number): void {
    this.editMode = true;
    this.editingBlogId = blogId;
    const blogToEdit = this.blogList.find(blog => blog.id === blogId);
    if (blogToEdit) {
      this.blogForm.patchValue(blogToEdit); // Cập nhật form với thông tin blog cần sửa
    }
  }

  onFileSelected(event: Event): void {
    const fileInput = event.target as HTMLInputElement;
    if (fileInput.files && fileInput.files.length > 0) {
      const file = fileInput.files[0];
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const thumbs = reader.result as string; // Cập nhật trường thumbs bằng base64
        this.blogForm.patchValue({ thumbs: thumbs }); // Cập nhật trường thumbs trong form
      };
      reader.onerror = (error) => {
        console.error('Error converting image to Base64', error);
      };
    }
  }


  addBlog(): void {
    if (!this.blogForm.valid) {
      Object.values(this.blogForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
    }
    if (this.blogForm.valid) {
      const maxId = this.blogList.length > 0 ? Math.max(...this.blogList.map(blog => typeof blog.id === 'number' ? blog.id : parseInt(blog.id, 10))) : 0;
      // Xử lý thêm blog
      // Lấy giá trị từ form và chuyển đổi mảng position từ string[] sang number[]
      const newBlog: Blog = {
        ...this.blogForm.value,
        id: (maxId + 1).toString(), // Tăng id lên 1
        category: Number(this.blogForm.value.category), // Convert từ string sang number
        position: this.blogForm.value.position.map((posId: string) => Number(posId)) // Convert từ string sang number
      };

      this.blogService.addBlog(newBlog).subscribe(
        () => {
          // Reset form và xử lý thành công
          this.blogForm.reset();
          this.handleCancel();
          this.resetErrorMessages();
          this.fetchBlogs();
        },
        error => console.error('Error adding blog', error)
      );
    } else {
      this.updateErrorMessages();
    }
  }

  updateBlog(): void {
    if (!this.blogForm.valid) {
      Object.values(this.blogForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
    }
    if (this.blogForm.valid && this.editingBlogId !== null) {
      const data = this.blogForm.value;
      // Chuyển đổi mảng position từ string[] sang number[]
      const updatedBlog: Blog = {
        ...data,
        category: Number(data.category), // Convert từ string sang number
        position: data.position.map((posId: string) => Number(posId)) // Convert từ string sang number
      };
      this.sendUpdateRequest(updatedBlog);
    }
  }

  sendUpdateRequest(updatedBlog: Blog): void {
    this.blogService.updateBlog(updatedBlog).subscribe(() => {
      this.fetchBlogs(); // Lấy lại danh sách blog sau khi cập nhật
      this.blogForm.reset(); // Reset form
      this.resetErrorMessages(); // Reset thông báo lỗi
      this.editMode = false; // Đặt lại chế độ
      this.handleCancel(); // Đóng modal
    }, error => {
      console.error('Error updating blog', error);
    });
  }

  deleteBlog(blogId: number): void {
    console.log(blogId);
    this.blogService.deleteBlog(blogId).subscribe(
      () => {
        // Sau khi xoá thành công, tự động tải lại danh sách blog
        this.fetchBlogs();
      },
      error => {
        console.error('Error deleting blog', error);
      }
    );
  }  

  updateErrorMessages(): void {
    this.titleError = this.blogForm.get('title')?.hasError('required') ? 'Tiêu đề là bắt buộc.' : '';
    this.desError = this.blogForm.get('des')?.hasError('required') ? 'Mô tả là bắt buộc.' : "";
    this.detailError = this.blogForm.get('detail')?.hasError('required') ? 'Chi tiết là bắt buộc.' : "";
    this.categoryError = this.blogForm.get('category')?.hasError('required') ? 'Danh mục là bắt buộc.' : "";
  }
}
