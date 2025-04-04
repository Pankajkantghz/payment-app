import { useState } from "react";
import { BottomWarning } from "../components/BottomWarning";
import { Button } from "../components/Button";
import { Heading } from "../components/Heading";
import { InputBox } from "../components/InputBox";
import { SubHeading } from "../components/SubHeading";
import {  useNavigate } from "react-router-dom";
import axios from "axios";

export function Signin() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();
  return (
    <div className="bg-slate-300 h-screen flex justify-center">
      <div className="flex flex-col  justify-center">
        <div className="rounded-lg bg-white w-80 text-center p-2 h-max px-4">
          <Heading label={"Signin"} />
          <SubHeading label={"Enter your credentials to access your account"} />
          
          <InputBox
            label="Email"
            placeholder="your@email.com"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <InputBox
            label="Password"
            placeholder="*********"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <div className="pt-4">
            <Button onClick={async()=>{
                try {
                    if(!username||!password){
                        alert("all field are required")
                        return;
                    }
                    const response = await axios.post(
                        "http://localhost:3000/api/v1/user/signin",
                        {
                          username,
                          password,
                        }
                      );
                      localStorage.setItem("token",response.data.token);
                      navigate("/dashboard")
                } catch (error) {
                    console.error("Signin failed:", error);
                  alert(error.response?.data?.message || "Signin failed");
                }
                

            }} label={"Sign In"} />
          </div>
          <BottomWarning
            label={"Don't have an account?"}
            to={"/"}
            buttonText={"Signup"}
          />
        </div>
      </div>
    </div>
  );
}
