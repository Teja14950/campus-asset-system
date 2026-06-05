import {
  AppBar,
  Toolbar,
  Typography,
  TextField,
  Avatar,
  Box,
} from "@mui/material";

function Header() {
  return (
    <AppBar
      position="static"
      color="inherit"
      elevation={0}
      sx={{
        borderBottom: "1px solid #e5e7eb",
        mb: 4,
      }}
    >
      <Toolbar
        sx={{
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <Box>
          <Typography
            variant="h5"
            fontWeight={700}
          >
            Dashboard
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
          >
            Campus Asset Overview
          </Typography>
        </Box>

        <Box display="flex" gap={2}>
          <TextField
            size="small"
            placeholder="Search..."
          />

          <Avatar
            sx={{
              bgcolor: "#1976d2",
            }}
          >
            A
          </Avatar>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Header;