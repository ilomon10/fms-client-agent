import { Box, render, Text } from "ink";
import React from "react";
import dayjs from "dayjs";
import { TitleText } from "./components/ink-titletext.tsx";
import { TitledBox } from "./components/ink-titlebox.tsx";
import { withFullScreen } from "ink-fullscreen";

const Counter = () => {
  const [counter, setCounter] = React.useState("00:00:00");

  React.useEffect(() => {
    const timer = setInterval(() => {
      setCounter(() => dayjs().format("HH:mm:ss"));
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, []);
  return <Text color="green">{counter}</Text>;
};

export default async function runTui() {
  await withFullScreen(
    <Box>
      <Box></Box>
      <TitledBox borderStyle="single">
        <TitleText>cpu</TitleText>
        <TitleText alignment="center">
          <Counter />
        </TitleText>
        <TitleText alignment="right">- 2000ms +</TitleText>
        <Text>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Molestiae
          sapiente aliquam debitis reprehenderit tempora dolore numquam repellat
          nisi porro officiis voluptatum minima vitae inventore veniam illum
          magni maxime, alias hic!
        </Text>
      </TitledBox>
    </Box>,
    { exitOnCtrlC: true }
  ).start();
}

if (import.meta.main) {
  await runTui();
}
