'use client';

import { createTheme } from "@mui/material/styles";
import { Outfit } from "next/font/google";


const fontSans = Outfit({
  subsets: ["latin"],
  variable: "--font-sans",
});

const theme = createTheme({
  typography: {
    fontFamily: fontSans.style.fontFamily,
  },
  components: {
    MuiButton: {
      defaultProps: {
        disableRipple: true,
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
  },
});

export default theme;