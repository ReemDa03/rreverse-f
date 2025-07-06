// src/components/RedirectIfQuery.jsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function RedirectIfQuery() {
  const navigate = useNavigate();

  useEffect(() => {
    const query = window.location.search.slice(1);
    if (query) {
      navigate('/' + query);
    }
  }, []);

  return null;
}

export default RedirectIfQuery;
