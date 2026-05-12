import { useEffect, useState } from "react";
import {io} from "socket.io-client";
function RoomMap() {
  const [roomData, setRoomData] = useState(null);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [description, setDescription] = useState("");
  const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NCwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzc4NTIyOTg0LCJleHAiOjE3Nzg2MDkzODR9.IQQJ1r8EQBF1HqlN-C54BkH_vSD73s3Ynnfl1o8GHME";
  useEffect(() => {
    // Fetch initial room data
    fetch("http://localhost:3000/rooms/1/assets")
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        setRoomData(data);
      })
      .catch((err) => console.error(err));
    const socket = io("http://localhost:3000");
    socket.on("reportUpdated", (updatedReport) => {
      console.log("Realtime update received:", updatedReport);
      setRoomData((prevData) => {
        if (!prevData) return prevData;
        const updatedAssets = prevData.assets.map((asset) => {
          if (asset.id === updatedReport.asset_id) {
            return {
              ...asset,
              status: updatedReport.status,
            };
          }
          return asset;
        });
        return {
          ...prevData,
          assets: updatedAssets,
        };
      });
      alert(
        `Asset ${updatedReport.asset_id} updated to ${updatedReport.status}`
      );
    });
    return () => {
      socket.disconnect();
    };
  }, []);

  const submitReport = async () => {
    if (!selectedAsset) {
      alert("Please select an asset on the map");
      return;
    }
    if(!description.trim()){
      alert("Please describe the issue");
      return;
    }
    try {
      const response = await fetch("http://localhost:3000/reports", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          asset_id: selectedAsset.id,
          description,
        }),
      });
      const data = await response.json();
      console.log(data);
      if(!response.ok){
        alert(data.error || "Failed to submit report");
        return;
      }
      alert("Report submitted successfully!");
      setDescription("");
      setSelectedAsset(null);
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    }
  };
    if (!roomData) {
    return <p>Loading room...</p>;
  }
  const getStatusColor = (status) => {
  switch (status) {
    case "pending":
      return "red";

    case "assigned":
      return "orange";

    case "resolved":
    case "working":
    default:
      return "green";
  }
};
  return (
    <div>
      <h2>{roomData.room.name}</h2>

      <div
        style={{
          position: "relative",
          width: "800px",
          height: "500px",
          border: "2px solid black",
        }}
      >
        <img
          src={roomData.room.image_url}
          alt="Room"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />

        {roomData.assets.map((asset) => (
          <div
            key={asset.id}
            title={asset.name}
            style={{
              position: "absolute",
              left: asset.x_position,
              top: asset.y_position,
              transform: "translate(-50%,-50%)",
              width: "20px",
              height: "20px",
              backgroundColor: getStatusColor(asset.status),
              borderRadius: "50%",
              cursor: "pointer",
              border: "2px solid white",
            }}
            onClick={() => setSelectedAsset(asset)}
          />
        ))}
      </div>
      {selectedAsset && (
          <div
            style={{
              marginTop: "20px",
              padding: "10px",
              border: "1px solid gray",
              width: "400px",
            }}
          >
            <h3>{selectedAsset.name}</h3>
            <p>Type: {selectedAsset.type}</p>
            <p>Status: {selectedAsset.status}</p>
            <textarea
              placeholder="Describe issue..."
              rows="4"
              cols="40"
              value={description}
              onChange={(e)=> setDescription(e.target.value)}
            />
            <br/>
            <button onClick={submitReport}>Submit Report</button>
          </div>
        )}
    </div>
  );
}

export default RoomMap;