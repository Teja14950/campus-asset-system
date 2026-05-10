import { useEffect, useState } from "react";

function RoomMap() {
  const [roomData, setRoomData] = useState(null);

  useEffect(() => {
    fetch("http://localhost:3000/rooms/1/assets")
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        setRoomData(data);
      })
      .catch((err) => console.error(err));
  }, []);

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
              width: "20px",
              height: "20px",
              backgroundColor: "red",
              borderRadius: "50%",
              cursor: "pointer",
            }}
          />
        ))}
      </div>
    </div>
  );
}

export default RoomMap;