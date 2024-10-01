  import { Component, OnInit } from '@angular/core';
  import { Blog } from '../../models/blog';
  import { BlogService } from '../../services/blog.service';
  import { FormBuilder, FormGroup, Validators } from '@angular/forms';

  @Component({
    selector: 'app-blogs',
    templateUrl: './blogs.component.html',
    styleUrl: './blogs.component.css'
  })
  export class BlogsComponent implements OnInit {

    blogForm: FormGroup;
    blogList: Blog[] = []; // Danh sách blog
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
        ...blog,
        date: blog.data_pubblic ? new Date(blog.data_pubblic).toISOString().substring(0, 10) : null, // Chuyển đổi chuỗi ngày thành định dạng 'YYYY-MM-DD' cho input
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

    constructor(private fb: FormBuilder, private blogService: BlogService) {
      this.blogForm = this.fb.group({
        title: ['', Validators.required],
        des: ['', Validators.required],
        detail: ['', Validators.required],
        category: [null, [Validators.required, Validators.min(1)]],
        date: ['', Validators.required],
      });
    }

    ngOnInit(): void {
      this.fetchBlogs(); // Lấy danh sách blog khi khởi động
    }

    fetchBlogs(): void {
      this.blogService.getBlogs().subscribe(blogs => {
        this.blogList = blogs; // Cập nhật danh sách blog
      });
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

    updateBlog(): void {
      if (this.blogForm.valid) {
        const updatedBlog: Blog = {
          ...this.blogForm.value,
          id: this.editingBlogId,
          data_pubblic: this.blogForm.value.date ? new Date(this.blogForm.value.date).toISOString() : null, // Chuyển Date thành string
        };
        this.blogService.updateBlog(updatedBlog).subscribe(() => {
          this.fetchBlogs(); // Lấy lại danh sách blog sau khi cập nhật
          this.blogForm.reset(); // Reset form
          this.resetErrorMessages(); // Reset thông báo lỗi
          this.editMode = false; // Đặt lại chế độ
        });
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
