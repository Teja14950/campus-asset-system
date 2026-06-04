import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

// This page is the QR code landing target: /room/:id
// When a user scans the QR code posted in a physical room, they land here.
// If logged in → go straight to dashboard with that room pre-selected.
// If not logged in → go to login, then return here after auth.
function RoomQR() {
  const { id }   = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    // Store the intended room so Dashboard can read it after login
    sessionStorage.setItem("qr_room_id", id);

    if (token) {
      navigate(`/dashboard?room=${id}`, { replace: true });
    } else {
      navigate(`/login?redirect=/room/${id}`, { replace: true });
    }
  }, [id, navigate]);

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center",
      justifyContent: "center", background: "#f5f5f5" }}>
      <p style={{ color: "#888" }}>Loading room...</p>
    </div>
  );
}

export default RoomQR;