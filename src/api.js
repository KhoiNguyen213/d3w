/* src/api.js */
/**
 * Sends updated room data to the backend.
 * The backend only provides a POST /api/rooms endpoint that upserts a single room.
 * This helper iterates over the provided array of rooms and POSTs each one.
 * It returns a Promise that resolves when all requests complete.
 */
export async function updateRoomsInAPI(rooms) {
  if (!Array.isArray(rooms)) {
    console.error('updateRoomsInAPI expects an array of rooms');
    return;
  }
  const promises = rooms.map((room) => {
    return fetch(`${process.env.VITE_API_URL || "http://localhost:5000"}/api/rooms`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(room),
    })
      .then((res) => {
        if (!res.ok) {
          return res.text().then((txt) => {
            throw new Error(`Failed to update room ${room.id}: ${res.status} ${txt}`);
          });
        }
        return res.json();
      })
      .catch((err) => {
        console.error(err);
      });
  });
  await Promise.all(promises);
}
