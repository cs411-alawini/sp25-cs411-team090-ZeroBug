import React from 'react';
import { 
  Box,
  Drawer, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText,
  Typography,
  styled,
  IconButton,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { 
  Home as DashboardIcon,
  Receipt as TransactionsIcon,
  Person as AccountsIcon,
  Settings as SettingIcon,
  Menu as MenuIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

const drawerWidth = 250;

const LogoBox = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
}));

const Logo = styled('div')(({ theme }) => ({
  width: 32,
  height: 32,
  backgroundColor: '#3461FF',
  borderRadius: 8,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'white',
}));

const StyledListItem = styled(ListItem)(({ theme, active }) => ({
  margin: '8px 16px',
  borderRadius: '10px',
  backgroundColor: active ? '#F5F7FE' : 'transparent',
  color: active ? '#3461FF' : '#94A3B8',
  '&:hover': {
    backgroundColor: '#F5F7FE',
    color: '#3461FF',
  },
  '& .MuiListItemIcon-root': {
    color: 'inherit',
  },
  '& .MuiTypography-root': {
    fontWeight: active ? 600 : 400,
    fontSize: '0.95rem',
  },
}));

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
    { text: 'Transactions', icon: <TransactionsIcon />, path: '/transactions' },
    { text: 'Accounts', icon: <AccountsIcon />, path: '/accounts' },
    { text: 'Setting', icon: <SettingIcon />, path: '/settings' },
  ];

  const drawer = (
    <>
      <LogoBox>
        <Logo>
          <span style={{ fontSize: '20px' }}>📊</span>
        </Logo>
        <Typography variant="h6" sx={{ fontWeight: 600, color: '#1E293B' }}>
          FinTrack
        </Typography>
      </LogoBox>
      <List sx={{ mt: 2 }}>
        {menuItems.map((item) => (
          <StyledListItem
            button
            key={item.text}
            onClick={() => {
              navigate(item.path);
              if (isMobile) handleDrawerToggle();
            }}
            active={location.pathname === item.path ? 1 : 0}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </StyledListItem>
        ))}
      </List>
    </>
  );

  return (
    <>
      {isMobile && (
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={handleDrawerToggle}
          sx={{ 
            position: 'fixed',
            left: 16,
            top: 16,
            zIndex: 1200,
            bgcolor: 'white',
            boxShadow: 1,
            '&:hover': { bgcolor: 'white' }
          }}
        >
          <MenuIcon />
        </IconButton>
      )}
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        {isMobile ? (
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{ keepMounted: true }}
            sx={{
              display: { xs: 'block', md: 'none' },
              '& .MuiDrawer-paper': {
                width: drawerWidth,
                boxSizing: 'border-box',
                border: 'none',
                backgroundColor: '#FFFFFF',
              },
            }}
          >
            {drawer}
          </Drawer>
        ) : (
          <Drawer
            variant="permanent"
            sx={{
              display: { xs: 'none', md: 'block' },
              '& .MuiDrawer-paper': {
                width: drawerWidth,
                boxSizing: 'border-box',
                border: 'none',
                backgroundColor: '#FFFFFF',
              },
            }}
            open
          >
            {drawer}
          </Drawer>
        )}
      </Box>
    </>
  );
}

export default Sidebar;