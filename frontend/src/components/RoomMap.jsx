import { useEffect, useState } from "react";

function RoomMap() {
  const [roomData, setRoomData] = useState(null);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [description, setDescription] = useState("");
  const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NCwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzc4NTIyOTg0LCJleHAiOjE3Nzg2MDkzODR9.IQQJ1r8EQBF1HqlN-C54BkH_vSD73s3Ynnfl1o8GHME";
  useEffect(() => {
    fetch("http://localhost:3000/rooms/1/assets")
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        setRoomData(data);
      })
      .catch((err) => console.error(err));
  }, []);

  const submitReport = async () => {
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
              transform: "translate(-50%,50%)",
              width: "20px",
              height: "20px",
              backgroundColor:
                asset.status === "working"
                  ?"green"
                  : asset.status === "pending"
                  ? "orange"
                  : "red",
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