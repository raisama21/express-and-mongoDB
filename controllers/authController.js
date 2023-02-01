const userDB = {
  users: require("../model/users.json"),
  setUsers: function (data) {
    this.users = data;
  },
};
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const fsPromises = require("fs").promises;
const path = require("path");

const handleLogin = async (req, res) => {
  const { user, password } = req.body;

  if (!user || !password) {
    return res
      .status(400)
      .json({ message: "username and password are required" });
  }

  const foundUser = userDB.users.find((person) => person.username === user);
  if (!foundUser) {
    return res.status(401).json({ message: "user not found" });
  }

  /* 
    Evaluate password 
  */
  const match = await bcrypt.compare(password, foundUser.password);
  if (match) {
    /*
      Create jsonwebtoken (jwt)
    */
    const acessToken = jwt.sign(
      { username: foundUser.username },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "60s" }
    );
    const refreshToken = jwt.sign(
      { username: foundUser.username },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "2d" }
    );

    /*
       Saving refresh token with current user in DabaBase (DB) 
    */
    const otherUser = userDB.users.filter(
      (person) => person.username !== foundUser.username
    );

    const currentUser = { ...foundUser, refreshToken };
    userDB.setUsers([...otherUser, currentUser]);

    await fsPromises.writeFile(
      path.join(__dirname, "..", "model", "users.json"),
      JSON.stringify(userDB.users)
    );

    res.cookie("jwt", refreshToken, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.json({ acessToken });
  } else {
    res.status(401).json({ message: "unauthorized user" });
  }
};

module.exports = { handleLogin };
