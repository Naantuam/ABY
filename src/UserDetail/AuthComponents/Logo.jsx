import React from "react";
import logo from "../../assets/ABY.png";

export default function Logo() {
  return <>
  <div className="h-30 justify-center flex items-center">
    <img src={logo} alt="Logo" className="w-40" />
    </div>
  </>
}