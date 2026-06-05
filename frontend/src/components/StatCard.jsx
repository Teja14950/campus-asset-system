import { Card, CardContent, Typography, Box } from "@mui/material";

function StatCard({
  title,
  value,
  icon,
  color = "#1976d2",
}) {
  return (
    <Card
      elevation={2}
      sx={{
        borderRadius: 3,
      }}
    >
      <CardContent>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
        >
          <Box>
            <Typography
              variant="body2"
              color="text.secondary"
            >
              {title}
            </Typography>

            <Typography
              variant="h4"
              fontWeight={700}
            >
              {value}
            </Typography>
          </Box>

          <Box
            sx={{
              fontSize: "2rem",
              color,
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

export default StatCard;