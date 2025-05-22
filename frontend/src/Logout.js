import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Logout = () => {
  const navigate = useNavigate();
  const hasLoggedOut = useRef(false);
  const errorRef = useRef(null);

  useEffect(() => {
    const performLogout = async () => {
      if (hasLoggedOut.current) {
        return;
      }

      hasLoggedOut.current = true;

      try {
        const token = localStorage.getItem("token");
        if (!token) {
          errorRef.current = "Vui lòng đăng nhập lại.";
          setTimeout(() => {
            navigate("/");
          }, 2000);
          return;
        }

        await axios.get("http://127.0.0.1:8000/sanctum/csrf-cookie", {
          withCredentials: true,
        });

        await axios.post(
          "http://127.0.0.1:8000/api/logout",
          {},
          {
            withCredentials: true,
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        console.log("Logout.js: Đăng xuất thành công");
        localStorage.removeItem("token");
        navigate("/");
      } catch (error) {
        const errorMessage = error.response
          ? `Lỗi ${error.response.status}: ${error.response.data.message || error.response.statusText}`
          : `Lỗi kết nối: ${error.message}`;
        errorRef.current = errorMessage;
        localStorage.removeItem("token");
        setTimeout(() => {
          navigate("/");
        }, 2000);
      }
    };

    performLogout();
  }, [navigate]);

  return errorRef.current ? (
    <div className="alert alert-danger">{errorRef.current}</div>
  ) : null;
};

export default Logout;