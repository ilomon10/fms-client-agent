import React, { useEffect, useRef, useState } from "react";
import { Box, Text, TextProps, measureElement } from "ink";

type TitleAlignment = "left" | "center" | "right";

export type TitleTextProps = TextProps & {
  alignment?: TitleAlignment;
};

export const TitleText: React.FC<TitleTextProps> = ({
  alignment = "left",
  children,
  ...rest
}) => {
  const ref = useRef<any>(null);
  const [parentWidth, setParentWidth] = useState(0);

  useEffect(() => {
    if (ref.current) {
      const { width } = measureElement(ref.current);
      setParentWidth(width);
    }
  }, []);

  const textContent = String(children ?? "");
  const textLength = textContent.length;

  let marginLeft = 0;
  if (parentWidth > 0) {
    switch (alignment) {
      case "center":
        marginLeft = Math.max(0, Math.floor((parentWidth - textLength) / 2));
        break;
      case "right":
        marginLeft = Math.max(0, parentWidth - textLength - 2);
        break;
      case "left":
      default:
        marginLeft = 0;
    }
  }

  return (
    <Box ref={ref} marginTop={-1} marginLeft={marginLeft}>
      <Text {...rest}>┐</Text>
      {typeof children === "string" ? <Text>{children}</Text> : children}
      <Text>┌</Text>
    </Box>
  );
};

TitleText.displayName = "TitleText";
