import {
  Dashboard,
  Assignment,
  People,
  CheckCircle,
  QrCode,
  Settings,
} from "@mui/icons-material";

import {
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Box,
} from "@mui/material";

import { Link, useLocation } from "react-router-dom";

const drawerWidth = 260;

function Sidebar() {
  const location = useLocation();

  const menuItems = [
    {
      text: "Overview",
      icon: <Dashboard />,
      path: "/admin",
    },
    {
      text: "Reports",
      icon: <Assignment />,
      path: "/admin/reports",
    },
    {
      text: "Users",
      icon: <People />,
      path: "/admin/users",
    },
    {
      text: "Approvals",
      icon: <CheckCircle />,
      path: "/admin/approvals",
    },
    {
      text: "QR Codes",
      icon: <QrCode />,
      path: "/admin/qr",
    },
    {
      text: "Settings",
      icon: <Settings />,
      path: "/admin/settings",
    },
  ];

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: drawerWidth,
          boxSizing: "border-box",
          borderRight: "1px solid #e5e7eb",
        },
      }}
    >
      <Toolbar />

      <Box sx={{ p: 3 }}>
        <Typography
          variant="h5"
          fontWeight={700}
        >
          AssetTrack
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
        >
          Campus Intelligence
        </Typography>
      </Box>

      <List>
        {menuItems.map((item) => (
          <ListItemButton
            key={item.text}
            component={Link}
            to={item.path}
            selected={
              location.pathname === item.path
            }
            sx={{
              mx: 1,
              borderRadius: 2,
            }}
          >
            <ListItemIcon>
              {item.icon}
            </ListItemIcon>

            <ListItemText
              primary={item.text}
            />
          </ListItemButton>
        ))}
      </List>
    </Drawer>
  );
}

export default Sidebar;