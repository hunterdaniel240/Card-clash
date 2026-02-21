const User = require("./models/User");

(async () => {
  const mockUser = {
    name: "test",
    email: "test@test.com",
    password_hash: "pass",
    role: "teacher"
  };

  const created = await User.createUser(mockUser);
  console.log("CREATED USER:", created);

  const found = await User.findUserByEmail(mockUser.email);
  console.log("FOUND USER:", found);
})();