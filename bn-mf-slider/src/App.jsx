import React from "react";
import ReactDOM from "react-dom";

import Slider from "./slider";

const App = () => (
  <ChakraProvider>
    <Heading>BN MF Slider</Heading>
    <Slider />
  </ChakraProvider>
);

ReactDOM.render(<App />, document.getElementById("app"));
