import React, { useState } from 'react';
import AppTheme from '../components/shared-theme/AppTheme';
import Sidebar from '../components/shared/Sidebar';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Toolbar from '@mui/material/Toolbar';
import AppBar from '@mui/material/AppBar';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import ColorModeSelect from '../components/shared-theme/ColorModeSelect';

export default function Settings() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleDrawerToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <AppTheme>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <AppBar 
          position="fixed" 
          color="default"
          elevation={0}
          sx={{
            zIndex: (theme) => theme.zIndex.drawer + 1,
            bgcolor: 'background.paper',
            borderBottom: '1px solid #E2E8F0',
          }}
        >
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, color: 'text.primary' }}>
              Settings
            </Typography>
            <ColorModeSelect sx={{ ml: 1 }} />
          </Toolbar>
        </AppBar>
        <Sidebar open={sidebarOpen} onClose={handleDrawerToggle} />
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            pt: 8,
            px: 2,
            backgroundColor: 'background.default',
          }}
        >
          <Container maxWidth="sm" sx={{ py: 3 }}>
            <Typography variant="h4" gutterBottom>
              Settings
            </Typography>
            <Typography variant="h6" sx={{ mt: 3 }}>
              Theme
            </Typography>
            <Box sx={{ mt: 1 }}>
              <ColorModeSelect />
            </Box>
            {/* Add more settings here as needed */}
          </Container>
        </Box>
      </Box>
    </AppTheme>
  );
}
