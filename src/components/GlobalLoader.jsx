import React from 'react';
import './GlobalLoader.css';

export default function GlobalLoader() {
  return (
    <div className="global-loader-overlay">
      <div className="loader">
        <div className="box1"></div>
        <div className="box2"></div>
        <div className="box3"></div>
      </div>
    </div>
  );
}
