import React from "react";
import { Box, BoxProps } from "ink";
import { TitleText } from "./ink-titletext.tsx"; // Adjust the path as needed

type TitledBoxProps = React.PropsWithChildren<BoxProps>;

export const TitledBox: React.FC<TitledBoxProps> = ({
  borderStyle,
  borderColor,
  width,
  children,
  ...rest
}) => {
  const childrenArray = React.Children.toArray(children);

  const titleElements: React.ReactElement[] = [];
  const contentElements: React.ReactNode[] = [];

  let collectingTitles = true;

  for (const child of childrenArray) {
    if (
      collectingTitles &&
      React.isValidElement(child) &&
      child.type === TitleText
    ) {
      titleElements.push(child);
    } else {
      collectingTitles = false;
      contentElements.push(child);
    }
  }

  return (
    <Box
      flexDirection="column"
      borderStyle={borderStyle}
      borderColor={borderColor}
      width={width}
    >
      {titleElements}
      <Box {...rest}>{contentElements}</Box>
    </Box>
  );
};
