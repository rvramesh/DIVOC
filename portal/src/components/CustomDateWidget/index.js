import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import date from "../../assets/img/date.png";
import "./index.css";


export const CustomDateWidget = (props) => {
  const [startDate, setStartDate] = useState(new Date(props.value || null));

  const updateValue = (newValue) => {
    setStartDate(newValue);
    props.onChange(newValue)
};

  const CustomInput = ({ value, onClick }) => (
    <div className="date-picker-container d-flex justify-content-between">
        <label className="date-picker-label p-2 mr-auto" onClick={onClick}>
        {value}
        </label>
        <img className="p-2" src={date} onClick={onClick} />
    </div>
  );
  return (
    <div className="date-picker">
    <DatePicker
            selected={startDate} 
            onChange={updateValue} 
            dateFormat="dd-MM-yyyy"
            id="date-picker"
            customInput={<CustomInput />}
        />
    </div>
  );
};


