// Boxful Design System - Color Palette
export const colors = {
  // White
  white: '#fff',

  // Blue palette
  blue: {
    900: '#050817',
    dark: '#16163d',
    500: '#2e49ce',
  },

  // Gray palette
  gray: {
    500: '#4e4c4c',
    300: '#b8b7b7',
    100: '#ededed',
  },
};

// Ant Design theme configuration
export const theme = {
  token: {
    colorPrimary: colors.blue[500],
    colorText: colors.gray[500],
    colorTextSecondary: colors.gray[300],
    colorBgContainer: colors.white,
    colorBorder: colors.gray[100],
    borderRadius: 8,
    fontFamily: '"Mona Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  },
  components: {
    Button: {
      colorPrimary: colors.blue[500],
      borderRadius: 8,
      controlHeight: 48,
    },
    Input: {
      controlHeight: 48,
      borderRadius: 8,
    },
    Select: {
      controlHeight: 48,
      borderRadius: 8,
    },
    DatePicker: {
      controlHeight: 48,
      borderRadius: 8,
    },
  },
};
