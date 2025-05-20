@extends('navlayout')

@section('content')
    <div class="container mt-5">
        <h2 class="mb-4">Quản Lý Mục Tiêu Tài Chính</h2>

        <!-- Hiển thị thông báo flash -->
        @if (session('success'))
            <div class="alert alert-success alert-dismissible fade show" role="alert">
                {{ session('success') }}
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
        @endif
        @if (session('error'))
            <div class="alert alert-danger alert-dismissible fade show" role="alert">
                {{ session('error') }}
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
        @endif

        <!-- Danh Sách Mục Tiêu -->
        <h3>Danh Sách Mục Tiêu</h3>
        <table class="table table-bordered">
            <thead>
                <tr>
                    <th>Tên</th>
                    <th>Danh Mục</th>
                    <th>Số Tiền</th>
                    <th>Hạn</th>
                    <th>Ghi Chú</th>
                </tr>
            </thead>
            <tbody>
                @foreach($goals as $goal)
                    <tr>
                        <td>{{ $goal->name }}</td>
                        <td>{{ $goal->category->name ?? 'Không có danh mục' }}</td>
                        <td>{{ number_format($goal->target_amount, 0, ',', '.') }}</td>
                        <td>{{ \Carbon\Carbon::parse($goal->due_date)->format('d/m/Y') }}</td>
                        <td>{{ $goal->note ?? 'Không có ghi chú' }}</td>
                    </tr>
                @endforeach
                @if($goals->isEmpty())
                    <tr>
                        <td colspan="5" class="text-center">Chưa có mục tiêu nào.</td>
                    </tr>
                @endif
            </tbody>
        </table>

        <!-- Liên kết phân trang -->
        <div class="mt-3 d-flex justify-content-center">
            @if ($goals->hasPages())
                <nav aria-label="Page navigation">
                    {{ $goals->links('pagination::bootstrap-5') }}
                </nav>
            @endif
        </div>

        <!-- Nút chuyển đổi form -->
        <div class="mb-4">
            <button class="btn btn-success" onclick="showForm('addForm')">Thêm Mục Tiêu</button>
            <button class="btn btn-warning" onclick="showForm('editForm')">Sửa Mục Tiêu</button>
            <button class="btn btn-danger" onclick="showForm('deleteForm')">Xóa Mục Tiêu</button>
        </div>

        <!-- Form Thêm -->
        <form action="{{ route('goals.store') }}" method="POST" id="addForm" style="display:none;">
            @csrf
            <h4>Thêm Mục Tiêu</h4>
            <div class="mb-3">
                <label for="name" class="form-label">Tên Mục Tiêu:</label>
                <input type="text" name="name" id="name" class="form-control" value="{{ old('name') }}" required>
                @error('name')
                    <span class="text-danger">{{ $message }}</span>
                @enderror
            </div>
            <div class="mb-3">
                <label for="category_id" class="form-label">Danh Mục:</label>
                <select name="category_id" id="category_id" class="form-control" required>
                    <option value="">-- Chọn Danh Mục --</option>
                    @foreach($categories as $cat)
                        <option value="{{ $cat->id }}" {{ old('category_id') == $cat->id ? 'selected' : '' }}>
                            {{ $cat->name }}
                        </option>
                    @endforeach
                </select>
                @error('category_id')
                    <span class="text-danger">{{ $message }}</span>
                @enderror
            </div>
            <div class="mb-3">
                <label for="target_amount" class="form-label">Số Tiền Mục Tiêu:</label>
                <input type="number" name="target_amount" id="target_amount" class="form-control" value="{{ old('target_amount') }}" required>
                @error('target_amount')
                    <span class="text-danger">{{ $message }}</span>
                @enderror
            </div>
            <div class="mb-3">
                <label for="due_date" class="form-label">Hạn Hoàn Thành:</label>
                <input type="date" name="due_date" id="due_date" class="form-control" value="{{ old('due_date') }}" required>
                @error('due_date')
                    <span class="text-danger">{{ $message }}</span>
                @enderror
            </div>
            <div class="mb-3">
                <label for="note" class="form-label">Ghi Chú:</label>
                <textarea name="note" id="note" class="form-control">{{ old('note') }}</textarea>
                @error('note')
                    <span class="text-danger">{{ $message }}</span>
                @enderror
            </div>
            <button type="submit" class="btn btn-primary mt-2">Lưu</button>
        </form>

        <!-- Form Sửa -->
        <form action="#" method="POST" id="editForm" style="display:none;" onsubmit="return validateEditForm()">
            @csrf
            @method('PUT')
            <h4>Sửa Mục Tiêu</h4>
            <div class="mb-3">
                <label for="edit_goal_id" class="form-label">Chọn Mục Tiêu:</label>
                <select name="goal_id" id="edit_goal_id" class="form-control" onchange="fillEditForm(this)" required>
                    <option value="">-- Chọn Mục Tiêu --</option>
                    @foreach($goals as $goal)
                        <option value="{{ $goal->id }}"
                                data-name="{{ $goal->name }}"
                                data-cat="{{ $goal->category_id }}"
                                data-amount="{{ $goal->target_amount }}"
                                data-date="{{ $goal->due_date }}"
                                data-note="{{ $goal->note }}">
                            {{ $goal->name }} ({{ \Carbon\Carbon::parse($goal->due_date)->format('d/m/Y') }})
                        </option>
                    @endforeach
                </select>
                @error('goal_id')
                    <span class="text-danger">{{ $message }}</span>
                @enderror
            </div>
            <input type="hidden" name="goal_id_actual" id="goal_id_actual">
            <div class="mb-3">
                <label for="edit_name" class="form-label">Tên Mục Tiêu:</label>
                <input type="text" name="name" id="edit_name" class="form-control" required>
                @error('name')
                    <span class="text-danger">{{ $message }}</span>
                @enderror
            </div>
            <div class="mb-3">
                <label for="edit_category_id" class="form-label">Danh Mục:</label>
                <select name="category_id" id="edit_category_id" class="form-control" required>
                    <option value="">-- Chọn Danh Mục --</option>
                    @foreach($categories as $cat)
                        <option value="{{ $cat->id }}">{{ $cat->name }}</option>
                    @endforeach
                </select>
                @error('category_id')
                    <span class="text-danger">{{ $message }}</span>
                @enderror
            </div>
            <div class="mb-3">
                <label for="edit_amount" class="form-label">Số Tiền Mục Tiêu:</label>
                <input type="number" name="target_amount" id="edit_amount" class="form-control" required>
                @error('target_amount')
                    <span class="text-danger">{{ $message }}</span>
                @enderror
            </div>
            <div class="mb-3">
                <label for="edit_date" class="form-label">Hạn Hoàn Thành:</label>
                <input type="date" name="due_date" id="edit_date" class="form-control" required>
                @error('due_date')
                    <span class="text-danger">{{ $message }}</span>
                @enderror
            </div>
            <div class="mb-3">
                <label for="edit_note" class="form-label">Ghi Chú:</label>
                <textarea name="note" id="edit_note" class="form-control"></textarea>
                @error('note')
                    <span class="text-danger">{{ $message }}</span>
                @enderror
            </div>
            <button type="submit" class="btn btn-warning mt-2">Cập Nhật</button>
        </form>

        <!-- Form Xóa -->
        <form action="#" method="POST" id="deleteForm" style="display:none;" onsubmit="return confirmDelete(event)">
            @csrf
            @method('DELETE')
            <h4>Xóa Mục Tiêu</h4>
            <div class="mb-3">
                <label for="delete_goal_id" class="form-label">Chọn Mục Tiêu Cần Xóa:</label>
                <select name="goal_id" id="delete_goal_id" class="form-control" onchange="setDeleteAction(this)" required>
                    <option value="">-- Chọn Mục Tiêu --</option>
                    <option value="all">Xóa Tất Cả</option>
                    @foreach($goals as $goal)
                        <option value="{{ $goal->id }}">{{ $goal->name }} ({{ \Carbon\Carbon::parse($goal->due_date)->format('d/m/Y') }})</option>
                    @endforeach
                </select>
                @error('goal_id')
                    <span class="text-danger">{{ $message }}</span>
                @enderror
            </div>
            <button type="submit" class="btn btn-danger mt-2">Xóa</button>
        </form>
    </div>

    <script>
        function showForm(id) {
            document.getElementById('addForm').style.display = 'none';
            document.getElementById('editForm').style.display = 'none';
            document.getElementById('deleteForm').style.display = 'none';
            document.getElementById(id).style.display = 'block';
        }

        function fillEditForm(select) {
            let option = select.options[select.selectedIndex];
            let form = document.getElementById('editForm');
            if (option.value) {
                form.action = "{{ route('goals.update', ':id') }}".replace(':id', option.value);
                document.getElementById('goal_id_actual').value = option.value;
                document.getElementById('edit_name').value = option.dataset.name || '';
                document.getElementById('edit_category_id').value = option.dataset.cat || '';
                document.getElementById('edit_amount').value = option.dataset.amount || '';
                document.getElementById('edit_date').value = option.dataset.date || '';
                document.getElementById('edit_note').value = option.dataset.note || '';
            }
        }

        function validateEditForm() {
            let goalId = document.getElementById('goal_id_actual').value;
            if (!goalId) {
                alert('Vui lòng chọn mục tiêu để sửa.');
                return false;
            }
            return true;
        }

        function setDeleteAction(select) {
            let form = document.getElementById('deleteForm');
            let value = select.value;
            if (value === 'all') {
                form.action = "{{ route('goals.deleteAll') }}";
            } else if (value) {
                form.action = "{{ route('goals.destroy', ':id') }}".replace(':id', value);
            } else {
                form.action = '#';
            }
        }

        function confirmDelete(event) {
            let goalId = document.getElementById('delete_goal_id').value;
            if (!goalId) {
                alert('Vui lòng chọn mục tiêu để xóa.');
                return false;
            }
            if (goalId === 'all') {
                return confirm('Bạn chắc chắn muốn xóa TẤT CẢ mục tiêu? Hành động này không thể khôi phục!');
            }
            return confirm('Bạn chắc chắn muốn xóa mục tiêu này?');
        }
    </script>
@endsection