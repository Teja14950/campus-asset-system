import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useRef } from "react";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

function RoomMap({
  roomId = 1,
  role = "reporter",
  highlightedAssetId = null,
}) {
  const [roomData,      setRoomData]      = useState(null);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [description,   setDescription]  = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [assetFilter,   setAssetFilter]  = useState("all");
  const [message,       setMessage]      = useState("");
  const [updating,      setUpdating]     = useState(false);
  const [assetTypes,    setAssetTypes]   = useState(["all"]);
  const token = localStorage.getItem("token");
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetch(`${API_URL}/rooms/${roomId}/assets`)
      .then((res) => res.json())
      .then((data) => setRoomData(data));

    fetch(`${API_URL}/rooms/categories/types`)
      .then((res) => res.json())
      .then((types) => setAssetTypes(["all", ...types]))
      .catch(() => setAssetTypes(["all"]));

    const socket = io(API_URL);

    socket.on("reportUpdated", (updatedReport) => {
      setRoomData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          assets: prev.assets.map((asset) =>
            asset.id === updatedReport.asset_id
              ? { ...asset, status: updatedReport.status }
              : asset
          ),
        };
      });
    });

    return () => socket.disconnect();
  }, [roomId]);

  const filteredAssets = roomData?.assets.filter(
    (asset) => assetFilter === "all" || asset.type === assetFilter
  );

  const submitReport = async () => {
    if (!selectedAsset || !description.trim()) {
      setMessage(
        "Select an asset and describe the issue"
      );
      return;
    }

    try {
      let imageUrl = null;

      if (imageFile) {
        const formData = new FormData();

        formData.append(
          "image",
          imageFile
        );

        const uploadRes = await fetch(
          `${API_URL}/upload`,
          {
            method: "POST",
            body: formData,
          }
        );

        const uploadData =
          await uploadRes.json();

        imageUrl =
          uploadData.imageUrl;
      }

      const res = await fetch(
        `${API_URL}/reports`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            asset_id:
              selectedAsset.id,
            description,
            image_url: imageUrl,
          }),
        }
      );

      if (!res.ok) {
        const err =
          await res.json();

        setMessage(
          err.error ||
            "Failed to submit report"
        );

        return;
      }

      setMessage(
        "Report submitted successfully"
      );

      setDescription("");
      setImageFile(null);
    } catch (err) {
      console.error(err);

      setMessage(
        "Failed to submit report"
      );
    }
  };

  // FIX: Repairer Resolve/Keep Pending buttons had no onClick — they were dead.
  // This calls PUT /reports/:id/status. We use the selectedAsset's id to find
  // the latest open report for it, then update its status.
  const updateAssetStatus = async (status) => {
    if (!selectedAsset) return;
    setUpdating(true);
    setMessage("");
    try {
      // Fetch the latest report for this asset to get the report id
      const reportsRes = await fetch(`${API_URL}/reports`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const allReports = await reportsRes.json();
      const activeReport = allReports.find(
        (r) => r.asset_id === selectedAsset.id && r.status !== "resolved"
      );

      if (!activeReport) {
        setMessage("No active report found for this asset");
        setUpdating(false);
        return;
      }

      const res = await fetch(`${API_URL}/reports/${activeReport.id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) {
        const err = await res.json();
        setMessage(err.error || "Update failed");
        return;
      }

      setMessage(`Marked as "${status}"`);
    } catch {
      setMessage("Something went wrong");
    } finally {
      setUpdating(false);
    }
  };

  if (!roomData) return <p>Loading room...</p>;

  return (
    <div>
      <h2>{roomData.room.name}</h2>

      {/* FIX: Filter options derived from actual asset types in this room */}
      <select
        value={assetFilter}
        onChange={(e) => setAssetFilter(e.target.value)}
        style={{ marginBottom: "15px", padding: "8px" }}
      >
        {assetTypes.map((type) => (
          <option key={type} value={type}>
            {type === "all" ? "All Assets" : type.charAt(0).toUpperCase() + type.slice(1) + "s"}
          </option>
        ))}
      </select>

      {/* Room map canvas */}
      <div style={{
        position: "relative",
        width: "900px",
        height: "550px",
        border: "2px solid black",
      }}>
        <img
          src={roomData.room.image_url}
          alt="room layout"
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />

        {filteredAssets.map((asset) => (
          <div
            key={asset.id}
            title={`${asset.name} — ${asset.status}`}
            onClick={() => { setSelectedAsset(asset); setMessage(""); }}
            style={{
              position: "absolute",
              // FIX: Explicit "px" suffix; React does convert numbers to px
              // in inline styles but being explicit avoids confusion
              left: `${asset.x_position}px`,
              top:  `${asset.y_position}px`,
              transform: "translate(-50%, -50%)",
              width: "18px",
              height: "18px",
              borderRadius: "50%",
              cursor: "pointer",
              border: asset.id === selectedAsset?.id
                ? "3px solid #333"
                : "2px solid white",
              backgroundColor:
                asset.id === highlightedAssetId ? "blue"
                : asset.status === "working"     ? "green"
                : asset.status === "assigned"    ? "orange"
                : "red",
            }}
          />
        ))}
      </div>

      {/* Asset detail panel */}
      {selectedAsset && (
        <div style={{
          marginTop: "20px", background: "white", padding: "20px",
          borderRadius: "10px", boxShadow: "0 0 10px rgba(0,0,0,0.1)",
          maxWidth: "500px",
        }}>
          <h3>{selectedAsset.name}</h3>
          <p>Type: {selectedAsset.type}</p>
          <p>Status: {selectedAsset.status}</p>

          {role === "reporter" && (
            <>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the issue..."
                style={{ width: "100%", padding: "10px", marginTop: "10px", height: "80px" }}
              />
              <div style={{ marginTop: "10px" }}>
                <input
                  ref ={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setImageFile(e.target.files[0])
                  }
                />
                {imageFile && (
                  <button
                    type="button"
                    onClick={() => {
                      setImageFile(null);

                      if (fileInputRef.current) {
                        fileInputRef.current.value = "";
                      }
                    }}
                    style={{
                      marginTop: "10px",
                      padding: "6px 12px",
                      cursor: "pointer",
                    }}
                  >
                    Remove Image
                  </button>
                )}
              </div>
              <button
                onClick={submitReport}
                style={{ marginTop: "10px", padding: "10px 20px", cursor: "pointer" }}
              >
                Submit Report
              </button>
            </>
          )}

          {/* FIX: Repairer buttons now call updateAssetStatus() */}
          {role === "repairer" && (
            <div style={{ display: "flex", gap: "10px", marginTop: "15px" }}>
              <button
                onClick={() => updateAssetStatus("resolved")}
                disabled={updating}
                style={{
                  padding: "10px 20px", cursor: "pointer",
                  background: "#28a745", color: "white", border: "none", borderRadius: "6px",
                }}
              >
                {updating ? "Updating..." : "Resolve"}
              </button>
              <button
                onClick={() => updateAssetStatus("pending")}
                disabled={updating}
                style={{
                  padding: "10px 20px", cursor: "pointer",
                  background: "#ffc107", color: "#333", border: "none", borderRadius: "6px",
                }}
              >
                Keep Pending
              </button>
            </div>
          )}

          {message && <p style={{ marginTop: "10px", color: "#555" }}>{message}</p>}
        </div>
      )}
    </div>
  );
}

export default RoomMap;