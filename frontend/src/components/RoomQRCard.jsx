import { useEffect, useRef } from "react";

// Generates a QR code for a room's deep-link URL using the qrcode library.
// Install: npm install qrcode
// Usage: <RoomQRCard room={roomObject} baseUrl="http://localhost:5173" />

function RoomQRCard({ room, baseUrl }) {
  const canvasRef = useRef(null);
  const url = `${baseUrl}/room/${room.id}`;

  useEffect(() => {
    if (!canvasRef.current) return;

    // Dynamically import qrcode so it doesn't block the rest of the app
    import("qrcode").then((QRCode) => {
      QRCode.toCanvas(canvasRef.current, url, {
        width: 180,
        margin: 2,
        color: { dark: "#1a1a2e", light: "#ffffff" },
      });
    });
  }, [url]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `qr-${room.name.replace(/\s+/g, "-").toLowerCase()}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  const handlePrint = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL("image/png");
    const win = window.open("", "_blank");
    win.document.write(`
      <html>
        <head><title>QR Code — ${room.name}</title></head>
        <body style="display:flex;flex-direction:column;align-items:center;
          justify-content:center;min-height:100vh;font-family:system-ui;gap:16px">
          <img src="${dataUrl}" style="width:240px;height:240px" />
          <h2 style="margin:0;font-size:20px">${room.name}</h2>
          <p style="margin:0;color:#888;font-size:14px">
            ${room.building}${room.block ? ` · Block ${room.block}` : ""} · Floor ${room.floor}
          </p>
          <p style="margin:0;color:#aaa;font-size:12px">Scan to report an issue</p>
          <script>window.onload=()=>window.print()</script>
        </body>
      </html>
    `);
    win.document.close();
  };

  return (
    <div style={{ background: "white", borderRadius: "10px", padding: "20px",
      boxShadow: "0 1px 4px rgba(0,0,0,0.08)", display: "flex",
      flexDirection: "column", alignItems: "center", gap: "12px", width: "220px" }}>

      <canvas ref={canvasRef} style={{ borderRadius: "6px" }} />

      <div style={{ textAlign: "center" }}>
        <div style={{ fontWeight: "600", fontSize: "14px" }}>{room.name}</div>
        <div style={{ fontSize: "12px", color: "#888", marginTop: "2px" }}>
          {room.building}{room.block ? ` · Block ${room.block}` : ""} · Floor {room.floor}
        </div>
        <div style={{ fontSize: "11px", color: "#bbb", marginTop: "4px",
          wordBreak: "break-all", fontFamily: "monospace" }}>
          {url}
        </div>
      </div>

      <div style={{ display: "flex", gap: "8px" }}>
        <button onClick={handleDownload}
          style={{ padding: "6px 14px", borderRadius: "6px", cursor: "pointer",
            border: "1px solid #ddd", background: "white", fontSize: "12px" }}>
          Download
        </button>
        <button onClick={handlePrint}
          style={{ padding: "6px 14px", borderRadius: "6px", cursor: "pointer",
            border: "none", background: "#1a1a2e", color: "white", fontSize: "12px" }}>
          Print
        </button>
      </div>
    </div>
  );
}

export default RoomQRCard;