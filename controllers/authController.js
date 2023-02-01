const User = require("../model/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const handleLogin = async (req, res) => {
  const { user, password } = req.body;

  if (!user || !password) {
    return res
      .status(400)
      .json({ message: "username and password are required" });
  }

  const foundUser = await User.findOne({ username: user }).exec();
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
      { expiresIn: "15m" }
    );
    const refreshToken = jwt.sign(
      { username: foundUser.username },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "2d" }
    );

    /*
       Saving refresh token with current user in DabaBase (DB) 
    */
    foundUser.refreshToken = refreshToken;
    const result = await foundUser.save();
    console.log(result);

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
