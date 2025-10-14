import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const userRef = useRef(null);
  const navigate = useNavigate();

  // keep a ref with the latest user so the auth listener can check current state
  useEffect(() => {
    userRef.current = user;
  }, [user]);

  // Ajustar la consulta para obtener el perfil del usuario y manejar errores correctamente
  const getProfileByAuthId = async (authUserId) => {
    console.log('Buscando perfil para auth_user_id:', authUserId);
    // Evitar consultas duplicadas concurrentes: usar un mapa de inflight requests
    if (!getProfileByAuthId._inflight) {
      getProfileByAuthId._inflight = new Map();
    }
    const inflight = getProfileByAuthId._inflight;

    if (inflight.has(authUserId)) {
      console.log('Usando petición en curso para auth_user_id:', authUserId);
      return await inflight.get(authUserId);
    }
    // Do a quick fetch with a short timeout and don't throw on failure.
    const queryPromise = (async () => {
      try {
        const { data: profileData, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('auth_user_id', authUserId)
          .maybeSingle();

        if (profileError) {
          console.warn('Error al obtener el perfil (desde Supabase):', profileError);
          return null;
        }

        if (!profileData) {
          // No profile yet
          return null;
        }

        return profileData;
      } catch (error) {
        // Avoid noisy errors; return null and let background retry handle it.
        return null;
      }
    })();

    const wrapped = queryPromise.finally(() => {
      try { inflight.delete(authUserId); } catch (e) { /* noop */ }
    });
    inflight.set(authUserId, wrapped);

    // Short timeout: 3s to keep UI responsive.
    const timeoutMs = 3000;
    const timeoutPromise = new Promise((resolve) => setTimeout(() => resolve(null), timeoutMs));

    try {
      const result = await Promise.race([wrapped, timeoutPromise]);
      return result; // may be profile object or null
    } catch (error) {
      // never throw; return null as fallback
      return null;
    }
  };

  // Background poll: tries to fetch profile every n seconds until found (or until max attempts)
  const backgroundFetchProfile = (authUserId, attempts = 5, intervalMs = 2000) => {
    let tries = 0;
    const id = setInterval(async () => {
      tries += 1;
      try {
        const { data: profileData, error } = await supabase
          .from('users')
          .select('*')
          .eq('auth_user_id', authUserId)
          .maybeSingle();
        if (!error && profileData) {
          console.log('Background profile fetch succeeded:', profileData);
          setUser({ id: profileData.id, username: profileData.username, email: profileData.email, role: profileData.role, created_at: profileData.created_at, updated_at: profileData.updated_at });
          clearInterval(id);
        }
      } catch (e) {
        // ignore and retry
      }
      if (tries >= attempts) clearInterval(id);
    }, intervalMs);
  };

  // Limpieza de inflight cuando una petición finaliza (para no almacenar promesas resueltas)
  // Observación: no es estrictamente necesario aquí porque usamos map local en la función,
  // pero eliminar entradas evita que el map crezca indefinidamente en casos raros.
  const _cleanupInflight = (authUserId) => {
    try {
      if (getProfileByAuthId._inflight && getProfileByAuthId._inflight.has(authUserId)) {
        getProfileByAuthId._inflight.delete(authUserId);
      }
    } catch (e) {
      // noop
    }
  };

  // Login simplificado y manejo de errores claro (sin timeout manual)
  const login = async (email, password) => {
    console.log('Intentando login con:', email);
    try {
      console.log('Llamando a signInWithPassword...');

      // Llamada directa y manejo explícito de respuesta
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      console.log('Respuesta de signInWithPassword:', { data, error });

      if (error) {
        console.error('Error de autenticación:', error);

        // Detectar mensajes comunes de cuenta no verificada y proporcionar mensaje amigable
        const msg = (error.message || '').toLowerCase();
        if (msg.includes('confirm') || msg.includes('verify') || msg.includes('confirmed')) {
          throw new Error('Tu cuenta no está verificada. Revisa tu correo y confirma la cuenta antes de iniciar sesión.');
        }

        throw new Error(error.message || 'Error de autenticación');
      }

      const session = data?.session;
      if (!session) {
        console.error('No hay sesión después del login');
        throw new Error('No hay sesión activa.');
      }

      console.log('Sesión obtenida:', session.user.id);

      // Obtener el perfil del usuario por auth_user_id
      let profile = await getProfileByAuthId(session.user.id);
      console.log('Perfil inicial:', profile);

      if (!profile) {
        console.log('Perfil no encontrado, creando...');
        // Crear perfil si falta
        const fallbackUsername = (email || '').split('@')[0] || 'user';
        console.log('Insertando perfil con:', { auth_user_id: session.user.id, email, username: fallbackUsername, role: 'user' });

        const { error: insertError } = await supabase
          .from('users')
          .insert([{ auth_user_id: session.user.id, email, username: fallbackUsername, role: 'user' }]);

        if (insertError) {
          console.error('Error creando perfil:', insertError);
          profile = { 
            id: session.user.id, 
            username: fallbackUsername, 
            email, 
            role: 'user', 
            created_at: new Date(), 
            updated_at: new Date() 
          };
          console.log('Usando perfil temporal:', profile);
        } else {
          profile = await getProfileByAuthId(session.user.id);
          console.log('Perfil creado exitosamente:', profile);
        }
      }

      console.log('Perfil final:', profile);
      setUser({ id: profile.id, username: profile.username, email: profile.email, role: profile.role, created_at: profile.created_at, updated_at: profile.updated_at });
      console.log('Usuario establecido, navegando...');
      navigate('/', { state: { loggedIn: true } }); // Redirigir al home después del login
    } catch (error) {
      console.error('Error completo en login:', error);
      throw error;
    }
  };

  /**
   * Logout function: Clears the user state and navigates to the home page.
   */
  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    navigate('/');
  };

  /**
   * Register function: Creates a new user in the database.
   * @param {string} username - The username of the new user.
   * @param {string} password - The password of the new user.
   * @param {string} email - The email of the new user.
   */
  const register = async (username, password, email) => {
    console.log('Intentando registrar usuario:', username);
    try {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) throw new Error(error.message);

      const authUserId = data.user?.id;
      if (authUserId) {
        const { error: insertError } = await supabase
          .from('users')
          .insert([{ auth_user_id: authUserId, username, email, role: 'user' }]);

        if (insertError) {
          console.error('Error al insertar usuario en la base de datos:', insertError);
          throw new Error('Error al registrar el usuario en la base de datos.');
        }
      }

      console.log('Usuario registrado exitosamente:', username);
    } catch (error) {
      console.error('Error completo en registro:', error);
      throw error;
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        console.log('Inicializando sesión...');
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error al obtener la sesión:', error);
          return;
        }
        
        const session = data.session;
        if (session?.user?.id) {
          console.log('Sesión encontrada, cargando perfil...');
          try {
              let profile = await getProfileByAuthId(session.user.id);
              if (!profile) {
                console.log('Perfil no encontrado en fetch rápido, lanzando background fetch...');
                // Start background fetch to populate profile when it becomes available
                backgroundFetchProfile(session.user.id);
                // proceed without blocking UI
              // Crear perfil automáticamente si no existe
                const fallbackUsername = (session.user.email || '').split('@')[0] || 'user';
              
                const { data: insertData, error: insertError } = await supabase
                  .from('users')
                  .insert([{ 
                    auth_user_id: session.user.id, 
                    email: session.user.email, 
                    username: fallbackUsername, 
                    role: 'user' 
                  }])
                  .select();
                
                if (insertError) {
                  console.warn('Error al crear perfil (no crítico):', insertError);
                  // Usar perfil temporal ligero para permitir mostrar la app
                  profile = { 
                    id: session.user.id, 
                    username: fallbackUsername, 
                    email: session.user.email, 
                    role: 'user', 
                    created_at: new Date().toISOString(), 
                    updated_at: new Date().toISOString() 
                  };
                } else if (insertData && insertData.length > 0) {
                  profile = insertData[0];
                } else {
                  // try again quickly
                  profile = await getProfileByAuthId(session.user.id);
                }
            }
            
            if (profile) {
              console.log('Perfil cargado correctamente');
              setUser({ 
                id: profile.id, 
                username: profile.username, 
                email: profile.email, 
                role: profile.role, 
                created_at: profile.created_at, 
                updated_at: profile.updated_at 
              });
            }
          } catch (e) {
            console.error('Error al inicializar usuario:', e);
          }
        } else {
          console.log('No hay sesión activa');
        }
      } catch (e) {
        console.error('Error general al inicializar:', e);
      }
    };
    init();

    const { data: sub } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.id);

      // Procesar sólo los eventos relevantes para evitar bucles o reacciones a eventos internos
      if (event === 'SIGNED_IN' && session?.user?.id) {
        try {
          const uid = session.user.id;
          console.log('Sesión activa, auth listener recibido para:', uid);

          // Si ya tenemos el usuario cargado en el contexto (ej. login() ya lo estableció),
          // evitar recargar el perfil para no provocar duplicados o parpadeos.
          if (userRef.current && userRef.current.id === uid && userRef.current.role) {
            console.log('Perfil ya cargado en contexto, evitando recarga para auth_user_id:', uid);
            // Navegar según el rol ya disponible
            if (userRef.current.role === 'admin') navigate('/admin');
            else navigate('/');
            return;
          }

          console.log('Cargando perfil de usuario desde DB...', uid);
          // Obtener el perfil del usuario
          let profile = await getProfileByAuthId(uid);
          console.log('Perfil obtenido:', profile);

          // Asegurarse de establecer el usuario en el contexto para que
          // componentes como Header puedan leer user.role inmediatamente.
          if (profile) {
            setUser({
              id: profile.id,
              username: profile.username,
              email: profile.email,
              role: profile.role,
              created_at: profile.created_at,
              updated_at: profile.updated_at,
            });
          }

          if (profile?.role === 'admin') {
            console.log('Usuario admin detectado, navegando al panel de administración (SPA)');
            navigate('/admin');
          } else {
            console.log('Usuario no admin, navegando a la página principal (SPA)');
            navigate('/');
          }
        } catch (error) {
          // No limpiar el `user` por errores transitorios al obtener el perfil.
          // Solo registramos el error para diagnóstico.
          console.error('Error cargando perfil (transitorio):', error);
        }
      } else if (event === 'SIGNED_OUT') {
        console.log('Evento SIGNED_OUT recibido, limpiando usuario');
        setUser(null);
      } else {
        // Ignorar otros eventos (TOKEN_REFRESHED, USER_UPDATED, etc.)
        console.log('Evento auth ignorado:', event);
      }
    });

    return () => {
      try {
        // `sub` contiene un objeto con `subscription` en la respuesta de supabase-js v2
        if (sub && sub.subscription && typeof sub.subscription.unsubscribe === 'function') {
          sub.subscription.unsubscribe();
        } else if (sub && typeof sub.unsubscribe === 'function') {
          // En algunas versiones la función puede estar directamente en `sub`
          sub.unsubscribe();
        }
      } catch (e) {
        console.warn('Error al desuscribir auth listener:', e);
      }
    };
  }, []);

  // Ensure isLoading is cleared after initial auth check (avoid stuck state)
  useEffect(() => {
    // When user is set (or we've determined there is no session), stop loading
    if (user !== undefined) {
      setIsLoading(false);
    }
  }, [user]);

  // Role-based access helpers
  const isAdmin = user?.role === 'admin';
  const isUser = user?.role === 'user';

  return (
    <AuthContext.Provider value={{ user, login, logout, isAdmin, isUser, register, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}