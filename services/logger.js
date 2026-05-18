const axios = require("axios");
require("dotenv").config();
const serverUrl = process.env.LOG_SERVER_URL;
const authToken = process.env.AUTH_TOKEN;

function conversion(value){
    return typeof value === "string" ? value.trim().toLowerCase(): "";
}
async function Log(stack,level,packageName,message){
    
    const body = {
    stack: conversion(stack),
    level: conversion(level),
    package: conversion(packageName),
    message: String(message).trim(),
  };

    try {
         await axios.post(serverUrl, body, {
      timeout: 2000,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
    });
    return true;
      } catch (err) {
    console.error("Log request failed:", err.message);

    if (err.response) {
      console.error("Status:", err.response.status);
      console.error("Response body:", err.response.data);
    }

    return false;
  }

}
module.exports ={ Log };