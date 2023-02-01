const User = require("../model/User");

const handleLogout = async (req, res) => {
  /* 
    ##Note for front-end
    on client, also delete the acessToken 
  */

  const cookies = req.cookies;
  if (!cookies?.jwt) return res.sendStatus(204);
  const refreshToken = cookies.jwt;

  /* 
    check for refresh token in the db 
  */
  const foundUser = await User.findOne({ refreshToken }).exec();
  if (!foundUser) {
    res.clearCookie("jwt", { httpOnly: true });
    return res.sendStatus(204);
  }

  /* 
    Delete refreshToken in db 
  */
  foundUser.refreshToken = "";
  const result = await foundUser.save();
  console.log(result);

  res.clearCookie("jwt", { httpOnly: true });
  res.sendStatus(204);
};

module.exports = { handleLogout };
