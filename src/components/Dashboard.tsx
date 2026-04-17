import React from 'react';
import { generateHomeWorkout, generateGymWorkout } from '../utils/workoutGenerator';

export default function Dashboard() {
  const handleHomeClick = () => {
    const plan = generateHomeWorkout('intermediario', 30);
    console.log('Treino em casa:', plan);
  };

  const handleGymClick = () => {
    const plan = generateGymWorkout('intermediario', 45);
    console.log('Treino musculação:', plan);
  };

  return (
    <div>
      <h1>Dashboard</h1>
      <button onClick={handleHomeClick}>Gerar Treino em Casa</button>
      <button onClick={handleGymClick}>Gerar Treino Musculação</button>
    </div>
  );
}
