import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import './GameDetail.css';
import { supabase } from '../supabaseClient';
import { useAuth } from '../auth/AuthContext';
import { useLoading } from '../context/LoadingContext';
import { FaStar, FaRegStar } from 'react-icons/fa';

function GameDetail({ games }) {
  const { id } = useParams();
  // Find by string or number id to be tolerant of different shapes (string ids, numbers)
  const game = games.find((g) => String(g.id) === String(id));
  // Normalize links to objects: [{name, url}]
  const links = (game && game.links) ? game.links.map((link) => (
    typeof link === 'string' ? { name: '', url: link } : link
  )) : [];
  const { user, isAdmin } = useAuth();
  const { showLoader, hideLoader } = useLoading();
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentsError, setCommentsError] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviews, setReviews] = useState([]);
  const [reviewText, setReviewText] = useState('');

  // Función para enviar calificación y reseña
  const submitRating = async () => {
    if (!user || !game) return;
    
    try {
      showLoader();
      const { data, error } = await supabase
        .from('reviews')
        .upsert({
          user_id: user.id,
          game_id: game.id,
          rating: userRating,
          comment: reviewText,
          created_at: new Date()
        })
        .select();
        
      if (error) throw error;
      
      // Actualizar la lista de reseñas
      fetchReviews();
      setReviewText('');
      
    } catch (error) {
      console.error('Error al enviar calificación:', error);
    } finally {
      hideLoader();
    }
  };
  
  // Función para obtener reseñas
  const fetchReviews = async () => {
    if (!game) return;
    
    try {
      showLoader();
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('game_id', game.id)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      setReviews(data || []);
      
      // Si el usuario actual ya ha calificado, mostrar su calificación
      const userReview = data?.find(r => r.user_id === user?.id);
      if (userReview) {
        setUserRating(userReview.rating);
        setReviewText(userReview.comment || '');
      }
      
    } catch (error) {
      console.error('Error al obtener reseñas:', error);
    } finally {
      hideLoader();
    }
  };

  useEffect(() => {
    let mounted = true;
    
    // Cargar reseñas al montar el componente
    if (game && user) {
      fetchReviews();
    }
    
    return () => {
      mounted = false;
    };
  }, [game, user]);
  
  useEffect(() => {
    let mounted = true;
    const fetchComments = async () => {
      if (!game) return;
      showLoader(); // Mostrar el loader global
      setCommentsLoading(true);
      setCommentsError(null);
      try {
        // Primero obtenemos los comentarios
        const { data: commentsData, error } = await supabase
          .from('comments')
          .select('*')
          .eq('game_id', game.id)
          .order('created_at', { ascending: true });
          
        if (error) throw error;
        
        // Obtener la información de los usuarios
        const authUserIds = Array.from(new Set((commentsData || []).map(c => c.auth_user_id).filter(Boolean)));
        let usersMap = {};
        
        if (authUserIds.length > 0) {
          const { data: users } = await supabase
            .from('users')
            .select('auth_user_id, username, email')
            .in('auth_user_id', authUserIds);
            
          if (users) {
            usersMap = users.reduce((acc, user) => ({
              ...acc,
              [user.auth_user_id]: user
            }), {});
          }
        }
        if (error) throw error;
        
        const withNames = (commentsData || []).map(c => {
          const user = usersMap[c.auth_user_id];
          return {
            ...c,
            username: user ? (user.username || user.email) : 'Anónimo'
          };
        });
        if (mounted) setComments(withNames);
      } catch (err) {
        console.error('Error fetching comments:', err);
        if (mounted) setCommentsError('No se pueden cargar los comentarios.');
      } finally {
        if (mounted) {
          setCommentsLoading(false);
          hideLoader(); // Ocultar el loader global
        }
      }
    };
    fetchComments();
    return () => { mounted = false; };
  }, [game]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [images, setImages] = useState(game?.images || []);
  const [prevImageSrc, setPrevImageSrc] = useState(null);
  const prevIndexRef = useRef(0);
  const [isPaused, setIsPaused] = useState(false);
  const resumeTimerRef = useRef(null);
  useEffect(() => {
    setImages(game?.images || []);
    // Reset carousel to first image when the game changes
    setCurrentImageIndex(0);
    prevIndexRef.current = 0;
  }, [game]);

  // Auto-play: advance images every 3 seconds
  useEffect(() => {
    if (!images || images.length <= 1) return undefined;
    if (isPaused) return undefined;
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [images, isPaused]);

  // Crossfade: when currentImageIndex changes, keep the previous image briefly
  useEffect(() => {
    if (!images || images.length === 0) return undefined;
    const prevIdx = prevIndexRef.current;
    if (prevIdx !== currentImageIndex) {
      setPrevImageSrc(images[prevIdx]);
      const timer = setTimeout(() => setPrevImageSrc(null), 650); // match CSS transition
      prevIndexRef.current = currentImageIndex;
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [currentImageIndex, images]);

  const handleNextImage = () => {
    if (images.length > 0) {
      setCurrentImageIndex((currentImageIndex + 1) % images.length);
      // pause autoplay briefly when user interacts
      setIsPaused(true);
      clearTimeout(resumeTimerRef.current);
      resumeTimerRef.current = setTimeout(() => setIsPaused(false), 5000);
    }
  };

  const handlePrevImage = () => {
    if (images.length > 0) {
      setCurrentImageIndex((currentImageIndex - 1 + images.length) % images.length);
      // pause autoplay briefly when user interacts
      setIsPaused(true);
      clearTimeout(resumeTimerRef.current);
      resumeTimerRef.current = setTimeout(() => setIsPaused(false), 5000);
    }
  };

  // cleanup resume timer on unmount
  useEffect(() => () => clearTimeout(resumeTimerRef.current), []);

  const handlePostComment = async () => {
    if (!user) return;
    const content = (newComment || '').trim();
    if (!content) return;
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData?.session) {
        throw new Error('No hay sesión activa');
      }

      // Asegurarse de que el usuario tiene un perfil
      if (!user.id) {
        const { data: profileData } = await supabase
          .from('users')
          .select('*')
          .eq('auth_user_id', sessionData.session.user.id)
          .single();
        
        if (!profileData) {
          throw new Error('Perfil de usuario no encontrado');
        }
      }

      const payload = { 
        game_id: game.id, 
        auth_user_id: sessionData.session.user.id,
        content,
        parent_id: replyingTo
      };

      const { data, error } = await supabase
        .from('comments')
        .insert([payload])
        .select()
        .single();
        
      if (error) throw error;
      
      // Obtener la información del usuario para el nuevo comentario
      const { data: userData } = await supabase
        .from('users')
        .select('username, email')
        .eq('auth_user_id', sessionData.session.user.id)
        .single();

      if (error) throw error;

      setComments(prev => [...prev, { 
        ...data, 
        username: userData ? (userData.username || userData.email) : 'Anónimo',
        created_at: new Date().toISOString() 
      }]);
      setNewComment('');
      setReplyingTo(null);
    } catch (err) {
      console.error('Error posting comment:', err);
      setCommentsError('No se pudo publicar el comentario.');
    }
  };

  if (!game) {
    return <p>Game not found</p>;
  }

  return (
    <div className="game-detail">
      <h2>{game.name}</h2>
      {(images || []).length > 0 ? (
        <div className="carousel">
          <button onClick={handlePrevImage} className="carousel-button">&#8249;</button>
          <div className="image-frame" aria-hidden={false}>
            {prevImageSrc && (
              <img src={prevImageSrc} alt="previous" className="game-image image-prev" />
            )}
            <img
              src={images[currentImageIndex]}
              alt={`${game.name} - ${currentImageIndex + 1}`}
              className="game-image image-current"
            />
          </div>
          <button onClick={handleNextImage} className="carousel-button">&#8250;</button>
        </div>
      ) : (
        <p>No images available for this game.</p>
      )}
      <p className="game-description">{game.description}</p>
      <p className="game-notes">Notas: {game.notes}</p>
      <ul>
        {links.map((link, index) => (
          <li key={index}>
            <a href={link.url} target="_blank" rel="noopener noreferrer">
              {link.name || link.url}
            </a>
          </li>
        ))}
      </ul>
      
      {/* Sistema de calificación */}
      <div className="rating-section">
        <h3>Calificación y Reseñas</h3>
        
        {user ? (
          <div className="user-rating">
            <div className="star-rating">
              {[...Array(5)].map((_, i) => (
                <span 
                  key={i}
                  className="star"
                  onMouseEnter={() => setHoverRating(i + 1)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setUserRating(i + 1)}
                >
                  {(hoverRating || userRating) > i ? <FaStar color="#FFD700" /> : <FaRegStar />}
                </span>
              ))}
            </div>
            
            <textarea
              className="review-textarea"
              placeholder="Escribe tu reseña (opcional)"
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
            />
            
            <button 
              className="submit-rating"
              onClick={submitRating}
              disabled={!userRating}
            >
              Enviar Calificación
            </button>
          </div>
        ) : (
          <p>Inicia sesión para calificar este juego</p>
        )}
        
        {/* Lista de reseñas */}
        <div className="reviews-list">
          <h4>Reseñas de usuarios ({reviews.length})</h4>
          
          {reviews.length > 0 ? (
            reviews.map((review) => (
              <div key={review.id} className="review-item">
                <div className="review-header">
                  <span className="review-author">{review.users?.username || 'Usuario'}</span>
                  <div className="review-stars">
                    {[...Array(5)].map((_, i) => (
                      <span key={i}>
                        {review.rating > i ? <FaStar color="#FFD700" /> : <FaRegStar />}
                      </span>
                    ))}
                  </div>
                </div>
                {review.comment && (
                <p className="review-text">{review.comment}</p>
              )}
                <span className="review-date">
                  {new Date(review.created_at).toLocaleDateString()}
                </span>
              </div>
            ))
          ) : (
            <p>No hay reseñas todavía. ¡Sé el primero en calificar!</p>
          )}
        </div>
      </div>
      <section className="comments">
        <h3>Comentarios</h3>
        {commentsLoading ? <p>Cargando comentarios...</p> : null}
        {commentsError ? <p className="error">{commentsError}</p> : null}
        <div className="comments-list">
          {comments.length === 0 && !commentsLoading ? <p>No hay comentarios aún. Sé el primero.</p> : null}
          {comments.map((c) => {
            const username = c.username || 'Usuario';
            const timeStr = c.created_at ? new Date(c.created_at).toLocaleString() : '';
            const initial = (username && username[0]) ? username[0].toUpperCase() : 'U';
            const handleDelete = async () => {
              try {
                const { error } = await supabase
                  .from('comments')
                  .delete()
                  .match({ id: c.id });
                
                if (error) throw error;
                setComments(prev => prev.filter(comment => comment.id !== c.id));
              } catch (err) {
                console.error('Error deleting comment:', err);
                setCommentsError('No se pudo eliminar el comentario.');
              }
            };

            const handleReply = () => {
              setReplyingTo(c.id);
              setNewComment(`@${username} `);
            };

            return (
              <div className={`comment ${c.parent_id ? 'comment-reply' : ''}`} key={c.id || `${c.user_id}-${c.created_at}`}>
                <div className="comment-left">
                  <div className="comment-avatar" aria-hidden>{initial}</div>
                </div>
                <div className="comment-main">
                  <div className="comment-meta">
                    <strong>{username}</strong> 
                    <span className="time">· {timeStr}</span>
                    {isAdmin && (
                      <button 
                        onClick={handleDelete}
                        className="delete-button"
                        title="Eliminar comentario"
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                  <div className="comment-body">{c.content}</div>
                  <div className="comment-actions">
                    {user && (
                      <button 
                        onClick={handleReply}
                        className="reply-button"
                      >
                        Responder
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {user ? (
          <div className="comment-form">
            <textarea value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Escribe un comentario..." rows={3} />
            <div className="comment-actions">
              <button className="btn" onClick={handlePostComment} disabled={!newComment.trim()}>Publicar</button>
            </div>
          </div>
        ) : (
          <p><Link to="/login">Inicia sesión</Link> para comentar.</p>
        )}
      </section>
    </div>
  );
}

export default GameDetail;