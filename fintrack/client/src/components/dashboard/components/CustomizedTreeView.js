import * as React from 'react';
import PropTypes from 'prop-types';
import { animated, useSpring } from '@react-spring/web';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Collapse from '@mui/material/Collapse';
import Typography from '@mui/material/Typography';
import TreeView from '@mui/lab/TreeView';
import TreeItem from '@mui/lab/TreeItem';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { useTheme } from '@mui/material/styles';

const ITEMS = [
  {
    id: '1',
    label: 'Website',
    children: [
      { id: '1.1', label: 'Home', color: 'green' },
      { id: '1.2', label: 'Pricing', color: 'green' },
      { id: '1.3', label: 'About us', color: 'green' },
      {
        id: '1.4',
        label: 'Blog',
        children: [
          { id: '1.1.1', label: 'Announcements', color: 'blue' },
          { id: '1.1.2', label: 'April lookahead', color: 'blue' },
          { id: '1.1.3', label: "What's new", color: 'blue' },
          { id: '1.1.4', label: 'Meet the team', color: 'blue' },
        ],
      },
    ],
  },
  {
    id: '2',
    label: 'Store',
    children: [
      { id: '2.1', label: 'All products', color: 'green' },
      {
        id: '2.2',
        label: 'Categories',
        children: [
          { id: '2.2.1', label: 'Gadgets', color: 'blue' },
          { id: '2.2.2', label: 'Phones', color: 'blue' },
          { id: '2.2.3', label: 'Wearables', color: 'blue' },
        ],
      },
      { id: '2.3', label: 'Bestsellers', color: 'green' },
      { id: '2.4', label: 'Sales', color: 'green' },
    ],
  },
  { id: '4', label: 'Contact', color: 'blue' },
  { id: '5', label: 'Help', color: 'blue' },
];

function DotIcon({ color }) {
  return (
    <Box sx={{ marginRight: 1, display: 'flex', alignItems: 'center' }}>
      <svg width={6} height={6}>
        <circle cx={3} cy={3} r={3} fill={color} />
      </svg>
    </Box>
  );
}

DotIcon.propTypes = {
  color: PropTypes.string.isRequired,
};

const AnimatedCollapse = animated(Collapse);

function TransitionComponent(props) {
  const style = useSpring({
    to: {
      opacity: props.in ? 1 : 0,
      transform: `translate3d(0,${props.in ? 0 : 20}px,0)`,
    },
  });

  return <AnimatedCollapse style={style} {...props} />;
}

TransitionComponent.propTypes = {
  in: PropTypes.bool,
};

function CustomLabel({ color, children }) {
  const theme = useTheme();
  const colors = {
    blue: (theme.vars || theme).palette.primary.main,
    green: (theme.vars || theme).palette.success.main,
  };

  const iconColor = color ? colors[color] : null;
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', p: 0.5, pr: 0 }}>
      {iconColor && <DotIcon color={iconColor} />}
      <Typography variant="body2" sx={{ color: 'text.primary' }}>
        {children}
      </Typography>
    </Box>
  );
}

CustomLabel.propTypes = {
  children: PropTypes.node,
  color: PropTypes.oneOf(['blue', 'green']),
};

const StyledTreeItem = React.forwardRef(function StyledTreeItem(props, ref) {
  const { label, color, children, ...other } = props;

  return (
    <TreeItem
      ref={ref}
      TransitionComponent={TransitionComponent}
      label={<CustomLabel color={color}>{label}</CustomLabel>}
      {...other}
    >
      {children}
    </TreeItem>
  );
});

StyledTreeItem.propTypes = {
  children: PropTypes.node,
  color: PropTypes.oneOf(['blue', 'green']),
  label: PropTypes.string.isRequired,
};

export default function CustomizedTreeView() {
  return (
    <Card
      variant="outlined"
      sx={{ display: 'flex', flexDirection: 'column', gap: '8px', flexGrow: 1 }}
    >
      <CardContent>
        <Typography component="h2" variant="subtitle2" gutterBottom>
          Product tree
        </Typography>
        <TreeView
          aria-label="pages"
          defaultExpanded={['1', '1.4', '2', '2.2']}
          defaultCollapseIcon={<ExpandMoreIcon />}
          defaultExpandIcon={<ChevronRightIcon />}
          sx={{
            height: 'auto',
            flexGrow: 1,
            maxWidth: 400,
            overflowY: 'auto',
            '& .MuiTreeItem-root': {
              '& .MuiTreeItem-content': {
                padding: '4px 8px',
              },
            },
          }}
        >
          {ITEMS.map((item) => (
            <StyledTreeItem
              key={item.id}
              nodeId={item.id}
              label={item.label}
              color={item.color}
            >
              {item.children?.map((child) => (
                <StyledTreeItem
                  key={child.id}
                  nodeId={child.id}
                  label={child.label}
                  color={child.color}
                >
                  {child.children?.map((grandChild) => (
                    <StyledTreeItem
                      key={grandChild.id}
                      nodeId={grandChild.id}
                      label={grandChild.label}
                      color={grandChild.color}
                    />
                  ))}
                </StyledTreeItem>
              ))}
            </StyledTreeItem>
          ))}
        </TreeView>
      </CardContent>
    </Card>
  );
}
