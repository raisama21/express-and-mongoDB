const User = require("../model/User");
const bcrypt = require("bcrypt");

const handleNewUser = async (req, res) => {
  const { user, password } = req.body;

  if (!user || !password) {
    return res
      .status(400)
      .json({ message: "username and password are required" });
  }

  try {
    /* 
      check for duplicate username in databse (db)
    */
    const duplicate = await User.findOne({ username: user }).exec();
    if (duplicate) {
      return res.sendStatus(409);
    }

    /*
      encrypt the password
    */
    const hashedPassword = await bcrypt.hash(password, 10);

    /*
      Create and store the new user in database
    */
    const result = await User.create({
      username: user,
      password: hashedPassword,
    });
    console.log(result);

    res.status(201).json({ sucess: `New user ${user} created!` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { handleNewUser };
