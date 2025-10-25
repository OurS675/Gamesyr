-- Crear tabla de notificaciones
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  game_id INTEGER REFERENCES public.games(id) ON DELETE SET NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at);

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad
-- Permitir a los usuarios ver solo sus propias notificaciones
CREATE POLICY "Users can view their own notifications" 
  ON public.notifications 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Permitir a los usuarios actualizar solo sus propias notificaciones (para marcar como leídas)
CREATE POLICY "Users can update their own notifications" 
  ON public.notifications 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Permitir a los administradores crear notificaciones para cualquier usuario
CREATE POLICY "Admins can insert notifications" 
  ON public.notifications 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Permitir al sistema crear notificaciones (para eventos automáticos)
CREATE POLICY "System can insert notifications" 
  ON public.notifications 
  FOR INSERT 
  WITH CHECK (true);

-- Función para notificar a todos los usuarios cuando se añade un nuevo juego
CREATE OR REPLACE FUNCTION public.notify_new_game()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.notifications (user_id, type, title, message, game_id)
  SELECT 
    id, 
    'new_game', 
    'Nuevo juego añadido', 
    '¡' || NEW.name || ' ha sido añadido a la biblioteca!',
    NEW.id
  FROM auth.users;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para ejecutar la función cuando se añade un nuevo juego
DROP TRIGGER IF EXISTS on_game_created ON public.games;
CREATE TRIGGER on_game_created
  AFTER INSERT ON public.games
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_new_game();