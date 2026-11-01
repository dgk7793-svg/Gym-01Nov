-- Sample data. ON CONFLICT DO NOTHING keeps re-runs from creating duplicates.

INSERT INTO exercises (name, muscle_group, sets, reps, difficulty, rest_seconds, description) VALUES
  -- Chest
  ('Barbell Bench Press', 'Chest', 4, '6-8', 'Intermediate', 120, 'Lower the bar to mid-chest with elbows at about 45 degrees, then press up and slightly back.'),
  ('Incline Dumbbell Press', 'Chest', 3, '8-10', 'Intermediate', 90, 'Set the bench to 30 degrees and press the dumbbells up over your upper chest.'),
  ('Tempo Push-Ups', 'Chest', 3, '15', 'Beginner', 60, 'Three seconds down, one second up. Keep your body in a straight line.'),
  ('Cable Crossover Fly', 'Chest', 3, '12', 'Beginner', 60, 'Bring the handles together in a wide hugging arc and squeeze at the middle.'),
  ('Weighted Chest Dips', 'Chest', 3, '8', 'Advanced', 120, 'Lean forward slightly to bias the chest and lower until shoulders are below elbows.'),
  -- Back
  ('Conventional Deadlift', 'Back', 5, '5', 'Advanced', 180, 'Brace hard, push the floor away and keep the bar dragging up your legs.'),
  ('Weighted Pull-Ups', 'Back', 4, '6', 'Advanced', 120, 'Start from a dead hang and pull until your chin clears the bar.'),
  ('Bent-Over Barbell Row', 'Back', 4, '8', 'Intermediate', 90, 'Hinge to about 45 degrees and row the bar to your lower ribs.'),
  ('Lat Pulldown', 'Back', 3, '10-12', 'Beginner', 75, 'Pull the bar to your upper chest while driving your elbows down and back.'),
  ('Seated Cable Row', 'Back', 3, '12', 'Beginner', 60, 'Sit tall, row to your belly button and pause with shoulder blades squeezed.'),
  -- Legs
  ('Back Squat', 'Legs', 5, '5', 'Advanced', 180, 'Sit down between your hips with knees tracking over toes, then drive up.'),
  ('Romanian Deadlift', 'Legs', 3, '8-10', 'Intermediate', 120, 'Push your hips back with soft knees until you feel a deep hamstring stretch.'),
  ('Walking Lunges', 'Legs', 3, '12 / leg', 'Beginner', 75, 'Take long steps and lower the back knee gently toward the floor.'),
  ('Leg Press', 'Legs', 4, '10', 'Beginner', 90, 'Lower the sled until knees reach about 90 degrees without lifting your hips.'),
  ('Bulgarian Split Squat', 'Legs', 3, '10 / leg', 'Intermediate', 90, 'Rear foot on a bench, drop straight down and drive through the front heel.'),
  -- Arms
  ('EZ-Bar Curl', 'Arms', 3, '10', 'Beginner', 60, 'Keep elbows pinned to your sides and curl without swinging.'),
  ('Parallel Bar Dips', 'Arms', 3, '8-12', 'Intermediate', 90, 'Stay upright to focus on the triceps and lock out at the top.'),
  ('Skull Crushers', 'Arms', 3, '10', 'Intermediate', 60, 'Lower the bar toward your forehead with elbows pointing at the ceiling.'),
  ('Hammer Curls', 'Arms', 3, '12', 'Beginner', 60, 'Neutral grip, curl both dumbbells with control and squeeze at the top.'),
  ('Close-Grip Bench Press', 'Arms', 4, '6-8', 'Advanced', 120, 'Hands shoulder-width apart, elbows tucked, press with your triceps.'),
  -- Core
  ('Plank Hold', 'Core', 3, '60s', 'Beginner', 45, 'Squeeze glutes and abs, and keep a straight line from head to heels.'),
  ('Hanging Leg Raise', 'Core', 3, '12', 'Advanced', 60, 'Hang from the bar and raise straight legs to hip height without swinging.'),
  ('Ab Wheel Rollout', 'Core', 3, '10', 'Intermediate', 60, 'Roll out as far as you can while keeping your lower back flat.'),
  ('Dead Bug', 'Core', 3, '10 / side', 'Beginner', 45, 'Press your lower back into the floor and extend opposite arm and leg.'),
  ('Cable Woodchopper', 'Core', 3, '12 / side', 'Intermediate', 60, 'Rotate through your torso, not your arms, from high to low.'),
  -- Cardio
  ('Rower Intervals', 'Cardio', 6, '250m', 'Intermediate', 60, 'Drive with the legs first, then swing back and pull the handle to your chest.'),
  ('Assault Bike Sprints', 'Cardio', 8, '20s', 'Advanced', 40, 'All-out effort for 20 seconds, then spin easy during the rest.'),
  ('Jump Rope', 'Cardio', 5, '90s', 'Beginner', 30, 'Stay light on the balls of your feet with small quick jumps.'),
  ('Treadmill Incline Walk', 'Cardio', 1, '20 min', 'Beginner', 0, 'Set a 10 to 12 percent incline at a brisk walking pace.'),
  ('Burpee Ladder', 'Cardio', 5, '10', 'Advanced', 60, 'Chest to floor, jump at the top, and keep a steady rhythm.')
ON CONFLICT (name) DO NOTHING;

-- Ten classes spread across the current week (Monday-based)
INSERT INTO classes (title, coach_name, start_time, duration_minutes, capacity, intensity) VALUES
  ('Sunrise Yoga Flow',  'Maya Chen',    date_trunc('week', now()) + interval '0 days 06:30', 50, 18, 'Low'),
  ('HIIT Burn 45',       'Jordan Blake', date_trunc('week', now()) + interval '0 days 18:00', 45, 20, 'High'),
  ('Rhythm Ride Spin',   'Priya Nair',   date_trunc('week', now()) + interval '1 days 07:00', 45, 24, 'Medium'),
  ('Fight Club Boxing',  'Dre Walker',   date_trunc('week', now()) + interval '1 days 18:30', 60, 16, 'High'),
  ('Strength Foundations','Sam Ortiz',   date_trunc('week', now()) + interval '2 days 12:00', 50, 14, 'Medium'),
  ('Power Vinyasa',      'Leo Okafor',   date_trunc('week', now()) + interval '3 days 19:00', 60, 18, 'Medium'),
  ('Tabata Torch',       'Jordan Blake', date_trunc('week', now()) + interval '4 days 07:15', 30, 20, 'High'),
  ('Climb & Sprint Spin','Kai Mendes',   date_trunc('week', now()) + interval '4 days 18:00', 40, 24, 'High'),
  ('Core & Mobility',    'Nina Petrov',  date_trunc('week', now()) + interval '5 days 10:00', 45, 16, 'Low'),
  ('Weekend Boxing Bootcamp','Dre Walker', date_trunc('week', now()) + interval '6 days 11:00', 60, 16, 'High')
ON CONFLICT (title, start_time) DO NOTHING;
