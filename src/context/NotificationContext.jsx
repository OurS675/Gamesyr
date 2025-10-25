import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../auth/AuthContext';

const NotificationContext = createContext();

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchNotifications();
      
      // Suscripción a nuevos juegos
      const gameSubscription = supabase
        .channel('public:games')
        .on('INSERT', (payload) => {
          const newGame = payload.new;
          addNotification({
            type: 'new_game',
            title: 'Nuevo juego añadido',
            message: `¡${newGame.name} ha sido añadido a la biblioteca!`,
            gameId: newGame.id,
            read: false
          });
        })
        .subscribe();

      return () => {
        supabase.removeChannel(gameSubscription);
      };
    }
  }, [user]);

  const fetchNotifications = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20);
    
    if (data && !error) {
      setNotifications(data);
      setUnreadCount(data.filter(n => !n.read).length);
    }
  };

  const addNotification = async (notification) => {
    if (!user) return;
    
    const newNotification = {
      ...notification,
      user_id: user.id,
      created_at: new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from('notifications')
      .insert([newNotification])
      .select();
    
    if (data && !error) {
      setNotifications(prev => [data[0], ...prev]);
      setUnreadCount(prev => prev + 1);
    }
  };

  const markAsRead = async (notificationId) => {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId);
    
    if (!error) {
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  const markAllAsRead = async () => {
    if (notifications.length === 0) return;
    
    const unreadIds = notifications.filter(n => !n.read).map(n => n.id);
    
    if (unreadIds.length === 0) return;
    
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .in('id', unreadIds);
    
    if (!error) {
      setNotifications(prev => 
        prev.map(n => ({ ...n, read: true }))
      );
      setUnreadCount(0);
    }
  };

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      addNotification,
      markAsRead,
      markAllAsRead,
      fetchNotifications
    }}>
      {children}
    </NotificationContext.Provider>
  );
};