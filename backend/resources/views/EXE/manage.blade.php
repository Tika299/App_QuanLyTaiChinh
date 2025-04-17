@extends('navlayout')

@section('content')
    <div class="container mt-5">
        <h2 class="mb-4">Quản Lý Mục Tiêu Tài Chính</h2>

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
            <div class="form-group">
                <label>Tên Mục Tiêu:</label>
                <input type="text" name="name" class="form-control" required>
            </div>
            <div class="form-group">
                <label>Loại:</label>
                <select name="type" class="form-control">
                    <option value="income">Thu nhập</option>
                    <option value="expense">Chi tiêu</option>
                </select>
            </div>
            <div class="form-group">
                <label>Danh Mục:</label>
                <select name="category_id" class="form-control">
                    @foreach($categories as $cat)
                        <option value="{{ $cat->id }}">{{ $cat->name }}</option>
                    @endforeach

                </select>
            </div>
            <div class="form-group">
                <label>Số Tiền Mục Tiêu:</label>
                <input type="number" name="target_amount" class="form-control" required>
            </div>
            <div class="form-group">
                <label>Hạn Hoàn Thành:</label>
                <input type="date" name="due_date" class="form-control" required>
            </div>
            <div class="form-group">
                <label>Ghi Chú:</label>
                <textarea name="note" class="form-control"></textarea>
            </div>
            <button type="submit" class="btn btn-primary mt-2">Lưu</button>
        </form>
            <!-- Form Sửa -->

        <form action="{{ route('goals.update', 'goal_id_actual') }}" method="POST" id="editForm" style="display:none;"
            onsubmit="return updateAction(event)">
            @csrf
            @method('PUT')
            <h4>Sửa Mục Tiêu</h4>
            <div class="form-group">
                <label>Chọn Mục Tiêu:</label>
                <select name="goal_id" id="edit_goal_id" class="form-control" onchange="fillEditForm(this)">
                    <option value="">-- Chọn --</option>
                    @foreach($goals as $goal)
                        <option value="{{ $goal->id }}" data-name="{{ $goal->name }}" data-type="{{ $goal->type }}"
                            data-cat="{{ $goal->category_id }}" data-amount="{{ $goal->target_amount }}"
                            data-date="{{ $goal->due_date }}" data-note="{{ $goal->note }}">
                            {{ $goal->name }} ({{ $goal->due_date }})
                        </option>
                    @endforeach
                </select>
            </div>
            <input type="hidden" name="goal_id_actual" id="goal_id_actual">
            <!-- Các input khác vẫn giữ nguyên -->
            ...
            <button type="submit" class="btn btn-warning mt-2">Cập Nhật</button>
        </form>


        <!-- Form Xóa -->
        <form action="{{ route('goals.destroy', 'goal_id') }}" method="POST" id="deleteForm" style="display:none;"
            onsubmit="return confirmDelete(event)">
            @csrf
            @method('DELETE')
            <h4>Xóa Mục Tiêu</h4>
            <div class="form-group">
                <label>Chọn Mục Tiêu Cần Xóa:</label>
                <select name="goal_id" id="delete_goal_id" class="form-control" onchange="setDeleteAction(this)">
                    <option value="">-- Chọn --</option>
                    @foreach($goals as $goal)
                        <option value="{{ $goal->id }}">{{ $goal->name }} ({{ $goal->due_date }})</option>
                    @endforeach
                </select>
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
            document.getElementById('goal_id_actual').value = option.value; // Điền ID mục tiêu vào input hidden
            document.getElementById('edit_name').value = option.dataset.name;  // Điền tên mục tiêu
            document.getElementById('edit_type').value = option.dataset.type;  // Điền loại (thu nhập/chi tiêu)
            document.getElementById('edit_category').value = option.dataset.cat;  // Điền danh mục
            document.getElementById('edit_amount').value = option.dataset.amount;  // Điền số tiền mục tiêu
            document.getElementById('edit_date').value = option.dataset.date;  // Điền hạn hoàn thành
            document.getElementById('edit_note').value = option.dataset.note;  // Điền ghi chú
        }


        function updateAction(event) {
            let id = document.getElementById('goal_id_actual').value;
            if (!id) {
                alert("Vui lòng chọn mục tiêu để sửa.");
                return false;
            }
            event.target.action = `/goals/${id}`;
            return true;
        }

        function setDeleteAction(select) {
            var goalId = select.value;
            // Cập nhật action của form
            document.getElementById('deleteForm').action = '/goals/' + goalId;
        }

        function confirmDelete(event) {
            var goalId = document.getElementById('delete_goal_id').value;
            if (!goalId) {
                alert("Vui lòng chọn mục tiêu để xóa.");
                return false;
            }
            return confirm("Bạn chắc chắn muốn xóa mục tiêu này?");
        }
    </script>
@endsection