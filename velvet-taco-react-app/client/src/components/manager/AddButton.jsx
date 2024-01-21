import React, { Fragment, useContext, useEffect, useState } from "react";
import Select from "react-select";
import { ManagerContext } from "../../context/ManagerContext";

const AddButton = () => {
  const { currentPressed, requestRefresh, setRequestRefresh } =
    useContext(ManagerContext);

  const [selectedOptions, setSelectedOptions] = useState([]);
  const [options, setOptions] = useState([]);
  /* for selecting ingredients when adding to menu table */
  useEffect(() => {
    const fetchIngredientOptions = async () => {
      try {
        const response = await fetch(
          process.env.REACT_APP_SERVER_URL +
            `api/manager/tables/?table=inventory`
        );
        if (!response.ok) {
          throw new Error(`Request failed with status: ${response.status}`);
        }
        const ingredients = await response.json();
        setOptions(
          ingredients.data.data.map((item) => ({
            value: item.ingredient,
            label: item.ingredient,
          }))
        );
        // console.log(_options.data.data);
        // setOptions(_options);
        // setRequestRefresh(!requestRefresh); // to trigger a refresh
        // setFormData(initialState);
        // window.alert("Successfully added new entry.");
      } catch (err) {
        console.error(err.message);
      }
    };
    if (currentPressed === "menu") {
      fetchIngredientOptions();
    }
  }, [currentPressed]);

  const handleIngredientChange = (selectedValues) => {
    setSelectedOptions(selectedValues);
    console.log(selectedValues);
    if (selectedValues.length > 0) {
      formData.ingredients = [
        ...formData.ingredients,
        selectedValues[selectedValues.length - 1].value,
      ];
    }
  };

  const initialState = {
    // date: "",
    // time: "",
    // cashier: "",
    // total: "",
    ingredient: "",
    quantity: "",
    restock_quantity: "",
    min_quantity: "",
    menu_name: "",
    calories: "",
    price: "",
    type: "",
    ingredients: [],
    username: "",
    password: "",
    email: "",
    user_type: "",
    name: "",
    // employee_name: "",
    // role: "",
    // pay: "",
    // schedule: "",
  };

  const [formData, setFormData] = useState(initialState);

  const handleSubmit = async (e) => {
    e.preventDefault();
    let body = {};
    let values = [];

    if (currentPressed === "inventory") {
      values = inventory_values;
    } else if (currentPressed === "menu") {
      values = menu_values;
    }

    values.forEach((value) => {
      body[value.db_key] = formData[value.state];
    });

    console.log(body);

    try {
      const response = await fetch(
        process.env.REACT_APP_SERVER_URL +
          `api/manager/tables/${currentPressed}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        }
      );
      if (!response.ok) {
        throw new Error(`Request failed with status: ${response.status}`);
      }

      setRequestRefresh(!requestRefresh); // to trigger a refresh
      setFormData(initialState);
      setSelectedOptions([]);
      // window.alert("Successfully added new entry.");
    } catch (err) {
      console.error(err.message);
    }
  };

  const handleChange = (key, value) => {
    setFormData((prevData) => ({ ...prevData, [key]: value }));
  };

  const generateInputs = (inputValues) => {
    return (
      <Fragment>
        {inputValues.map((row) =>
          row.db_key !== "ingredients" ? (
            <td key={row.db_key}>
              <input
                type="text"
                className="form-control"
                placeholder={row.placeholder}
                value={formData[row.state]}
                onChange={(e) => handleChange(row.state, e.target.value)}
              />
            </td>
          ) : (
            <td key={row.db_key}>
              <Select
                isMulti
                options={options}
                value={selectedOptions}
                onChange={handleIngredientChange}
                placeholder="Ingredients"
                styles={{
                  option: (provided, state) => ({
                    ...provided,
                    color: state.isSelected ? "white" : "#333",
                  }),
                  multiValueRemove: (provided) => ({
                    ...provided,
                    color: "#333",
                  }),
                }}
              />
            </td>
          )
        )}
        <td>
          <button className="btn btn-success" onClick={(e) => handleSubmit(e)}>
            Add
          </button>
        </td>
      </Fragment>
    );
  };

  // const orders_values = [
  //   { db_key: "date", state: "date", placeholder: "Date" },
  //   { db_key: "time", state: "time", placeholder: "Time" },
  //   { db_key: "cashier", state: "cashier", placeholder: "Cashier" },
  //   { db_key: "total", state: "total", placeholder: "Total" },
  // ];

  const inventory_values = [
    { db_key: "ingredient", state: "ingredient", placeholder: "Ingredient" },
    { db_key: "quantity", state: "quantity", placeholder: "Quantity" },
    {
      db_key: "restock_quantity",
      state: "restock_quantity",
      placeholder: "Reorder Quantity",
    },
    {
      db_key: "min_quantity",
      state: "min_quantity",
      placeholder: "Minimum Quantity",
    },
  ];

  const menu_values = [
    { db_key: "item_name", state: "menu_name", placeholder: "Name" },
    { db_key: "calories", state: "calories", placeholder: "Calories" },
    { db_key: "price", state: "price", placeholder: "Price ($)" },
    { db_key: "foodtype", state: "type", placeholder: "Type" },
    { db_key: "ingredients", state: "ingredients", placeholder: "Ingredients" },
  ];

  const users_values = [
    { db_key: "username", state: "username", placeholder: "Username" },
    { db_key: "password", state: "password", placeholder: "Password" },
    {
      db_key: "email",
      state: "email",
      placeholder: "Email",
    },
    {
      db_key: "user_type",
      state: "user_type",
      placeholder: "Role",
    },
    { db_key: "name", state: "name", placeholder: "Owner" },
  ];

  // const employee_values = [
  //   { db_key: "name", state: "employee_name", placeholder: "Name" },
  //   { db_key: "role", state: "role", placeholder: "Role" },
  //   { db_key: "pay", state: "pay", placeholder: "Pay ($/hr)" },
  //   { db_key: "schedule", state: "schedule", placeholder: "Schedule" },
  // ];

  useEffect(() => {
    setFormData(initialState);
    setSelectedOptions([]);
  }, [currentPressed]);

  return (
    <tr className="active">
      {currentPressed === "inventory" && generateInputs(inventory_values)}
      {currentPressed === "menu" && generateInputs(menu_values)}
      {currentPressed === "users" && generateInputs(users_values)}
    </tr>
  );
};

export default AddButton;
