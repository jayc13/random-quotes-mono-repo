import React from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline'; // Optional: for baseline styles

// Define the expected props structure
interface AppProps {
  quote?: { // Make quote optional initially, server will provide it
    text: string;
    author: string;
  };
}

function App({ quote }: AppProps) {
  return (
    <React.Fragment>
      <CssBaseline /> {/* Apply baseline styles */}
      <Container maxWidth="sm"> {/* Limit width */}
        <Box sx={{ my: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}> {/* Center content */}
          <Typography variant="h4" component="h1" gutterBottom>
            Random Quote
          </Typography>
          <Card sx={{ minWidth: 275, mt: 2 }}>
            <CardContent>
              {quote ? (
                <>
                  <Typography variant="body1" component="p" sx={{ fontStyle: 'italic' }}>
                    "{quote.text}"
                  </Typography>
                  <Typography variant="body2" color="text.secondary" align="right" sx={{ mt: 1 }}>
                    - {quote.author || 'Unknown Author'}
                  </Typography>
                </>
              ) : (
                <Typography variant="body1" component="p">
                  Loading quote... {/* Or handle error state */}
                </Typography>
              )}
            </CardContent>
          </Card>
        </Box>
      </Container>
    </React.Fragment>
  );
}

export default App;
