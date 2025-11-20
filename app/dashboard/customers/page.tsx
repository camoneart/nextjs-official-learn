"use client";

import { useState } from "react";

const CustomersPage = () => {
  const [state, setState] = useState(false);
  return (
    <div>
      <button onClick={() => setState(!state)}>Click me</button>
    </div>
  );
};

export default CustomersPage;
