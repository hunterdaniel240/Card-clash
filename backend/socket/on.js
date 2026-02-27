export function TestOn(socket) {
  socket.on("load-file", (user) => {
    console.log(
      "received socket call, email: " + user.email + " role: " + user.role,
    );
  });
}
