// src/styles/styles.js


export const getInputStyle = (theme) => ({
  width: "100%",
  padding: "10px",
  marginTop: 4,
  background: theme.surface,
  border: `1px solid ${theme.border}`,
  borderRadius: 6,
  color: theme.text,
  outline: "none",
  boxSizing: "border-box"
});

export const getSelectStyle = (theme) => ({
  width: "100%",
  padding: "8px",
  background: theme.surface,
  color: theme.text,
  border: `1px solid ${theme.border}`,
  borderRadius: 6,
  fontSize: 12,
  outline: "none",
  cursor: "pointer"
});

export const getActionButton = (theme) => ({
  flex: 1,
  padding: "12px",
  borderRadius: 10,
  border: `1px solid ${theme.border}`,
  background: theme.card,
  color: theme.text,
  fontSize: 13,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 6,
  transition: "all 0.2s ease"
});

export const getSecondaryButton = (theme) => ({
  background: theme.card,
  color: theme.secondaryText,
  border: `3px solid ${theme.border}`,
  borderRadius: 6,
  cursor: "pointer"
});

export const getModalStyle = (theme) => ({
  background: theme.card,
  color: theme.text,

  border: `1px solid ${theme.border}`,
  borderRadius: 12,

  padding: 20,

  width: "90%",
  maxWidth: "900px",

  maxHeight: "90vh",
  overflowY: "auto"
});

export const getCardStyle = (theme) => ({
  background: theme.surface,
  color: theme.text,
  border: `1px solid ${theme.border}`,
  padding: 12,
  margin: 12,
  borderRadius: 8
});

export const getLabelStyle = (theme) => ({
  color: theme.text,
  borderTop: `2px solid ${theme.border}`,
  display: "flex",
  alignItems: "center",
  gap: 8,
  marginTop: 22,
  padding: 6,
  fontSize: 13,
});

export const getUserStyle = (theme) => ({
  color: theme.text,
  fontWeight: "bold",
  fontSize: 14
});

export const getDateStyle = (theme) => ({
  color: theme.secondaryText,
  fontSize: 11
});

export const getMessageStyle = (theme) => ({
  color: theme.text,
  lineHeight: 1.5,
  marginBottom: 12,
  whiteSpace: "pre-wrap"
});

export const getResponseBoxStyle = (theme) => ({
  marginTop: 10,
  padding: 10,
  borderRadius: 10,
  background: theme.surface,
  border: `1px solid ${theme.border}`
});

export const getResponseTextStyle = (theme) => ({
  color: theme.text,
  lineHeight: 1.4
});


export const historialOverlay = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.9)",
  zIndex: 200,
  display: "flex",
  alignItems: "flex-end"
};

export const getHistorialItemStyle = (theme) => ({
  padding: "10px 0",
  borderBottom: `1px solid ${theme.border}`
});

export const getHistorialButtonStyle = (theme) => ({
  marginTop: 15,
  width: "100%",
  padding: "12px",
  borderRadius: 8,
  background: theme.surface,
  color: theme.text,
  border: `1px solid ${theme.border}`,
  cursor: "pointer"
});







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