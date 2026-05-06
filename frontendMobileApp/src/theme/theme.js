export const COLORS = {
  navy: "#021024",
  navy2: "#052859",
  blue: "#5483B3",
  blueSoft: "#7DA0CA",
  sky: "#C1EBFF",
  white: "#FFFFFF",
  text: "#021024",
  muted: "rgba(2, 16, 36, 0.65)",
  border: "rgba(2, 16, 36, 0.10)",
  error: "#D32F2F",
  grey: "grey",
  card: "#F5F8FF",
  success: "#10B981",
  authPrimary: "#2b8cee",
  authBg: "#f8fcff",
  authTextMain: "#021024",
  authTextMuted: "#5483b3",
  authInputBg: "#f1f5f9",
  authInputBorder: "#e2e8f0",
};

export const RADIUS = {
  card: 24,
  input: 12,
  button: 12,
};

export const SPACING = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 28,
  xxl: 40,
};

export const TYPO = {
  h1: { fontSize: 28, fontFamily: "PlusJakartaSans_800ExtraBold", color: COLORS.text },
  h2: { fontSize: 22, fontFamily: "PlusJakartaSans_800ExtraBold", color: COLORS.text },
  body: {
    fontSize: 14,
    fontFamily: "PlusJakartaSans_500Medium",
    color: COLORS.muted,
    lineHeight: 20,
  },
  label: { fontSize: 12, fontFamily: "PlusJakartaSans_700Bold", color: COLORS.text },
  link: { fontSize: 12, fontFamily: "PlusJakartaSans_700Bold", color: COLORS.authPrimary },
  button: { fontSize: 16, fontFamily: "PlusJakartaSans_700Bold", color: COLORS.white },
};
