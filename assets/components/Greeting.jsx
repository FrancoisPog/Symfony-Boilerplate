import { useState } from "preact/hooks";

export const Greeting = ({ name }) => {
  const [time, setTime] = useState(Date.now());

  const onClick = () => {
    setTime(Date.now());
  };

  return (
    <p onClick={onClick}>
      Hello {name} ! This message come from a <code>JSX</code> component at{" "}
      {time} ! :)
    </p>
  );
};
