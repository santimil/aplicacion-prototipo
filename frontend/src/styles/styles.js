// src/styles/styles.js

export const colors = {
  background: "#111",
  backgroundLight: "#161616",
  border: "#2A2A2A",
  text: "#E8E0D0",
  textMuted: "#888",
  primary: "#FFB74D",
  danger: "#FF9090",
  dangerBg: "#2A1111"
};

export const overlay = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.9)",
  zIndex: 200,
  display: "flex",
  alignItems: "flex-end",
  justifyContent: "center"
};

export const modal = {
  width: "100%",
  height: "95dvh",
  background: colors.background,
  borderTop: `1px solid ${colors.border}`,
  borderRadius: "16px 16px 0 0",
  padding: 16,
  overflowY: "auto",
  boxSizing: "border-box"
};

export const sectionTitleStyle = {
  color: "#FFB74D",
  fontSize: 13,
  fontWeight: "bold",
  marginBottom: 10,
  letterSpacing: 1
};

export const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "12px 14px",
  marginBottom: 12,
  background: "#1A1A1A",
  border: `1px solid ${colors.border}`,
  borderRadius: 10,
  color: colors.text,
  outline: "none",
  fontSize: 14
};

export const labelStyle = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  marginBottom: 10,
  fontSize: 13,
  color: "#AAA"
};

export const buttonPrimary = {
  flex: 1,
  background: colors.primary,
  border: "none",
  borderRadius: 10,
  padding: "12px",
  fontWeight: "bold",
  cursor: "pointer"
};

export const buttonSecondary = {
  flex: 1,
  background: colors.backgroundLight,
  border: `1px solid ${colors.border}`,
  borderRadius: 10,
  padding: "12px",
  color: colors.text,
  cursor: "pointer"
};

export const uploadButtonStyle = {
  width: "100%",
  boxSizing: "border-box",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "14px",
  marginBottom: 12,
  background: "#1A1A1A",
  border: "1px dashed #444",
  borderRadius: 10,
  color: "#E8E0D0",
  fontSize: 14,
  cursor: "pointer"
};

export const primaryLinkButton = {
  padding: "10px 16px",
  background: "#FFB74D",
  color: "#111",
  borderRadius: 8,
  border: "1px dashed #444",
  textDecoration: "none",
  fontWeight: "bold"
};

export const dangerButtonStyle = {
  width: "100%",
  padding: "10px",
  borderRadius: 8,
  border: "1px solid #552222",
  background: "#2A1111",
  color: "#FF9090",
  cursor: "pointer"
};

export const cardStyle = {
  background: "#161616",
  border: "1px solid #222",
  borderRadius: 10,
  padding: "10px 12px"
};

export const chipStyle = {
  padding: "5px 8px",
  border: "1px solid #2A2A2A",
  borderRadius: 999,
  transition: "all 0.15s ease",
  cursor: "pointer",
  fontSize: 12,
  maxWidth: 180,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap"
};

export const dividerStyle = {
  height: 1,
  background: "#222",
  margin: "10px 0"
};

export const textareaStyle = {
  width: "100%",
  minHeight: 100,
  background: "#111",
  border: "1px solid #2A2A2A",
  borderRadius: 10,
  padding: 12,
  color: "#E8E0D0",
  resize: "vertical",
  boxSizing: "border-box"
};

export const buttonStyle = {
  width: "100%",
  padding: 14,
  borderRadius: 10,
  border: "1px solid #2A2A2A",
  background: "#1A1A1A",
  color: "#E8E0D0",
  cursor: "pointer"
};

export const cancelButton = {
  flex: 1,
  padding: 10,
  borderRadius: 8,
  border: "1px solid #2A2A2A",
  background: "#1A1A1A",
  color: "#AAA",
  cursor: "pointer"
};

export const sendButton = {
  flex: 1,
  padding: 10,
  borderRadius: 8,
  border: "none",
  background: "#FFB74D",
  color: "#111",
  fontWeight: "bold",
  cursor: "pointer"
};