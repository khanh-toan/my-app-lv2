import { Component, OnInit } from '@angular/core';
import { Blog } from '../../models/blog';
import { BlogService } from '../../services/blog.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CategoryService } from '../../services/category.service';

@Component({
  selector: 'app-blogs',
  templateUrl: './blogs.component.html',
  styleUrl: './blogs.component.css'
})
export class BlogsComponent implements OnInit {

  blogForm: FormGroup;
  blogList: Blog[] = []; // Danh sách blog
  categories: { id: number; name: string }[] = [];
  editMode: boolean = false;
  editingBlogId: number | null = null;
  // Modal
  isModalVisible = false;

  openAddModal(): void {
    this.isModalVisible = true;
    this.editMode = false; // Thiết lập chế độ thêm
    this.blogForm.reset(); // Reset form
  }

  // openEditModal(blog: Blog): void {
  //   this.isModalVisible = true;
  //   this.editMode = true; 
  //   this.editingBlogId = blog.id; // Lưu ID blog đang chỉnh sửa
  //   this.blogForm.patchValue(blog); // Cập nhật form với thông tin blog cần sửa
  // }

  openEditModal(blog: Blog): void {
    this.editMode = true; // Thiết lập chế độ sửa
    this.editingBlogId = blog.id; // Gán ID blog cần sửa
    this.blogForm.patchValue({
      title: blog.title,
      des: blog.des,
      detail: blog.detail,
      category: blog.category.toString(), // Set giá trị danh mục là ID của danh mục hiện tại
      data_pubblic: blog.data_pubblic ? new Date(blog.data_pubblic).toISOString().substring(0, 10) : null,
      public: blog.public,
      thumbs: blog.thumbs == null ? "" : blog.thumbs.toString(),
    });
    this.isModalVisible = true;
  }


  handleCancel(): void {
    this.isModalVisible = false; // Đóng modal
  }

  // Các biến để lưu thông báo lỗi
  titleError: string | null = null;
  desError: string | null = null;
  detailError: string | null = null;
  categoryError: string | null = null;
  dateError: Date | null = null;

  constructor(private fb: FormBuilder, private blogService: BlogService, private categoryService: CategoryService) {
    this.blogForm = this.fb.group({
      title: ['', Validators.required],
      des: ['', Validators.required],
      detail: ['', Validators.required],
      category: [null, [Validators.required, Validators.min(1)]],
      data_pubblic: ['', Validators.required],
      public: [true], // Trường radio, mặc định là công khai
      thumbs: [null] // Trường upload ảnh
    });
  }

  ngOnInit(): void {
    this.fetchCategories(); // Lấy danh sách danh mục khi khởi đ��ng
    this.fetchBlogs(); // Lấy danh sách blog khi khởi động
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

  getCategoryName(categoryId: number): string {
    const category = this.categories.find(cat => +cat.id === categoryId);
    // console.log(category);
    return category ? category.name : 'Unknown'; // Trả về 'Unknown' nếu không tìm thấy
  }

  resetErrorMessages(): void {
    this.titleError = null;
    this.desError = null;
    this.detailError = null;
    this.categoryError = null;
  }

  toggleEditMode(blogId: number): void {
    this.editMode = true;
    this.editingBlogId = blogId;
    const blogToEdit = this.blogList.find(blog => blog.id === blogId);
    if (blogToEdit) {
      this.blogForm.patchValue(blogToEdit); // Cập nhật form với thông tin blog cần sửa
    }
  }

  onFileChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.blogForm.patchValue({
        thumbs: file // Lưu file vào FormGroup
      });
    }
  }

  addBlog(): void {
    if (this.blogForm.valid) {
      // Xử lý thêm blog
      const newBlog: Blog = this.blogForm.value;
      this.blogService.addBlog(newBlog).subscribe(
        () => {
          // Reset form và xử lý thành công
          this.blogForm.reset();
          this.resetErrorMessages();
        },
        error => console.error('Error adding blog', error)
      );
    } else {
      this.updateErrorMessages();
    }
  }

  // updateBlog(): void {
  //   if (this.blogForm.valid) {
  //     const updatedBlog: Blog = {
  //       ...this.blogForm.value,
  //       id: this.editingBlogId,
  //       data_pubblic: this.blogForm.value.date ? new Date(this.blogForm.value.date).toISOString() : null, // Chuyển Date thành string
  //     };
  //     this.blogService.updateBlog(updatedBlog).subscribe(() => {
  //       this.fetchBlogs(); // Lấy lại danh sách blog sau khi cập nhật
  //       this.blogForm.reset(); // Reset form
  //       this.resetErrorMessages(); // Reset thông báo lỗi
  //       this.editMode = false; // Đặt lại chế độ
  //     });
  //   } else {
  //     this.updateErrorMessages();
  //   }
  // }

  updateBlog(): void {
    if (this.blogForm.valid && this.editingBlogId !== null) {
      // Lấy thông tin hiện tại của blog
      const currentBlog = this.blogList.find(blog => blog.id === this.editingBlogId);
      const file: File = this.blogForm.get('thumbs')?.value;
      if (currentBlog) {
        // Tạo đối tượng blog cập nhật bằng cách kết hợp thông tin hiện tại và thông tin mới từ form
        const updatedBlog: Blog = {
          ...currentBlog,  // Giữ nguyên thông tin cũ
          ...this.blogForm.value,  // Cập nhật thông tin mới từ form
          id: this.editingBlogId,
          category: +this.blogForm.value.category, // Chuyển ID thành số
          data_pubblic: this.blogForm.value.data_pubblic ? new Date(this.blogForm.value.data_pubblic).toISOString() : currentBlog.data_pubblic, // Nếu không có ngày mới, giữ nguyên
        };

        // Nếu có file, thêm vào đối tượng blog
        if (file) {
          updatedBlog.thumbs = file.name; // Hoặc xử lý để lưu trữ tên file
        }

        this.blogService.updateBlog(updatedBlog).subscribe(() => {
          this.fetchBlogs(); // Lấy lại danh sách blog sau khi cập nhật
          this.blogForm.reset(); // Reset form
          this.resetErrorMessages(); // Reset thông báo lỗi
          this.editMode = false; // Đặt lại chế độ
          // Đóng modal
          this.handleCancel();
        });
      }
    } else {
      this.updateErrorMessages();
    }
  }


  deleteBlog(blogId: number): void {
    this.blogService.deleteBlog(blogId).subscribe(() => {
      this.fetchBlogs(); // Lấy lại danh sách blog sau khi xóa
    });
  }

  updateErrorMessages(): void {
    this.titleError = this.blogForm.get('title')?.hasError('required') ? 'Tiêu đề là bắt buộc.' : null;
    this.desError = this.blogForm.get('des')?.hasError('required') ? 'Mô tả là bắt buộc.' : null;
    this.detailError = this.blogForm.get('detail')?.hasError('required') ? 'Chi tiết là bắt buộc.' : null;
    this.categoryError = this.blogForm.get('category')?.hasError('required') ? 'Danh mục là bắt buộc.' : null;
  }
  
}
