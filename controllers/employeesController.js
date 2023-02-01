const data = {
  employees: require("../model/employees.json"),
  setEmployees: function (data) {
    this.employees = data;
  },
};

const getAllEmployees = (req, res) => {
  res.json(data.employees);
};

const createNewEmployees = (req, res) => {
  const newEmployee = {
    id: data.employees.length + 1,
    firstname: req.body.firstname,
    lastname: req.body.lastname,
  };

  if (!newEmployee.firstname && !newEmployee.lastname) {
    return res
      .status(400)
      .json({ message: "firstname and lastname are required" });
  }

  data.setEmployees([...data.employees, newEmployee]);
  res.status(201).json(data.employees);
};

const updateEmployee = (req, res) => {
  const employee = data.employees.find((emp) => emp.id === req.body.id);

  if (!employee) {
    res
      .status(400)
      .json({ message: `Employee ID ${req.body.id} is not found` });
  }

  if (req.body.firstname) employee.firstname = req.body.firstname;
  if (req.body.lastname) employee.lastname = req.body.lastname;

  const filteredArray = data.employees.filter((emp) => emp.id !== req.body.id);
  const unsortedArray = [...filteredArray, employee];
  data.setEmployees(
    unsortedArray.sort((a, b) => (a.id > b.id ? 1 : a.id < b.id ? -1 : 0))
  );
  res.json(data.employees);
};

const deletEmployee = (req, res) => {
  const employee = data.employees.find((emp) => emp.id === req.body.id);

  if (!employee) {
    res
      .status(400)
      .json({ message: `Employee ID ${req.body.id} is not found` });
  }

  const filteredArray = data.employees.filter((emp) => emp.id !== req.body.id);
  data.setEmployees([...filteredArray]);
  res.json(data.employees);
};

const getEmployee = (req, res) => {
  const employee = data.employees.find(
    (emp) => emp.id === parseInt(req.params.id)
  );

  if (!employee) {
    res
      .status(400)
      .json({ message: `Employee ID ${req.body.id} is not found` });
  }

  res.json(employee);
};

module.exports = {
  getAllEmployees,
  createNewEmployees,
  updateEmployee,
  deletEmployee,
  getEmployee,
};
