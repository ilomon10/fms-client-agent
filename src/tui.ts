import { crayon } from "https://deno.land/x/crayon@3.3.3/mod.ts";
import {
  Canvas,
  handleInput,
  handleMouseControls,
  handleKeyboardControls,
  Tui,
  GridLayout,
  HorizontalLayout,
  View,
  VerticalLayout,
} from "https://deno.land/x/tui@2.1.11/mod.ts";
import {
  Box,
  Button,
  Frame,
} from "https://deno.land/x/tui@2.1.11/src/components/mod.ts";

const tui = new Tui({
  style: crayon.bgBlue, // Make background black
  refreshRate: 1000 / 60, // Run in 60FPS
});

const panel = new HorizontalLayout({
  pattern: ["A", "B", "C"],
  gapX: 1,
  gapY: 1,
  rectangle: tui.rectangle,
});

const view = new View({
  rectangle: panel.element("B").value,
  maxOffset: {
    columns: 0,
    rows: 20,
  },
});

const _viewBackground = new Box({
  parent: tui,
  rectangle: view.rectangle,
  theme: {
    base: crayon.bgWhite,
  },
  zIndex: 1,
});

const _viewFrame = new Frame({
  parent: tui,
  theme: {
    base: crayon.bgBlue,
  },
  charMap: "rounded",
  rectangle: view.rectangle,
  zIndex: 0,
});

const menu_list = [
  {
    id: "A",
    label: "Server",
  },
  {
    id: "B",
    label: "Tesing",
  },
  {
    id: "C",
    label: "Lagi Setting",
  },
  {
    id: "D",
    label: "About",
  },
];

// for (const menu_item of menu_list) {
//   const;
// }

export default function runTui() {
  handleInput(tui);
  handleMouseControls(tui);
  handleKeyboardControls(tui);

  tui.dispatch(); // Close Tui on CTRL+C
  tui.run();
}

if (import.meta.main) {
  runTui();
}
