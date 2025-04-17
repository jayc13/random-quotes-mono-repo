import { Alert, Box, CircularProgress, Typography } from "@mui/material";
import { useShow } from "@refinedev/core";
import type React from "react";

export const HomePage: React.FC = () => {
  const { queryResult } = useShow({
    resource: "quotes",
    id: 1,
  });

  const { data, isLoading, isError, error } = queryResult;

  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (isError) {
    return (
      <Box sx={{ padding: 2 }}>
        <Alert severity='error'>
          Error fetching quote: {error?.message || "An unknown error occurred"}
        </Alert>
      </Box>
    );
  }

  // Assuming the API returns data in the format { data: { id: 1, text: "Quote text" } }
  const quoteText = data?.data?.text;

  return (
    <Box sx={{ padding: 2 }}>
      <Typography variant='h4' gutterBottom>
        Quote of the Moment
      </Typography>
      {quoteText ? (
        <Typography variant='body1'>"{quoteText}"</Typography>
      ) : (
        <Typography variant='body1'>Could not load quote.</Typography>
      )}
    </Box>
  );
};
