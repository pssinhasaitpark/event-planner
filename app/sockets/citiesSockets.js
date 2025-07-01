// app/sockets/citiesSocket.js
import cities from 'indian-cities';

export default function handleCitySocket(io) {
  io.on('connection', (socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);

    // 🔍 Handle city search
    socket.on('searchCities', (query) => {
      if (!query || typeof query !== 'string') {
        return socket.emit('citiesList', []);
      }

      const search = query.toLowerCase();

      const filtered = cities.filter(city =>
        city.city.toLowerCase().includes(search) ||
        city.state.toLowerCase().includes(search)
      );

      socket.emit('citiesList', filtered);
    });

    socket.on('disconnect', () => {
      console.log(`❌ Client disconnected: ${socket.id}`);
    });
  });
}
