// /app/workout/page.tsx
"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Container, Typography, Box, Paper, Grid, TextField, Button } from '@mui/material';

export default function WorkoutPage() {
  const [sessionCode, setSessionCode] = useState('');
  const router = useRouter();
  const { data: session, status } = useSession();

  // Redirect to login if not authenticated
  if (status === 'unauthenticated') {
    router.push('/login');
    return null;
  }

  // Loading state
  if (status === 'loading') {
    return (
      <Container maxWidth="md" sx={{ pt: 8, textAlign: 'center' }}>
        <Typography variant="h5">Loading...</Typography>
      </Container>
    );
  }

  const handleCreateSession = () => {
    router.push('/workout/bicep-curls');
  };

  const handleJoinSession = () => {
    if (sessionCode.trim()) {
      router.push(`/workout/bicep-curls?session=${sessionCode.trim()}`);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Typography variant="h3" component="h1" gutterBottom align="center">
        Workout Sessions
      </Typography>
      
      <Grid container spacing={4} sx={{ mt: 4 }}>
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 4, height: '100%', borderRadius: '1rem' }}>
            <Typography variant="h5" gutterBottom>
              Create New Session
            </Typography>
            <Typography variant="body1" paragraph>
              Start a new workout session and invite friends to join you for bicep curls!
            </Typography>
            <Box sx={{ mt: 4, textAlign: 'center' }}>
              <img 
                src="/Assets/bicep.gif" 
                alt="Bicep Curls" 
                style={{ maxWidth: '60%', marginBottom: '2rem' }} 
              />
              <Button 
                variant="contained" 
                color="primary" 
                size="large"
                fullWidth
                onClick={handleCreateSession}
              >
                Create New Session
              </Button>
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 4, height: '100%', borderRadius: '1rem' }}>
            <Typography variant="h5" gutterBottom>
              Join Existing Session
            </Typography>
            <Typography variant="body1" paragraph>
              Enter a session code to join an existing workout with friends.
            </Typography>
            <Box sx={{ mt: 4 }}>
              <TextField
                label="Enter Session Code"
                variant="outlined"
                fullWidth
                value={sessionCode}
                // /app/workout/page.tsx (continued)
                onChange={(e) => setSessionCode(e.target.value)}
                sx={{ mb: 3 }}
              />
              <Button 
                variant="contained" 
                color="secondary" 
                size="large"
                fullWidth
                onClick={handleJoinSession}
                disabled={!sessionCode.trim()}
              >
                Join Session
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
      
      <Box sx={{ mt: 8 }}>
        <Typography variant="h5" gutterBottom>
          Recent Sessions
        </Typography>
        <Grid container spacing={3}>
          {/* We'll fetch this data from the API in a useEffect */}
          <Grid item xs={12}>
            <SessionHistoryList />
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
}

// Component to display recent sessions
function SessionHistoryList() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  React.useEffect(() => {
    async function fetchSessions() {
      try {
        const response = await fetch('/api/workout-sessions');
        if (response.ok) {
          const data = await response.json();
          setSessions(data);
        }
      } catch (error) {
        console.error('Error fetching sessions:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchSessions();
  }, []);

  if (loading) {
    return (
      <Typography variant="body2" color="text.secondary" align="center">
        Loading recent sessions...
      </Typography>
    );
  }

  if (sessions.length === 0) {
    return (
      <Paper elevation={1} sx={{ p: 3, borderRadius: '0.5rem', bgcolor: 'grey.100' }}>
        <Typography variant="body1" align="center">
          No recent workout sessions found. Create a new one to get started!
        </Typography>
      </Paper>
    );
  }

  return (
    <Box>
      {sessions.map((session: any) => (
        <Paper 
          key={session.id} 
          elevation={1} 
          sx={{ 
            p: 3, 
            mb: 2, 
            borderRadius: '0.5rem',
            cursor: 'pointer',
            '&:hover': { bgcolor: 'action.hover' }
          }}
          onClick={() => router.push(`/workout/history/${session.id}`)}
        >
          <Grid container alignItems="center">
            <Grid item xs={12} sm={6}>
              <Typography variant="h6">
                {session.hostId === session.participants[0]?.userId 
                  ? `${session.participants[0]?.user?.name}'s Session` 
                  : 'Group Workout'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {new Date(session.startedAt).toLocaleString()}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={3}>
              <Typography variant="body1">
                {session.exerciseType === 'bicepCurls' ? 'Bicep Curls' : session.exerciseType}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {session.participants.length} participant{session.participants.length !== 1 ? 's' : ''}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={3} sx={{ textAlign: 'right' }}>
              <Typography variant="h6" color="primary">
                {session.participants.reduce((total: number, p: any) => total + p.repCount, 0)} total reps
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {Math.floor(session.timeSpentSeconds / 60)}:{(session.timeSpentSeconds % 60).toString().padStart(2, '0')}
              </Typography>
            </Grid>
          </Grid>
        </Paper>
      ))}
    </Box>
  );
}