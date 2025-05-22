import React from 'react';

const GoalList = ({ goals, categories, currentPage, totalPages, setCurrentPage }) => {
  return (
    <div>
      <h3>Danh Sách Mục Tiêu</h3>
      <table className="table table-bordered">
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
          {goals.length > 0 ? (
            goals.map((goal) => (
              <tr key={goal.id}>
                <td>{goal.name}</td>
                <td>{categories.find(cat => cat.id === goal.category_id)?.name || 'Không có danh mục'}</td>
                <td>{new Intl.NumberFormat('vi-VN').format(parseFloat(goal.target_amount))}</td>
                <td>
                  {goal.due_date
                    ? new Date(goal.due_date.includes('T') ? goal.due_date.split('T')[0] : goal.due_date).toLocaleDateString('vi-VN')
                    : 'Không có hạn'}
                </td>
                <td>{goal.note || 'Không có ghi chú'}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="text-center">
                Chưa có mục tiêu nào.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {totalPages > 1 && (
        <div className="mt-3 d-flex justify-content-center">
          <nav aria-label="Page navigation">
            <ul className="pagination">
              <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                <button
                  className="page-link"
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                >
                  Trước
                </button>
              </li>
              <li className="page-item disabled">
                <span className="page-link">Trang {currentPage} / {totalPages}</span>
              </li>
              <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                <button
                  className="page-link"
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                >
                  Sau
                </button>
              </li>
            </ul>
          </nav>
        </div>
      )}
    </div>
  );
};

export default GoalList;