-- Tabla para reviews (reseñas y calificaciones)
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    game_id INTEGER NOT NULL REFERENCES public.games(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, game_id)
);

-- Índices para reviews
CREATE INDEX IF NOT EXISTS idx_reviews_game_id ON public.reviews(game_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON public.reviews(user_id);

-- Habilitar RLS para reviews
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Políticas para reviews
CREATE POLICY "Users can view all reviews" 
    ON public.reviews FOR SELECT 
    TO authenticated, anon
    USING (true);

CREATE POLICY "Users can create reviews" 
    ON public.reviews FOR INSERT 
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews" 
    ON public.reviews FOR UPDATE 
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reviews" 
    ON public.reviews FOR DELETE 
    TO authenticated
    USING (auth.uid() = user_id);

-- Función para actualizar el timestamp de actualización
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para actualizar el timestamp
CREATE TRIGGER update_reviews_updated_at
    BEFORE UPDATE ON public.reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();