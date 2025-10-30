#!/bin/bash

# Script to initialize database with seed data

echo "🗄️  Initializing GP-Medical Database..."
echo ""

# Run Alembic migrations
echo "📊 Running database migrations..."
alembic upgrade head

if [ $? -ne 0 ]; then
    echo "❌ Error running migrations"
    exit 1
fi

echo "✅ Migrations completed"
echo ""

# Run seeds
echo "🌱 Creating seed data..."
python -m app.seeds

if [ $? -ne 0 ]; then
    echo "❌ Error creating seed data"
    exit 1
fi

echo ""
echo "🎉 Database initialized successfully!"
echo ""
echo "📋 You can now login with these credentials:"
echo "----------------------------------------"
echo "Admin:      admin@clinica.com / admin123"
echo "Médico:     dr.perez@clinica.com / medico123"
echo "Pediatra:   dra.martinez@clinica.com / medico123"
echo "Recepción:  recepcion@clinica.com / recepcion123"
echo "Enfermería: enfermeria@clinica.com / enfermeria123"
echo "Caja:       caja@clinica.com / caja123"
echo "----------------------------------------"
